import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  date = new Date();
  constructor() {}

  ngOnInit(): void {}
}
