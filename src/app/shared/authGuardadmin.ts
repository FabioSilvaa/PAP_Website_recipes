import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardadm implements CanActivate {
  constructor(private fireauth: AngularFireAuth, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.fireauth.authState.pipe(
      take(1),
      map((authState) => !!authState),
      map((authenticated) => {
        if (authenticated) {
          const token = localStorage.getItem('token');
          const emailtoken = localStorage.getItem('email');
          if (token === 'true') {
            // User is authenticated and has admin role, check if email token matches
            if (emailtoken === 'fabiosilva10032005@gmail.com') {
              // Allow access to Admin page for the specified email token
              return true;
            } else {
              // Block access to Admin page for all other users
              this.router.navigate(['/homepage']);
              return false;
            }
          } else {
            // User is authenticated but does not have admin role, prevent access to Admin page
            this.router.navigate(['/homepage']);
            return false;
          }
        } else {
          // User is not authenticated, redirect to login page
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }



}
