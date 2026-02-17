import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewDashboardTabComponent } from './add-new-dashboard-tab.component';

describe('AddNewDashboardTabComponent', () => {
  let component: AddNewDashboardTabComponent;
  let fixture: ComponentFixture<AddNewDashboardTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewDashboardTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewDashboardTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
