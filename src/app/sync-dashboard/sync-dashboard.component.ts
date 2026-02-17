import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
  selector: 'app-sync-dashboard',
  templateUrl: './sync-dashboard.component.html',
  styleUrls: ['./sync-dashboard.component.scss'],
})
export class SyncDashboardComponent implements OnInit {
  @Output() syncComplete = new EventEmitter<boolean>();

  dashbordData: any;
  fileName = '';

  constructor(private dashboardService: DashboardDataService) {}

  ngOnInit(): void {}

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
        this.dashbordData = JSON.parse(e.target.result);
      };
    }
  }

  updateData() {
    let dashboardNames: string[] = [];
    for (let key in this.dashbordData) {
      dashboardNames.push(key);
      localStorage.setItem(
        key + 'DashBoardGridLayout',
        JSON.stringify(this.dashbordData[key])
      );
    }
    localStorage.setItem('DashBoardNameArray', JSON.stringify(dashboardNames));
    this.syncComplete.emit(true);
  }

  cancel() {
    this.syncComplete.emit(false);
  }
}
