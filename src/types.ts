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
  recibi: string;
  total: number;
}
