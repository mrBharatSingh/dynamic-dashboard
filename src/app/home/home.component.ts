import { Component, OnInit } from '@angular/core';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  selectedTabIndex = 0;
  boardlist: string[] = [];

  constructor(private dashboardService: DashboardDataService) {}

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

  private _updateActiveName(): void {
    const name = this.boardlist[this.selectedTabIndex] ?? '';
    this.dashboardService.activeDashboardName.next(name);
  }
}
