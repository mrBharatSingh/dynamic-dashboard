import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  dashboardName = new BehaviorSubject<string[]>(['Home']);
  getDashbord;
  constructor(private http: HttpClient) {
    if (JSON.parse(localStorage.getItem('DashBoardNameArray'))) {
      this.dashboardName.next(
        JSON.parse(localStorage.getItem('DashBoardNameArray')) as string[]
      );
    }
  }
  getData(): Observable<any> {
    return this.http.get<any>('dashBoardData.json');
  }
  downloadJSON() {
    let jsonData = {};
    this.dashboardName.value.forEach((el) => {
      jsonData[el] = JSON.parse(
        localStorage.getItem(el + 'DashBoardGridLayout')
      );
    });
    const json = JSON.stringify(jsonData);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'DashBoardData.json');
  }
}
