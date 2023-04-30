import { HttpClient, HttpXsrfTokenExtractor } from '@angular/common/http';
import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, of, Subscription } from 'rxjs';
import { EventService } from './event.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService implements OnDestroy {
  private sub?: Subscription;

  constructor(
    private http: HttpClient,
    private eventService: EventService,
    private cookieService: CookieService,
    private csrfTokenExtractor: HttpXsrfTokenExtractor
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
        .get<User>(`//${environment.BACKEND_URL}/auth/prelogin`, {
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
      .get(`//${environment.BACKEND_URL}/auth/logout`, {
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
        client_id: environment.GOOGLE_CLIENT_ID,
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
        `//${environment.BACKEND_URL}/auth/login`,
        { credential, _csrf: this.csrfTokenExtractor.getToken() },
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
