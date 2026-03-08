import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  APP_BASE_HREF,
  LocationStrategy,
  HashLocationStrategy,
} from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShortcutComponent } from './shortcut/shortcut.component';
import { LinksComponent } from './links/links.component';
import { AddNewShortcutComponent } from './add-new-shortcut/add-new-shortcut.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AddNewDashboardTabComponent } from './add-new-dashboard-tab/add-new-dashboard-tab.component';
import { SyncDashboardComponent } from './sync-dashboard/sync-dashboard.component';

// PrimeNG Modules
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ColorPickerModule } from 'primeng/colorpicker';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FileUploadModule } from 'primeng/fileupload';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TimelineModule } from 'primeng/timeline';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

// Keep KtdGrid for grid layout (no PrimeNG equivalent)
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { ApiModule, Configuration } from 'src/libs/dashboard-api';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    ShortcutComponent,
    LinksComponent,
    AddNewShortcutComponent,
    NotificationsComponent,
    AddNewDashboardTabComponent,
    SyncDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    KtdGridModule,
    // PrimeNG
    ToolbarModule,
    ButtonModule,
    TabViewModule,
    TableModule,
    CardModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ColorPickerModule,
    BadgeModule,
    TooltipModule,
    OverlayPanelModule,
    FileUploadModule,
    RippleModule,
    ToastModule,
    DividerModule,
    TagModule,
    AvatarModule,
    MenuModule,
    PaginatorModule,
    TimelineModule,
    ConfirmDialogModule,
    ApiModule.forRoot(
      () => new Configuration({ basePath: environment.apiBasePath }),
    ),
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    MessageService,
    ConfirmationService,
    provideHttpClient(withFetch()),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '[data-theme="dark"]',
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
