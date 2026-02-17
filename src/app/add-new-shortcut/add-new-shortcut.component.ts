import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  NgxMatColorPickerInput,
  Color,
} from '@angular-material-components/color-picker';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
  selector: 'app-add-new-shortcut',
  templateUrl: './add-new-shortcut.component.html',
  styleUrls: ['./add-new-shortcut.component.scss'],
})
export class AddNewShortcutComponent implements OnInit {
  public disabled = false;
  public color: any;
  public touchUi = false;
  boardList: string[];

  colorCtr: AbstractControl = new FormControl(null);
  @ViewChild(NgxMatColorPickerInput) pickerInput: NgxMatColorPickerInput;
  constructor(
    public dialogRef: MatDialogRef<AddNewShortcutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dashboardService: DashboardDataService
  ) {}

  myForm = new FormGroup({
    name: new FormControl(this.data.name || ''),
    url: new FormControl(this.data.url || ''),
    backgroundColor: new FormControl(this.data.backgroundColor || ''),
    boardName: new FormControl(this.data.boardName || ''),
  });

  ngOnInit(): void {
    console.log(this.data, this.myForm, 'dta');
    this.dashboardService.dashboardName.subscribe((result) => {
      this.boardList = result;
    });
  }
  ngAfterViewInit(): void {
    if (this.data.backgroundColor) {
      const temp = this.hexToRgb(this.data.backgroundColor);
      this.pickerInput.value = new Color(temp.r, temp.g, temp.b);
    }
  }
  submit(): void {
    let obj = this.myForm.value;
    console.log({ ...obj }, 'oooooooooooooooooo');
    if (obj.backgroundColor['hex']) {
      obj.backgroundColor = '#' + obj.backgroundColor['hex'];
    } else {
      obj.backgroundColor = obj.backgroundColor;
    }
    console.log(obj);
    this.data = obj;
    console.log(this.color, 'colot');
    this.dialogRef.close(this.data);
  }
  onNoClick() {
    this.dialogRef.close();
  }

  hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
}
