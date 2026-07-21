import { isAdmin } from "./verify.js";

// POST /api/enquiry -> anyone (public form submission)
export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Bad request" }), { status: 400 });
  }

  if (!data.name || !data.phone) {
    return new Response(JSON.stringify({ ok: false, error: "Name and phone are required" }), { status: 400 });
  }

  const id = "enq_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const record = {
    id,
    name: data.name,
    phone: data.phone,
    email: data.email || "",
    grade: data.grade || data.queryType || "",
    academicYear: data.academicYear || "",
    message: data.message || "",
    sourcePage: data.sourcePage || "",
    submittedAt: data.submittedAt || new Date().toISOString(),
    status: "New"
  };

  await env.GODWIN_KV.put(id, JSON.stringify(record));

  const indexRaw = await env.GODWIN_KV.get("enquiry_index");
  const index = indexRaw ? JSON.parse(indexRaw) : [];
  index.unshift(id);
  await env.GODWIN_KV.put("enquiry_index", JSON.stringify(index));

  return new Response(JSON.stringify({ ok: true, id }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

// GET /api/enquiry -> ADMIN ONLY, returns every stored enquiry (newest first)
export async function onRequestGet(context) {
  const { request, env } = context;

  const authed = await isAdmin(request, env);
  if (!authed) {
    return new Response(JSON.stringify({ ok: false, error: "Not logged in" }), { status: 401 });
  }

  const indexRaw = await env.GODWIN_KV.get("enquiry_index");
  const ids = indexRaw ? JSON.parse(indexRaw) : [];

  // KV doesn't support a bulk multi-get in Pages Functions, so fetch each record.
  const enquiries = [];
  for (const id of ids) {
    const raw = await env.GODWIN_KV.get(id);
    if (raw) enquiries.push(JSON.parse(raw));
  }

  return new Response(JSON.stringify({ ok: true, enquiries }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

// PATCH /api/enquiry -> ADMIN ONLY, updates the status of one enquiry
export async function onRequestPatch(context) {
  const { request, env } = context;

  const authed = await isAdmin(request, env);
  if (!authed) {
    return new Response(JSON.stringify({ ok: false, error: "Not logged in" }), { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Bad request" }), { status: 400 });
  }

  const { id, status } = body;
  if (!id || !status) {
    return new Response(JSON.stringify({ ok: false, error: "id and status are required" }), { status: 400 });
  }

  const raw = await env.GODWIN_KV.get(id);
  if (!raw) {
    return new Response(JSON.stringify({ ok: false, error: "Enquiry not found" }), { status: 404 });
  }

  const record = JSON.parse(raw);
  record.status = status;
  await env.GODWIN_KV.put(id, JSON.stringify(record));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
