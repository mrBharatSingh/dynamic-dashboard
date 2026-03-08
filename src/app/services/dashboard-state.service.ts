/**
 * services/dashboard-state.service.ts
 *
 * Singleton state-management service for cloud-backed dashboards.
 * Acts as the equivalent of a React Context / Redux slice for this Angular app.
 *
 * Responsibilities
 * ─────────────────
 *  • Keeps a reactive list of the user's remote dashboards (BehaviorSubjects).
 *  • Exposes actions: load, backup, update, delete, share.
 *  • Persists the user e-mail in localStorage so the user doesn't have to
 *    re-enter it on every visit (no auth in this app).
 *  • Emits toast notifications via PrimeNG MessageService.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../libs/dashboard-api';
import type {
  DashboardDocument,
  BackupDashboardBody,
  UpdateDashboardBody,
  Widget,
} from '../../libs/dashboard-api';

/** LocalStorage key used to persist the user's e-mail between sessions. */
const EMAIL_KEY = 'dashboard-user-email';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  // ── Reactive state ─────────────────────────────────────────────────────────

  /** Ordered list of the user's remote dashboards (newest first). */
  private readonly _dashboards = new BehaviorSubject<DashboardDocument[]>([]);
  readonly dashboards$: Observable<DashboardDocument[]> =
    this._dashboards.asObservable();

  /** True while an HTTP request is in-flight. */
  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$: Observable<boolean> = this._loading.asObservable();

  /** Currently authenticated user's e-mail (empty = not configured). */
  private readonly _userEmail = new BehaviorSubject<string>(
    localStorage.getItem(EMAIL_KEY) ?? '',
  );
  readonly userEmail$: Observable<string> = this._userEmail.asObservable();

  /** The ID of the dashboard most recently shared (drives copy-link UI). */
  private readonly _lastSharedUrl = new BehaviorSubject<string>('');
  readonly lastSharedUrl$: Observable<string> =
    this._lastSharedUrl.asObservable();

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor(
    private api: DashboardService,
    private msg: MessageService,
  ) {}

  // ── Getters / simple helpers ───────────────────────────────────────────────

  get userEmail(): string {
    return this._userEmail.value;
  }

  get dashboards(): DashboardDocument[] {
    return this._dashboards.value;
  }

  get isLoading(): boolean {
    return this._loading.value;
  }

  // ── setUserEmail ───────────────────────────────────────────────────────────

  /**
   * Stores the e-mail both in memory and in localStorage.
   * Call this when the user supplies their e-mail through the settings UI.
   */
  setUserEmail(email: string): void {
    const clean = email.trim().toLowerCase();
    localStorage.setItem(EMAIL_KEY, clean);
    this._userEmail.next(clean);
  }

  // ── loadUserDashboards ─────────────────────────────────────────────────────

  /**
   * Fetches all remote dashboards for the current user and replaces the
   * local list.  Silently skips if no e-mail is set.
   */
  loadUserDashboards(): void {
    const email = this._userEmail.value;
    if (!email) return;

    this._loading.next(true);
    this.api
      .getUserDashboards(email)
      .pipe(
        take(1),
        finalize(() => this._loading.next(false)),
      )
      .subscribe({
        next: (res) => {
          this._dashboards.next(res.data ?? []);
        },
        error: (err: Error) => {
          this._toast('error', 'Load failed', err.message);
        },
      });
  }

  // ── backupDashboard ────────────────────────────────────────────────────────

  /**
   * Calls POST /api/dashboard/backup and prepends the new document to the
   * local list on success.
   *
   * @param dashboardName  Name of the tab / dashboard being backed up.
   * @param widgets        Current widget layout.
   * @returns Observable that emits the saved DashboardDocument or throws.
   */
  backupDashboard(
    dashboardName: string,
    widgets: Widget[],
  ): Observable<DashboardDocument> {
    return new Observable((observer) => {
      const email = this._userEmail.value;
      if (!email) {
        observer.error(new Error('No user e-mail configured.'));
        return;
      }

      const body: BackupDashboardBody = {
        email,
        dashboardName,
        widgets: widgets.map((w) => ({
          id: w.id,
          x: w.x,
          y: w.y,
          w: w.w,
          h: w.h,
          name: w.name,
          url: w.url,
          backgroundColor: (w.backgroundColor ?? '').replace('#', ''),
        })),
      };

      this._loading.next(true);
      this.api
        .backupDashboard(body)
        .pipe(
          take(1),
          finalize(() => this._loading.next(false)),
        )
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              // If the backend upserted an existing doc, replace it in the
              // local list; otherwise prepend as a new entry.
              const exists = this._dashboards.value.some(
                (d) => d._id === res.data!._id,
              );
              if (exists) {
                this._replaceInList(res.data);
              } else {
                this._dashboards.next([res.data, ...this._dashboards.value]);
              }
              this._toast(
                'success',
                'Backup saved',
                `"${dashboardName}" backed up successfully.`,
              );
              observer.next(res.data);
              observer.complete();
            } else {
              const msg = res.message ?? 'Backup failed.';
              this._toast('error', 'Backup failed', msg);
              observer.error(new Error(msg));
            }
          },
          error: (err: Error) => {
            this._toast('error', 'Backup failed', err.message);
            observer.error(err);
          },
        });
    });
  }

  // ── updateDashboard ────────────────────────────────────────────────────────

  /**
   * Calls PUT /api/dashboard/:id and updates the local list in-place.
   */
  updateDashboard(
    dashboardId: string,
    updates: UpdateDashboardBody,
  ): Observable<DashboardDocument> {
    return new Observable((observer) => {
      this._loading.next(true);
      this.api
        .updateDashboard(dashboardId, updates)
        .pipe(
          take(1),
          finalize(() => this._loading.next(false)),
        )
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this._replaceInList(res.data);
              this._toast(
                'success',
                'Updated',
                `"${res.data.dashboardName}" updated.`,
              );
              observer.next(res.data);
              observer.complete();
            } else {
              const msg = res.message ?? 'Update failed.';
              this._toast('error', 'Update failed', msg);
              observer.error(new Error(msg));
            }
          },
          error: (err: Error) => {
            this._toast('error', 'Update failed', err.message);
            observer.error(err);
          },
        });
    });
  }

  // ── deleteDashboard ────────────────────────────────────────────────────────

  /**
   * Calls DELETE /api/dashboard/:id and removes it from the local list.
   */
  deleteDashboard(dashboardId: string): Observable<void> {
    return new Observable((observer) => {
      this._loading.next(true);
      this.api
        .deleteDashboard(dashboardId)
        .pipe(
          take(1),
          finalize(() => this._loading.next(false)),
        )
        .subscribe({
          next: (res) => {
            if (res.success) {
              this._removeFromList(dashboardId);
              this._toast('success', 'Deleted', 'Dashboard deleted.');
              observer.next();
              observer.complete();
            } else {
              const msg = res.message ?? 'Delete failed.';
              this._toast('error', 'Delete failed', msg);
              observer.error(new Error(msg));
            }
          },
          error: (err: Error) => {
            this._toast('error', 'Delete failed', err.message);
            observer.error(err);
          },
        });
    });
  }

  // ── shareDashboard ─────────────────────────────────────────────────────────

  /**
   * Calls POST /api/dashboard/share/:id, updates isShared on the local doc,
   * and stores the share URL for the copy-link UI.
   */
  shareDashboard(dashboardId: string): Observable<string> {
    return new Observable((observer) => {
      this._loading.next(true);
      this.api
        .shareDashboard(dashboardId)
        .pipe(
          take(1),
          finalize(() => this._loading.next(false)),
        )
        .subscribe({
          next: (res) => {
            if (res.success) {
              this._replaceInList(res.data);
              this._lastSharedUrl.next(res.fullUrl);
              this._toast(
                'success',
                'Dashboard shared',
                'Shareable link copied to clipboard.',
              );
              observer.next(res.fullUrl);
              observer.complete();
            } else {
              const msg = res.message ?? 'Share failed.';
              this._toast('error', 'Share failed', msg);
              observer.error(new Error(msg));
            }
          },
          error: (err: Error) => {
            this._toast('error', 'Share failed', err.message);
            observer.error(err);
          },
        });
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _replaceInList(updated: DashboardDocument): void {
    this._dashboards.next(
      this._dashboards.value.map((d) => (d._id === updated._id ? updated : d)),
    );
  }

  private _removeFromList(id: string): void {
    this._dashboards.next(this._dashboards.value.filter((d) => d._id !== id));
  }

  private _toast(
    severity: 'success' | 'error' | 'info' | 'warn',
    summary: string,
    detail: string,
  ): void {
    this.msg.add({ severity, summary, detail, life: 4000 });
  }
}
