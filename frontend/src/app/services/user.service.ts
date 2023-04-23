import { ElementRef, Injectable } from '@angular/core';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private eventService: EventService) {}

  injectGoogleSignInButton(
    elementRef: ElementRef,
    callback: ({ credential }: { credential: string }) => void
  ) {
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      const Window = window as typeof window & { google: any };

      Window.google.accounts.id.initialize({
        client_id:
          '1039686909483-v0c4tvd7d8eg5g30fovk7gjta4o253hk.apps.googleusercontent.com',
        callback,
      });
      this.eventService.dispatch('Initialized');
      Window.google.accounts.id.prompt();
    };

    elementRef.nativeElement.appendChild(script);
  }
}
