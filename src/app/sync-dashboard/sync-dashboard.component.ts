/**
 * sync-dashboard.component.ts
 *
 * Settings dialog with two tabs:
 *  • "Local Sync"   – existing JSON download / upload workflow.
 *  • "Cloud Backups"– lists all backups stored in MongoDB with the ability
 *                      to load, share (copy link), update, and delete them.
 */

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DashboardDataService } from '../services/dashboard-data.service';
import { DashboardStateService } from '../services/dashboard-state.service';
import type { DashboardDocument } from '../../libs/dashboard-api';

@Component({
  standalone: false,
  selector: 'app-sync-dashboard',
  templateUrl: './sync-dashboard.component.html',
  styleUrls: ['./sync-dashboard.component.scss'],
})
export class SyncDashboardComponent implements OnInit {
  @Output() syncComplete = new EventEmitter<boolean>();

  // ── Local sync state ───────────────────────────────────────────────────────
  dashboardData: any;
  fileName = '';

  // ── Cloud tab state ────────────────────────────────────────────────────────
  activeTabIndex = 0;
  /** User e-mail bound to the inline input when no email is stored yet. */
  emailInput = '';
  /** Tracks which dashboard ID is currently sharing (for spinner). */
  sharingId: string | null = null;
  /** Tracks which dashboard ID is currently being deleted (for spinner). */
  deletingId: string | null = null;

  constructor(
    public dashboardService: DashboardDataService,
    public state: DashboardStateService,
    private confirm: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.emailInput = this.state.userEmail;
    // Auto-load cloud dashboards if email is set
    if (this.state.userEmail) {
      this.state.loadUserDashboards();
    }
  }

  // ── Local sync ─────────────────────────────────────────────────────────────

  download() {
    this.dashboardService.downloadJSON();
  }

  fileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e: any) => {
        this.dashboardData = JSON.parse(e.target.result);
      };
    }
  }

  updateData() {
    const dashboardNames: string[] = [];
    for (const key in this.dashboardData) {
      dashboardNames.push(key);
      localStorage.setItem(
        key + 'DashBoardGridLayout',
        JSON.stringify(this.dashboardData[key]),
      );
    }
    localStorage.setItem('DashBoardNameArray', JSON.stringify(dashboardNames));
    this.syncComplete.emit(true);
  }

  cancel() {
    this.syncComplete.emit(false);
  }

  // ── Cloud backups ──────────────────────────────────────────────────────────

  /** Called when the user submits the inline e-mail form. */
  onSetEmail(): void {
    const email = this.emailInput.trim();
    if (!email || !email.includes('@')) return;
    this.state.setUserEmail(email);
    this.state.loadUserDashboards();
  }

  refreshCloudList(): void {
    this.state.loadUserDashboards();
  }

  /**
   * Loads a cloud backup into localStorage and reloads the page so the
   * updated layout is picked up by DashboardComponent.
   */
  loadCloudDashboard(doc: DashboardDocument): void {
    // Ensure the tab name is registered
    const names = this.dashboardService.dashboardName.value;
    if (!names.includes(doc.dashboardName)) {
      const updated = [...names, doc.dashboardName];
      this.dashboardService.dashboardName.next(updated);
      localStorage.setItem('DashBoardNameArray', JSON.stringify(updated));
    }

    // Restore widget layout
    localStorage.setItem(
      doc.dashboardName + 'DashBoardGridLayout',
      JSON.stringify(
        doc.widgets.map((w) => ({
          ...w,
          backgroundColor: w.backgroundColor.startsWith('#')
            ? w.backgroundColor
            : '#' + w.backgroundColor,
        })),
      ),
    );

    this.syncComplete.emit(true); // triggers page reload from AppComponent
  }

  /** Shares a dashboard and copies the link to clipboard via the state service. */
  shareCloudDashboard(doc: DashboardDocument): void {
    this.sharingId = doc._id;
    this.state.shareDashboard(doc._id).subscribe({
      next: (url) => {
        // Copy to clipboard
        navigator.clipboard?.writeText(url).catch(() => {});
        this.sharingId = null;
      },
      error: () => {
        this.sharingId = null;
      },
    });
  }

  /** Confirms then deletes a cloud dashboard. */
  deleteCloudDashboard(doc: DashboardDocument): void {
    this.confirm.confirm({
      message: `Permanently delete <strong>${doc.dashboardName}</strong> from the cloud?`,
      header: 'Delete Backup',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deletingId = doc._id;
        this.state.deleteDashboard(doc._id).subscribe({
          next: () => {
            this.deletingId = null;
          },
          error: () => {
            this.deletingId = null;
          },
        });
      },
    });
  }

  /** Updates the cloud backup with the current local layout. */
  pushLocalToCloud(doc: DashboardDocument): void {
    const widgets = this.dashboardService.getWidgetsForDashboard(
      doc.dashboardName,
    );
    this.state.updateDashboard(doc._id, { widgets }).subscribe();
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleString();
  }
}
