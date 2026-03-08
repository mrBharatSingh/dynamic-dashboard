import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SharedDashboardComponent } from './shared-dashboard/shared-dashboard.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    pathMatch: 'full',
    component: HomeComponent,
    data: { userGroups: ['USER'] },
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
    data: { userGroups: ['ADMIN'] },
  },
  {
    path: 'dashboard/shared/:dashboardId',
    component: SharedDashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
