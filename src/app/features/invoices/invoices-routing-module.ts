import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyInvoices } from './pages/my-invoices/my-invoices';
import { InvoiceListAdmin } from './pages/invoice-list-admin/invoice-list-admin';
import { authGuard } from '../../core/guards/auth-guard';
import { adminGuard } from '../../core/guards/admin-guard';

const routes: Routes = [
  {
    path: '',
    component: MyInvoices,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: InvoiceListAdmin,
    canActivate: [adminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule { }
