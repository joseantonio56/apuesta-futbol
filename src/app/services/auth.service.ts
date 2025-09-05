import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _esAdmin = new BehaviorSubject<boolean>(false);
  private _usuarioLogueado = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkAuthStatus(); // Verificar el estado al iniciar el servicio
  }

  // Métodos para obtener los observables
  isAdmin(): Observable<boolean> {
    return this._esAdmin.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this._usuarioLogueado.asObservable();
  }

  // Método para actualizar el estado de autenticación
  checkAuthStatus() {
    // Usamos la clave 'adminLoggedIn' que ya usa tu QuinielaService
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    this._esAdmin.next(isAdmin);
    this._usuarioLogueado.next(isAdmin); // Si es admin, también está logueado
  }

  // Método para simular el inicio de sesión
  loginAdmin() {
    localStorage.setItem('adminLoggedIn', 'true'); // Ahora usa la misma clave
    this.checkAuthStatus();
  }

  // Método para simular el cierre de sesión
  logout() {
    localStorage.removeItem('adminLoggedIn'); // Ahora usa la misma clave
    this.checkAuthStatus();
  }
}
