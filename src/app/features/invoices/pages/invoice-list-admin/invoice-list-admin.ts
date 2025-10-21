import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice';
import { Factura, FacturaItemDto } from '../../models/factura.model';
import { UsersService, User } from '../../../admin/services/users.service';
import { ProductService, Product } from '../../../products/services/product';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-invoice-list-admin',
  standalone: false,
  templateUrl: './invoice-list-admin.html',
  styleUrl: './invoice-list-admin.css'
})
export class InvoiceListAdmin implements OnInit {
  invoices: Factura[] = [];
  loading = true;
  error: string | null = null;

  // Data for dropdowns
  users: User[] = [];
  products: Product[] = [];
  loadingUsers = false;
  loadingProducts = false;

  // Modal properties
  showModal = false;
  isSubmitting = false;

  // Form data
  newInvoice = {
    numero: 1,
    fecha: new Date().toISOString().split('T')[0],
    usuarioId: undefined as number | undefined,
    total: 0,
    items: [] as FacturaItemDto[]
  };

  // Current item being added
  currentItem: FacturaItemDto & { productId?: number | null } = {
    descripcion: '',
    cantidad: 1,
    precio: 0,
    productId: null
  };

  constructor(
    private router: Router,
    private invoiceService: InvoiceService,
    private usersService: UsersService,
    private productService: ProductService,
    private alertService: AlertService
  ) {}

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
        } else if (error.status === 403) {
          this.error = 'No tienes permisos de administrador.';
        } else if (error.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que esté corriendo en http://localhost:3000';
        } else {
          this.error = `Error al cargar las facturas: ${error.message || 'Error desconocido'}`;
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

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  // Modal methods
  openModal(): void {
    this.showModal = true;
    this.resetForm();
    if (this.invoices.length > 0) {
      const maxNumero = Math.max(...this.invoices.map(inv => inv.numero));
      this.newInvoice.numero = maxNumero + 1;
    }
    this.loadUsers();
    this.loadProducts();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
      }
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.products = []; 

    
    this.productService.getAllProductsList().subscribe({
      next: (products) => {

        if (!Array.isArray(products)) {
          this.products = [];
          this.loadingProducts = false;
          return;
        }

        if (products.length === 0) {
          this.products = [];
          this.loadingProducts = false;
          return;
        }

        if (products.length === 2 && Array.isArray(products[0])) {
          const actualProducts = products[0];
          

          const filtered = actualProducts.filter((p: any) => {
            const isValid = p.isActive === true && p.stock > 0;
            return isValid;
          });


          if (filtered.length === 0) {
            this.products = actualProducts;
          } else {
            this.products = filtered;
          }
        } else {
          const filtered = products.filter(p => {
            const isValid = p.isActive === true && p.stock > 0;
            return isValid;
          });

          if (filtered.length === 0) {
            this.products = products;
          } else {
            this.products = filtered;
          }
        }

        this.loadingProducts = false;
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
        console.error('❌ Error details:', error.message, error.status);
        this.products = [];
        this.loadingProducts = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newInvoice = {
      numero: 1,
      fecha: new Date().toISOString().split('T')[0],
      usuarioId: undefined,
      total: 0,
      items: []
    };
    this.currentItem = {
      descripcion: '',
      cantidad: 1,
      precio: 0,
      productId: null
    };
  }

  onProductSelect(): void {
    if (this.currentItem.productId) {
      const selectedProduct = this.products.find(p => p.id === this.currentItem.productId);
      if (selectedProduct) {
        this.currentItem.descripcion = selectedProduct.nombre;
        this.currentItem.precio = selectedProduct.precio;
      }
    }
  }

  // Item management
  addItem(): void {
    if (!this.currentItem.descripcion || this.currentItem.cantidad <= 0 || this.currentItem.precio <= 0) {
      this.alertService.validationError('Por favor, complete todos los campos del item correctamente');
      return;
    }

    const { productId, ...itemToAdd } = this.currentItem;
    this.newInvoice.items.push({ ...itemToAdd });
    this.calculateTotal();

    this.currentItem = {
      descripcion: '',
      cantidad: 1,
      precio: 0,
      productId: null
    };
  }

  removeItem(index: number): void {
    this.newInvoice.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.newInvoice.total = this.invoiceService.calculateTotal(this.newInvoice.items);
  }

  getItemSubtotal(item: FacturaItemDto): number {
    return item.cantidad * item.precio;
  }

  // Create invoice
  createInvoice(): void {
    if (!this.newInvoice.numero || this.newInvoice.numero < 1) {
      this.alertService.validationError('El número de factura debe ser mayor a 0');
      return;
    }

    if (!this.newInvoice.fecha) {
      this.alertService.validationError('La fecha es requerida');
      return;
    }

    if (!this.newInvoice.usuarioId) {
      this.alertService.validationError('El cliente es requerido');
      return;
    }

    if (this.newInvoice.items.length === 0) {
      this.alertService.validationError('Debe agregar al menos un item a la factura');
      return;
    }

    // Validate total matches items
    if (!this.invoiceService.validateTotal(this.newInvoice.total, this.newInvoice.items)) {
      this.alertService.validationError('El total no coincide con la suma de los items');
      return;
    }

    this.isSubmitting = true;

    // Buscar el usuario seleccionado para obtener su email
    const selectedUser = this.users.find(u => u.id === this.newInvoice.usuarioId);

    // Preparar el DTO - enviar tanto usuarioId como cliente (email del usuario)
    const invoiceDto: any = {
      numero: this.newInvoice.numero,
      fecha: this.newInvoice.fecha,
      total: this.newInvoice.total,
      items: this.newInvoice.items,
      usuarioId: this.newInvoice.usuarioId 
    };

    // Si el backend también requiere el campo cliente, agregarlo
    if (selectedUser) {
      invoiceDto.cliente = selectedUser.email || selectedUser.name;
    }


    this.invoiceService.createInvoice(invoiceDto).subscribe({
      next: (response) => {
        this.alertService.success('¡Éxito!', 'Factura creada exitosamente');
        this.closeModal();
        this.loadInvoices();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating invoice:', error);
        this.alertService.error('Error', error.error?.message || 'Error al crear la factura');
        this.isSubmitting = false;
      }
    });
  }
}
