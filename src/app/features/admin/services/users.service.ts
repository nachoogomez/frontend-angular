import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los usuarios (requiere permisos de administrador)
   * GET /api/users
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener un usuario por ID (requiere permisos de administrador)
   * GET /api/users/:id
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Actualizar un usuario existente (requiere permisos de administrador)
   * PATCH /api/users/:id
   */
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}`, userData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Eliminar un usuario (requiere permisos de administrador)
   * DELETE /api/users/:id
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crear un nuevo usuario (requiere permisos de administrador)
   * POST /api/users
   */
  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, userData).pipe(
      map(response => response.data)
    );
  }
}
