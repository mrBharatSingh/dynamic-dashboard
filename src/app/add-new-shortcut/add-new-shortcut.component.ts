import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
  selector: 'app-add-new-shortcut',
  templateUrl: './add-new-shortcut.component.html',
  styleUrls: ['./add-new-shortcut.component.scss'],
})
export class AddNewShortcutComponent implements OnInit {
  @Input() data: any = {};
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  boardList: { label: string; value: string }[] = [];
  selectedColor: string = '';

  myForm: FormGroup;

  constructor(private dashboardService: DashboardDataService) {}

  ngOnInit(): void {
    this.myForm = new FormGroup({
      name: new FormControl(this.data.name || ''),
      url: new FormControl(this.data.url || ''),
      backgroundColor: new FormControl(this.data.backgroundColor || '#3B82F6'),
      boardName: new FormControl(this.data.boardName || ''),
    });

    if (this.data.backgroundColor) {
      this.selectedColor = this.data.backgroundColor.replace('#', '');
    } else {
      this.selectedColor = '3B82F6';
    }

    this.dashboardService.dashboardName.subscribe((result) => {
      this.boardList = result.map((b: string) => ({ label: b, value: b }));
    });
  }

  onColorChange(color: string) {
    if (color) {
      this.myForm.patchValue({ backgroundColor: color });
    }
  }

  submit(): void {
    let obj = { ...this.myForm.value };
    if (this.selectedColor) {
      obj.backgroundColor = this.selectedColor;
    }
    if (this.data.id !== undefined) {
      obj.id = this.data.id;
    }
    this.submitted.emit(obj);
  }

  onCancel() {
    this.cancelled.emit();
  }
}
