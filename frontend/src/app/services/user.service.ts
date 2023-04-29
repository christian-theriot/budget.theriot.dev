import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, of, Subscription } from 'rxjs';
import { EventService } from './event.service';

@Injectable({ providedIn: 'root' })
export class UserService implements OnDestroy {
  private sub?: Subscription;

  constructor(
    private http: HttpClient,
    private eventService: EventService,
    private cookieService: CookieService
  ) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  isAuthenticated() {
    return this.cookieService.check('user');
  }

  authenticate(elementRef?: ElementRef) {
    const prevSignIn = this.cookieService.get('user');
    if (prevSignIn && /^{"\d+":"[^"]+"}$/.test(prevSignIn)) {
      const user = JSON.parse(prevSignIn) as User;

      this.eventService.dispatch('LOGIN', user);
      return;
    }

    if (elementRef) {
      this.sub?.unsubscribe();
      this.sub = this.http
        .get<User>('https://localhost:8443/api/auth/prelogin', {
          withCredentials: true,
        })
        .subscribe({
          next: (value: User) => {
            this.cookieService.set(
              'user',
              JSON.stringify({ [value.id]: value.email })
            );
            this.eventService.dispatch('LOGIN', value);
          },
          error: () => this.injectGoogleSignIn(elementRef),
        });
    }
  }

  logout() {
    this.sub?.unsubscribe();
    this.sub = this.http
      .get('https://localhost:8443/api/auth/logout', {
        withCredentials: true,
        responseType: 'text',
      })
      .pipe(catchError((err) => of(err)))
      .subscribe({
        next: (err) => {
          if (err.stack) {
            console.error(err);
          }

          this.cookieService.delete('user');
          this.eventService.dispatch('LOGOUT');
          this.eventService.dispatch('REDIRECT', '/');
        },
      });
  }

  /* istanbul ignore next */
  private injectGoogleSignIn(elementRef: ElementRef) {
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      const Window = window as typeof window & { google: any };

      Window.google.accounts.id.initialize({
        client_id:
          '1039686909483-v0c4tvd7d8eg5g30fovk7gjta4o253hk.apps.googleusercontent.com',
        callback: ({ credential }: { credential: string }) =>
          this.onGoogleSignIn(credential),
      });
      Window.google.accounts.id.prompt();
    };

    elementRef.nativeElement.appendChild(script);
  }

  private onGoogleSignIn(credential: string) {
    this.sub?.unsubscribe();
    this.sub = this.http
      .post<User>(
        'https://localhost:8443/api/auth/login',
        { credential },
        { withCredentials: true }
      )
      .subscribe({
        next: (value: User) => {
          this.cookieService.set(
            'user',
            JSON.stringify({ [value.id]: value.email })
          );
          this.eventService.dispatch('LOGIN', value);
          this.eventService.dispatch('REDIRECT', '/user');
        },
        error: (err) => console.error(err),
      });
  }
}
