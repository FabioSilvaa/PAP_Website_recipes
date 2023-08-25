import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Todo } from '../homepage/todo';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AuthService } from 'src/app/shared/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DomSanitizer } from '@angular/platform-browser';
import { map, take, timeout, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-recipe',
  templateUrl: './new-recipe.component.html',
  styleUrls: ['./new-recipe.component.css'],
})
export class NewRecipeComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  newuser: String | null = '';
  newname: String = '';
  newurl: string | ArrayBuffer | null = '';
  newtemp: string = '';
  newtype: string = '';
  newdesc: string = '';
  newvideo: string | ArrayBuffer | null = '';
  user: any;
  newid: string = '';
  imageuploaded: string | ArrayBuffer | null = '';
  todos: Todo[] = [];

  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService,
    public afAuth: AngularFireAuth,
    public sanitizer: DomSanitizer,
    public router : Router
  ) {}

  ngOnInit(): void {}

  importImage() {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        const imageUrl = reader.result;
        this.imageuploaded = imageUrl;
      };
    }
  }

  chose(event: any) {
    console.log(event.target.value);
    if (event.target.value === '1') {
      document.getElementById('img')?.removeAttribute('hidden');
      document.getElementById('RecipeVideo')?.setAttribute('hidden', '');
    }
    if (event.target.value === '2') {
      document.getElementById('img')?.removeAttribute('hidden');
      document.getElementById('RecipeVideo')?.removeAttribute('hidden');
    }
  }

  saverecipe() {
    console.log("ta")
    if (this.newname) {
      let todo = new Todo();

      this.afAuth.authState.subscribe((user) => {
        if (user) {
          console.log(user.email);
          todo.recipeuser = user.email;
          todo.recipename = this.newname;
          todo.recipeurl = this.imageuploaded;
          todo.recipetemp = this.newtemp;
          todo.recipetype = this.newtype;
          todo.recipedesc = this.newdesc;
          todo.recipevideo = this.newvideo;
          todo.avgRating = 0;
          // Generate a new ID using the current timestamp
          const timestamp = new Date().getTime();
          this.newid = timestamp.toString();
          todo.id = this.newid;

          console.log(todo.id);

          // Push the new todo object to the todos array and save it to the database
          this.todos.push(todo);
          this.db.list('/recipes').push(todo);

          this.newname = '';
          this.newurl = '';
          this.newtemp = '';
          this.newtype = '';
          this.newdesc = '';
          this.newuser = '';

          this.router.navigate(['homepage']);
        } else {
          // handle the case when the user is not authenticated
        }
      });
    }
  }
}
