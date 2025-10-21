import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CartRoutingModule } from './cart-routing-module';
import { CartView } from './pages/cart-view/cart-view';
import { Cart } from './services/cart';


@NgModule({
  declarations: [
    CartView
  ],
  imports: [
    CommonModule,
    CartRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    Cart
  ]
})
export class CartModule { }
