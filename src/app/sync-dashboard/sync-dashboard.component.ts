import { Component, OnInit } from '@angular/core';
import { DashboardDataService } from '../services/dashboard-data.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-sync-dashboard',
  templateUrl: './sync-dashboard.component.html',
  styleUrls: ['./sync-dashboard.component.scss'],
})
export class SyncDashboardComponent implements OnInit {
  dashbordData;
  constructor(
    private dashboardService: DashboardDataService,
    public dialogRef: MatDialogRef<SyncDashboardComponent>
  ) {}

  ngOnInit(): void {}
  download() {
    this.dashboardService.downloadJSON();
  }
  fileChange(event) {
    const file: File = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e: any) => {
      this.dashbordData = JSON.parse(e.target.result);
    };
  }

  updateData() {
    let dashboardNames = [];
    console.log(this.dashbordData);
    for (let key in this.dashbordData) {
      dashboardNames.push(key);
      localStorage.setItem(
        key + 'DashBoardGridLayout',
        JSON.stringify(this.dashbordData[key])
      );
    }

    localStorage.setItem('DashBoardNameArray', JSON.stringify(dashboardNames));
    this.dialogRef.close(true);
  }
}
