import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, LoginResponse } from '../../../../core/services/auth';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: Auth,
    private alertService: AlertService
  ) {}

  // Manejar el envío del formulario de login
  onSubmit() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.email, this.password).subscribe({
        next: (response: LoginResponse) => {
          this.isLoading = false;
          this.handleLoginSuccess(response);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleLoginError(error);
        }
      });
    }
  }

  // Validar campos del formulario (email y contraseña)
  private validateForm(): boolean {
    if (!this.email || !this.password) {
      this.alertService.validationError('Por favor, completa todos los campos');
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

    return true;
  }

  // Procesar login exitoso: guardar token y datos del usuario
  private handleLoginSuccess(response: LoginResponse) {
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);

      const tokenPayload = this.decodeJWT(response.data.access_token);

      localStorage.setItem('userData', JSON.stringify({
        id: tokenPayload?.sub || tokenPayload?.id || tokenPayload?.userId,
        sub: tokenPayload?.sub,
        email: this.email,
        fullName: tokenPayload?.fullName || tokenPayload?.name || this.email.split('@')[0],
        role: tokenPayload?.role || 'USER'
      }));
    }

    this.router.navigate(['/home']);
  }

  // Decodificar token JWT para extraer información del usuario
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  // Manejar errores de login y mostrar mensaje apropiado
  private handleLoginError(error: any) {
    console.error('Login error:', error);

    if (error.error && error.error.message) {
      this.errorMessage = error.error.message;
    } else if (error.status === 401) {
      this.errorMessage = 'Invalid email or password';
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please try again later.';
    } else {
      this.errorMessage = 'An error occurred during login. Please try again.';
    }
  }

  // Navegar a la página de registro
  onRegisterClick(event: Event) {
    event.preventDefault();
    this.router.navigate(['/auth/register']);
  }
}
