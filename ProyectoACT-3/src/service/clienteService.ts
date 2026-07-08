import { PersistenciaService } from './persistencia.service';
import { Cliente } from '../models/cliente.model';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validaciones previas a la escritura para clientes: campos obligatorios,
 * formato de correo y teléfono no vacío.
 */
const validarCliente = (cliente: Cliente): string[] => {
  const errores: string[] = [];

  if (!cliente.nombre || cliente.nombre.trim() === '') {
    errores.push('El nombre del cliente es obligatorio.');
  }

  if (!cliente.correo || !REGEX_CORREO.test(cliente.correo)) {
    errores.push('El correo es obligatorio y debe tener un formato válido.');
  }

  if (!cliente.telefono || cliente.telefono.trim() === '') {
    errores.push('El teléfono es obligatorio.');
  }

  return errores;
};

export class ClienteService {
  private persistencia = new PersistenciaService<Cliente>('clientes.json');

  async crear(cliente: Cliente) {
    return this.persistencia.agregar(cliente, validarCliente);
  }

  async listar(): Promise<Cliente[]> {
    return this.persistencia.leerTodos();
  }

  async obtener(id: number): Promise<Cliente | undefined> {
    return this.persistencia.buscarPorId(id);
  }

  async actualizar(id: number, cambios: Partial<Cliente>): Promise<boolean> {
    return this.persistencia.actualizar(id, cambios);
  }

  async eliminar(id: number): Promise<boolean> {
    return this.persistencia.eliminar(id);
  }
}
