import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  usuario: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  login(): void {
    const adminUsuario = 'admin';
    const adminPassword = '1234';

    if (this.usuario.trim() === adminUsuario && this.password === adminPassword) {
      // Guardamos en el servicio
      this.authService.loginAdmin();

      // Guardamos en localStorage
      localStorage.setItem('usuario', this.usuario);
      localStorage.setItem('rol', 'admin'); // para diferenciar si es admin

      this.toastr.success('Login exitoso', 'Bienvenido', { timeOut: 2000, positionClass: 'toast-top-center' });

      // Redirigimos a la página de apuestas
      this.router.navigate(['/apuesta']);
    } else {
      this.toastr.error('Usuario o contraseña incorrectos', 'Error', { timeOut: 3000, positionClass: 'toast-top-center' });
    }
  }
}
