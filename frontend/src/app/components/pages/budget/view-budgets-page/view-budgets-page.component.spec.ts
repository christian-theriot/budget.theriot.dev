import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'src/app/spec/mock';

import { ViewBudgetsPageComponent } from './view-budgets-page.component';

describe('ViewBudgetsPageComponent', () => {
  let component: ViewBudgetsPageComponent;
  let fixture: ComponentFixture<ViewBudgetsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewBudgetsPageComponent, MockComponent('app-header')],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewBudgetsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
