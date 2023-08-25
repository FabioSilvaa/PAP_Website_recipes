import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-varify-email',
  templateUrl: './varify-email.component.html',
  styleUrls: ['./varify-email.component.css']
})
export class VarifyEmailComponent implements OnInit {

  constructor(public route : Router) { }

  ngOnInit(): void {
  }


  gobacktologin(){
    this.route.navigate(["/login"]);
  }

}
