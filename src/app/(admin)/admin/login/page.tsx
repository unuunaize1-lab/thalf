import { redirect } from 'next/navigation';

/**
 * /admin/login is the old internal admin login route.
 * The canonical admin login is now at /admin-login (standalone URL).
 * This page exists purely as a server-side fallback redirect in case
 * the proxy middleware 308 is bypassed (e.g. direct SSR rendering).
 */
export default function AdminLoginLegacyRedirect() {
  redirect('/admin-login');
}
