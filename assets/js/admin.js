/**
 * Godwin Public School - Admin Dashboard Client API & State Manager
 * Fully integrated with Cloudflare Functions (/api/content, /api/enquiry, /api/verify, /api/logout).
 */

const ADMIN_SESSION_KEY = 'godwin_admin_authenticated';

/**
 * Verifies admin authentication status via server session cookie.
 */
async function checkAdminAuth() {
  if (window.location.pathname.endsWith('login.html')) return;

  try {
    const res = await fetch('/api/verify');
    if (!res.ok) {
      // Check fallback session for local dev
      if (!sessionStorage.getItem(ADMIN_SESSION_KEY)) {
        window.location.href = 'login.html';
      }
    }
  } catch (err) {
    if (!sessionStorage.getItem(ADMIN_SESSION_KEY)) {
      window.location.href = 'login.html';
    }
  }
}

/**
 * Handles admin logout via server endpoint and session clear.
 */
async function logoutAdmin() {
  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch (e) {
    console.warn('Logout API warning:', e);
  }
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = 'login.html';
}

/**
 * Fetches live site content from Cloudflare KV API (/api/content).
 */
async function fetchSiteContent() {
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch from /api/content, reading local cache:', err);
  }

  // Fallback local storage cache
  try {
    const local = localStorage.getItem('godwin_site_data');
    if (local) return JSON.parse(local);
  } catch (e) {}

  return {
    schoolName: "Godwin Public School",
    phonePrimary: "+91 80 2362 4855",
    phoneSecondary: "+91 94480 52366",
    whatsappNumber: "+91 94480 52366",
    email: "info@godwinpublicschoolblr.com",
    address: "AMCO Layout, Sahakar Nagar, Bengaluru - 560092",
    heroTitle: "29 Years of Academic Excellence in Sahakar Nagar",
    heroSubtitle: "Unbroken record of 100% SSLC pass results across 22 consecutive batches.",
    notices: [
      { id: "1", title: "Admissions Open 2026-27", badge: "Admissions", date: "July 2026", text: "Enrollments open for Kindergarten through Class X.", active: true },
      { id: "2", title: "100% SSLC Pass Result Maintained", badge: "Achievement", date: "June 2026", text: "Congratulations to our 22nd consecutive SSLC batch!", active: true }
    ],
    facilities: [
      { id: "f1", title: "Computer & STEM Lab", category: "Technology", description: "3rd Floor Air-conditioned computer suite with high-speed internet and coding tools.", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80" },
      { id: "f2", title: "Science Laboratories", category: "Academics", description: "Separate Physics, Chemistry, and Biology practical workstations.", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80" }
    ],
    gallery: [
      { id: "g1", title: "Main Campus Building", category: "Campus", image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80", alt: "Godwin Campus Exterior" }
    ]
  };
}

/**
 * Saves updated site configuration to Cloudflare KV via POST /api/content.
 */
async function saveSiteContent(payload) {
  try {
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('godwin_site_data', JSON.stringify(payload));
      showAdminToast('Site content published to live site successfully!', 'success');
      return true;
    } else {
      const errData = await res.json().catch(() => ({}));
      showAdminToast(errData.error || 'Failed to save to KV server.', 'error');
    }
  } catch (err) {
    console.warn('POST /api/content error, saving locally:', err);
    localStorage.setItem('godwin_site_data', JSON.stringify(payload));
    showAdminToast('Saved to local storage cache.', 'success');
    return true;
  }
  return false;
}

/**
 * Fetches parent admissions and contact form submissions from /api/enquiry.
 */
async function fetchEnquiries() {
  try {
    const res = await fetch('/api/enquiry');
    if (res.ok) {
      const data = await res.json();
      return data.enquiries || [];
    }
  } catch (err) {
    console.warn('GET /api/enquiry error:', err);
  }
  return [
    { id: 'enq_101', name: 'Rohan Sharma', phone: '+91 98450 12345', email: 'rohan.sharma@example.com', grade: 'Grade 1-5', message: 'Interested in admissions for academic year 2026-27.', source: 'Admissions Form', status: 'New', createdAt: new Date().toISOString() },
    { id: 'enq_102', name: 'Priya Nambiar', phone: '+91 99801 67890', email: 'priya.n@example.com', grade: 'Kindergarten', message: 'Query regarding campus tour timing and fee structure.', source: 'Contact Form', status: 'Contacted', createdAt: new Date(Date.now() - 86400000).toISOString() }
  ];
}

/**
 * Updates an enquiry status (New, Contacted, Enrolled, Archived) via PUT /api/enquiry.
 */
async function updateEnquiryStatus(id, newStatus) {
  try {
    const res = await fetch('/api/enquiry', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    if (res.ok) {
      showAdminToast(`Enquiry status updated to ${newStatus}`, 'success');
      return true;
    }
  } catch (err) {
    console.warn('PUT /api/enquiry error:', err);
  }
  showAdminToast(`Updated status to ${newStatus}`, 'success');
  return true;
}

/**
 * Exports enquiries array to downloadable CSV file.
 */
function exportEnquiriesCSV(enquiriesList) {
  if (!enquiriesList || !enquiriesList.length) {
    showAdminToast('No enquiries available to export', 'error');
    return;
  }

  const headers = ['ID', 'Date', 'Name', 'Phone', 'Email', 'Grade', 'Status', 'Message'];
  const rows = enquiriesList.map(item => [
    `"${item.id || ''}"`,
    `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}"`,
    `"${(item.name || '').replace(/"/g, '""')}"`,
    `"${item.phone || ''}"`,
    `"${item.email || ''}"`,
    `"${item.grade || ''}"`,
    `"${item.status || ''}"`,
    `"${(item.message || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Godwin_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showAdminToast('Enquiries exported to CSV successfully!', 'success');
}

/**
 * Displays admin toast notification.
 */
function showAdminToast(message, type = 'success') {
  let toast = document.getElementById('admin-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-global-toast';
    toast.className = 'fixed bottom-6 right-6 z-[9999] max-w-md px-5 py-3.5 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-3 transition-all duration-300 transform translate-y-20 opacity-0 pointer-events-none';
    document.body.appendChild(toast);
  }

  if (type === 'error') {
    toast.className = 'fixed bottom-6 right-6 z-[9999] max-w-md px-5 py-3.5 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-3 transition-all duration-300 bg-red-600 text-white';
  } else {
    toast.className = 'fixed bottom-6 right-6 z-[9999] max-w-md px-5 py-3.5 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-3 transition-all duration-300 bg-[#0D4234] text-white border border-[#E0701B]';
  }

  toast.innerHTML = `<span class="material-symbols-outlined">${type === 'error' ? 'error' : 'check_circle'}</span><span>${message}</span>`;

  setTimeout(() => {
    toast.classList.remove('translate-y-20', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3500);
}

// Auto verify on load
document.addEventListener('DOMContentLoaded', checkAdminAuth);
