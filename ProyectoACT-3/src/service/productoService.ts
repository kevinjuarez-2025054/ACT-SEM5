import { PersistenciaService } from './persistencia.service';
import { Producto } from '../models/producto.model';

/**
 * Validaciones previas a la escritura. Solo se permite guardar productos
 * que cumplan con los requisitos mínimos: campos obligatorios presentes,
 * tipos de datos correctos y valores no vacíos.
 */
const validarProducto = (producto: Producto): string[] => {
  const errores: string[] = [];

  if (!producto.nombre || producto.nombre.trim() === '') {
    errores.push('El nombre del producto es obligatorio.');
  }

  if (typeof producto.precio !== 'number' || Number.isNaN(producto.precio) || producto.precio <= 0) {
    errores.push('El precio debe ser un número mayor a 0.');
  }

  if (!producto.categoria || producto.categoria.trim() === '') {
    errores.push('La categoría es obligatoria.');
  }

  if (typeof producto.disponible !== 'boolean') {
    errores.push('El campo disponible debe ser booleano (true/false).');
  }

  return errores;
};

export class ProductoService {
  private persistencia = new PersistenciaService<Producto>('productos.json');

  async crear(producto: Producto) {
    return this.persistencia.agregar(producto, validarProducto);
  }

  async listar(): Promise<Producto[]> {
    return this.persistencia.leerTodos();
  }

  async obtener(id: number): Promise<Producto | undefined> {
    return this.persistencia.buscarPorId(id);
  }

  async actualizar(id: number, cambios: Partial<Producto>): Promise<boolean> {
    return this.persistencia.actualizar(id, cambios);
  }

  async eliminar(id: number): Promise<boolean> {
    return this.persistencia.eliminar(id);
  }
}
