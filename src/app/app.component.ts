import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

@Component({
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

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Restore saved theme preference
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (!savedTheme) {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
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
}
