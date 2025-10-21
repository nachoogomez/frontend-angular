import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Auth } from '../../../core/services/auth';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class User {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {}

  /**
   * Obtener ID del usuario actual desde el token JWT
   * Método privado que extrae el ID de los datos de autenticación
   */
  private getCurrentUserId(): number {
    const userData = this.authService.getUserData();
    const userId = userData?.id || userData?.userId || userData?.sub || 1;
    return userId;
  }

  /**
   * Obtener perfil del usuario autenticado (requiere autenticación JWT)
   * GET /api/users/:id
   */
  getCurrentUserProfile(): Observable<UserProfile> {
    const userId = this.getCurrentUserId();
    const url = `${this.apiUrl}/${userId}`;
    return this.http.get<any>(url).pipe(
    );
  }

  /**
   * Actualizar perfil del usuario autenticado (requiere autenticación JWT)
   * PATCH /api/users/:id
   */
  updateUserProfile(profileData: UpdateUserProfileRequest): Observable<UserProfile> {
    const userId = this.getCurrentUserId();
    const url = `${this.apiUrl}/${userId}`;
    return this.http.patch<UserProfile>(url, profileData);
  }

 
}
