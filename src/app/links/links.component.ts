import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToolsService } from 'src/libs/dashboard-api';

@Component({
  standalone: false,
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
})
export class LinksComponent implements OnInit {
  linksData: any[] = [];
  filteredData: any[] = [];
  searchText = '';
  showAddDialog = false;
  dialogData: any = {};
  loading = false;

  @ViewChild('dt') dt: Table;

  constructor(
    private toolsService: ToolsService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadTools();
  }

  loadTools(): void {
    this.loading = true;
    this.toolsService.getAllTools().subscribe({
      next: (res) => {
        this.linksData = res.data ?? [];
        this.filteredData = [...this.linksData];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tools. Is the backend running?',
        });
        this.loading = false;
      },
    });
  }

  /** Refreshes tool list from the backend. */
  refresh(): void {
    this.searchText = '';
    if (this.dt) {
      this.dt.filterGlobal('', 'contains');
    }
    this.loadTools();
  }

  applyFilter(event: Event | string) {
    const filterValue =
      typeof event === 'string'
        ? event
        : (event.target as HTMLInputElement).value;
    this.searchText = filterValue;
    if (this.dt) {
      this.dt.filterGlobal(filterValue, 'contains');
    }
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  addToDashboard(data: any) {
    this.dialogData = { name: data.toolName, url: data.url };
    this.showAddDialog = true;
  }

  onShortcutDialogClose(result: any) {
    this.showAddDialog = false;
    if (result) {
      let layout = JSON.parse(
        localStorage.getItem(result.boardName + 'DashBoardGridLayout') || '[]',
      );
      let max = 0;
      layout.forEach((el: any) => {
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
      layout = [...layout, tempTile];
      localStorage.setItem(
        result.boardName + 'DashBoardGridLayout',
        JSON.stringify([...layout]),
      );
    }
  }
}

