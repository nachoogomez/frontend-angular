import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor() {}

  /**
   * Mostrar alerta de éxito
   * Desaparece automáticamente después de 2 segundos
   */
  success(title: string, text?: string): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonColor: '#10b981',
      timer: 2000,
      timerProgressBar: true
    });
  }

  /**
   * Mostrar alerta de error
   */
  error(title: string, text?: string): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonColor: '#ef4444'
    });
  }

  /**
   * Mostrar alerta de advertencia
   */
  warning(title: string, text?: string): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonColor: '#f59e0b'
    });
  }

  /**
   * Mostrar alerta de información
   */
  info(title: string, text?: string): Promise<any> {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: text,
      confirmButtonColor: '#3b82f6'
    });
  }

  /**
   * Mostrar diálogo de confirmación genérico
   * Retorna una promesa con el resultado de la acción del usuario
   */
  confirm(title: string, text?: string, confirmButtonText: string = 'Sí, confirmar'): Promise<any> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar'
    });
  }

  /**
   * Mostrar diálogo de confirmación de eliminación
   * Diseñado específicamente para acciones destructivas
   */
  confirmDelete(itemName: string = 'este elemento'): Promise<any> {
    return Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar ${itemName}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  }

  /**
   * Mostrar notificación toast (pequeña en la esquina)
   * Desaparece automáticamente después de 3 segundos
   */
  toast(icon: 'success' | 'error' | 'warning' | 'info', title: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: icon,
      title: title
    });
  }

  /**
   * Mostrar alerta de error de validación de formulario
   * Útil para mostrar mensajes de campos requeridos o inválidos
   */
  validationError(message: string): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: 'Validación',
      text: message,
      confirmButtonColor: '#f59e0b'
    });
  }

  /**
   * Mostrar alerta de carga con spinner
   * No permite cerrar ni hacer clic fuera
   */
  loading(title: string = 'Cargando...', text?: string): void {
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Cerrar la alerta de carga activa
   */
  close(): void {
    Swal.close();
  }
}
