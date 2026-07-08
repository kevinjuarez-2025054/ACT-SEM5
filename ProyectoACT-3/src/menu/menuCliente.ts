import { createInterface } from 'readline/promises';
import { ClienteService } from '../service/cliente.service';
import { Cliente } from '../models/cliente.model';

type Rl = ReturnType<typeof createInterface>;

const clienteService = new ClienteService();

export async function menuCliente(rl: Rl): Promise<void> {
  let salir = false;

  while (!salir) {
    console.log('\n=== Menú de Clientes ===');
    console.log('1. Crear cliente');
    console.log('2. Listar clientes');
    console.log('3. Buscar cliente por id');
    console.log('4. Actualizar cliente');
    console.log('5. Eliminar cliente');
    console.log('0. Volver al menú principal');

    const opcion = (await rl.question('Selecciona una opción: ')).trim();

    switch (opcion) {
      case '1':
        await crearCliente(rl);
        break;
      case '2':
        await listarClientes();
        break;
      case '3':
        await buscarCliente(rl);
        break;
      case '4':
        await actualizarCliente(rl);
        break;
      case '5':
        await eliminarCliente(rl);
        break;
      case '0':
        salir = true;
        break;
      default:
        console.log('Opción no válida.');
    }
  }
}

async function crearCliente(rl: Rl): Promise<void> {
  const idTexto = await rl.question('Id: ');
  const nombre = await rl.question('Nombre: ');
  const correo = await rl.question('Correo: ');
  const telefono = await rl.question('Teléfono: ');

  const cliente: Cliente = {
    id: Number(idTexto),
    nombre,
    correo,
    telefono,
  };

  const resultado = await clienteService.crear(cliente);

  if (resultado.exito) {
    console.log('Cliente creado correctamente.');
  } else {
    console.log('No se pudo crear el cliente:');
    resultado.errores?.forEach((e) => console.log(` - ${e}`));
  }
}

async function listarClientes(): Promise<void> {
  const clientes = await clienteService.listar();

  if (clientes.length === 0) {
    console.log('No hay clientes registrados.');
    return;
  }

  console.table(clientes);
}

async function buscarCliente(rl: Rl): Promise<void> {
  const idTexto = await rl.question('Id del cliente a buscar: ');
  const cliente = await clienteService.obtener(Number(idTexto));

  if (!cliente) {
    console.log('No se encontró un cliente con ese id.');
    return;
  }

  console.log(cliente);
}

async function actualizarCliente(rl: Rl): Promise<void> {
  const idTexto = await rl.question('Id del cliente a actualizar: ');
  const id = Number(idTexto);

  const existente = await clienteService.obtener(id);
  if (!existente) {
    console.log('No se encontró un cliente con ese id.');
    return;
  }

  console.log('Deja el campo vacío para mantener el valor actual.');

  const nombre = await rl.question(`Nombre (${existente.nombre}): `);
  const correo = await rl.question(`Correo (${existente.correo}): `);
  const telefono = await rl.question(`Teléfono (${existente.telefono}): `);

  const cambios: Partial<Cliente> = {
    nombre: nombre.trim() !== '' ? nombre : existente.nombre,
    correo: correo.trim() !== '' ? correo : existente.correo,
    telefono: telefono.trim() !== '' ? telefono : existente.telefono,
  };

  const actualizado = await clienteService.actualizar(id, cambios);
  console.log(
    actualizado ? 'Cliente actualizado correctamente.' : 'No se pudo actualizar el cliente.'
  );
}

async function eliminarCliente(rl: Rl): Promise<void> {
  const idTexto = await rl.question('Id del cliente a eliminar: ');
  const eliminado = await clienteService.eliminar(Number(idTexto));
  console.log(
    eliminado ? 'Cliente eliminado correctamente.' : 'No se encontró un cliente con ese id.'
  );
}
