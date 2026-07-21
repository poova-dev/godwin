/**
 * Cloudflare Function: /api/enquiry
 * POST: Public submission of contact/admissions forms into GODWIN_KV.
 * GET: Protected admin retrieval of enquiries inbox.
 * PUT: Protected admin status update (New, Contacted, Enrolled, Archived).
 */
import { verifyAdminSession } from './verify.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const name = body.name || body.parentName || 'Anonymous User';
    const phone = body.phone || body.mobile || '';
    const email = body.email || '';
    const grade = body.grade || body.classInterested || 'General Enquiry';
    const message = body.message || '';
    const source = body.source || 'Website Form';

    const id = `enquiry_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const enquiryItem = {
      id,
      name,
      phone,
      email,
      grade,
      message,
      source,
      status: 'New',
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    if (env.GODWIN_KV) {
      await env.GODWIN_KV.put(`enquiry:${id}`, JSON.stringify(enquiryItem));

      // Append to enquiry index array
      let index = await env.GODWIN_KV.get('enquiry_index', 'json') || [];
      index.unshift(id);

      // Keep last 500 enquiries in index
      if (index.length > 500) index = index.slice(0, 500);

      await env.GODWIN_KV.put('enquiry_index', JSON.stringify(index));
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Enquiry submitted successfully', enquiry: enquiryItem }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Submission failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const isAuth = await verifyAdminSession(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Session required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let list = [];

    if (env.GODWIN_KV) {
      const index = await env.GODWIN_KV.get('enquiry_index', 'json') || [];

      for (const id of index) {
        const item = await env.GODWIN_KV.get(`enquiry:${id}`, 'json');
        if (item) list.push(item);
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: list.length, enquiries: list }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to fetch enquiries' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;

  const isAuth = await verifyAdminSession(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Session required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing id or status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (env.GODWIN_KV) {
      const item = await env.GODWIN_KV.get(`enquiry:${id}`, 'json');
      if (item) {
        item.status = status;
        item.updatedAt = new Date().toISOString();
        await env.GODWIN_KV.put(`enquiry:${id}`, JSON.stringify(item));
        return new Response(
          JSON.stringify({ success: true, message: 'Enquiry status updated', enquiry: item }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Enquiry not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
