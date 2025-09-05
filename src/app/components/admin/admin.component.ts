import { Component, OnInit } from '@angular/core';
import { QuinielaService } from '../../services/quiniela.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  // Inputs para los 3 partidos, número de jornada y fecha límite
  partido1: string = '';
  partido2: string = '';
  partido3: string = '';
  numeroJornada: number | null = null;
  fechaLimite: string = ''; // YYYY-MM-DDTHH:mm

  jornadas: any[] = [];
  esAdmin = false; // Por defecto no es admin

  constructor(private quinielaService: QuinielaService, private toastr: ToastrService) { }

  ngOnInit(): void {
    // Obtener jornadas
    this.jornadas = this.quinielaService.getJornadas();

    // Comprobar si el usuario es admin desde localStorage
    const rol = localStorage.getItem('rol');
    if (rol === 'admin') {
      this.esAdmin = true;
    }
  }

  crearJornada() {
    if (!this.esAdmin) {
      this.toastr.error('No tienes permisos para crear jornadas', 'Error');
      return;
    }

    // Validación de campos
    if (!this.partido1 || !this.partido2 || !this.partido3) {
      this.toastr.error('Debes llenar los 3 partidos', 'Error');
      return;
    }
    if (!this.numeroJornada || this.numeroJornada <= 0) {
      this.toastr.error('Debes ingresar un número válido para la jornada', 'Error');
      return;
    }
    if (!this.fechaLimite) {
      this.toastr.error('Debes ingresar la fecha límite para la jornada', 'Error');
      return;
    }

    const partidos = [this.partido1, this.partido2, this.partido3];

    // Crear jornada con número personalizado y fecha límite
    const nuevaJornada = this.quinielaService.crearJornadaConNumero(
      partidos,
      this.numeroJornada,
      new Date(this.fechaLimite)
    );

    this.jornadas = this.quinielaService.getJornadas();

    // Limpiar inputs
    this.partido1 = '';
    this.partido2 = '';
    this.partido3 = '';
    this.numeroJornada = null;
    this.fechaLimite = '';

    this.toastr.success(`Jornada ${nuevaJornada.numero} creada con éxito`, 'Éxito');
  }
}
