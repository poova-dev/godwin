/**
 * Cloudflare Function: GET /api/verify
 * Verifies if the request contains a valid HttpOnly admin session cookie.
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const cookieHeader = request.headers.get('Cookie') || '';
  
  const matches = cookieHeader.match(/godwin_admin_session=([^;]+)/);
  const token = matches ? matches[1] : null;

  if (!token || !token.startsWith('session_')) {
    return new Response(
      JSON.stringify({ authenticated: false, error: 'No active session cookie found' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // If KV exists, verify session in KV
  if (env.GODWIN_KV) {
    const sessionData = await env.GODWIN_KV.get(`session:${token}`, 'json');
    if (!sessionData) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'Session expired or invalid' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ authenticated: true, message: 'Valid admin session' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

// Helper utility export for other function endpoints
export async function verifyAdminSession(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const matches = cookieHeader.match(/godwin_admin_session=([^;]+)/);
  const token = matches ? matches[1] : null;

  if (!token || !token.startsWith('session_')) {
    return false;
  }

  if (env.GODWIN_KV) {
    const sessionData = await env.GODWIN_KV.get(`session:${token}`, 'json');
    if (!sessionData) return false;
  }
  return true;
}
