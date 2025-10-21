import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaces para el modelo de datos
export interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface ProductsWithMeta {
  data: Product[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductsResponse {
  data: {
    data: Product[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/';

  constructor(private http: HttpClient) {}

  /**
   * Obtener productos con paginación
   * GET /api/products?page={page}&limit={limit}
   */
  getProducts(page: number = 1, limit: number = 10): Observable<Product[]> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}products?page=${page}&limit=${limit}`).pipe(
      map(response => {
        return response.data.data;
      })
    );
  }

  /**
   * Obtener todos los productos sin paginación
   * GET /api/products
   * Maneja múltiples formatos de respuesta de la API
   */
  getAllProductsList(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}products`).pipe(
      map(response => {
        if (Array.isArray(response) && response.length > 0) {
          if (Array.isArray(response[0])) {
            return response[0];
          }
        }

        if (response?.data?.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }

        if (response?.data?.data && typeof response.data.data === 'object') {
          const values = Object.values(response.data.data);
          if (Array.isArray(values)) {
            return values;
          }
        }

        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }

        if (Array.isArray(response)) {
          return response;
        }

        return [];
      })
    );
  }

  /**
   * Buscar productos por término de búsqueda
   * GET /api/products/search?search={search}&page={page}&limit={limit}
   */
  searchProducts(search: string, page: number = 1, limit: number = 10): Observable<Product[]> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}products/search?search=${search}&page=${page}&limit=${limit}`).pipe(
      map(response => response.data.data)
    );
  }

  /**
   * Crear un nuevo producto (requiere permisos de administrador)
   * POST /api/products
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}products`, product).pipe(
      map(response => response.data)
    );
  }

  /**
   * Actualizar un producto existente (requiere permisos de administrador)
   * PATCH /api/products/:id
   */
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.patch<ApiResponse<Product>>(`${this.apiUrl}products/${id}`, product).pipe(
      map(response => response.data)
    );
  }

  /**
   * Eliminar un producto (requiere permisos de administrador)
   * DELETE /api/products/:id
   */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}products/${id}`).pipe(
      map(response => response.data)
    );
  }
}
