import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { SyncDashboardComponent } from './sync-dashboard/sync-dashboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'dashboard';
  authenticatedLoading = false;
  @ViewChild('menuTrigger')
  menuTrigger: MatMenuTrigger;
  time: number = 3;
  notificationCount: number = 3;
  constructor(private cd: ChangeDetectorRef, public dialog: MatDialog) {}
  ngOnInit(): void {}
  ngAfterViewInit() {
    // this.menuTrigger.openMenu();
    // this.cd.detectChanges();
    // let interval;
    // interval = setInterval(() => {
    //   this.time--;
    //   // this.cd.detectChanges();
    //   console.log(this.time);
    //   if (this.time == 0) {
    //     this.menuTrigger.closeMenu();
    //     clearInterval(interval);
    //   }
    // }, 1000);
  }
  openSyncDashboardDialog() {
    const dialogRef = this.dialog.open(SyncDashboardComponent, {
      height: 'auto',
      width: '40%',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        location.reload();
      }
    });
  }
}
//one note
//todo
//
