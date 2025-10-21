import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
  };
  message: any;
  statusCode: number;
}

export interface RegisterResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  
  private apiUrl = 'http://localhost:3000/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Iniciar sesión de usuario
   * POST /api/auth/login
   * Retorna un token JWT en caso de éxito
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      email,
      password
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData);
  }

  /**
   * Registrar un nuevo usuario
   * POST /api/auth/register
   * Retorna un token JWT en caso de éxito
   */
  register(nombre: string, email: string, password: string): Observable<RegisterResponse> {
    const registerData: RegisterRequest = {
      nombre,
      email,
      password
    };

    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, registerData);
  }

  /**
   * Guardar token y datos de usuario en localStorage
   * Actualiza el estado de autenticación
   */
  setAuthData(token: string, userData: any): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Verificar si el usuario está autenticado
   * Comprueba la existencia del token en localStorage
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Cerrar sesión del usuario
   * Elimina token y datos de usuario del localStorage
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userData');
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Obtener el token JWT almacenado
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtener los datos del usuario autenticado
   * Retorna el objeto parseado desde localStorage
   */
  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}
