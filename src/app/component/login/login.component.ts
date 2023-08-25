import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';

  emailtosend: any
  
  constructor(private auth: AuthService) { }

  ngOnInit(): void {
  }

  login() {
  

    if (this.email == '') {
      alert('Please enter email');
      return;
    }

    if (this.password == '') {
      alert('Please enter password');
      return;
    }

    this.auth.login(this.email, this.password);
    console.log(this.email)
 

   

  

  }

  signInWithGoogle() {
    this.auth.googleSignIn();
  
  }

}
