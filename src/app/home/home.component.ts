import { Component, OnInit } from '@angular/core';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
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
    });
  }
}
