import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  KtdGridComponent,
  KtdGridLayout,
  ktdTrackById,
} from '@katoid/angular-grid-layout';
import { ConfirmationService } from 'primeng/api';
import { DashboardDataService } from '../services/dashboard-data.service';
import { DashboardStateService } from '../services/dashboard-state.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { DashboardDocument } from '../../libs/dashboard-api';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input() dashboardName: string;
  /** Emitted whenever editMode toggles — HomeComponent uses this to show/hide
   *  the × close button on the tab header. */
  @Output() editModeChange = new EventEmitter<boolean>();

  private _editMode = false;
  get editMode(): boolean { return this._editMode; }
  set editMode(value: boolean) {
    this._editMode = value;
    this.editModeChange.emit(value);
  }

  cols = 25;
  rowHeight = 75;
  layout: any = [];

  innerWidth: any;
  @ViewChild(KtdGridComponent, { static: true }) grid: KtdGridComponent;

  // Dialog control
  showAddShortcutDialog = false;
  showAddDashboardDialog = false;
  dialogData: any = {};

  /** The cloud-persisted version of this dashboard (null if never backed up). */
  cloudDoc: DashboardDocument | null = null;
  cloudSaving = false;
  cloudSharing = false;
  cloudDeleting = false;

  constructor(
    private dashboardService: DashboardDataService,
    private dashboardState: DashboardStateService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this._syncCloudDoc();
    const defaultLayout = [
      {
        id: '1',
        x: 6,
        y: 0,
        w: 6,
        h: 2,
        name: 'Chat GPT',
        url: 'https://chatgpt.com/',
        backgroundColor: '#FF6F61',
        boardName: 'AI Tools',
      },
      {
        id: '2',
        x: 12,
        y: 0,
        w: 6,
        h: 1,
        name: 'Bard',
        url: 'https://bard.google.com/',
        backgroundColor: '#6B5B95',
        boardName: 'AI Tools',
      },
      {
        id: '3',
        x: 12,
        y: 1,
        w: 3,
        h: 1,
        name: 'Claude',
        url: 'https://claude.ai/',
        backgroundColor: '#88B04B',
        boardName: 'AI Tools',
      },
      {
        id: '4',
        x: 15,
        y: 1,
        w: 3,
        h: 1,
        name: 'Gemini',
        url: 'https://gemini.google.com/app',
        backgroundColor: '#F7CAC9',
        boardName: 'AI Tools',
      },
      {
        id: '5',
        x: 6,
        y: 2,
        w: 4,
        h: 2,
        name: 'DALL-E',
        url: 'https://openai.com/dall-e',
        backgroundColor: '#92A8D1',
        boardName: 'AI Tools',
      },
      {
        id: '6',
        x: 10,
        y: 2,
        w: 4,
        h: 1,
        name: 'MidJourney',
        url: 'https://midjourney.com/',
        backgroundColor: '#955251',
        boardName: 'AI Tools',
      },
      {
        id: '7',
        x: 10,
        y: 3,
        w: 4,
        h: 1,
        name: 'Stable Diffusion',
        url: 'https://stablediffusionweb.com/',
        backgroundColor: '#B565A7',
        boardName: 'AI Tools',
      },
      {
        id: '8',
        x: 14,
        y: 2,
        w: 4,
        h: 2,
        name: 'Runway',
        url: 'https://runwayml.com/',
        backgroundColor: '#009B77',
        boardName: 'AI Tools',
      },
      {
        id: '9',
        x: 6,
        y: 4,
        w: 12,
        h: 1,
        name: 'Hugging Face',
        url: 'https://huggingface.co/',
        backgroundColor: '#DD4124',
        boardName: 'AI Tools',
      },
    ];

    const savedLayout = localStorage.getItem(
      this.dashboardName + 'DashBoardGridLayout',
    );
    if (
      this.dashboardName === 'Home' &&
      (!savedLayout || JSON.parse(savedLayout).length === 0)
    ) {
      localStorage.setItem(
        this.dashboardName + 'DashBoardGridLayout',
        JSON.stringify([...defaultLayout]),
      );
    }
    this.loadLayout();
    this.innerWidth = window.innerWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboardName'] && !changes['dashboardName'].firstChange) {
      this.loadLayout();
      this._syncCloudDoc();
    }
  }

  /**
   * Looks up the cloud document for this dashboard tab from the state service.
   * Called on init and whenever the dashboardName @Input changes.
   */
  private _syncCloudDoc(): void {
    const all = this.dashboardState.dashboards;
    this.cloudDoc =
      all.find((d) => d.dashboardName === this.dashboardName) ?? null;
    // Also subscribe so the card updates when a share/delete/update happens
    this.dashboardState.dashboards$.subscribe((docs) => {
      this.cloudDoc =
        docs.find((d) => d.dashboardName === this.dashboardName) ?? null;
    });
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

  // ── Cloud actions ──────────────────────────────────────────────────────────

  /** Overwrites the cloud backup with the current local layout. */
  updateCloudDashboard(): void {
    if (!this.cloudDoc) return;
    this.cloudSaving = true;
    const widgets = this.dashboardService.getWidgetsForDashboard(
      this.dashboardName,
    );
    this.dashboardState
      .updateDashboard(this.cloudDoc._id, { widgets })
      .subscribe({
        next: (doc) => {
          this.cloudDoc = doc;
          this.cloudSaving = false;
        },
        error: () => {
          this.cloudSaving = false;
        },
      });
  }

  /** Marks the cloud dashboard as shared and copies the link to clipboard. */
  shareCloudDashboard(): void {
    if (!this.cloudDoc) return;
    this.cloudSharing = true;
    this.dashboardState.shareDashboard(this.cloudDoc._id).subscribe({
      next: (url) => {
        navigator.clipboard?.writeText(url).catch(() => {});
        this.cloudSharing = false;
      },
      error: () => {
        this.cloudSharing = false;
      },
    });
  }

  /** Confirms then permanently deletes the cloud backup. */
  deleteCloudDashboard(): void {
    if (!this.cloudDoc) return;
    this.confirmationService.confirm({
      message: `Delete cloud backup of <strong>${this.dashboardName}</strong>?`,
      header: 'Delete Cloud Backup',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.cloudDoc) return;
        this.cloudDeleting = true;
        this.dashboardState.deleteDashboard(this.cloudDoc._id).subscribe({
          next: () => {
            this.cloudDoc = null;
            this.cloudDeleting = false;
          },
          error: () => {
            this.cloudDeleting = false;
          },
        });
      },
    });
  }
}
