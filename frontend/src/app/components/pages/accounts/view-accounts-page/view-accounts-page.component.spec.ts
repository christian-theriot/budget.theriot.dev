import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'src/app/spec/mock';

import { ViewAccountsPageComponent } from './view-accounts-page.component';

describe('ViewAccountsPageComponent', () => {
  let component: ViewAccountsPageComponent;
  let fixture: ComponentFixture<ViewAccountsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAccountsPageComponent, MockComponent('app-header')],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewAccountsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
