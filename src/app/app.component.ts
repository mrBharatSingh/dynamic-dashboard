import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DashboardStateService } from './services/dashboard-state.service';
import { DashboardDataService } from './services/dashboard-data.service';
import { DashboardService } from '../libs/dashboard-api';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'dashboard';
  authenticatedLoading = false;
  notificationCount: number = 3;
  showSyncDialog = false;
  isDarkMode = false;

  // ── Backup UI state ────────────────────────────────────────────────────────

  /** Controls the "enter your e-mail" dialog shown before first backup. */
  showEmailDialog = false;
  /** Two-way bound to the e-mail <input> inside the dialog. */
  emailInput = '';
  /** True while a backup HTTP call is in-flight. */
  backupLoading = false;
  /** True while a cloud-sync HTTP call is in-flight. */
  cloudSyncLoading = false;
  /** Tracks which action to run after the e-mail dialog is dismissed. */
  private pendingAction: 'backup' | 'sync' = 'backup';
  /** Controls the share-link dialog. */
  showShareDialog = false;
  /** URL produced by the latest shareDashboard() call. */
  shareUrl = '';

  constructor(
    private cd: ChangeDetectorRef,
    public dashboardState: DashboardStateService,
    private dashboardData: DashboardDataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private api: DashboardService,
  ) {}

  ngOnInit(): void {
    // Restore saved theme preference
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (!savedTheme) {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      if (prefersDark) {
        this.isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }

    // Pre-populate email input with stored value if available
    this.emailInput = this.dashboardState.userEmail;

    // Listen for share URLs produced anywhere in the app
    this.dashboardState.lastSharedUrl$.subscribe((url) => {
      if (url) {
        this.shareUrl = url;
        this._copyToClipboard(url);
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('dashboard-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('dashboard-theme', 'light');
    }
  }

  openSyncDashboardDialog() {
    this.showSyncDialog = true;
  }
  onSyncDialogClose(result: boolean) {
    this.showSyncDialog = false;
    if (result) {
      location.reload();
    }
  }

  // ── Backup button logic ────────────────────────────────────────────────────

  /**
   * Entry-point for the Backup button in the navbar.
   * If no e-mail is stored, shows the e-mail dialog first.
   */
  onBackupClick(): void {
    if (!this.dashboardState.userEmail) {
      this.pendingAction = 'backup';
      this.showEmailDialog = true;
      return;
    }
    this._executeBackup();
  }

  /** Entry-point for the Sync Dashboards button in the navbar. */
  onCloudSyncClick(): void {
    if (!this.dashboardState.userEmail) {
      this.pendingAction = 'sync';
      this.showEmailDialog = true;
      return;
    }
    this._confirmAndSync();
  }

  /** Shows the PrimeNG confirmation dialog before executing the cloud sync. */
  private _confirmAndSync(): void {
    this.confirmationService.confirm({
      header: 'Sync Dashboards from Cloud',
      message:
        'This will fetch all your cloud dashboards and add or update them locally. Existing dashboards with the same name will be overwritten. Continue?',
      icon: 'pi pi-cloud-download',
      acceptLabel: 'Sync',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this._executeCloudSync(),
    });
  }

  /** Invoked when the user submits the e-mail dialog. */
  onEmailSave(): void {
    const email = this.emailInput.trim();
    if (!email || !email.includes('@')) return;
    this.dashboardState.setUserEmail(email);
    this.showEmailDialog = false;
    if (this.pendingAction === 'sync') {
      this._confirmAndSync();
    } else {
      this._executeBackup();
    }
  }

  /** Cancels the e-mail dialog without doing anything. */
  onEmailCancel(): void {
    this.showEmailDialog = false;
  }

  /** Copies the current share URL to the clipboard. */
  copyShareLink(): void {
    this._copyToClipboard(this.shareUrl);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Fetches all cloud dashboards and merges them into local storage. */
  private _executeCloudSync(): void {
    const email = this.dashboardState.userEmail;
    if (!email) return;

    this.cloudSyncLoading = true;
    this.api.getUserDashboards(email).subscribe({
      next: (res) => {
        const remoteDashboards = res.data ?? [];
        if (remoteDashboards.length === 0) {
          this.messageService.add({ severity: 'info', summary: 'No dashboards', detail: 'No cloud dashboards found for your account.' });
          this.cloudSyncLoading = false;
          return;
        }

        const currentTabs = [...this.dashboardData.dashboardName.value];

        remoteDashboards.forEach((doc) => {
          // Add tab if not already present
          if (!currentTabs.includes(doc.dashboardName)) {
            currentTabs.push(doc.dashboardName);
          }
          // Restore widget layout, ensuring backgroundColor has the '#' prefix
          const widgets = doc.widgets.map((w) => ({
            ...w,
            backgroundColor: w.backgroundColor
              ? w.backgroundColor.startsWith('#')
                ? w.backgroundColor
                : '#' + w.backgroundColor
              : '',
          }));
          localStorage.setItem(
            doc.dashboardName + 'DashBoardGridLayout',
            JSON.stringify(widgets),
          );
        });

        // Persist updated tab list
        localStorage.setItem('DashBoardNameArray', JSON.stringify(currentTabs));
        this.dashboardData.dashboardName.next(currentTabs);

        this.cloudSyncLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sync complete',
          detail: `${remoteDashboards.length} dashboard(s) synchronised from the cloud.`,
        });
      },
      error: (err: Error) => {
        this.cloudSyncLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Sync failed',
          detail: err?.message ?? 'Could not fetch dashboards from the cloud.',
        });
      },
    });
  }

  private _executeBackup(): void {
    const allTabs = this.dashboardData.dashboardName.value;

    this.backupLoading = true;
    const backupObs = allTabs.map((tab) => {
      const widgets = this.dashboardData.getWidgetsForDashboard(tab);
      return this.dashboardState.backupDashboard(tab, widgets);
    });

    forkJoin(backupObs).subscribe({
      next: () => {
        this.backupLoading = false;
      },
      error: () => {
        this.backupLoading = false;
      },
    });
  }

  private _copyToClipboard(text: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        this._fallbackCopy(text);
      });
    } else {
      this._fallbackCopy(text);
    }
  }

  private _fallbackCopy(text: string): void {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
