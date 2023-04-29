import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './components/guards/auth.guard';
import { NewAccountPageComponent } from './components/pages/accounts/new-account-page/new-account-page.component';
import { ViewAccountsPageComponent } from './components/pages/accounts/view-accounts-page/view-accounts-page.component';
import { NewBudgetPageComponent } from './components/pages/budget/new-budget-page/new-budget-page.component';
import { ViewBudgetsPageComponent } from './components/pages/budget/view-budgets-page/view-budgets-page.component';
import { HomePageComponent } from './components/pages/home-page/home-page.component';
import { ProfilePageComponent } from './components/pages/profile-page/profile-page.component';
import { NewTransactionPageComponent } from './components/pages/transactions/new-transaction-page/new-transaction-page.component';
import { ViewTransactionsPageComponent } from './components/pages/transactions/view-transactions-page/view-transactions-page.component';
import { UserService } from './services/user.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePageComponent,
  },
  {
    path: 'user',
    pathMatch: 'full',
    component: ProfilePageComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
  },
  {
    path: 'new/account',
    component: NewAccountPageComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
  },
  {
    path: 'new/budget',
    component: NewBudgetPageComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
  },
  {
    path: 'new/transaction',
    component: NewTransactionPageComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
  },
  {
    path: 'view/accounts',
    component: ViewAccountsPageComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
  },
  {
    path: 'view/budgets',
    component: ViewBudgetsPageComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
  },
  {
    path: 'view/transactions',
    component: ViewTransactionsPageComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
  },
  {
    path: '**',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
