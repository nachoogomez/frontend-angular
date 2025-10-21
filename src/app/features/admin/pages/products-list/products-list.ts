import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../../products/services/product';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-products-list',
  standalone: false,
  templateUrl: './products-list.html',
  styleUrl: './products-list.css'
})

export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  errorMessage = '';

  // Filter properties
  activeFilter: 'all' | 'active' | 'inactive' = 'all';

  // Modal properties
  showModal = false;
  isEditMode = false;
  editingProductId: number | null = null;
  newProduct = {
    nombre: '',
    precio: 0,
    stock: 0,
    isActive: true
  };
  isSubmitting = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts(1, 100).subscribe({
      next: (products) => {

        // Si products tiene una propiedad data, extraerla
        if ((products as any)?.data && Array.isArray((products as any).data)) {
          this.products = (products as any).data;
        } else {
          this.products = products;
        }

        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error:', error);

        if (error.status === 401) {
          this.errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else if (error.status === 403) {
          this.errorMessage = 'No tienes permisos de administrador para acceder a esta página.';
          setTimeout(() => this.router.navigate(['/home']), 2000);
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000';
        } else {
          this.errorMessage = `Error al cargar los productos: ${error.message || 'Error desconocido'}`;
        }

        this.isLoading = false;
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToInvoices(): void {
    this.router.navigate(['/invoices/admin']);
  }

  // Filter methods
  setFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.activeFilter) {
      case 'active':
        this.filteredProducts = this.products.filter(p => p.isActive);
        break;
      case 'inactive':
        this.filteredProducts = this.products.filter(p => !p.isActive);
        break;
      case 'all':
      default:
        this.filteredProducts = [...this.products];
        break;
    }
  }

  getActiveCount(): number {
    return this.products.filter(p => p.isActive).length;
  }

  getInactiveCount(): number {
    return this.products.filter(p => !p.isActive).length;
  }

  getTotalStock(): number {
    return this.products.reduce((total, p) => total + p.stock, 0);
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  openModal(product?: Product): void {
    this.showModal = true;
    if (product) {
      this.isEditMode = true;
      this.editingProductId = product.id;
      this.newProduct = {
        nombre: product.nombre,
        precio: product.precio,
        stock: product.stock,
        isActive: product.isActive
      };
    } else {
      this.isEditMode = false;
      this.editingProductId = null;
      this.resetForm();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.editingProductId = null;
    this.resetForm();
  }

  resetForm(): void {
    this.newProduct = {
      nombre: '',
      precio: 0,
      stock: 0,
      isActive: true
    };
  }

  createProduct(): void {
    // Validaciones básicas
    if (!this.newProduct.nombre || !this.newProduct.precio) {
      this.alertService.validationError('Por favor, completa todos los campos requeridos');
      return;
    }

    if (this.newProduct.precio <= 0) {
      this.alertService.validationError('El precio debe ser mayor a 0');
      return;
    }

    if (this.newProduct.stock < 0) {
      this.alertService.validationError('El stock no puede ser negativo');
      return;
    }

    this.isSubmitting = true;

    // Asegurar que precio y stock sean números
    const productData = {
      nombre: this.newProduct.nombre,
      precio: Number(this.newProduct.precio),
      stock: Number(this.newProduct.stock)
    };


    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.alertService.success('¡Éxito!', 'Producto creado correctamente');
        this.closeModal();
        this.loadProducts();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating product:', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
        this.alertService.error('Error', error.error?.message || 'Error al crear el producto');
        this.isSubmitting = false;
      }
    });
  }

  updateProduct(): void {
    if (!this.editingProductId) return;

    // Validaciones básicas
    if (!this.newProduct.nombre || !this.newProduct.precio) {
      this.alertService.validationError('Por favor, completa todos los campos requeridos');
      return;
    }

    if (this.newProduct.precio <= 0) {
      this.alertService.validationError('El precio debe ser mayor a 0');
      return;
    }

    if (this.newProduct.stock < 0) {
      this.alertService.validationError('El stock no puede ser negativo');
      return;
    }

    this.isSubmitting = true;

    // Asegurar que precio y stock sean números y isActive sea booleano
    const productData = {
      nombre: this.newProduct.nombre,
      precio: Number(this.newProduct.precio),
      stock: Number(this.newProduct.stock),
      isActive: Boolean(this.newProduct.isActive)
    };

    this.productService.updateProduct(this.editingProductId, productData).subscribe({
      next: () => {
        this.alertService.success('¡Éxito!', 'Producto actualizado correctamente');
        this.closeModal();
        this.loadProducts();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating product:', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
        this.alertService.error('Error', error.error?.message || 'Error al actualizar el producto');
        this.isSubmitting = false;
      }
    });
  }

  saveProduct(): void {
    if (this.isEditMode) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  deleteProduct(product: Product): void {
    this.alertService.confirmDelete(`el producto "${product.nombre}"`).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.alertService.success('¡Eliminado!', 'Producto eliminado correctamente');
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.alertService.error('Error', 'Error al eliminar el producto');
          }
        });
      }
    });
  }
}
