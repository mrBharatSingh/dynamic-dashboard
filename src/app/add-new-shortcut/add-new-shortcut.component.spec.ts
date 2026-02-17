import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewShortcutComponent } from './add-new-shortcut.component';

describe('AddNewShortcutComponent', () => {
  let component: AddNewShortcutComponent;
  let fixture: ComponentFixture<AddNewShortcutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewShortcutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
