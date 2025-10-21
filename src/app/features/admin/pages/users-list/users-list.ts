import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService, User } from '../../services/users.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  errorMessage = '';

  // Modal properties
  showModal = false;
  isEditMode = false;
  editingUserId: number | null = null;
  newUser = {
    email: '',
    password: '',
    name: '',
    role: 'USER' as 'USER' | 'ADMIN'
  };
  isSubmitting = false;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Cargar lista de usuarios desde el servidor
  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);

        // Mensajes de error específicos
        if (error.status === 401) {
          this.errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else if (error.status === 403) {
          this.errorMessage = 'No tienes permisos de administrador para acceder a esta página.';
          setTimeout(() => this.router.navigate(['/home']), 2000);
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000';
        } else {
          this.errorMessage = `Error al cargar los usuarios: ${error.message || 'Error desconocido'}`;
        }

        this.isLoading = false;
      }
    });
  }

  // Eliminar un usuario después de confirmación
  deleteUser(user: User): void {
    this.alertService.confirmDelete(`al usuario ${user.name || user.email}`).then((result) => {
      if (result.isConfirmed) {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.alertService.success('¡Eliminado!', 'Usuario eliminado correctamente');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.alertService.error('Error', 'Error al eliminar el usuario');
          }
        });
      }
    });
  }

  // Obtener clase CSS según el rol del usuario
  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'role-admin' : 'role-user';
  }

  // Navegar a la página principal
  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  // Navegar a la página de productos admin
  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  // Navegar a la página de facturas admin
  navigateToInvoices(): void {
    this.router.navigate(['/invoices/admin']);
  }

  // Contar usuarios con rol ADMIN
  getAdminCount(): number {
    return this.users.filter(u => u.role === 'ADMIN').length;
  }

  // Contar usuarios con rol USER
  getUserCount(): number {
    return this.users.filter(u => u.role === 'USER').length;
  }

  // TrackBy para optimización de renderizado
  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  // Abrir modal para crear o editar usuario
  openModal(user?: User): void {
    this.showModal = true;
    if (user) {
      // Modo edición
      this.isEditMode = true;
      this.editingUserId = user.id;
      this.newUser = {
        email: user.email,
        password: '', 
        name: user.name,
        role: user.role
      };
    } else {
      // Modo creación
      this.isEditMode = false;
      this.editingUserId = null;
      this.resetForm();
    }
  }

  // Cerrar modal y limpiar formulario
  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.editingUserId = null;
    this.resetForm();
  }

  // Resetear formulario a valores por defecto
  resetForm(): void {
    this.newUser = {
      email: '',
      password: '',
      name: '',
      role: 'USER'
    };
  }

  // Crear nuevo usuario con validaciones
  createUser(): void {
    if (!this.newUser.email || !this.newUser.password || !this.newUser.name) {
      this.alertService.validationError('Por favor, completa todos los campos requeridos');
      return;
    }

    if (this.newUser.password.length < 6) {
      this.alertService.validationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.isSubmitting = true;


    this.usersService.createUser(this.newUser).subscribe({
      next: () => {
        this.alertService.success('¡Éxito!', 'Usuario creado correctamente');
        this.closeModal();
        this.loadUsers();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
        this.alertService.error('Error', error.error?.message || 'Error al crear el usuario');
        this.isSubmitting = false;
      }
    });
  }

  // Actualizar usuario existente
  updateUser(): void {
    if (!this.editingUserId) return;

    if (!this.newUser.email || !this.newUser.name) {
      this.alertService.validationError('Por favor, completa todos los campos requeridos');
      return;
    }

    // Si se proporciona contraseña, validar longitud
    if (this.newUser.password && this.newUser.password.length < 6) {
      this.alertService.validationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.isSubmitting = true;

    // Construir objeto de actualización
    const updateData: any = {
      email: this.newUser.email,
      name: this.newUser.name,
      role: this.newUser.role
    };

    // Solo incluir password si se proporcionó uno nuevo
    if (this.newUser.password) {
      updateData.password = this.newUser.password;
    }


    this.usersService.updateUser(this.editingUserId, updateData).subscribe({
      next: () => {
        this.alertService.success('¡Éxito!', 'Usuario actualizado correctamente');
        this.closeModal();
        this.loadUsers();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
        this.alertService.error('Error', error.error?.message || 'Error al actualizar el usuario');
        this.isSubmitting = false;
      }
    });
  }

  // Guardar usuario (crear o actualizar según modo)
  saveUser(): void {
    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }
}
