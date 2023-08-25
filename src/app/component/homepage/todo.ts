export class Todo {
  id: number | null | string = '';
  commentText : string ="";
  recipeuser: String | null = '';
  recipename: String = '';
  recipeurl: string | ArrayBuffer | null = '';
  recipetemp: string = '';
  avgRating: number = 0;
  recipetype: string = '';
  recipedesc: String = '';
  userRating : any ;
  recipereportreason : any;
  recipevideo :any | null;
  recipeavaliation: { userId: string, rating: number }[] = [];
  recipeFavoriteby : null |String = 'a';
  comments: Comment[] = [];

}


export class Comment {
    commentText: string = '';
    commentuser: string = '';
    commentuserimg : string | ArrayBuffer | null = '';
  }


  export class Ai {
    blockedwords !: any ;
  }
