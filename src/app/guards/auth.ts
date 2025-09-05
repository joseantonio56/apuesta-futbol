import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { QuinielaService } from '../services/quiniela.service';

@Injectable({
  providedIn: 'root'
})
export class Auth implements CanActivate {

  constructor(private quinielaService: QuinielaService, private router: Router) { }

  canActivate(): boolean {
    if (this.quinielaService.isAdminLoggedIn()) {
      return true; // admin logueado, permite acceso
    } else {
      this.router.navigate(['/login']); // no logueado, redirige a login
      return false;
    }
  }
}
