import { Injectable } from '@angular/core';
import { Jornada } from '../models/jornada';
import { Apuesta } from '../models/apuesta';

@Injectable({
  providedIn: 'root'
})
export class QuinielaService {

  private jornadas: Jornada[] = [];
  private jornadaCounter: number = 1;

  // Credenciales de administrador
  private admin = { usuario: 'admin', password: '1234' };

  constructor() {
    this.cargarDesdeLocalStorage();
  }

  // ------------------- LOGIN ADMIN -------------------
  loginAdmin(usuario: string, password: string): boolean {
    if (usuario === this.admin.usuario && password === this.admin.password) {
      localStorage.setItem('adminLoggedIn', 'true');
      return true;
    }
    return false;
  }

  isAdminLoggedIn(): boolean {
    return !!localStorage.getItem('adminLoggedIn');
  }

  logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
  }

  // ------------------- FUNCIONES EXISTENTES -------------------
  private guardarEnLocalStorage() {
    localStorage.setItem('jornadas', JSON.stringify(this.jornadas));
    localStorage.setItem('jornadaCounter', this.jornadaCounter.toString());
  }

  private cargarDesdeLocalStorage() {
    const jornadasGuardadas = localStorage.getItem('jornadas');
    const counterGuardado = localStorage.getItem('jornadaCounter');

    if (jornadasGuardadas) {
      const jornadasParsed = JSON.parse(jornadasGuardadas);
      this.jornadas = jornadasParsed.map((j: any) => {
        const jornada = new Jornada(j.id, j.numero, j.partidos);
        jornada.apuestas = j.apuestas || [];
        jornada.bote = j.bote || 0;
        jornada.fechaLimite = j.fechaLimite ? new Date(j.fechaLimite) : null;
        return jornada;
      });
    }

    if (counterGuardado) {
      this.jornadaCounter = +counterGuardado;
    }
  }

  getJornadas(): Jornada[] {
    return this.jornadas;
  }

  getJornadaActiva(): Jornada | null {
    if (this.jornadas.length === 0) return null;
    return this.jornadas[this.jornadas.length - 1];
  }

  crearJornada(partidos: string[]): Jornada {
    const nuevaJornada = new Jornada(this.jornadaCounter, this.jornadaCounter, partidos);
    this.jornadas.push(nuevaJornada);
    this.jornadaCounter++;
    this.guardarEnLocalStorage();
    return nuevaJornada;
  }

  crearJornadaConNumero(partidos: string[], numero: number, fechaLimite?: Date): Jornada {
    const nuevaJornada = new Jornada(this.jornadaCounter, numero, partidos);
    if (fechaLimite) {
      nuevaJornada.fechaLimite = fechaLimite;
    }
    this.jornadas.push(nuevaJornada);
    this.jornadaCounter++;
    this.guardarEnLocalStorage();
    return nuevaJornada;
  }

  agregarApuesta(jornadaId: number, apuesta: Apuesta) {
    const jornada = this.jornadas.find(j => j.id === jornadaId);
    if (jornada) {
      jornada.agregarApuesta(apuesta); // actualiza bote automáticamente
      this.guardarEnLocalStorage();
    }
  }

  actualizarJornada(jornada: Jornada) {
    const index = this.jornadas.findIndex(j => j.id === jornada.id);
    if (index !== -1) {
      this.jornadas[index] = jornada;
      this.guardarEnLocalStorage();
    }
  }

  resetearJornadas() {
    this.jornadas = [];
    this.jornadaCounter = 1;
    localStorage.removeItem('jornadas');
    localStorage.removeItem('jornadaCounter');
  }

}
