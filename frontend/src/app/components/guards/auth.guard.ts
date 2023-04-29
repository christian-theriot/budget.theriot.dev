import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  async canActivate() {
    if (this.userService.isAuthenticated()) {
      return true;
    }

    await this.router.navigate(['/']);

    return false;
  }
}
