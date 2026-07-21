/**
 * Cloudflare Function: POST /api/login
 * Validates password against ADMIN_PASSWORD secret and issues HttpOnly session cookie.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const password = body.password || '';

    const expectedPassword = env.ADMIN_PASSWORD || 'godwin2026';

    if (password !== expectedPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid admin password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure session token
    const randomArray = new Uint8Array(16);
    crypto.getRandomValues(randomArray);
    const token = Array.from(randomArray, b => b.toString(16).padStart(2, '0')).join('');
    const sessionToken = `session_${Date.now()}_${token}`;

    // Store in KV if available
    if (env.GODWIN_KV) {
      await env.GODWIN_KV.put(`session:${sessionToken}`, JSON.stringify({ authenticated: true, createdAt: Date.now() }), {
        expirationTtl: 86400 * 7 // 7 days
      });
    }

    const cookieHeader = `godwin_admin_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`;

    return new Response(
      JSON.stringify({ success: true, message: 'Authentication successful' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader
        }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
