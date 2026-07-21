// POST /api/logout -> clears the admin session cookie
export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Overwrite the cookie with an already-expired one to clear it.
      "Set-Cookie": "godwin_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
    }
  });
}
