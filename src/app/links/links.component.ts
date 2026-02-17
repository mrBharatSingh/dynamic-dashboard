import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddNewShortcutComponent } from '../add-new-shortcut/add-new-shortcut.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
})
export class LinksComponent implements OnInit {
  displayedColumns: string[] = ['toolname', 'description', 'link', 'add'];
  dataSource: MatTableDataSource<any>;
  linksData: any;
  data = [
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

  @ViewChild('MatPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.refresh();
  }
  refresh() {
    this.linksData = JSON.parse(localStorage.getItem('dashBoardLinks'));
    this.dataSource = new MatTableDataSource(this.linksData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  syncLinks() {
    localStorage.setItem('dashBoardLinks', JSON.stringify(this.data));
    this.refresh();
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  goToLink(url: string) {
    window.open(url, '_blank');
  }

  addToDashboard(data) {
    console.log(data);

    const dialogRef = this.dialog.open(AddNewShortcutComponent, {
      height: '50%',
      width: '60%',
      data: { name: data.toolName, url: data.url },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let layout = JSON.parse(
          localStorage.getItem(result.boardName + 'DashBoardGridLayout')
        );
        console.log(result, 'The dialog was closed');
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
        console.log(layout);
        localStorage.setItem(
          result.boardName + 'DashBoardGridLayout',
          JSON.stringify([...layout])
        );
      }
    });
  }
}
