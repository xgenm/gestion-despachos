export interface Dispatch {
  id: number;
  despachoNo: string;
  fecha: string;
  hora: string;
  camion: string;
  placa: string;
  color: string;
  ficha: string;
  materials: { id: string; quantity: number }[];
  cliente: string;
  celular: string;
  recibido?: string; // Campo antiguo, ya no se usa
  total: number;
  userId: number;
  equipmentId: number;
  operatorId: number;
  // Campos opcionales que vienen de los JOINs
  userName?: string;
  equipmentName?: string;
  operatorName?: string;
}