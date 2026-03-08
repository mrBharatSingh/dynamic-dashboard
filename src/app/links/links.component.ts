import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardDataService } from '../services/dashboard-data.service';
import { Table } from 'primeng/table';

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

  @ViewChild('dt') dt: Table;

  defaultData = [
    {
      toolName: 'Chat GPT',
      description: 'AI language model for generating human-like text',
      url: 'https://chatgpt.com/',
    },
    {
      toolName: 'Gemini',
      description: 'AI model by Google for various applications',
      url: 'https://gemini.google.com/app',
    },
    {
      toolName: 'YouTube',
      description: 'Video sharing platform',
      url: 'https://www.youtube.com/',
    },
    {
      toolName: 'Stack Overflow',
      description: 'Community-driven Q&A for programmers',
      url: 'https://stackoverflow.com/',
    },
    {
      toolName: 'MDN Web Docs',
      description: 'Resources for developers, by developers',
      url: 'https://developer.mozilla.org/',
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
