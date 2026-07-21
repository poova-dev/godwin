/**
 * Cloudflare Function: POST /api/logout
 * Clears HttpOnly admin session cookie and invalidates session in KV.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const cookieHeader = request.headers.get('Cookie') || '';
  const matches = cookieHeader.match(/godwin_admin_session=([^;]+)/);
  const token = matches ? matches[1] : null;

  if (token && env.GODWIN_KV) {
    await env.GODWIN_KV.delete(`session:${token}`);
  }

  const expiredCookie = `godwin_admin_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  return new Response(
    JSON.stringify({ success: true, message: 'Logged out successfully' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': expiredCookie
      }
    }
  );
}
