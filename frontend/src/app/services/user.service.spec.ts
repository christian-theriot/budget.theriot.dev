import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { of, throwError } from 'rxjs';
import { EventService } from './event.service';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpClient;
  let eventService: EventService;
  let cookieService: CookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [CookieService, EventService],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpClient);
    eventService = TestBed.inject(EventService);
    cookieService = TestBed.inject(CookieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated checks for the existance of a user cookie', () => {
    spyOn(cookieService, 'check').and.returnValue(true);

    const value = service.isAuthenticated();

    expect(value).toBeTrue();
  });

  it('authenticate with no params checks for the existance of a user cookie', () => {
    spyOn(eventService, 'dispatch').and.callFake(() => {});
    spyOn(cookieService, 'get').and.returnValue('{"100":"test@gmail.com"}');

    service.authenticate();

    expect(eventService.dispatch).toHaveBeenCalledWith('LOGIN', {
      100: 'test@gmail.com',
    });
  });

  it('authenticate with an elementRef attempts prelogin', (done) => {
    spyOn(cookieService, 'get').and.returnValue('');
    spyOn(cookieService, 'set').and.callFake(
      (_name: string, ..._args: any) => {}
    );
    spyOn(http, 'get').and.returnValue(
      of({ id: 100, email: 'test@gmail.com' })
    );
    spyOn(eventService, 'dispatch').and.callFake((...args: any) => {
      expect(args[0]).toBe('LOGIN');
      expect(args[1]).toEqual({ id: 100, email: 'test@gmail.com' });
      expect(cookieService.set).toHaveBeenCalledWith(
        'user',
        '{"100":"test@gmail.com"}'
      );

      done();
    });

    service.authenticate({} as ElementRef);
  });

  it('authenticate then injects the google sign in button if prelogin fails', (done) => {
    spyOn(service as any, 'injectGoogleSignIn').and.callFake(() => {
      done();
    });
    spyOn(cookieService, 'get').and.returnValue('');
    spyOn(http, 'get').and.returnValue(
      throwError(() => new Error('401 Unauthenticated'))
    );

    service.authenticate({} as ElementRef);
  });

  it('logout deletes the user cookie and logs the user out', (done) => {
    spyOn(eventService, 'dispatch').and.callFake((name, param) => {
      switch (name) {
        case 'LOGOUT':
          expect(param).toBeUndefined();
          break;
        case 'REDIRECT':
          expect(param as string).toBe('/');
          break;
      }
    });
    spyOn(http, 'get').and.returnValue(of({}));
    spyOn(cookieService, 'delete').and.callFake((name) => {
      expect(name).toBe('user');

      done();
    });

    service.logout();
  });

  it('logout can catch any http errors', (done) => {
    spyOn(eventService, 'dispatch').and.callFake((name, param) => {
      switch (name) {
        case 'LOGOUT':
          expect(param).toBeUndefined();
          break;
        case 'REDIRECT':
          expect(param as string).toBe('/');
          break;
      }
    });
    spyOn(http, 'get').and.returnValue(
      throwError(() => new Error('mock error'))
    );
    spyOn(console, 'error').and.callFake(() => {});
    spyOn(cookieService, 'delete').and.callFake((name) => {
      expect(name).toBe('user');
      expect(console.error).toHaveBeenCalledWith(new Error('mock error'));

      done();
    });

    service.logout();
  });

  it('onGoogleSignIn passes the credential from the google sign in flow to the server', (done) => {
    spyOn(http, 'post').and.returnValue(
      of({ id: 100, email: 'test@gmail.com' })
    );
    spyOn(cookieService, 'set').and.callFake((name: string, value: string) => {
      expect(name).toBe('user');
      expect(value).toBe('{"100":"test@gmail.com"}');
    });
    spyOn(eventService, 'dispatch').and.callFake((type, value: any) => {
      switch (type) {
        case 'LOGIN':
          expect(value).toEqual({ id: 100, email: 'test@gmail.com' });
          break;
        case 'REDIRECT':
          expect(value).toEqual('/user');
          done();
          break;
      }
    });

    (service as any).onGoogleSignIn('test');
  });

  it('onGoogleSignIn can catch errors', (done) => {
    spyOn(http, 'post').and.returnValue(
      throwError(() => new Error('mock error'))
    );
    spyOn(cookieService, 'set');
    spyOn(eventService, 'dispatch');
    spyOn(console, 'error').and.callFake((err) => {
      expect(err).toEqual(new Error('mock error'));

      done();
    });

    (service as any).onGoogleSignIn('test');
  });
});
