import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  authState,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private fireauth: AngularFireAuth,
    private router: Router,
    private db: AngularFireDatabase
  ) {}

  // login method
  login(email: string, password: string) {
    this.fireauth.signInWithEmailAndPassword(email, password).then(
      (res) => {
        localStorage.setItem('token', 'true');
        localStorage.setItem('email', email); // Store the user's email address in localStorage
        if (res.user?.emailVerified == true) {
          // Check if the user email exists in the profiles section of the Realtime Database
          this.db
            .list('/profile', (ref) =>
              ref.orderByChild('profilesemail').equalTo(email)
            )
            .valueChanges()
            .subscribe((profiles: any[]) => {
              if (profiles.length > 0) {
                // If user exists in profiles section, navigate to homepage
                this.router.navigate(['homepage']);
                setTimeout(() => {
                  location.reload();
                }, 500);
              } else {
                // If user does not exist in profiles section, navigate to somewhere else
                this.router.navigate(['profile']);
              }
            });
        } else {
          this.router.navigate(['/verify-email']);
        }
      },
      (err) => {
        alert(err.message);
        window.location.reload();
        this.router.navigate(['/login']);
      }
    );
  }

  // register method
  register(email: string, password: string) {
    this.fireauth.createUserWithEmailAndPassword(email, password).then(
      (res) => {
        alert('Registration Successful');
        this.sendEmailForVarification(res.user);
        this.router.navigate(['/login']);
        return;
      },
      (err) => {
        alert(err.message);
        this.router.navigate(['/register']);
      }
    );
  }

  // sign out
  logout() {
    this.fireauth.signOut().then(
      () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email'); 
        this.router.navigate(['/login']);
        setTimeout(() => {
          location.reload();
        }, 300);
      },
      (err) => {
        alert(err.message);
      }
    );
  }

  // forgot password
  forgotPassword(email: string) {
    this.fireauth.sendPasswordResetEmail(email).then(
      () => {
        this.router.navigate(['/varify-email']);
      },
      (err) => {
        alert('Something went wrong');
      }
    );
  }

  // email varification
  sendEmailForVarification(user: any) {
    console.log(user);
    user.sendEmailVerification().then(
      (res: any) => {
        this.router.navigate(['/varify-email']);
      },
      (err: any) => {
        alert('Something went wrong. Not able to send mail to your email.');
      }
    );
  }

  //sign in with google
  googleSignIn() {
    return this.fireauth.signInWithPopup(new GoogleAuthProvider()).then(
      (res) => {
        localStorage.setItem('token', 'true');
        this.fireauth.authState.subscribe((user) => {
          if (user) {
            const userEmail = user.email;
            const profilesRef = this.db.list('/profile', (ref) =>
              ref.orderByChild('profilesemail').equalTo(userEmail)
            );
            profilesRef.valueChanges().subscribe((profiles: any[]) => {
              if (profiles.length === 0) {
                // User email does not exist in profiles database
                // Navigate to somewhere
                this.router.navigate(['/profile']);
              } else {
                // User email exists in profiles database
                // Navigate to homepage
                this.router.navigate(['/homepage']);
            
                setTimeout(() => {
                  window.location.reload()
                }, 500);
              }
            });
          }
        });
      },
      (err) => {
        alert(err.message);
      }
    );
  }
}
