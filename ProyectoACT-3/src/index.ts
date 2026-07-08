import { menuPrincipal } from './menu/menuPrincipal';

menuPrincipal().catch((error) => {
  console.error('Error no controlado en la aplicación:', error);
});
