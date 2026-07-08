import { createInterface } from 'readline/promises';
import { menuProducto } from './menuProducto';
import { menuCliente } from './menuCliente';

/**
 * Une los menús individuales (producto, cliente) en un solo punto de
 * entrada. Se abre una única interfaz de readline aquí y se comparte con
 * cada submenú para evitar conflictos al leer de stdin.
 */
export async function menuPrincipal(): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  let salir = false;

  try {
    while (!salir) {
      console.log('\n===== RestNova - Menú Principal =====');
      console.log('1. Gestión de productos');
      console.log('2. Gestión de clientes');
      console.log('0. Salir');

      const opcion = (await rl.question('Selecciona una opción: ')).trim();

      switch (opcion) {
        case '1':
          await menuProducto(rl);
          break;
        case '2':
          await menuCliente(rl);
          break;
        case '0':
          salir = true;
          break;
        default:
          console.log('Opción no válida.');
      }
    }
  } finally {
    rl.close();
  }

  console.log('Hasta luego.');
}
