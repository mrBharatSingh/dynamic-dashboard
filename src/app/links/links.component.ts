import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardDataService } from '../services/dashboard-data.service';
import { Table } from 'primeng/table';

@Component({
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

  @ViewChild('dt') dt: Table;

  defaultData = [
    {
      toolName: 'IQM',
      description: 'Integration Queue Manager',
      url: 'https://brksw-ci.zf-world.com/iqm/#/',
    },
    {
      toolName: 'PDB',
      description: 'Project database management tool',
      url: 'https://adw.zf-world.com/pdb/#/home',
    },
    {
      toolName: 'Ticket System',
      description: 'Ticket system',
      url: 'https://adw.zf-world.com/tickets/',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.linksData = JSON.parse(localStorage.getItem('dashBoardLinks') || '[]');
    this.filteredData = [...this.linksData];
  }

  syncLinks() {
    localStorage.setItem('dashBoardLinks', JSON.stringify(this.defaultData));
    this.refresh();
  }

  applyFilter(event: Event | string) {
    const filterValue = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
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
        localStorage.getItem(result.boardName + 'DashBoardGridLayout') || '[]'
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
        JSON.stringify([...layout])
      );
    }
  }
}
