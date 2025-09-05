import { AfterViewInit, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { QuinielaService } from '../../services/quiniela.service';
import { ToastrService } from 'ngx-toastr';
import { Jornada } from '../../models/jornada';
import { Apuesta } from '../../models/apuesta';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

declare var paypal: any;

@Component({
  selector: 'app-apuesta',
  templateUrl: './apuesta.component.html',
  styleUrls: ['./apuesta.component.css']
})
export class ApuestaComponent implements OnInit, AfterViewInit, OnDestroy {
  private adminSubscription!: Subscription;
  
  jornadaActiva: Jornada | null = null;
  esAdmin: boolean = false;
  usuarioLogueado: boolean = false;

  apuesta: Apuesta = {
    jornadaId: 0,
    id: 0,
    usuarioId: 0,
    nombre: '',
    nombreUsuario: '',
    resultado1: '',
    resultado2: '',
    resultado3: '',
    fecha: new Date()
  };

  opcionesResultado3 = ['1', 'X', '2'];

  // Paginación
  paginaActual = 1;
  tamPagina = 10;
  totalPaginas = 1;
  apuestasPaginadas: Apuesta[] = [];

  constructor(
    private quinielaService: QuinielaService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Suscripciones a los cambios de estado en el servicio
    this.adminSubscription = this.authService.isAdmin().subscribe(isAdmin => {
      this.esAdmin = isAdmin;
      // Si el usuario es admin, también lo consideramos logueado.
      this.usuarioLogueado = isAdmin;
      // ❌ ya no forzamos detectChanges aquí
    });

    this.jornadaActiva = this.quinielaService.getJornadaActiva();
    if (this.jornadaActiva) {
      this.apuesta.jornadaId = this.jornadaActiva.id;
    }
    this.actualizarPaginacion();
  }

  ngOnDestroy(): void {
    if (this.adminSubscription) {
      this.adminSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    // Renderizar botón PayPal si hay jornada activa
    if (this.jornadaActiva) {
      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: '5.00' } }]
          });
        },
        onApprove: (data: any, actions: any) => {
          this.toastr.success('¡Pago completado por ' + data.payer.name.given_name + '!', 'Éxito', { positionClass: 'toast-top-center' });
        },
        onError: (err: any) => {
          console.error(err);
          this.toastr.error('Error en el pago, revisa la consola.', 'Error', { positionClass: 'toast-top-center' });
        }
      }).render('#paypal-button-container');
    }

    // ✅ aquí es seguro forzar una actualización
    this.cd.detectChanges();
  }

  enviarApuesta(): void {
    if (!this.jornadaActiva) {
      this.toastr.error('No hay ninguna jornada activa', 'Error', { timeOut: 3000, positionClass: 'toast-top-center' });
      return;
    }

    if (this.jornadaActiva.fechaLimite && new Date() > new Date(this.jornadaActiva.fechaLimite)) {
      this.toastr.error('La fecha límite para apostar ha expirado.', 'Error', { timeOut: 3000, positionClass: 'toast-top-center' });
      return;
    }

    const nombre = (this.apuesta.nombre || '').trim();
    if (!nombre) {
      this.toastr.warning('Debes ingresar un nombre', 'Atención', { timeOut: 3000, positionClass: 'toast-top-center' });
      return;
    }

    const nombreExiste = !!(this.jornadaActiva.apuestas || []).some(a =>
      ((a.nombre || a.nombreUsuario) || '').trim().toLowerCase() === nombre.toLowerCase()
    );
    if (nombreExiste) {
      this.toastr.error('El nombre ya está registrado', 'Error', { timeOut: 3000, positionClass: 'toast-top-center' });
      return;
    }

    const res1 = this.apuesta.resultado1.trim();
    const res2 = this.apuesta.resultado2.trim();
    const marcadorRegex = /^[0-9]-[0-9]$/;
    if (!marcadorRegex.test(res1) || !marcadorRegex.test(res2)) {
      this.toastr.warning('Resultados inválidos (Ej: 2-0, 1-1)', 'Error', { timeOut: 3000, positionClass: 'toast-top-center' });
      return;
    }

    if (!this.apuesta.resultado3) {
      this.toastr.warning('Debes seleccionar Resultado 3 (1/X/2)', 'Atención', { timeOut: 3000, positionClass: 'toast-top-center' });
      return;
    }

    const combinacionExiste = !!(this.jornadaActiva.apuestas || []).some(a =>
      a.resultado1 === res1 &&
      a.resultado2 === res2 &&
      a.resultado3 === this.apuesta.resultado3
    );
    if (combinacionExiste) {
      this.toastr.error('Ya existe esa combinación', 'Error', { timeOut: 3000, positionClass: 'toast-top-center' });
      return;
    }

    const nuevaApuesta: Apuesta = {
      jornadaId: this.jornadaActiva.id,
      id: Date.now(),
      usuarioId: 0,
      nombre: nombre,
      nombreUsuario: nombre,
      resultado1: res1,
      resultado2: res2,
      resultado3: this.apuesta.resultado3,
      fecha: new Date()
    };

    this.quinielaService.agregarApuesta(this.jornadaActiva.id, nuevaApuesta);
    this.jornadaActiva = this.quinielaService.getJornadaActiva();

    this.toastr.success(`Apuesta de ${nombre} registrada`, 'Éxito', { timeOut: 3000, positionClass: 'toast-top-center' });

    this.apuesta = {
      jornadaId: this.jornadaActiva?.id || 0,
      id: 0,
      usuarioId: 0,
      nombre: '',
      nombreUsuario: '',
      resultado1: '',
      resultado2: '',
      resultado3: '',
      fecha: new Date()
    };

    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    if (!this.jornadaActiva) return;
    this.totalPaginas = Math.ceil(this.jornadaActiva.apuestas.length / this.tamPagina);
    const inicio = (this.paginaActual - 1) * this.tamPagina;
    const fin = inicio + this.tamPagina;
    this.apuestasPaginadas = this.jornadaActiva.apuestas.slice(inicio, fin);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarPaginacion();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarPaginacion();
    }
  }

  resetearJornadas(): void {
    if (!this.esAdmin) return;
    this.toastr.info('¡El administrador está intentando resetear las jornadas!', 'Confirmación Requerida', {
      timeOut: 5000,
      positionClass: 'toast-top-center'
    });
    if(confirm('¿ de verdad quieres resetear la jornada ?')){
      this.quinielaService.resetearJornadas();
      this.jornadaActiva = null;
      this.authService.logout();
    } else {
      this.toastr.success('¡peticion rechazada','Ok',{
        timeOut:5000,positionClass: 'toast-top-center'
      });
    }
  }

  irAdmin(): void {
    this.router.navigate(['/admin']);
  }
  
  cerrarSesion(): void {
    this.authService.logout();
  }

  irLogin(): void {
    this.router.navigate(['/login']);
  }

  get jornadaAbierta(): boolean {
    if (!this.jornadaActiva || !this.jornadaActiva.fechaLimite) return false;
    return new Date() <= new Date(this.jornadaActiva.fechaLimite);
  }
}
