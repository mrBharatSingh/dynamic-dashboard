import { Component, OnInit } from '@angular/core';
import { DashboardDataService } from '../services/dashboard-data.service';
import { DashboardStateService } from '../services/dashboard-state.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  selectedTabIndex = 0;
  boardlist: string[] = [];
  /** Tracks which dashboard tabs are currently in edit mode. */
  editingTabs = new Set<string>();

  constructor(
    private dashboardService: DashboardDataService,
    private dashboardState: DashboardStateService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.dashboardService.dashboardName.subscribe((result) => {
      this.boardlist = result;
      // Keep active name in sync when the list changes
      this._updateActiveName();
    });
  }

  /** Called by (activeIndexChange) on the p-tabView */
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this._updateActiveName();
  }

  /** Keeps editingTabs in sync with each DashboardComponent's editMode. */
  onEditModeChange(board: string, isEditing: boolean): void {
    if (isEditing) {
      this.editingTabs.add(board);
    } else {
      this.editingTabs.delete(board);
    }
  }

  /**
   * Deletes the dashboard tab by name.
   * - Removes widgets from localStorage
   * - Removes name from the tab list (persisted in localStorage)
   * - Deletes the cloud backup if one exists
   * - Adjusts the selected tab index so another tab stays visible
   */
  onDeleteDashboard(name: string, index: number): void {
    this.confirmationService.confirm({
      message: `Delete dashboard <strong>${name}</strong>? This cannot be undone.`,
      header: 'Delete Dashboard',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // 1. Remove widgets from localStorage
        localStorage.removeItem(name + 'DashBoardGridLayout');

        // 2. Remove from the tab list
        const updated = this.boardlist.filter((b) => b !== name);
        localStorage.setItem('DashBoardNameArray', JSON.stringify(updated));
        this.dashboardService.dashboardName.next(updated);

        // 3. Delete cloud backup if it exists
        const cloudDoc = this.dashboardState.dashboards.find(
          (d) => d.dashboardName === name,
        );
        if (cloudDoc) {
          this.dashboardState.deleteDashboard(cloudDoc._id).subscribe();
        }

        // 4. Adjust selected tab so we don't land on an out-of-bounds index
        const nextIndex = Math.max(0, index - 1);
        this.selectedTabIndex = nextIndex;
        this._updateActiveName();
      },
    });
  }

  private _updateActiveName(): void {
    const name = this.boardlist[this.selectedTabIndex] ?? '';
    this.dashboardService.activeDashboardName.next(name);
  }
}
