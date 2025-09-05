import { Apuesta } from './apuesta';

export class Jornada {
  id: number;             // ID único de la jornada
  numero: number;         // Número de la jornada (1, 2, 3…)
  partidos: string[];     // Nombres de los 3 partidos
  apuestas: Apuesta[] = []; // Apuestas realizadas en esta jornada
  bote: number = 0;       // Bote acumulado de la jornada
  fechaLimite?: Date | null; // Fecha límite para apostar (opcional)

  constructor(id: number, numero: number, partidos: string[]) {
    this.id = id;
    this.numero = numero;
    this.partidos = partidos;
    this.fechaLimite = null;
  }

  // Agregar una apuesta a la jornada
  agregarApuesta(apuesta: Apuesta) {
    this.apuestas.push(apuesta);
    this.bote += 0.8; // ejemplo: 0,8€ por apuesta
  }

  // Obtener número de jugadores actuales
  numeroJugadores(): number {
    return this.apuestas.length;
  }
}
