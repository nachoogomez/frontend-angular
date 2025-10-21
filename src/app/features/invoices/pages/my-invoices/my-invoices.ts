import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice';
import { Factura } from '../../models/factura.model';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-my-invoices',
  standalone: false,
  templateUrl: './my-invoices.html',
  styleUrl: './my-invoices.css'
})
export class MyInvoices implements OnInit {
  invoices: Factura[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private invoiceService: InvoiceService,
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
  
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = null;

    this.invoiceService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar facturas:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);

        if (error.status === 401) {
          this.error = 'No estás autenticado. Por favor, inicia sesión.';
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        } else if (error.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que esté corriendo en http://localhost:3000';
        } else {
          this.error = `No se pudieron cargar las facturas: ${error.message || 'Error desconocido'}`;
        }

        this.loading = false;
      }
    });
  }

  deleteInvoice(id: string): void {
    this.alertService.confirmDelete('esta factura').then((result) => {
      if (result.isConfirmed) {
        this.invoiceService.deleteInvoice(id).subscribe({
          next: () => {
            this.invoices = this.invoices.filter(inv => inv.id !== id);
            this.alertService.success('¡Eliminada!', 'Factura eliminada exitosamente');
          },
          error: (error) => {
            console.error('Error al eliminar factura:', error);
            this.alertService.error('Error', 'No se pudo eliminar la factura. Por favor, intente nuevamente.');
          }
        });
      }
    });
  }

  formatPrice(price: number): string {
    return this.invoiceService.formatPrice(price);
  }

  formatDate(date: string | Date): string {
    return this.invoiceService.formatDate(date);
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}
