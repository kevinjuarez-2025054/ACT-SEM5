# Módulo de Persistencia con JSON y fs/promises

## ¿Cómo funciona?

El módulo está separado en dos capas:

1. **`PersistenciaService<T>`** (`src/service/persistencia.service.ts`): clase genérica
   que solo sabe leer y escribir arreglos de objetos en un archivo JSON usando
   `fs/promises`. No conoce reglas de negocio.
2. **Servicios específicos** (`ProductoService`, `ClienteService`): usan una
   instancia de `PersistenciaService` y le inyectan la función de validación
   propia de cada entidad (`validarProducto`, `validarCliente`).

Esto cumple con el punto 3 de la actividad: la lógica de lectura/escritura de
archivos queda separada del resto de la aplicación.

## Archivos utilizados

- `src/data/productos.json` — arreglo de objetos `Producto`.
- `src/data/clientes.json` — arreglo de objetos `Cliente`.

Ambos se crean automáticamente (con `[]`) la primera vez que se usan, si no existen.

## Estructura del proyecto

```
src/
  data/                     # archivos JSON (se crean solos)
  models/
    producto.ts       # interfaz Producto
    cliente.ts         # interfaz Cliente
  service/
    persistencia.service.ts  # lee/escribe JSON de forma genérica (fs/promises)
    productoService.ts      # CRUD + validación de Producto
    clienteService.ts       # CRUD + validación de Cliente
  menu/
    menuProducto.ts          # menú CRUD interactivo de productos
    menuCliente.ts            # menú CRUD interactivo de clientes
    menuPrincipal.ts          # une los menús anteriores en uno solo
  index.ts                   # punto de entrada: llama a menuPrincipal
```

`index.ts` solo llama a `menuPrincipal()`. Cada menú (`menuProducto`, `menuCliente`)
recibe la misma instancia de `readline` para no abrir varias entradas de stdin,
y usa su respectivo servicio (`ProductoService`, `ClienteService`) para las
operaciones CRUD, las cuales a su vez usan `PersistenciaService` para tocar
los archivos JSON.

## Cómo se leen y escriben los datos

- **Lectura (`leerTodos`)**: lee el archivo con `fs.readFile`, y si el contenido
  no está vacío, hace `JSON.parse` y valida que el resultado sea un arreglo.
- **Escritura (`escribirTodos`, privado)**: recibe el arreglo completo en memoria
  y lo serializa con `JSON.stringify` antes de escribirlo con `fs.writeFile`.
- **Alta (`agregar`)**: valida el registro, revisa que el `id` no esté duplicado,
  y solo entonces escribe.
- **Actualización/eliminación**: leen el arreglo completo, modifican en memoria
  y vuelven a escribir el archivo completo (reescritura total, sencilla y segura
  para volúmenes de datos pequeños/medianos como los de este proyecto).

## Errores que se manejan

| Escenario | Dónde se captura | Comportamiento |
|---|---|---|
| Archivo inexistente | `asegurarArchivo` / código `ENOENT` | Se crea el archivo con `[]`, o se informa el error y se retorna `[]` |
| JSON corrupto / mal formado | `catch (SyntaxError)` en `leerTodos` | Se informa el error por consola y se retorna `[]` en vez de detener la app |
| Archivo vacío | validación de `contenido.trim()` | Se retorna `[]` sin intentar `JSON.parse` |
| Permisos insuficientes | código `EACCES` | Se informa el error específico por consola |
| Contenido que no es un arreglo | `Array.isArray` | Se lanza un error controlado que cae en el `catch` |
| Datos con formato inválido (antes de guardar) | funciones `validarProducto` / `validarCliente` | Se rechaza el guardado y se devuelven los mensajes de error, sin tocar el archivo |
| Id duplicado | `agregar` | Se rechaza el guardado con un mensaje específico |

En todos los casos la aplicación **no se detiene**: los errores se registran
por consola y las funciones devuelven valores seguros (`[]`, `false` o
`{ exito: false, errores: [...] }`) para que quien llame decida qué hacer.

## Pruebas incluidas (`src/pruebas.ts`)

1. Escritura de datos válidos (producto y cliente).
2. Escritura de datos inválidos (debe rechazarse por validación).
3. Lectura correcta de los datos ya guardados.
4. Lectura cuando el archivo está vacío.
5. Lectura cuando el archivo está corrupto (JSON mal formado).

Para ejecutar las pruebas automáticas:

```bash
pnpm install
pnpm ts-node src/pruebas.ts
```

Para ejecutar la aplicación con el menú interactivo:

```bash
pnpm ts-node src/index.ts
```
