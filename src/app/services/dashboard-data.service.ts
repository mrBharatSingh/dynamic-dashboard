import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import type { Widget } from '../../libs/dashboard-api';

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  /** Ordered list of all dashboard tab names (persisted in localStorage). */
  dashboardName = new BehaviorSubject<string[]>(['Home']);

  /**
   * The tab that is currently visible in HomeComponent.
   * AppComponent reads this so the Backup button knows which dashboard to save.
   */
  activeDashboardName = new BehaviorSubject<string>('Home');

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('DashBoardNameArray');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.dashboardName.next(parsed);
        this.activeDashboardName.next(parsed[0]);
      }
    }
  }

  /**
   * Returns the current widget layout for the named dashboard from localStorage.
   * Strips the local-only `boardName` field so the payload is API-clean.
   */
  getWidgetsForDashboard(name: string): Widget[] {
    const raw = localStorage.getItem(name + 'DashBoardGridLayout');
    if (!raw) return [];
    const items: any[] = JSON.parse(raw) ?? [];
    return items.map((item) => ({
      id: String(item.id),
      x: item.x ?? 0,
      y: item.y ?? 0,
      w: item.w ?? 2,
      h: item.h ?? 2,
      name: item.name ?? '',
      url: item.url ?? '',
      backgroundColor: (item.backgroundColor ?? '').replace('#', ''),
    }));
  }

  downloadJSON() {
    const jsonData: Record<string, any> = {};
    this.dashboardName.value.forEach((el) => {
      jsonData[el] = JSON.parse(
        localStorage.getItem(el + 'DashBoardGridLayout') ?? 'null',
      );
    });
    const blob = new Blob([JSON.stringify(jsonData)], {
      type: 'application/json',
    });
    saveAs(blob, 'DashBoardData.json');
  }
}
