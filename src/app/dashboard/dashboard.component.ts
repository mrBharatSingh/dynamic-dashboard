import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  HostListener,
  Input,
} from '@angular/core';
import {
  KtdGridComponent,
  KtdGridLayout,
  ktdTrackById,
} from '@katoid/angular-grid-layout';
import { AddNewShortcutComponent } from '../add-new-shortcut/add-new-shortcut.component';
import { MatDialog } from '@angular/material/dialog';
import { DashboardDataService } from '../services/dashboard-data.service';
import { AddNewDashboardTabComponent } from '../add-new-dashboard-tab/add-new-dashboard-tab.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @Input() dashboardName: string;
  cols = 25;
  rowHeight = 75;
  editMode = false;

  layout: any = [
    // {
    //   id: '0',
    //   x: 0,
    //   y: 0,
    //   w: 10,
    //   h: 3,
    //   backgroundColor: '#D5E8D4',
    //   name: 'IQM',
    //   url: 'https://brksw-ci.zf-world.com/iqm/#/',
    // },
    // {
    //   id: '1',
    //   x: 8,
    //   y: 3,
    //   w: 2,
    //   h: 3,
    //   backgroundColor: '#FFE6CC',
    //   name: 'PDB',
    //   url: 'https://adw.zf-world.com/pdb/#/home',
    // },
    // {
    //   id: '2',
    //   x: 0,
    //   y: 3,
    //   w: 8,
    //   h: 3,
    //   backgroundColor: '#F8CECC',
    //   name: 'Ticket System',
    //   url: 'https://adw.zf-world.com/tickets/',
    // },
  ];
  //   layout: any  = JSON.parse(localStorage.getItem('IQMKtdGridLayout')) || [
  //       { id: '0', x: 0, y: 0, w: 10, h: 3,backgroundColor:"#D5E8D4",name:"IQM",url:"https://brksw-ci.zf-world.com/iqm/#/" },
  //       { id: '1', x: 8, y: 3, w: 2, h: 3, backgroundColor:"#FFE6CC",name:"PDB",url:"https://adw.zf-world.com/pdb/#/home" },
  //       { id: '2', x: 0, y: 3, w: 8, h: 3 ,backgroundColor:"#F8CECC",name:"Ticket Syatem",url:"https://adw.zf-world.com/tickets/" },
  //   ];
  //  gridMetaData=[
  //     { id: '0', x: 0, y: 0, w: 10, h: 3,backgroundColor:"#D5E8D4",name:"IQM",url:"https://brksw-ci.zf-world.com/iqm/#/" },
  //       { id: '1', x: 8, y: 3, w: 2, h: 3, backgroundColor:"#FFE6CC",name:"PDB",url:"https://adw.zf-world.com/pdb/#/home" },
  //       { id: '2', x: 0, y: 3, w: 8, h: 3 ,backgroundColor:"#F8CECC",name:"Ticket Syatem",url:"https://adw.zf-world.com/tickets/" },
  //  ]

  innerWidth: any;
  @ViewChild(KtdGridComponent, { static: true }) grid: KtdGridComponent;

  constructor(
    public dialog: MatDialog,
    private dashboardService: DashboardDataService,
    private http: HttpClient
  ) {}
  ngOnInit(): void {
    console.log(this.dashboardName);
    // this.getData().subscribe((data) => {
    //   console.log(data);
    // });
    // this.dashboardService.updataDataJSON();
    // this.dashboardService.getData().subscribe((data) => {
    //   console.log(data, 'get call call');
    // });
    this.layout =
      JSON.parse(
        localStorage.getItem(this.dashboardName + 'DashBoardGridLayout')
      ) || this.layout;

    this.innerWidth = window.innerWidth;
  }
  getData(): Observable<any> {
    return this.http.get<any>('dashBoardData.json');
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log(event);
    this.grid.resize();
    this.innerWidth = window.innerWidth;
  }

  ngAfterViewInit() {
    this.layout = [...this.layout];
    //   this.grid.resize();
  }
  trackById = ktdTrackById;

  onLayoutUpdated(event: any) {
    console.log(event);
    const layoutMap = new Map<number, any>();

    this.layout.forEach((lay) => {
      layoutMap.set(lay.id, lay);
    });

    event.forEach((el) => {
      const existingLayout = layoutMap.get(el.id);

      if (existingLayout) {
        Object.assign(existingLayout, el);
      }
    });

    this.layout = Array.from(layoutMap.values());
  }
  opneEdigDialog(item) {
    item.boardName = this.dashboardName;
    const dialogRef = this.dialog.open(AddNewShortcutComponent, {
      height: '50%',
      width: '60%',
      data: item,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let index = this.layout.findIndex((el) => el.id == item.id);
        if (index != -1) {
          this.layout[index] = { ...item, ...result };
        }
      }
    });
  }
  addGridTile() {
    const dialogRef = this.dialog.open(AddNewShortcutComponent, {
      height: '50%',
      width: '60%',
      data: { boardName: this.dashboardName },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result, 'The dialog was closed');
        let max = 0;
        this.layout.forEach((el: any) => {
          max = Math.max(max, +el.id);
        });
        let tempTile = {
          id: (max + 1).toString(),
          x: 0,
          y: 0,
          w: 2,
          h: 2,
          name: result.name,
          url: result.url,
          backgroundColor: result.backgroundColor,
        };
        this.layout = [...this.layout, tempTile];
      }
    });
  }
  removeItem(id: any) {
    let itemIndex = this.layout.findIndex((el: any) => el.id == id);
    console.log(itemIndex);
    this.layout.splice(itemIndex, 1);
    this.layout = [...this.layout];
  }
  saveGridTile() {
    this.editMode = false;
    localStorage.setItem(
      this.dashboardName + 'DashBoardGridLayout',
      JSON.stringify([...this.layout])
    );
  }
  addNewDashboardTab() {
    const dialogRef = this.dialog.open(AddNewDashboardTabComponent, {
      width: '40%',
      height: 'auto',
    });
  }
  ngOnDestroy() {}
}
