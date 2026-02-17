import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
  selector: 'app-add-new-dashboard-tab',
  templateUrl: './add-new-dashboard-tab.component.html',
  styleUrls: ['./add-new-dashboard-tab.component.scss'],
})
export class AddNewDashboardTabComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AddNewDashboardTabComponent>,
    private dashboardService: DashboardDataService
  ) {}
  myForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });
  ngOnInit(): void {}

  onNoClick() {
    this.dialogRef.close();
  }
  submit() {
    if (this.myForm.value.name) {
      let currentValues = this.dashboardService.dashboardName.value;

      if (currentValues) {
        let temp: string[] = [...currentValues, this.myForm.value.name];
        this.dashboardService.dashboardName.next(temp);
        localStorage.setItem('DashBoardNameArray', JSON.stringify(temp));
        this.dialogRef.close();
      }
    }
  }
}
