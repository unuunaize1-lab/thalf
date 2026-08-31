import { redirect } from 'next/navigation';

/**
 * /admin/login is the old internal admin login route.
 * The canonical admin login is now at /secret-admin.
 * This page exists purely as a server-side fallback redirect in case
 * direct SSR rendering occurs.
 */
export default function AdminLoginLegacyRedirect() {
  redirect('/secret-admin');
}
