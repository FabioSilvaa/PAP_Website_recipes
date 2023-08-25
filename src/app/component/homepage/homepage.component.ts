import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { profiles } from 'src/app/profile/profile';
import { AuthService } from 'src/app/shared/auth.service';
import { LoginComponent } from '../login/login.component';
import { ProfileComponent } from 'src/app/profile/profile.component';
import { Todo } from './todo';
import { Comment } from './todo';
import { map, take, timeout, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth } from '@angular/fire/auth';

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  private embedUrlCache = new Map<string, SafeResourceUrl>();
  img: any;
  rightemail: string = '';
  session: any;
  teste: any;
  email: any;
  teste1: any;
  averageRating: any;

  profilename: any;
  imageuploaded: string | ArrayBuffer | null = '';
  showComments = false;
  showelement: any;
  commentText: string = '';
  profile: profiles[] = [];
  todos: Todo[] = [];
  coments: Comment[] = [];
  comments!: any[];
  newuser: String | null = '';
  newname: String = '';
  newurl: string | ArrayBuffer | null = '';
  newtemp: string = '';
  newtype: string = '';
  newdesc: string = '';
  newvideo: string | ArrayBuffer | null = '';
  user: any;
  newid: string = '';
  comments$!: Observable<any[]>;

  Report: string = '';

  name: String = '';
  url: string | ArrayBuffer | null = '';
  temp: string = '';
  type: string = '';
  desc: string = '';
  video: any;

  profiles$ = this.db.list('/profiles').valueChanges();

  recognition: any;
  speechRecognitionActive = false;
  transcribedText = '';

  selectedTodo!: Todo;

  filteredTodos!: any[];

  recipeNames!: string[];
  filteredRecipeNames!: string[];
  searchInput: string = '';
  recipe: any;

  constructor(
    public login: LoginComponent,
    private db: AngularFireDatabase,
    public profilea: ProfileComponent,
    private auth: AuthService,
    public afAuth: AngularFireAuth,
    public sanitizer: DomSanitizer
  ) {
    this.fileInput = new ElementRef(null);
    const email = localStorage.getItem('email'); // Retrieve the user's email address from localStorage
    if (email === 'fabiosilva10032005@gmail.com') {
      // Check if the user is an admin
      this.isAdmin = true;
    }
  }
  isAdmin: boolean = false;

  ngOnInit(): void {

    this.recognition = new webkitSpeechRecognition();

    this.recognition.addEventListener('result', (event: any) => {
      const transcribedText = event.results[0][0].transcript;
      this.transcribedText = transcribedText;

      this.filterRecipeNames();
    });

    this.recognition.addEventListener('end', () => {
      if (this.speechRecognitionActive) {
        // If speech recognition is still active, restart the recognition process

        this.recognition.start();
      } else {
        // Otherwise, reset the transcribed text and stop the recognition process
        this.transcribedText = '';
        this.recognition.stop();
      }
    });

    this.img = this.profilea.mainimg;

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.db
          .list('/profile', (ref) =>
            ref.orderByChild('profilesemail').equalTo(user.email)
          )
          .snapshotChanges()
          .subscribe((profiles: any[]) => {
            const profileNames = profiles.map(
              (profile) => profile.payload.val().profilesname
            );
            console.log(profileNames);
            this.teste1 = profileNames;
          });

        this.email = user.email;

        this.db
          .list('profile')
          .valueChanges()
          .subscribe((profiles: any) => {
            const matchingProfiles = profiles.filter(
              (profiles: any) => profiles.profilesemail === this.email
            );
            if (matchingProfiles.length > 0) {
              const profilematch = matchingProfiles[0];
              const imageurl = profilematch.profilesimgurl;
              this.img = imageurl;
            }
          });
      } else {
      }
    });

    console.log(this.user);

    //Para pegar todos os valores da Database
    const dbRef = this.db.database.ref('/recipes');
    dbRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        this.todos.push(childSnapshot.val());
      });
    });
  }

  toggleComments() {
    this.showComments = !this.showComments;
  }

  printRecipe(todo: Todo) {
    // Create a new HTML document with the recipe content
    const printContent = `
    <html>
    <head>
      <title>Print Recipe</title>
      <style>
        /* Add any custom styles for printing */
        @media print {
          /* Add any custom styles for printing */
        }
      </style>
    </head>
    <body>
    <br>
    <br>
      <h1 style="display: flex; justify-content: center; align-items: center; text-align: center;">${
        this.name
      }</h1>

      <br>
      <br>
      <div class="teste" style="display: flex; justify-content: center; align-items: center; text-align: center;">
        <br>
        <img style = "border-radius: 10px;" src="${
          this.url
        }" alt="" width="500" height="400">
      </div>
      <br>

      <div class="time" style="display: flex; justify-content: center; align-items: center; text-align: center;" >
      <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-clock"
      viewBox="0 0 16 16"
    >
      <path
        d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
      />
      <path
        d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"
      />


    </svg>
   </div>
   <div class="time" style="display: flex; justify-content: center; align-items: center; text-align: center;" >
   <p>${this.temp + 'min'}</p>
   </div>

      <div class="time" style="display: flex; justify-content: center; align-items: center; text-align: center;" >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tag" viewBox="0 0 16 16">
        <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z"/>
        <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z"/>
      </svg>
      <br>

      </div>
      <div class="time" style="display: flex; justify-content: center; align-items: center; text-align: center;" >
      <p>${this.type}</p>
      </div>

    <div class="time" style="display: flex; justify-content: center; align-items: center; text-align: center;" >

    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    class="bi bi-book"
    viewBox="0 0 16 16"
  >
    <path
      d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"
    />
  </svg>
  </div>
  <div class="time" style="display: flex; justify-content: center; align-items: center; text-align: center;" >
  <p style="text-align: center;">${this.desc}</p>
  </div>
    </body>
  </html>
    `;

    // Open a new window with the recipe content
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      // Trigger the print dialog
      printWindow.print();

      // Wait for the print dialog to open
      const timeout = 100;
      const startTime = new Date().getTime();
      const checkPrintDialog = setInterval(() => {
        if (new Date().getTime() - startTime > timeout || printWindow.closed) {
          clearInterval(checkPrintDialog);
          printWindow.close();
        }
      }, 50);
    } else {
      console.error('Could not open print window');
    }
  }

  toggleSpeechRecognition() {
    if (this.speechRecognitionActive) {
      // If speech recognition is already active, stop it
      this.speechRecognitionActive = false;
      this.recognition.stop();
    } else {
      // Otherwise, start the recognition process
      this.speechRecognitionActive = true;
      this.recognition.start();
    }
  }

  filterRecipeNames() {
    let searchInput = this.transcribedText.toLowerCase();

    if (this.todos) {
      this.todos = this.todos.filter((todo) => {
        const name = todo.recipename.toLowerCase();
        const desc = todo.recipedesc.toLowerCase();
        const search = this.searchInput.toLowerCase();
        return name.includes(searchInput) || desc.includes(searchInput);
      });
    }
  }

  filterRecipeNames1() {
    if (this.searchInput == '') {
      this.todos.splice(0, this.todos.length);
      const dbRef = this.db.database.ref('/recipes');
      dbRef.once('value').then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          this.todos.push(childSnapshot.val());
        });
      });
    }

    if (this.todos) {
      this.todos = this.todos.filter((todo) => {
        const name = todo.recipename.toLowerCase();
        const desc = todo.recipedesc.toLowerCase();
        const search = this.searchInput.toLowerCase();
        return name.includes(search) || desc.includes(search);
      });
    }
  }

  tira() {
    document.getElementById('tirahidden')?.removeAttribute('hidden');
  }

  getRecipeNames() {
    this.db
      .list('/recipes')
      .valueChanges()
      .subscribe((data: any[]) => {
        this.recipeNames = data.map((todo) => todo.recipename);
        console.log(this.recipeNames);
        this.filteredRecipeNames = this.recipeNames;
      });
  }

  logout() {
    this.auth.logout();
  }

  showRecipeId(todo: Todo, index: number) {
    this.videoLoaded = false;
    console.log(`The ID of ${todo.recipename} is ${todo.id}`);

    this.video = '';
    const recipesRef = this.db.list('/recipes', (ref) =>
      ref.orderByChild('id').equalTo(todo.id)
    );
    recipesRef
      .snapshotChanges()
      .pipe(
        take(1),
        map((changes) => {
          const recipeKey = changes[0].key;
          console.log(recipeKey);
          this.teste = recipeKey;

          const recipeRef = this.db.object(`/recipes/${recipeKey}`);
          recipeRef.valueChanges().subscribe((recipe) => {
            this.recipe = recipe;
            this.name = this.recipe.recipename;
            this.temp = this.recipe.recipetemp;
            this.url = this.recipe.recipeurl;
            this.type = this.recipe.recipetype;
            this.desc = this.recipe.recipedesc;
            this.video = this.recipe.recipevideo;
          });

          this.comments = [];
          this.db
            .list(`/recipes/${recipeKey}/comments`)
            .valueChanges()
            .subscribe((comments) => {
              this.comments = comments;
              console.log(comments);
            });

          const recipe = changes[0].payload.val();
          return { recipeKey, recipe };
        })
      )
      .subscribe(({ recipeKey }) => {
        this.showelement = index;
      });
  }

  addComment(todo: Todo) {
    const recipesRef = this.db.list('/recipes', (ref) =>
      ref.orderByChild('id').equalTo(todo.id)
    );
    recipesRef
      .snapshotChanges()
      .pipe(
        take(1),
        map((changes) => {
          const recipeKey = this.teste;
          console.log(recipeKey);
          return { recipeKey };
        })
      )
      .subscribe(({ recipeKey }) => {
        const commentRef = this.db.list(`/recipes/${recipeKey}/comments`);

        this.afAuth.authState.subscribe((user) => {
          if (user) {
            this.db
              .list('profile')
              .valueChanges()
              .subscribe((profiles: any) => {
                const matchingProfiles = profiles.filter(
                  (profiles: any) => profiles.profilesemail === user.email
                );
                if (matchingProfiles.length > 0) {
                  const profilematch = matchingProfiles[0];
                  const imageurl = profilematch.profilesimgurl;

                  if (todo.commentText) {
                    // Sanitize the comment text
                    const sanitizedText = todo.commentText
                      .replace(/n1gga|n[i1]gga/gi, 'n-word')
                      .replace(/f[u*]ck/gi, 'f-word')
                      .replace(/sh[i*]t/gi, 's-word');

                    // Check for offensive words
                    const offensiveWords = ['n-word', 'f-word', 's-word'];
                    const hasOffensiveWord = offensiveWords.some((word) =>
                      sanitizedText.toLowerCase().includes(word)
                    );

                    // Check for blocked words
                    this.db
                      .list('/words')
                      .valueChanges()
                      .subscribe((blockedWords: any[]) => {
                        const hasBlockedWord = blockedWords.some(
                          (blockedWord) =>
                            sanitizedText
                              .toLowerCase()
                              .includes(blockedWord.blockedwords)
                        );

                        if (hasBlockedWord) {
                          alert('Comment contains offensive word');
                          // Handle the case where the comment contains a blocked word
                          // For example, you could display an error message to the user
                        } else if (hasOffensiveWord) {
                          alert('Comment contains offensive word');
                          // Handle the case where the comment contains an offensive word
                          // For example, you could display an error message to the user
                        } else {
                          this.db
                            .list('/profile', (ref) =>
                              ref
                                .orderByChild('profilesemail')
                                .equalTo(user.email)
                            )
                            .snapshotChanges()
                            .subscribe((profiles: any[]) => {
                              const profileNames = profiles.map(
                                (profile) => profile.payload.val().profilesname
                              );
                              console.log(profileNames);
                              commentRef.push({
                                commentText: todo.commentText,
                                commentuser: profileNames,
                                commentuserimg: imageurl,
                              });
                            });
                        }
                      });
                  }
                }
              });
          }
        });
      });
  }

  save(todo: Todo) {
    console.log(this.selectedTodo);
    console.log(this.Report);
    console.log(this.Report);


    this.afAuth.authState.subscribe((user) => {
      if (user) {
        let rep = new Todo();

        rep.id = this.selectedTodo.id;
        rep.recipeuser = this.selectedTodo.recipeuser;
        rep.recipename = this.selectedTodo.recipename;
        rep.recipeurl = this.selectedTodo.recipeurl;
        rep.recipetemp = this.selectedTodo.recipetemp;
        rep.recipetype = this.selectedTodo.recipetype;
        rep.recipedesc = this.selectedTodo.recipedesc;
        rep.recipevideo = this.selectedTodo.recipevideo;
        rep.recipereportreason = this.Report;

        this.db.list('/Report').push(rep);
        this.Report = "";
      }
    });

  }

  getComments(todo: Todo) {
    const recipeRef = this.db.list('/recipes', (ref) =>
      ref.orderByChild('id').equalTo(todo.id)
    );
    recipeRef
      .snapshotChanges()
      .pipe(
        take(1),
        switchMap((changes) => {
          const recipeKey = this.teste;
          return this.db.list(`/recipes/${this.teste}/comments`).valueChanges();
        })
      )
      .subscribe((comments: any) => {
        // update the comments array of the specific todo object
        todo.comments = comments;
        console.log('este aqui ' + todo.comments);
      });
  }

  fav(todo: Todo) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        let Fav = new Todo();

        Fav.recipeFavoriteby = user.email;
        Fav.recipename = todo.recipename;
        Fav.recipeurl = todo.recipeurl;
        Fav.recipetemp = todo.recipetemp;
        Fav.recipetype = todo.recipetype;
        Fav.recipedesc = todo.recipedesc;
        Fav.recipevideo = todo.recipevideo;

        this.db.list('/Favorites').push(Fav);
      }
    });
    alert("Added to favorites succes")

  }

  all() {
    this.todos.splice(0, this.todos.length);
    const dbRef = this.db.database.ref('/recipes');
    dbRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        this.todos.push(childSnapshot.val());
      });
    });
  }

  Drinks() {
    this.todos.splice(0, this.todos.length);
    const dbRef = this.db.database.ref('/recipes');
    dbRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.child('recipetype').val() === 'Drinks') {
          this.todos.push(childSnapshot.val());
        }
      });
    });
  }

  maincourse() {
    this.todos.splice(0, this.todos.length);
    const dbRef = this.db.database.ref('/recipes');
    dbRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.child('recipetype').val() === 'Main course') {
          this.todos.push(childSnapshot.val());
        }
      });
    });
  }

  bestrating(){
    this.todos.splice(0, this.todos.length);
const dbRef = this.db.database.ref('/recipes');
dbRef.orderByChild('avgRating').once('value').then((snapshot) => {
  snapshot.forEach((childSnapshot) => {
    const recipe = childSnapshot.val();
    if (recipe.recipetype !== 'Desserts', 'Main course', 'Drink') {
      this.todos.push(recipe);
    }
  });
  // Sort todos array by avgRating in descending order
  this.todos.reverse();
});


  }

  dessert() {
    this.todos.splice(0, this.todos.length);
    const dbRef = this.db.database.ref('/recipes');
    dbRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.child('recipetype').val() === 'Desserts') {
          this.todos.push(childSnapshot.val());
        }
      });
    });
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

  refresh() {
    setTimeout(() => {
      window.location.reload();
    }, 100); // Refresh the page after 5 seconds
  }

  rate(todo: Todo, rating: any) {
    this.afAuth.authState.subscribe((user) => {
      // subscribe to Firebase Auth state changes
      if (user) {
        const recipesRef = this.db.list('/recipes', (ref) =>
          ref.orderByChild('id').equalTo(todo.id)
        );
        recipesRef
          .snapshotChanges()
          .pipe(
            take(1),
            map((changes) => {
              const recipeKey = changes[0].key;
              const recipe = changes[0].payload.val();
              let ratings = todo.recipeavaliation || []; // get existing ratings or create a new array
              const index = ratings.findIndex(
                (ratingObj) => ratingObj.userId === user.uid
              );
              if (index !== -1) {
                // update existing rating
                ratings[index].rating = rating;
              } else {
                // add new rating
                ratings.push({ userId: user.uid, rating: rating });
              }
              const ratingRef = this.db.object(
                `/recipes/${recipeKey}/recipeavaliation`
              );
              ratingRef.set(ratings);

              const totalRating = ratings.reduce(
                (acc, curr) => acc + curr.rating,
                0
              );
              const avgRating = totalRating / ratings.length;
              const avgRatingRef = this.db.object(
                `/recipes/${recipeKey}/avgRating`
              );
              avgRatingRef.set(avgRating);

              // update the todo object with the new average rating
              todo.avgRating = avgRating;
              todo.userRating = ratings.find(ratingObj => ratingObj.userId === user.uid)?.rating;

              // get the user's rating and color the stars accordingly
              const userRating = ratings.find(
                (ratingObj) => ratingObj.userId === user.uid
              );
              if (userRating) {
                const stars = document.querySelectorAll('.star');
                stars.forEach((star, index) => {
                  if (index >= userRating.rating) {
                    star.classList.remove('yellow');
                  } else {
                    star.classList.add('yellow');
                  }
                });
              }

              return { recipeKey };
            })
          )
          .subscribe(); // don't forget to subscribe to the observable
      }
    });
  }




  report(todo: Todo) {
    console.log(todo);
  }

  getAverageRating(ratings: { userId: string; rating: number }[]): number {
    if (!ratings || ratings.length === 0) {
      return 0;
    }
    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = totalRating / ratings.length;
    return avgRating;
  }
}
