import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ktdTrackById } from '@katoid/angular-grid-layout';
import { DashboardService } from '../../libs/dashboard-api';
import type { DashboardDocument, Widget } from '../../libs/dashboard-api';

@Component({
  standalone: false,
  selector: 'app-shared-dashboard',
  templateUrl: './shared-dashboard.component.html',
  styleUrls: ['./shared-dashboard.component.scss'],
})
export class SharedDashboardComponent implements OnInit {
  loading = true;
  error = '';
  dashboard: DashboardDocument | null = null;

  // KTD grid config — same values as DashboardComponent
  cols = 25;
  rowHeight = 75;
  layout: any[] = [];
  trackById = ktdTrackById;

  showAddDialog = false;
  tabName = '';
  addSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: DashboardService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('dashboardId') ?? '';
    if (!id) {
      this.error = 'Invalid share link.';
      this.loading = false;
      return;
    }

    this.api.getSharedDashboard(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dashboard = res.data;
          this.tabName = res.data.dashboardName;
          // Build the KTD layout array from the widget coordinates
          this.layout = res.data.widgets.map((w: Widget) => ({
            id: w.id,
            x: w.x,
            y: w.y,
            w: w.w,
            h: w.h,
            name: w.name,
            url: w.url,
            backgroundColor: w.backgroundColor
              ? (w.backgroundColor.startsWith('#') ? w.backgroundColor : '#' + w.backgroundColor)
              : '#6366f1',
          }));
        } else {
          this.error =
            res.message ?? 'Dashboard not found or sharing disabled.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load shared dashboard.';
        this.loading = false;
      },
    });
  }

  navigateToUrl(url: string): void {
    if (url) {
      const finalUrl = url.match(/^https?:\/\//i) ? url : 'https://' + url;
      window.open(finalUrl, '_blank');
    }
  }

  openAddDialog(): void {
    if (!this.dashboard) return;
    this.tabName = this.dashboard.dashboardName;
    this.showAddDialog = true;
  }

  cancelAdd(): void {
    this.showAddDialog = false;
  }

  addToMyDashboard(): void {
    if (!this.dashboard || !this.tabName.trim()) return;
    const name = this.tabName.trim();

    // Save widgets to localStorage in the format the dashboard component expects
    const widgets = this.dashboard.widgets.map((w: Widget) => ({
      ...w,
      backgroundColor: w.backgroundColor
        ? '#' + w.backgroundColor.replace('#', '')
        : '#3B82F6',
      boardName: name,
    }));
    localStorage.setItem(name + 'DashBoardGridLayout', JSON.stringify(widgets));

    // Add the new tab name to the dashboard list
    const stored = localStorage.getItem('DashBoardNameArray');
    const tabs: string[] = stored ? JSON.parse(stored) : ['Home'];
    if (!tabs.includes(name)) {
      tabs.push(name);
      localStorage.setItem('DashBoardNameArray', JSON.stringify(tabs));
    }

    this.showAddDialog = false;
    this.addSuccess = true;

    // Navigate home after a short delay so the user sees the success overlay
    setTimeout(() => this.router.navigate(['/home']), 1500);
  }
}
