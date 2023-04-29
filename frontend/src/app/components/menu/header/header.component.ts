import { Component, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  sub: Subscription[] = [];
  user?: User;

  constructor(
    private elementRef: ElementRef,
    private userService: UserService,
    private eventService: EventService,
    private router: Router
  ) {
    this.sub.push(
      this.eventService.on<User>('LOGIN').subscribe({
        next: ({ payload }) => (this.user = payload),
      }),
      this.eventService.on('REDIRECT').subscribe({
        next: async ({ payload: route }) => await this.router.navigate([route]),
      })
    );
  }

  ngOnInit() {
    this.userService.authenticate();
  }

  ngOnDestroy() {
    for (const sub of this.sub) {
      sub.unsubscribe();
    }
  }

  onSignIn(e: Event) {
    e.preventDefault();

    this.userService.authenticate(this.elementRef);
  }

  onSignOut(e: Event) {
    e.preventDefault();

    this.userService.logout();
  }
}
