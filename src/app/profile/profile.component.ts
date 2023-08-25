import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { empty, isEmpty, map, take } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { profiles } from './profile';
import { Todo } from '../component/homepage/todo';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  mainimg: any;
  name: any;
  test: number = 0;
  constructor(
    private auth: AuthService,
    private db: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public sanitizer: DomSanitizer
  ) {
    this.fileInput = new ElementRef(null);
  }
  email: any;
  todos: Todo[] = [];
  profile: profiles[] = [];
  user: any;
  credentials: any;
  newuser1: String | null = '';
  newname1: String = '';
  newurl1: string | ArrayBuffer | null = '';
  newtemp1: string = '';
  newtype1: string = '';
  newdesc1: any;
  newvideo1: string | ArrayBuffer | null = '';

  profilesemail: string = "";

  userEmail:any

  imageuploaded1: string | ArrayBuffer | null = '';
  data: any;
  ngOnInit(): void {
    const emailValue = document.getElementById('Email') as HTMLInputElement;
  
    this.db
      .list('profile')
      .valueChanges()
      .subscribe((profiles: any) => {
        const matchingProfiles = profiles.filter(
          (profile: any) => profile.profilesemail === emailValue.value
        );
        if (matchingProfiles.length > 0) {
          const profileMatch = matchingProfiles[0];
          const profileName = profileMatch.profilesname;
          const email = profileMatch.profilesemail;
          const imageUrl = profileMatch.profilesimgurl;
          this.mainimg = imageUrl;
          this.name = profileName;
  
          document.getElementById('test')?.setAttribute('hidden', 'hidden');
          document.getElementById('edit-profile')?.removeAttribute('hidden');
          document.getElementById('recipe')?.removeAttribute('hidden');
        } else {
          document.getElementById('test')?.removeAttribute('hidden');
          document.getElementById('edit-profile')?.setAttribute('hidden', 'hidden');
          document.getElementById('recipe')?.setAttribute('hidden', 'disabled');
        }
      });
  
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        console.log(user.email);
        this.email = user.email;
        const input = document.getElementById('Email') as HTMLInputElement | null;
        if (input != null) {
          input.value = this.email;
        }
      } else {
      }
    });
  }
  


  selectedRecipe!: Todo; // add this variable to store the selected recipe

  review(Fav: Todo) {
    console.log(Fav);

    const recipeRef = this.db.object<Todo>(`recipes/${Fav.id}`);
    recipeRef.valueChanges().subscribe(recipe => {
      console.log(recipe);
      this.selectedRecipe != recipe; // store the selected recipe
    });
  }



  amostra(todo : Todo){


    this.newname1 = todo.recipename ;
    this.newurl1 = todo.recipeurl;
    this.newtemp1 = todo.recipetemp ;
    this.newtype1 = todo.recipetype;
    this.newdesc1 = todo.recipedesc;
    this.newvideo1 = todo.recipevideo ;



  }

  chose(event: any) {
    console.log(event.target.value);
    if (event.target.value === '1') {
      document.getElementById('imgg')?.removeAttribute('hidden');
      document.getElementById('RecipeVideoo')?.setAttribute('hidden', '');
    }
    if (event.target.value === '2') {
      document.getElementById('imgg')?.removeAttribute('hidden');
      document.getElementById('RecipeVideoo')?.removeAttribute('hidden');
    }
  }



  mostra() {
    const newData = {
      recipename: this.newname1,
      recipevideo: this.newvideo1,
      recipetemp: this.newtemp1,
      recipeurl : this.imageuploaded1,
      recipetype: this.newtype1,
      recipedesc: this.newdesc1,

    };

    this.db
      .list('recipes', (ref) =>
        ref.orderByChild('recipeuser').equalTo(this.email)
      )
      .snapshotChanges()
      .subscribe(
        (recipes) => {
          if (recipes.length > 0) {
            const recipeKey = recipes[0].key;
            this.db.object(`recipes/${recipeKey}`).update(newData);
          } else {
            console.error(`No recipe found with user email ${this.email}`);
          }
        },
        (error) => {
          console.error(error);
        }
      );

  }

  showrec() {
    document.getElementById('yourrecipes')?.removeAttribute('hidden');
    document.getElementById('favrecipes')?.setAttribute('hidden', '');
    this.todos.splice(0, this.todos.length);
    const dbRef = this.db.database.ref('recipes');
    dbRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.child('recipeuser').val() === this.email) {
          this.todos.push(childSnapshot.val());
        }
      });
    });
  }

  showfav() {
    document.getElementById('yourrecipes')?.setAttribute('hidden', '');
    document.getElementById('favrecipes')?.removeAttribute('hidden');
    this.todos.splice(0, this.todos.length);
    const dbRef = this.db.database.ref('Favorites');
    dbRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.child('recipeFavoriteby').val() === this.email) {
          this.todos.push(childSnapshot.val());
        }
      });
    });
  }

  logout() {
    this.auth.logout();
  }

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
        this.imageuploaded1 = imageUrl;
        console.log(imageUrl)
      };
    } else {
      // If no new image was selected, retrieve the saved image from the database
      this.db.object('profile/profilesimgurl').valueChanges().subscribe((imageUrl: any) => {
        console.log(imageUrl)


      });


    }
  }

  getVideoId(url: string): string {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;
    return searchParams.get('v') || '';
  }

  videoLoaded = false;
  cachedVideoUrl!: SafeResourceUrl;

  getEmbedUrl(videoId: string): SafeResourceUrl {
    if (!videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }

    if (this.videoLoaded) {
      return this.cachedVideoUrl;
    }

    const randomParam = Math.floor(Math.random() * 100000);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?v=${randomParam}`;
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.cachedVideoUrl = safeUrl;
    this.videoLoaded = true;
    return safeUrl;
  }



  changeprofile() {
    const name = document.getElementById('names') as HTMLInputElement;
    const newName = name.value; // new name
    console.log(this.email);
  
    // Check if a profile with the new name already exists
    this.db.list('profile').valueChanges().pipe(take(1)).subscribe((profiles: any[]) => {
      const matchingProfile = profiles.find(profile => profile.profilesname === newName);
      if (matchingProfile) {
        // Profile with the same name already exists, show an error or take appropriate action
        alert('Profile with the same name already exists');
      } else {
        // No profile with the same name exists, proceed with updating the profile
        let newData: any = {
          profilesname: newName,
        };
  
        if (this.imageuploaded1) {
          newData.profilesimgurl = this.imageuploaded1; // new image URL
        } else {
          // Retrieve saved image URL from database
          this.db
            .list('profile', (ref) =>
              ref.orderByChild('profilesemail').equalTo(this.email)
            )
            .valueChanges()
            .subscribe(
              (profiles: any) => {
                if (profiles.length > 0) {
                  newData.profilesimgurl = profiles[0].profilesimgurl;
                } else {
                  console.error(`No profile found with email ${this.email}`);
                }
              },
              (error) => {
                console.error(error);
              }
            );
        }
  
        this.db
          .list('profile', (ref) =>
            ref.orderByChild('profilesemail').equalTo(this.email)
          )
          .snapshotChanges()
          .subscribe(
            (profiles) => {
              if (profiles.length > 0) {
                const profileKey = profiles[0].key;
                this.db.object(`profile/${profileKey}`).update(newData);
              } else {
                console.error(`No profile found with email ${this.email}`);
              }
            },
            (error) => {
              console.error(error);
            }
          );
      }
    });
  
    name.value = '';
    this.imageuploaded1 = '';
    window.location.reload();
  }




  update() {
    const inputname = document.getElementById('name') as HTMLInputElement;
    const emailvalue = document.getElementById('Email') as HTMLInputElement;
  
    const profileinfo = new profiles();
    profileinfo.profilesname = inputname.value;
    profileinfo.profilesimgurl = this.imageuploaded1;
    profileinfo.profilesemail = emailvalue.value;
  
    // Check if a profile with the same name already exists
    this.db.list('profile').valueChanges().pipe(take(1)).subscribe((profiles: any[]) => {
      const matchingProfile = profiles.find(profile => profile.profilesname === profileinfo.profilesname);
      if (matchingProfile) {
        // Profile with the same name already exists, show an error or take appropriate action
        alert('Profile with the same name already exists');
      } else {
        // No profile with the same name exists, proceed with adding the profile
        this.profile.push(profileinfo);
        this.db.list('/profile').push(profileinfo);
      }
    });
  }

  delete(index: number) {
    // Remove the item at the specified index using splice()
    const deletedfromfb = this.todos.splice(index, 1)[0];
    this.db
      .list('/recipes')
      .snapshotChanges()
      .subscribe((todos) => {
        todos.forEach((todo) => {
          const todoData = todo.payload.val() as Todo;
          if (todoData.recipename === deletedfromfb.recipename) {
            const key = todo.payload.key;
            if (key) {
              this.db.list('/recipes').remove(key);
            }
          }
        });
      });
  }

  deletefav(index: number) {
    // Remove the item at the specified index using splice()
    const deletedfromfb = this.todos.splice(index, 1)[0];
    this.db
      .list('/Favorites')
      .snapshotChanges()
      .subscribe((todos) => {
        todos.forEach((todo) => {
          const todoData = todo.payload.val() as Todo;
          if (todoData.recipeFavoriteby === deletedfromfb.recipeFavoriteby) {
            const key = todo.payload.key;
            if (key) {
              this.db.list('/Favorites').remove(key);
            }
          }
        });
      });
  }
}
