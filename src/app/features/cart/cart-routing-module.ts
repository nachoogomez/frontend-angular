import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartView } from './pages/cart-view/cart-view';
import { authGuard } from '../../core/guards/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: CartView,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }
