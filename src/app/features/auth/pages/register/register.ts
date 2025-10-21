import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: Auth,
    private alertService: AlertService
  ) {}

  // Manejar el envío del formulario de registro
  onSubmit() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.register(this.fullName, this.email, this.password).subscribe({
        next: (response) => {
          const token = response.access_token;
          const payload = this.decodeToken(token);

          this.authService.setAuthData(token, {
            id: payload.sub,
            email: payload.email,
            fullName: payload.name,
            role: payload.role || 'USER'
          });

          this.isLoading = false;
          this.alertService.success('¡Registro exitoso!', 'Bienvenido');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;

          if (error.status === 409) {
            this.errorMessage = 'Este email ya está registrado. Por favor, usa otro email o inicia sesión.';
          } else if (error.status === 400) {
            this.errorMessage = 'Datos inválidos. Por favor, verifica la información ingresada.';
          } else {
            this.errorMessage = 'Error al registrar usuario. Por favor, intenta nuevamente.';
          }

          this.alertService.error('Error en el registro', this.errorMessage);
        }
      });
    }
  }

  // Decodificar token JWT para extraer datos del usuario
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return {};
    }
  }

  // Validar todos los campos del formulario de registro
  private validateForm(): boolean {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.alertService.validationError('Por favor, completa todos los campos');
      return false;
    }

    if (this.fullName.trim().length < 2) {
      this.alertService.validationError('El nombre debe tener al menos 2 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.alertService.validationError('Por favor, ingresa un email válido');
      return false;
    }

    if (this.password.length < 6) {
      this.alertService.validationError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.alertService.validationError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  }

  // Navegar a la página de login
  onLoginClick(event: Event) {
    event.preventDefault();
    this.router.navigate(['/auth/login']);
  }
}
