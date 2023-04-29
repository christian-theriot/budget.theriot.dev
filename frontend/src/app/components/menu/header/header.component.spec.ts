import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let userService: UserService;
  let elementRef: ElementRef;
  let eventService: EventService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [UserService],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
    eventService = fixture.debugElement.injector.get(EventService);
    elementRef = fixture.debugElement.injector.get(ElementRef);
    router = fixture.debugElement.injector.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSignIn runs authenticate on the userService', () => {
    spyOn(userService, 'authenticate').and.callFake(() => {});

    component.onSignIn(new Event('click'));

    expect(userService.authenticate).toHaveBeenCalledWith(elementRef);
  });

  it('onSignOut calls logout on the userService', () => {
    spyOn(userService, 'logout').and.callFake(() => {});

    component.onSignOut(new Event('click'));

    expect(userService.logout).toHaveBeenCalled();
  });

  it('listens to the LOGIN event, then set user to payload', () => {
    eventService.dispatch<User>('LOGIN', { id: 1, email: 'test' });

    expect(component.user).toEqual({ id: 1, email: 'test' });
  });

  it('listens to the REDIRECT event, then pass the route to router navigate', () => {
    spyOn(router, 'navigate').and.resolveTo(true);

    eventService.dispatch('REDIRECT', '/test');

    expect(router.navigate).toHaveBeenCalledWith(['/test']);
  });
});
