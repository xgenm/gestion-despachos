export interface Dispatch {
  id: string;
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
  recibido: string; // Corregido de 'recibi'
  total: number;
  userId: string;
  equipmentId: string;
  operatorId: string;
  // Campos opcionales que vienen de los JOINs
  userName?: string;
  equipmentName?: string;
  operatorName?: string;
}