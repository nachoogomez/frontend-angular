import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Factura, CreateFacturaDto, FacturaResponse } from '../models/factura.model';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:3000/api/facturas';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las facturas (requiere autenticación JWT)
   * GET /api/facturas
   * La respuesta viene envuelta en un objeto { data: [...] }
   */
  getAllInvoices(): Observable<Factura[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        
        if (Array.isArray(response)) {
          return response;
        }
    
        if (response?.data?.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }

        return [];
      })
    );
  }

  /**
   * Obtener una factura por ID (requiere autenticación JWT)
   * GET /api/facturas/:id
   */
  getInvoiceById(id: string): Observable<Factura> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {

        
        if (response?.id) {
          return response;
        }
       
        if (response?.data) {
          return response.data;
        }
        return response;
      })
    );
  }

  /**
   * Crear una nueva factura (requiere autenticación JWT)
   * POST /api/facturas
   * El campo 'cliente' se auto-completa desde el token JWT
   */
  createInvoice(invoice: CreateFacturaDto): Observable<FacturaResponse> {
    return this.http.post<FacturaResponse>(this.apiUrl, invoice);
  }

  /**
   * Eliminar una factura (requiere autenticación JWT)
   * DELETE /api/facturas/:id
   */
  deleteInvoice(id: string): Observable<Factura> {
    return this.http.delete<Factura>(`${this.apiUrl}/${id}`);
  }

  /**
   * Calcular el total de los items de una factura
   */
  calculateTotal(items: { cantidad: number; precio: number }[]): number {
    return items.reduce((total, item) => total + (item.cantidad * item.precio), 0);
  }

  /**
   * Validar que el total coincida con la suma de los items
   */
  validateTotal(total: number, items: { cantidad: number; precio: number }[]): boolean {
    const calculatedTotal = this.calculateTotal(items);
    return Math.abs(total - calculatedTotal) < 0.01; // Tolerancia para decimales
  }

  /**
   * Formatear precio con símbolo de moneda
   */
  formatPrice(price: number | string): string {
    if (price === null || price === undefined) {
      return '$0.00';
    }

    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
      return '$0.00';
    }

    return `$${numPrice.toFixed(2)}`;
  }

  /**
   * Formatear fecha a formato local
   */
  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }
}
