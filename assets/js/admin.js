/**
 * Admin Panel JavaScript Logic
 */
const ADMIN_AUTH_KEY = 'godwin_admin_authenticated';

function checkAdminAuth() {
  const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
  if (!isAuth && !window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
  }
}

function loginAdmin(username, password) {
  if (username === 'admin' && (password === 'admin123' || password === 'godwin2026')) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    window.location.href = 'dashboard.html';
    return true;
  }
  return false;
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  window.location.href = 'login.html';
}

function getStoredSiteData() {
  try {
    const saved = localStorage.getItem('godwin_site_data');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return {
    schoolName: "Godwin Public School",
    phonePrimary: "+91 80 2362 4855",
    phoneSecondary: "+91 94480 52366",
    whatsappNumber: "+91 94480 52366",
    email: "info@godwinpublicschoolblr.com",
    address: "AMCO Layout, Sahakar Nagar, Bengaluru, Karnataka 560092",
    heroTitle: "29 Years of Academic Excellence in Sahakar Nagar",
    heroSubtitle: "Unbroken record of 100% SSLC pass results across 22 consecutive batches."
  };
}

function saveSiteData(data) {
  localStorage.setItem('godwin_site_data', JSON.stringify(data));
  alert('Settings saved successfully!');
}
