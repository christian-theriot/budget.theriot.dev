import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './components/pages/home-page/home-page.component';
import { UserService } from './services/user.service';
import { EventService } from './services/event.service';
import { HeaderComponent } from './components/menu/header/header.component';
import { NewAccountPageComponent } from './components/pages/accounts/new-account-page/new-account-page.component';
import { ViewAccountsPageComponent } from './components/pages/accounts/view-accounts-page/view-accounts-page.component';
import { NewBudgetPageComponent } from './components/pages/budget/new-budget-page/new-budget-page.component';
import { ViewBudgetsPageComponent } from './components/pages/budget/view-budgets-page/view-budgets-page.component';
import { NewTransactionPageComponent } from './components/pages/transactions/new-transaction-page/new-transaction-page.component';
import { ViewTransactionsPageComponent } from './components/pages/transactions/view-transactions-page/view-transactions-page.component';
import { ProfilePageComponent } from './components/pages/profile-page/profile-page.component';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    HeaderComponent,
    NewAccountPageComponent,
    ViewAccountsPageComponent,
    NewBudgetPageComponent,
    ViewBudgetsPageComponent,
    NewTransactionPageComponent,
    ViewTransactionsPageComponent,
    ProfilePageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
  ],
  providers: [UserService, EventService, CookieService],
  bootstrap: [AppComponent],
})
export class AppModule {}
