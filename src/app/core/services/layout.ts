import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private showLayoutSubject = new BehaviorSubject<boolean>(false);
  public showLayout$: Observable<boolean> = this.showLayoutSubject.asObservable();

  constructor() {}

  /**
   * Mostrar u ocultar el layout (navbar y footer)
   * Actualiza el estado del BehaviorSubject
   */
  setShowLayout(show: boolean): void {
    this.showLayoutSubject.next(show);
  }

  /**
   * Obtener el estado actual de visibilidad del layout
   */
  getShowLayout(): boolean {
    return this.showLayoutSubject.value;
  }

  /**
   * Ocultar el layout
   * Útil para páginas de autenticación (login/register)
   */
  hideLayout(): void {
    this.setShowLayout(false);
  }

  /**
   * Mostrar el layout
   * Útil para páginas principales de la aplicación
   */
  showLayout(): void {
    this.setShowLayout(true);
  }
}
