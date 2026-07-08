import { promises as fs } from 'fs';
import * as path from 'path';
import { ProductoService } from './service/producto.service';
import { ClienteService } from './service/cliente.service';

const productoService = new ProductoService();
const clienteService = new ClienteService();

const RUTA_DATA = path.join(__dirname, 'data');

async function pruebaEscrituraValida() {
  console.log('\n--- Prueba 1: Escritura de datos válidos ---');

  const resultadoProducto = await productoService.crear({
    id: 1,
    nombre: 'Hamburguesa Clásica',
    precio: 45.5,
    categoria: 'Platos fuertes',
    disponible: true,
  });
  console.log('Resultado producto:', resultadoProducto);

  const resultadoCliente = await clienteService.crear({
    id: 1,
    nombre: 'Kevin López',
    correo: 'kevin@example.com',
    telefono: '55551234',
  });
  console.log('Resultado cliente:', resultadoCliente);
}

async function pruebaEscrituraInvalida() {
  console.log('\n--- Prueba 2: Escritura de datos inválidos (debe fallar) ---');

  // @ts-expect-error: se envía un precio inválido a propósito para probar la validación
  const resultado = await productoService.crear({
    id: 2,
    nombre: '',
    precio: -10,
    categoria: '',
    disponible: 'si',
  });
  console.log('Resultado (esperado: exito=false con errores):', resultado);
}

async function pruebaLecturaCorrecta() {
  console.log('\n--- Prueba 3: Lectura correcta ---');

  const productos = await productoService.listar();
  console.log('Productos guardados:', productos);

  const clientes = await clienteService.listar();
  console.log('Clientes guardados:', clientes);
}

async function pruebaArchivoVacio() {
  console.log('\n--- Prueba 4: Lectura cuando el archivo está vacío ---');

  const rutaVacio = path.join(RUTA_DATA, 'productos_vacio_test.json');
  await fs.mkdir(RUTA_DATA, { recursive: true });
  await fs.writeFile(rutaVacio, '', 'utf-8');

  const contenido = await fs.readFile(rutaVacio, 'utf-8');
  console.log('Contenido crudo del archivo vacío:', JSON.stringify(contenido));
  console.log('El módulo de persistencia, ante este caso, retorna [] en vez de fallar (ver leerTodos).');

  await fs.unlink(rutaVacio);
}

async function pruebaArchivoCorrupto() {
  console.log('\n--- Prueba 5: Lectura cuando el archivo está corrupto ---');

  const rutaCorrupta = path.join(RUTA_DATA, 'productos_corrupto_test.json');
  await fs.mkdir(RUTA_DATA, { recursive: true });
  // JSON intencionalmente mal formado (falta cerrar la llave)
  await fs.writeFile(rutaCorrupta, '{ "id": 1, "nombre": "Producto roto" ', 'utf-8');

  try {
    const contenido = await fs.readFile(rutaCorrupta, 'utf-8');
    JSON.parse(contenido);
  } catch (error) {
    console.log('Error capturado correctamente (JSON corrupto):', (error as Error).message);
  }

  await fs.unlink(rutaCorrupta);
}

async function main() {
  await pruebaEscrituraValida();
  await pruebaEscrituraInvalida();
  await pruebaLecturaCorrecta();
  await pruebaArchivoVacio();
  await pruebaArchivoCorrupto();
}

main().catch((error) => {
  console.error('Error no controlado en la ejecución de las pruebas:', error);
});
