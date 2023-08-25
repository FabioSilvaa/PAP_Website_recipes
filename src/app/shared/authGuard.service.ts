import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private fireauth: AngularFireAuth, private router: Router, private db: AngularFireDatabase) { }

  canActivate(): Observable<boolean> {
    return this.fireauth.authState.pipe(
      take(1),
      map(authState => !!authState),
      map(authenticated => {
        if (authenticated) {
          const token = localStorage.getItem('token');
          if (token === 'true') {
            return true;
          } else {
            this.router.navigate(['/login']);
            return false;
          }
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }

  
  
}




