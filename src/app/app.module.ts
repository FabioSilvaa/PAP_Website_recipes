
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { VarifyEmailComponent } from './component/varify-email/varify-email.component';
import { HomepageComponent } from './component/homepage/homepage.component';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { ProfileComponent } from './profile/profile.component';

import { AngularFireModule } from '@angular/fire/compat'

import { environment } from 'src/environments/environment';

import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { NewRecipeComponent } from './component/new-recipe/new-recipe.component';
import { AdminComponent } from './admin/admin.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    VarifyEmailComponent,
    HomepageComponent,
    ProfileComponent,
    NewRecipeComponent,
    AdminComponent,

  ],
  imports: [
    AngularFireDatabaseModule,
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
   ReactiveFormsModule,
    FormsModule,



  ],
  providers: [LoginComponent, ProfileComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
