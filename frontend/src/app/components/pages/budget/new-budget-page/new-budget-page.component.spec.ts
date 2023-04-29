import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'src/app/spec/mock';

import { NewBudgetPageComponent } from './new-budget-page.component';

describe('NewBudgetPageComponent', () => {
  let component: NewBudgetPageComponent;
  let fixture: ComponentFixture<NewBudgetPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewBudgetPageComponent, MockComponent('app-header')],
    }).compileComponents();

    fixture = TestBed.createComponent(NewBudgetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
