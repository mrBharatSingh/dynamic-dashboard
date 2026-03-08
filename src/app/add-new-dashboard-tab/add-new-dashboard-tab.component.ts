import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
  standalone: false,
  selector: 'app-add-new-dashboard-tab',
  templateUrl: './add-new-dashboard-tab.component.html',
  styleUrls: ['./add-new-dashboard-tab.component.scss'],
})
export class AddNewDashboardTabComponent implements OnInit {
  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  myForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  constructor(private dashboardService: DashboardDataService) {}

  ngOnInit(): void {}

  onCancel() {
    this.cancelled.emit();
  }

  submit() {
    if (this.myForm.value.name) {
      let currentValues = this.dashboardService.dashboardName.value;
      if (currentValues) {
        let temp: string[] = [...currentValues, this.myForm.value.name];
        this.dashboardService.dashboardName.next(temp);
        localStorage.setItem('DashBoardNameArray', JSON.stringify(temp));
        this.submitted.emit();
      }
    }
  }
}
