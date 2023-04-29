import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from 'src/app/services/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let userService: UserService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [UserService],
    });
    guard = TestBed.inject(AuthGuard);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('canActivate returns true if user is authenticated', async () => {
    spyOn(userService, 'isAuthenticated').and.returnValue(true);

    const value = await guard.canActivate();

    expect(value).toBeTrue();
  });

  it('canActivate redirects to / if user is unauthenticated; returns false', async () => {
    spyOn(userService, 'isAuthenticated').and.returnValue(false);
    spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));

    const value = await guard.canActivate();

    expect(value).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
