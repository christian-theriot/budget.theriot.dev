import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignInPageComponent } from './components/pages/sign-in-page/sign-in-page.component';
import { HomePageComponent } from './components/pages/home-page/home-page.component';
import { UserService } from './services/user.service';
import { EventService } from './services/event.service';

@NgModule({
  declarations: [AppComponent, SignInPageComponent, HomePageComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [UserService, EventService],
  bootstrap: [AppComponent],
})
export class AppModule {}
