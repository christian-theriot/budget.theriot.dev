import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

declare type User = {
  id: string;
  email: string;
  authProvider: {
    name: string;
    expires: Date;
  };
};

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss'],
})
export class SignInPageComponent implements OnDestroy, OnInit {
  loginSub?: Subscription;
  user?: User;

  constructor(
    private elementRef: ElementRef,
    private http: HttpClient,
    private userService: UserService,
    private eventService: EventService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.eventService.on('Initialized').subscribe({
      next: ({ type, payload }) => {
        console.log({ [type]: payload });
      },
    });
    this.eventService.on<User>('Authenticated').subscribe({
      next: ({ type, payload }) => {
        this.user = payload;
        console.log({ [type]: payload });
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    this.loginSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.userService.injectGoogleSignInButton(
      this.elementRef,
      ({ credential }) => {
        this.loginSub = this.http
          .post('http://localhost:8080/api/auth/login', { credential })
          .subscribe({
            next: (value: any) => {
              this.eventService.dispatch<User>('Authenticated', {
                id: value.sub,
                email: value.email,
                authProvider: {
                  name: 'GIS',
                  expires: new Date(parseInt(`${value.exp}000`)),
                },
              });
            },
            error: (err) => console.error(err),
          });
      }
    );
  }
}
