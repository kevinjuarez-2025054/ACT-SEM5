// Estructura de datos que se persistirá para cada producto
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
}
