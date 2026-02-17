import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncDashboardComponent } from './sync-dashboard.component';

describe('SyncDashboardComponent', () => {
  let component: SyncDashboardComponent;
  let fixture: ComponentFixture<SyncDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SyncDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyncDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
