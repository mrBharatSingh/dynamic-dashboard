import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DashboardStateService } from './services/dashboard-state.service';
import { DashboardDataService } from './services/dashboard-data.service';

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
  /** Controls the share-link dialog. */
  showShareDialog = false;
  /** URL produced by the latest shareDashboard() call. */
  shareUrl = '';

  constructor(
    private cd: ChangeDetectorRef,
    public dashboardState: DashboardStateService,
    private dashboardData: DashboardDataService,
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
      this.showEmailDialog = true;
      return;
    }
    this._executeBackup();
  }

  /** Invoked when the user submits the e-mail dialog. */
  onEmailSave(): void {
    const email = this.emailInput.trim();
    if (!email || !email.includes('@')) return;
    this.dashboardState.setUserEmail(email);
    this.showEmailDialog = false;
    this._executeBackup();
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

  private _executeBackup(): void {
    const activeTab = this.dashboardData.activeDashboardName.value;
    const widgets = this.dashboardData.getWidgetsForDashboard(activeTab);

    this.backupLoading = true;
    this.dashboardState.backupDashboard(activeTab, widgets).subscribe({
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
