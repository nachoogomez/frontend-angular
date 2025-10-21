import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService, Product, ProductsResponse } from '../../services/product';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  productsPerPage = 10;

  constructor(private productService: ProductService, private router: Router) {}

  private extractProductsFromResponse(response: any): Product[] {
    // Intentar diferentes estructuras posibles
    const possiblePaths = [
      response?.data?.data,
      response?.data,
      response?.products,
      response?.items,
      response
    ];
    
    for (let i = 0; i < possiblePaths.length; i++) {
      const path = possiblePaths[i];
      
      if (Array.isArray(path)) {
        return path;
      }
    }
    
    // Si no encontramos un array, intentar buscar en propiedades anidadas
    if (response && typeof response === 'object') {
      for (const key in response) {
        if (response.hasOwnProperty(key)) {
          const value = response[key];
          
          if (Array.isArray(value)) {
            return value;
          }
          
          // Si es un objeto, buscar recursivamente
          if (value && typeof value === 'object') {
            const nestedArray = this.extractProductsFromResponse(value);
            if (nestedArray.length > 0) {
              return nestedArray;
            }
          }
        }
      }
    }
    
    return [];
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(this.currentPage, this.productsPerPage).subscribe({
      next: (response: any) => {
        
        // Validar la estructura de la respuesta
        if (response && response.data && Array.isArray(response.data.data)) {
          this.products = response.data.data;
          // Extraer metadatos de paginación si están disponibles
          if (response.data.meta) {
            this.totalPages = response.data.meta.totalPages || 1;
            this.totalProducts = response.data.meta.total || 0;
          }
        } else if (response && Array.isArray(response.data)) {
          this.products = response.data;
        } else if (Array.isArray(response)) {
          this.products = response;
        } else {
          // Intentar extraer productos de cualquier estructura posible
          this.products = this.extractProductsFromResponse(response);
          
          if (this.products.length === 0) {
            this.error = 'No se pudieron cargar los productos';
          }
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Load products error:', error);
        this.error = 'Error al cargar los productos. Verifique su conexión e intente nuevamente.';
        this.loading = false;
      }
    });
  }

  searchProducts(): void {
    const trimmedSearchTerm = this.searchTerm.trim();
    
    if (trimmedSearchTerm.length < 2) {
      this.error = 'Por favor ingrese al menos 2 caracteres para buscar';
      return;
    }
    
    if (trimmedSearchTerm) {
      this.loading = true;
      this.error = null;
      // Reset to first page when searching
      this.currentPage = 1;

      this.productService.searchProducts(trimmedSearchTerm, this.currentPage, this.productsPerPage).subscribe({
        next: (response: any) => {
          
          // Validar la estructura de la respuesta
          if (response && response.data && Array.isArray(response.data.data)) {
            this.products = response.data.data;
            // Extraer metadatos de paginación si están disponibles
            if (response.data.meta) {
              this.totalPages = response.data.meta.totalPages || 1;
              this.totalProducts = response.data.meta.total || 0;
            }
          } else if (response && Array.isArray(response.data)) {
            this.products = response.data;
          } else if (Array.isArray(response)) {
            this.products = response;
          } else {
            this.products = this.extractProductsFromResponse(response);
            
            if (this.products.length === 0) {
              this.error = 'No se encontraron productos que coincidan con la búsqueda';
            }
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.error = 'Error al buscar productos. Verifique su conexión e intente nuevamente.';
          this.loading = false;
        }
      });
    } else {
      this.loadProducts();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  // Métodos de paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      if (this.searchTerm.trim()) {
        this.searchProducts();
      } else {
        this.loadProducts();
      }
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  formatPrice(price: string | number): string {
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

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}
