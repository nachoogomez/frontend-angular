import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  product?: {
    id: number;
    nombre: string;
    precio: number | string;
    stock: number;
    isActive: boolean;
  };
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class Cart {
  private apiUrl = 'http://localhost:3000/api/';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Agregar producto al carrito (requiere autenticación JWT)
   * POST /api/cart/add-item
   * Actualiza automáticamente el estado del carrito después de agregar
   */
  addToCart(productId: number, quantity: number): Observable<any> {
    const request: AddToCartRequest = { productId, quantity };

    return this.http.post(`${this.apiUrl}cart/add-item`, request).pipe(
      tap(() => {
        this.getCart().subscribe();
      }),
      catchError(error => {
        console.error('Error adding to cart:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener carrito del usuario autenticado (requiere autenticación JWT)
   * GET /api/cart
   * Actualiza el BehaviorSubject con los items del carrito
   */
  getCart(): Observable<CartItem[]> {
    return this.http.get<any>(`${this.apiUrl}cart`).pipe(
      tap(response => {
        const items = response?.data || response;
        const validItems = Array.isArray(items) ? items : [];
        this.cartItemsSubject.next(validItems);
      }),
      catchError(error => {
        console.error('Error getting cart:', error);
        this.cartItemsSubject.next([]);
        throw error;
      })
    );
  }

  /**
   * Eliminar producto del carrito (requiere autenticación JWT)
   * DELETE /api/cart/remove-item/:productId
   * Actualiza automáticamente el estado del carrito después de eliminar
   */
  removeFromCart(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}cart/remove-item/${productId}`).pipe(
      tap(() => {
        this.getCart().subscribe();
      }),
      catchError(error => {
        console.error('Error removing from cart:', error);
        console.error('Attempted to delete product with ID:', productId);
        throw error;
      })
    );
  }

  /**
   * Obtener cantidad total de items en el carrito
   * Suma todas las cantidades de los productos
   */
  getCartItemCount(): number {
    const items = this.cartItemsSubject.value;
    if (!Array.isArray(items)) {
      return 0;
    }
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calcular el total del carrito en dinero
   * Suma precio * cantidad de cada item
   */
  getCartTotal(): number {
    const items = this.cartItemsSubject.value;
    if (!Array.isArray(items)) {
      return 0;
    }
    return items.reduce((total, item) => {
      if (item.product) {
        const price = typeof item.product.precio === 'string'
          ? parseFloat(item.product.precio)
          : item.product.precio;
        return total + (isNaN(price) ? 0 : price * item.quantity);
      }
      return total;
    }, 0);
  }

  /**
   * Limpiar todos los items del carrito localmente
   * Resetea el BehaviorSubject a un array vacío
   */
  clearCart(): void {
    this.cartItemsSubject.next([]);
  }
}
