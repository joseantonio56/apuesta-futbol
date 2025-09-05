export interface Apuesta {
  jornadaId: number;
  id: number;           
  usuarioId: number; 
  nombre:string;   
  nombreUsuario?: string;  // nuevo campo temporal
  resultado1: string;   
  resultado2: string;   
  resultado3: string;   
  fecha: Date;          
}
