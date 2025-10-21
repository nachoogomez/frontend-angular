import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing-module';
import { UsersListComponent } from './pages/users-list/users-list';
import { ProductsListComponent } from './pages/products-list/products-list';

@NgModule({
  declarations: [
    UsersListComponent,
    ProductsListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
