import { Component, Input } from '@angular/core';
import { Product } from '../../services/product';
import { Cart } from '../../../cart/services/cart';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: Product;

  isAddingToCart = false;
  addToCartSuccess = false;

  constructor(
    private cartService: Cart,
    private alertService: AlertService
  ) {}
  
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  // Agregar producto al carrito
  addToCart(productId: number, quantity: number): void {
    if (this.isAddingToCart) return; // Evitar múltiples clics

    this.isAddingToCart = true;
    this.addToCartSuccess = false;

    this.cartService.addToCart(productId, quantity).subscribe({
      next: (response) => {
        this.addToCartSuccess = true;
        this.isAddingToCart = false;

        // Mostrar toast de éxito
        this.alertService.toast('success', 'Producto agregado al carrito');

        // Ocultar mensaje de éxito después de 2 segundos
        setTimeout(() => {
          this.addToCartSuccess = false;
        }, 2000);
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        this.isAddingToCart = false;

        // Mostrar mensaje de error
        this.alertService.error('Error', 'Error al agregar el producto al carrito. Verifique que esté autenticado y que haya stock disponible.');
      }
    });
  }
}
