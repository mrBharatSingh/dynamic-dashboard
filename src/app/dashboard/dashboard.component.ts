import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
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
import { DashboardDataService } from '../services/dashboard-data.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input() dashboardName: string;
  cols = 25;
  rowHeight = 75;
  editMode = false;

  layout: any = [];

  innerWidth: any;
  @ViewChild(KtdGridComponent, { static: true }) grid: KtdGridComponent;

  // Dialog control
  showAddShortcutDialog = false;
  showAddDashboardDialog = false;
  dialogData: any = {};

  constructor(
    private dashboardService: DashboardDataService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadLayout();
    this.innerWidth = window.innerWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboardName'] && !changes['dashboardName'].firstChange) {
      this.loadLayout();
    }
  }

  loadLayout() {
    this.layout =
      JSON.parse(
        localStorage.getItem(this.dashboardName + 'DashBoardGridLayout'),
      ) || [];
    // Trigger grid resize to fix layout rendering after tab switch
    setTimeout(() => {
      if (this.grid) {
        this.grid.resize();
      }
    });
  }

  getData(): Observable<any> {
    return this.http.get<any>('dashBoardData.json');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.grid.resize();
    this.innerWidth = window.innerWidth;
  }

  ngAfterViewInit() {
    this.layout = [...this.layout];
  }

  trackById = ktdTrackById;

  navigateToUrl(url: string) {
    if (url) {
      // Ensure URL has a protocol, otherwise browsers treat it as a relative path
      const finalUrl = url.match(/^https?:\/\//i) ? url : 'https://' + url;
      window.open(finalUrl, '_blank');
    }
  }

  onLayoutUpdated(event: any) {
    const layoutMap = new Map<number, any>();

    this.layout.forEach((lay: any) => {
      layoutMap.set(lay.id, lay);
    });

    event.forEach((el: any) => {
      const existingLayout = layoutMap.get(el.id);
      if (existingLayout) {
        Object.assign(existingLayout, el);
      }
    });

    this.layout = Array.from(layoutMap.values());
  }

  opneEdigDialog(item: any) {
    this.dialogData = { ...item, boardName: this.dashboardName };
    this.showAddShortcutDialog = true;
  }

  onShortcutDialogClose(result: any) {
    this.showAddShortcutDialog = false;
    if (result) {
      if (result.id !== undefined && result.id !== null) {
        // Editing existing item
        let index = this.layout.findIndex((el: any) => el.id == result.id);
        if (index !== -1) {
          this.layout[index] = { ...this.layout[index], ...result };
          this.layout = [...this.layout]; // new reference so KtdGrid re-renders
        }
      } else {
        // Adding new item
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
    }
  }

  addGridTile() {
    this.dialogData = { boardName: this.dashboardName };
    this.showAddShortcutDialog = true;
  }

  removeItem(id: any) {
    let itemIndex = this.layout.findIndex((el: any) => el.id == id);
    this.layout.splice(itemIndex, 1);
    this.layout = [...this.layout];
  }

  saveGridTile() {
    this.editMode = false;
    localStorage.setItem(
      this.dashboardName + 'DashBoardGridLayout',
      JSON.stringify([...this.layout]),
    );
  }

  addNewDashboardTab() {
    this.showAddDashboardDialog = true;
  }

  ngOnDestroy() {}
}
