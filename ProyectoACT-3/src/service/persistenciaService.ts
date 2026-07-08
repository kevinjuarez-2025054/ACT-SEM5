import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Módulo de persistencia genérico.
 * Se encarga EXCLUSIVAMENTE de leer y escribir arreglos de datos en archivos
 * JSON usando fs/promises. No conoce reglas de negocio: la validación se
 * recibe como función externa (inyectada) desde el servicio específico
 * (ProductoService, ClienteService, etc.).
 *
 * T debe tener al menos un campo "id" para poder identificar cada registro.
 */
export class PersistenciaService<T extends { id: number }> {
  private rutaArchivo: string;

  constructor(nombreArchivo: string, carpeta: string = path.join(__dirname, '..', 'data')) {
    this.rutaArchivo = path.join(carpeta, nombreArchivo);
  }

  /**
   * Verifica que el archivo exista; si no existe, lo crea con un arreglo
   * vacío. Esto evita el error ENOENT en la primera lectura/escritura.
   */
  private async asegurarArchivo(): Promise<void> {
    try {
      await fs.access(this.rutaArchivo);
    } catch {
      await fs.mkdir(path.dirname(this.rutaArchivo), { recursive: true });
      await fs.writeFile(this.rutaArchivo, '[]', 'utf-8');
    }
  }

  /**
   * Lee el archivo JSON y reconstruye el arreglo de objetos en memoria.
   * Maneja: archivo inexistente, JSON corrupto/inválido y errores de
   * permisos. Ante cualquier error recuperable, devuelve un arreglo vacío
   * en lugar de detener la aplicación.
   */
  async leerTodos(): Promise<T[]> {
    await this.asegurarArchivo();

    try {
      const contenido = await fs.readFile(this.rutaArchivo, 'utf-8');

      if (!contenido.trim()) {
        console.warn(`Aviso: ${this.rutaArchivo} está vacío. Se devuelve un arreglo vacío.`);
        return [];
      }

      const datos = JSON.parse(contenido);

      if (!Array.isArray(datos)) {
        throw new Error('El contenido no corresponde a un arreglo de registros.');
      }

      return datos as T[];
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(`Error: ${this.rutaArchivo} contiene JSON corrupto o mal formado.`);
        return [];
      }

      const errorFs = error as NodeJS.ErrnoException;

      if (errorFs.code === 'ENOENT') {
        console.error(`Error: el archivo ${this.rutaArchivo} no existe.`);
        return [];
      }

      if (errorFs.code === 'EACCES') {
        console.error(`Error: permisos insuficientes para leer ${this.rutaArchivo}.`);
        return [];
      }

      console.error(`Error inesperado al leer ${this.rutaArchivo}:`, error);
      return [];
    }
  }

  /**
   * Escribe el arreglo completo en el archivo JSON de forma asíncrona.
   * Maneja errores de permisos y cualquier otro error inesperado.
   */
  private async escribirTodos(datos: T[]): Promise<boolean> {
    try {
      await this.asegurarArchivo();
      await fs.writeFile(this.rutaArchivo, JSON.stringify(datos, null, 2), 'utf-8');
      return true;
    } catch (error) {
      const errorFs = error as NodeJS.ErrnoException;

      if (errorFs.code === 'EACCES') {
        console.error(`Error: permisos insuficientes para escribir en ${this.rutaArchivo}.`);
      } else {
        console.error(`Error inesperado al escribir en ${this.rutaArchivo}:`, error);
      }
      return false;
    }
  }

  /**
   * Agrega un nuevo registro, previa validación (función recibida por
   * parámetro) y verificación de id duplicado.
   */
  async agregar(
    item: T,
    validar: (item: T) => string[]
  ): Promise<{ exito: boolean; errores?: string[] }> {
    const errores = validar(item);
    if (errores.length > 0) {
      return { exito: false, errores };
    }

    const datos = await this.leerTodos();

    if (datos.some((d) => d.id === item.id)) {
      return { exito: false, errores: [`Ya existe un registro con id ${item.id}.`] };
    }

    datos.push(item);
    const guardado = await this.escribirTodos(datos);

    return guardado
      ? { exito: true }
      : { exito: false, errores: ['No se pudo escribir el archivo.'] };
  }

  async buscarPorId(id: number): Promise<T | undefined> {
    const datos = await this.leerTodos();
    return datos.find((d) => d.id === id);
  }

  async actualizar(id: number, cambios: Partial<T>): Promise<boolean> {
    const datos = await this.leerTodos();
    const indice = datos.findIndex((d) => d.id === id);

    if (indice === -1) return false;

    datos[indice] = { ...datos[indice], ...cambios };
    return this.escribirTodos(datos);
  }

  async eliminar(id: number): Promise<boolean> {
    const datos = await this.leerTodos();
    const nuevos = datos.filter((d) => d.id !== id);

    if (nuevos.length === datos.length) return false; // no existía ese id

    return this.escribirTodos(nuevos);
  }
}
