import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InvoicesRoutingModule } from './invoices-routing-module';
import { MyInvoices } from './pages/my-invoices/my-invoices';
import { InvoiceListAdmin } from './pages/invoice-list-admin/invoice-list-admin';


@NgModule({
  declarations: [
    MyInvoices,
    InvoiceListAdmin
  ],
  imports: [
    CommonModule,
    FormsModule,
    InvoicesRoutingModule
  ]
})
export class InvoicesModule { }
