import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  selectedTabIndex = 0;
  constructor(private dashboardService: DashboardDataService) {}

  boardlist;
  ngOnInit(): void {
    this.dashboardService.dashboardName.subscribe((result) => {
      this.boardlist = result;
    });
  }
  onTabChanged(event) {
    this.selectedTabIndex = event.index;
    console.log(event.index);
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.boardlist, event.previousIndex, event.currentIndex);
  }
}
