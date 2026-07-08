import { createInterface } from 'readline/promises';
import { ProductoService } from '../service/productoService';
import { Producto } from '../models/producto';

type Rl = ReturnType<typeof createInterface>;

const productoService = new ProductoService();

/**
 * Menú CRUD de productos. Se recibe la interfaz de readline ya abierta
 * (creada en menuPrincipal) para no abrir varias instancias de readline.
 */
export async function menuProducto(rl: Rl): Promise<void> {
  let salir = false;

  while (!salir) {
    console.log('\n=== Menú de Productos ===');
    console.log('1. Crear producto');
    console.log('2. Listar productos');
    console.log('3. Buscar producto por id');
    console.log('4. Actualizar producto');
    console.log('5. Eliminar producto');
    console.log('0. Volver al menú principal');

    const opcion = (await rl.question('Selecciona una opción: ')).trim();

    switch (opcion) {
      case '1':
        await crearProducto(rl);
        break;
      case '2':
        await listarProductos();
        break;
      case '3':
        await buscarProducto(rl);
        break;
      case '4':
        await actualizarProducto(rl);
        break;
      case '5':
        await eliminarProducto(rl);
        break;
      case '0':
        salir = true;
        break;
      default:
        console.log('Opción no válida.');
    }
  }
}

async function crearProducto(rl: Rl): Promise<void> {
  const idTexto = await rl.question('Id: ');
  const nombre = await rl.question('Nombre: ');
  const precioTexto = await rl.question('Precio: ');
  const categoria = await rl.question('Categoría: ');
  const disponibleTexto = await rl.question('¿Disponible? (si/no): ');

  const producto: Producto = {
    id: Number(idTexto),
    nombre,
    precio: Number(precioTexto),
    categoria,
    disponible: disponibleTexto.trim().toLowerCase() === 'si',
  };

  const resultado = await productoService.crear(producto);

  if (resultado.exito) {
    console.log('Producto creado correctamente.');
  } else {
    console.log('No se pudo crear el producto:');
    resultado.errores?.forEach((e) => console.log(` - ${e}`));
  }
}

async function listarProductos(): Promise<void> {
  const productos = await productoService.listar();

  if (productos.length === 0) {
    console.log('No hay productos registrados.');
    return;
  }

  console.table(productos);
}

async function buscarProducto(rl: Rl): Promise<void> {
  const idTexto = await rl.question('Id del producto a buscar: ');
  const producto = await productoService.obtener(Number(idTexto));

  if (!producto) {
    console.log('No se encontró un producto con ese id.');
    return;
  }

  console.log(producto);
}

async function actualizarProducto(rl: Rl): Promise<void> {
  const idTexto = await rl.question('Id del producto a actualizar: ');
  const id = Number(idTexto);

  const existente = await productoService.obtener(id);
  if (!existente) {
    console.log('No se encontró un producto con ese id.');
    return;
  }

  console.log('Deja el campo vacío para mantener el valor actual.');

  const nombre = await rl.question(`Nombre (${existente.nombre}): `);
  const precioTexto = await rl.question(`Precio (${existente.precio}): `);
  const categoria = await rl.question(`Categoría (${existente.categoria}): `);
  const disponibleTexto = await rl.question(
    `¿Disponible? si/no (${existente.disponible ? 'si' : 'no'}): `
  );

  const cambios: Partial<Producto> = {
    nombre: nombre.trim() !== '' ? nombre : existente.nombre,
    precio: precioTexto.trim() !== '' ? Number(precioTexto) : existente.precio,
    categoria: categoria.trim() !== '' ? categoria : existente.categoria,
    disponible:
      disponibleTexto.trim() !== ''
        ? disponibleTexto.trim().toLowerCase() === 'si'
        : existente.disponible,
  };

  const actualizado = await productoService.actualizar(id, cambios);
  console.log(
    actualizado ? 'Producto actualizado correctamente.' : 'No se pudo actualizar el producto.'
  );
}

async function eliminarProducto(rl: Rl): Promise<void> {
  const idTexto = await rl.question('Id del producto a eliminar: ');
  const eliminado = await productoService.eliminar(Number(idTexto));
  console.log(
    eliminado ? 'Producto eliminado correctamente.' : 'No se encontró un producto con ese id.'
  );
}
