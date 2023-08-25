import { Component, OnInit } from '@angular/core';
import { Ai, Todo, Comment } from '../component/homepage/todo';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { AuthService } from '../shared/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, map, take } from 'rxjs';
import { profiles } from '../profile/profile';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  todos: Todo[] = [];
  profile: profiles[] = [];
  selectedTodo: Todo | undefined;
  selectedReport: any;
  video: any;
  profilesSearch: any;
  searchInput: string = '';
  embedUrl: any;
  Report!: any[];
  searchValue!: string;
  filteredTodos!: Todo[];
  comment!: any[];
  comments: Comment[] = [];

  words: any[] = [];
  constructor(
    private db: AngularFireDatabase,
    private auth: AuthService,
    public afAuth: AngularFireAuth,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.filteredTodos = this.todos;

    const todoRef = this.db.list<Todo>('recipes').query;
    todoRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const todo = childSnapshot.val() as Todo;
        this.todos.push(todo);
      });
    });

    const profileRef = this.db.list<profiles>('profile').query;
    profileRef.once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const profiles = childSnapshot.val() as profiles;
        this.profile.push(profiles);
      });
    });

    this.db
      .list('Report')
      .valueChanges()
      .subscribe((data) => {
        this.Report = data;
        console.log(this.Report); // this will log all the reports data to the console
      });

    this.db
      .list('words')
      .valueChanges()
      .subscribe((data: any) => {
        console.log(data); // This will log all the words data to the console
        this.words = data;
      });

    // Retrieve the comments from all recipes in the database
    const recipesRef = this.db.list<Todo>('recipes').query;
    recipesRef.once('value').then((snapshot) => {
      snapshot.forEach((recipeSnapshot) => {
        const recipe = recipeSnapshot.val() as Todo;
        if (recipe.comments) {
          Object.values(recipe.comments).forEach((comment: Comment) => {
            this.comments.push(comment);
          });
        }
      });
    });
  }
  totalPages: number = 0;
  currentPage = 1;
  pageSize = 5;

  get pages() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get pagedTodos() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTodos.slice(startIndex, endIndex);
  }

  calculateTotalPages() {
    return Math.ceil(this.filteredTodos.length / this.pageSize);
  }


  Showrecipes(){
    document.getElementById('comment')?.setAttribute('hidden','');

    document.getElementById('rep')?.setAttribute('hidden', '');
    document.getElementById('bw')?.setAttribute('hidden', '');
    document.getElementById('allrecipes')?.removeAttribute('hidden');
  }

  Showcom() {
    document.getElementById('comment')?.removeAttribute('hidden');

    document.getElementById('rep')?.setAttribute('hidden', '');
    document.getElementById('bw')?.setAttribute('hidden', '');
    document.getElementById('allrecipes')?.setAttribute('hidden', '');
  }
  Showrep() {
    document.getElementById('comment')?.setAttribute('hidden', '');
    document.getElementById('rep')?.removeAttribute('hidden');
    document.getElementById('bw')?.setAttribute('hidden', '');
    document.getElementById('allrecipes')?.setAttribute('hidden', '');
  }
  Showbwords(){
    document.getElementById('comment')?.setAttribute('hidden', '');
    document.getElementById('rep')?.setAttribute('hidden','');
    document.getElementById('bw')?.removeAttribute('hidden');
    document.getElementById('allrecipes')?.setAttribute('hidden', '');
  }

  Showalltables(){
    document.getElementById('comment')?.removeAttribute('hidden');
    document.getElementById('rep')?.removeAttribute('hidden');
    document.getElementById('bw')?.removeAttribute('hidden');
    document.getElementById('allrecipes')?.removeAttribute('hidden');
  }

  /*filterTodos() {
    if (!this.searchValue) {
      // If search input is empty, show all todos
      this.filteredTodos = this.todos;
    } else {
      // Otherwise, filter todos based on search input
      this.filteredTodos = this.todos.filter(todo => {
        const user = this.profile.find(profile => profile.profilesemail === todo.recipeuser);
        return user && user.profilesname.toLowerCase().includes(this.searchValue.toLowerCase());
      });
    }
  }*/

  searchNameValue: any = '';
  /*filterTodosByName() {
    if (!this.searchNameValue) {
      // If search input is empty, show all todos
      this.filteredTodos = this.todos;
    } else {
      // Otherwise, filter todos based on search input
      this.filteredTodos = this.todos.filter(todo => {
        return todo.recipename.toLowerCase().includes(this.searchNameValue.toLowerCase());
      });
    }
  }
*/

  deleteword(word: string) {
    const wordsRef = this.db.list('words');

    wordsRef.query
      .orderByChild('blockedwords')
      .equalTo(word)
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const itemToDelete = childSnapshot.key as string;
          wordsRef.remove(itemToDelete);
        });
      });

    console.log(word);
  }

  filterTodos() {
    if (!this.searchValue && !this.searchNameValue) {
      // If both search inputs are empty, show all todos
      this.filteredTodos = this.todos;
    } else {
      // Filter todos based on search inputs
      this.filteredTodos = this.todos.filter((todo) => {
        const user = this.profile.find(
          (profile) => profile.profilesemail === todo.recipeuser
        );
        const nameMatch =
          !this.searchNameValue ||
          todo.recipename
            .toLowerCase()
            .includes(this.searchNameValue.toLowerCase());
        const userMatch =
          !this.searchValue ||
          (user &&
            user.profilesname
              .toLowerCase()
              .includes(this.searchValue.toLowerCase()));
        return nameMatch && userMatch;
      });
    }
  }

  Find(report: Todo) {
    const profilename = this.profile.find(
      (profile) => profile.profilesemail === report.recipeuser
    )?.profilesname;
    if (profilename) {
      this.searchValue = profilename;
      this.searchNameValue = report.recipename;
      this.filterTodos();
    }
  }

  blockedwordss!: String;
  block() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        const blockedWord = this.blockedwordss.toLowerCase().trim();
        if (blockedWord) {
          let rep = new Ai();
          rep.blockedwords = blockedWord;
          this.db.list('/words').push(rep);
          this.blockedwordss = '';

          // Delete comments that contain blocked word
          const dbRef = this.db.database.ref('/recipes');
          dbRef.once('value').then((snapshot) => {
            snapshot.forEach((recipeSnapshot) => {
              recipeSnapshot.child('comments').forEach((commentSnapshot) => {
                const commentKey = commentSnapshot.key;
                const comment = commentSnapshot.val();
                const commentText = comment.commentText.toLowerCase();
                if (commentText.includes(blockedWord)) {
                  dbRef
                    .child(`${recipeSnapshot.key}/comments/${commentKey}`)
                    .remove();
                }
              });
            });
          });
        }
      }
    });
  }

  mostra(todos: Todo) {
    if (confirm('Are you sure you want to delete this recipe?')) {
      const recipeRef = this.db
        .list<Todo>('recipes', (ref) =>
          ref.orderByChild('id').equalTo(todos.id)
        )
        .snapshotChanges();
      recipeRef.forEach((snapshot) => {
        snapshot.forEach((recipe) => {
          const recipekey = recipe.key;
          this.db
            .object(`recipes/${recipekey}`)
            .remove()
            .then(() =>
              console.log(`Recipe with id ${todos.id} has been deleted.`)
            )
            .catch((error) => console.error(error));
        });
      });
    }
  }

  //AQUI ACABAR

  deleteComment(commentText: string) {
    if (confirm('Are you sure you want to delete this comment?')) {
      const recipesRef = this.db.list<Todo>('recipes').query;
      recipesRef.once('value').then((snapshot) => {
        snapshot.forEach((recipeSnapshot) => {
          const recipe = recipeSnapshot.val() as Todo;
          if (recipe.comments) {
            Object.entries(recipe.comments).forEach(([commentId, comment]) => {
              if (comment.commentText === commentText) {
                const commentRef = this.db.object<Comment>(
                  `recipes/${recipeSnapshot.key}/comments/${commentId}`
                );
                commentRef
                  .remove()
                  .then(() => {
                    console.log(
                      `Comment with text "${commentText}" has been deleted.`
                    );
                    // find the index of the deleted comment in the array
                    const index = this.comments.findIndex(
                      (c) => c.commentText === commentText
                    );
                    // splice the deleted comment from the array
                    this.comments.splice(index, 1);
                  })
                  .catch((error) => console.error(error));
              }
            });
          }
        });
      });
    }
  }

  mostra1(todo: Todo) {
    if (confirm('Are you sure you want to delete this Report?')) {
      const reportRef = this.db
        .list<Todo>('Report', (ref) =>
          ref
            .orderByChild('recipereportreason')
            .equalTo(todo.recipereportreason)
        )
        .snapshotChanges();
      reportRef.forEach((snapshot) => {
        snapshot.forEach((report) => {
          const reportKey = report.key;
          if (reportKey) {
            this.db
              .object(`Report/${reportKey}`)
              .remove()
              .then(() =>
                console.log(
                  `Report with recipe report reason ${todo.recipereportreason} has been deleted.`
                )
              )
              .catch((error) => console.error(error));
          }
        });
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
    const randomParam = Math.floor(Math.random() * 100000);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?v=${randomParam}`;
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);

    // Check if the video has actually changed before setting the cached URL
    if (this.cachedVideoUrl !== safeUrl) {
      this.cachedVideoUrl = safeUrl;
      this.videoLoaded = true;
    }

    return safeUrl;
  }

  showvideo(todos: Todo) {
    this.selectedTodo = todos;
  }

  review(todo: Todo) {
    console.log(todo);
    this.selectedTodo = todo;
  }
}
