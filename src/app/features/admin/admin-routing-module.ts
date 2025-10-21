import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './pages/users-list/users-list';
import { ProductsListComponent } from './pages/products-list/products-list';
import { adminGuard } from '../../core/guards/admin-guard';

const routes: Routes = [
  {
    path: 'users',
    component: UsersListComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'products',
    component: ProductsListComponent,
    canActivate: [adminGuard]
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
