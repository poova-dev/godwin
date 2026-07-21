/**
 * Cloudflare Function: /api/content
 * GET: Public endpoint returning site configuration from GODWIN_KV (or default JSON).
 * POST: Protected endpoint requiring admin cookie session to update GODWIN_KV.
 */
import { verifyAdminSession } from './verify.js';

const DEFAULT_CONTENT = {
  schoolName: "Godwin Public School",
  phonePrimary: "+91 80 2362 4855",
  phoneSecondary: "+91 94480 52366",
  whatsappNumber: "+91 94480 52366",
  email: "info@godwinpublicschoolblr.com",
  address: "AMCO Layout, Sahakar Nagar, Bengaluru - 560092",
  heroTitle: "29 Years of Academic Excellence in Sahakar Nagar",
  heroSubtitle: "Unbroken record of 100% SSLC pass results across 22 consecutive batches.",
  principalMessage: "At Godwin Public School, we nurture young minds to achieve academic distinction while instilling moral discipline and holistic values.",
  lastUpdated: Date.now(),
  notices: [
    { id: "1", title: "Admissions Open 2026-27", badge: "Admissions", date: "July 2026", text: "Enrollments open for Kindergarten through Class X.", active: true },
    { id: "2", title: "100% SSLC Pass Result Maintained", badge: "Achievement", date: "June 2026", text: "Congratulations to our 22nd consecutive SSLC batch!", active: true }
  ],
  facilities: [
    { id: "f1", title: "Computer & STEM Lab", category: "Technology", description: "3rd Floor Air-conditioned computer suite with high-speed internet and coding tools.", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80" },
    { id: "f2", title: "Science Laboratories", category: "Academics", description: "Separate Physics, Chemistry, and Biology practical workstations.", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80" },
    { id: "f3", title: "School Library & Reading Room", category: "Resources", description: "Over 5,000 reference books, periodicals, and quiet reading areas.", image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80" }
  ],
  gallery: [
    { id: "g1", title: "Main Campus Building", category: "Campus", image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80", alt: "Godwin Campus Exterior" },
    { id: "g2", title: "Robotics Workshop", category: "Events", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80", alt: "Students learning Robotics" }
  ]
};

export async function onRequestGet(context) {
  const { env } = context;

  try {
    if (env.GODWIN_KV) {
      const data = await env.GODWIN_KV.get('site_content', 'json');
      if (data) {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
          }
        });
      }
    }

    return new Response(JSON.stringify(DEFAULT_CONTENT), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify(DEFAULT_CONTENT), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Verify admin cookie session
  const isAuth = await verifyAdminSession(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Session expired or invalid cookie' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload = await request.json();
    payload.lastUpdated = Date.now();

    if (env.GODWIN_KV) {
      await env.GODWIN_KV.put('site_content', JSON.stringify(payload));
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Content updated in KV successfully', data: payload }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to update content' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
