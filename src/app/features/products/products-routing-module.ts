import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductList } from './pages/product-list/product-list';
import { authGuard } from '../../core/guards/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: ProductList,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
