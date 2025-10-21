import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ProductsRoutingModule } from './products-routing-module';
import { ProductList } from './pages/product-list/product-list';
import { ProductCard } from './components/product-card/product-card';
import { ProductService } from './services/product';

@NgModule({
  declarations: [
    ProductList,
    ProductCard
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ProductsRoutingModule
  ],
  providers: [ProductService]
})
export class ProductsModule { }
