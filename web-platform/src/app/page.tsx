import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir la raíz directamente al mapa interactivo de SafeGuard
  redirect('/live-map');
}
