import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Cart, CartItem } from '../../services/cart';
import { Subscription } from 'rxjs';
import { Auth } from '../../../../core/services/auth';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-cart-view',
  standalone: false,
  templateUrl: './cart-view.html',
  styleUrl: './cart-view.css'
})
export class CartView implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isLoading = true;
  private cartSubscription?: Subscription;
  private quantityUpdateTimeouts: { [key: number]: any } = {};

  constructor(
    private router: Router,
    private cartService: Cart,
    private authService: Auth,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    
    // Limpiar todos los timeouts pendientes
    Object.values(this.quantityUpdateTimeouts).forEach(timeout => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });
  }

  loadCartItems(): void {
    this.isLoading = true;
    
    // Verificar autenticación
    const isAuthenticated = this.authService.isLoggedIn();
    const token = this.authService.getToken();
    const userData = this.authService.getUserData();
    
 
    this.cartSubscription = this.cartService.getCart().subscribe({
      next: (response: any) => {
        const items = response?.data || response;
        this.cartItems = Array.isArray(items) ? items : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        this.cartItems = [];
        this.isLoading = false;
      }
    });
  }

  // Eliminar producto del carrito usando productId
  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.alertService.success('Eliminado', 'Producto eliminado del carrito');
        this.loadCartItems(); // Recargar el carrito para actualizar la vista
      },
      error: (error) => {
        console.error('Error removing item from cart:', error);
        this.alertService.error('Error', 'Error al eliminar el producto del carrito');
      }
    });
  }

  onQuantityInput(productId: number, newQuantity: number): void {
    const quantity = parseInt(String(newQuantity)) || 1;

    // Validar que la cantidad esté dentro de los límites
    const item = this.cartItems.find(item => item.productId === productId);
    if (!item) return;

    const maxStock = item.product?.stock || 999;
    const validQuantity = Math.max(1, Math.min(quantity, maxStock));

    // Actualizar la cantidad localmente para feedback inmediato
    item.quantity = validQuantity;

    // Limpiar timeout anterior si existe
    if (this.quantityUpdateTimeouts[productId]) {
      clearTimeout(this.quantityUpdateTimeouts[productId]);
    }

    // Crear nuevo timeout para actualizar en el servidor después de 500ms de inactividad
    this.quantityUpdateTimeouts[productId] = setTimeout(() => {
      this.updateQuantityOnServer(productId, validQuantity);
      delete this.quantityUpdateTimeouts[productId];
    }, 500);
  }

  // Actualizar cantidad de un producto en el carrito
  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    // Validar que la cantidad esté dentro de los límites
    const maxStock = this.cartItems.find(item => item.productId === productId)?.product?.stock || 999;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));

    // Para simplificar, eliminamos el item actual y lo agregamos con la nueva cantidad
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.cartService.addToCart(productId, validQuantity).subscribe({
          next: () => {
            this.loadCartItems(); // Recargar el carrito para actualizar la vista
          },
          error: (error) => {
            console.error('Error updating quantity:', error);
            this.alertService.error('Error', 'Error al actualizar la cantidad');
            this.loadCartItems();
          }
        });
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.alertService.error('Error', 'Error al actualizar la cantidad');
        this.loadCartItems();
      }
    });
  }

  // Actualizar cantidad en el servidor después de debounce
  private updateQuantityOnServer(productId: number, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    // Validar que la cantidad esté dentro de los límites
    const maxStock = this.cartItems.find(item => item.productId === productId)?.product?.stock || 999;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));

    // Actualizar en el servidor
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.cartService.addToCart(productId, validQuantity).subscribe({
          next: () => {
            this.loadCartItems(); // Recargar el carrito para actualizar la vista
          },
          error: (error) => {
            console.error('Error updating quantity on server:', error);
            this.loadCartItems();
          }
        });
      },
      error: (error) => {
        console.error('Error updating quantity on server:', error);
        this.loadCartItems();
      }
    });
  }

  getTotalPrice(): number {
    try {
      return this.cartService.getCartTotal();
    } catch (error) {
      console.error('Error calculating total price:', error);
      return 0;
    }
  }

  getTotalItems(): number {
    try {
      return this.cartService.getCartItemCount();
    } catch (error) {
      console.error('Error calculating total items:', error);
      return 0;
    }
  }

  formatPrice(price: number | string): string {
    // Convertir a número si es string
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Verificar que sea un número válido
    if (isNaN(numericPrice)) {
      return '$0.00';
    }
    
    return `$${numericPrice.toFixed(2)}`;
  }

  // Función auxiliar para convertir precio a número
  parsePrice(price: number | string): number {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? 0 : numericPrice;
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.alertService.warning('Carrito vacío', 'El carrito está vacío');
      return;
    }

    // Aquí podrías navegar a una página de checkout
    this.alertService.info('En desarrollo', 'Funcionalidad de checkout en desarrollo');
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }
}
