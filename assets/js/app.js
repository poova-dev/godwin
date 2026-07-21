/**
 * Client App Core JavaScript - Godwin Public School
 */

const DEFAULT_DATA = {
  schoolName: "Godwin Public School",
  phonePrimary: "+91 80 2362 4855",
  phoneSecondary: "+91 94480 52366",
  whatsappNumber: "+91 94480 52366",
  email: "info@godwinpublicschoolblr.com",
  address: "AMCO Layout, Sahakar Nagar, Bengaluru, Karnataka 560092",
  virtualTourUrl: "https://v3dmania.com/godwin-public-school-360-tour",
  heroTitle: "29 Years of Academic Excellence in Sahakar Nagar",
  heroSubtitle: "Unbroken record of 100% SSLC pass results across 22 consecutive batches. Empowering students with modern STEM facilities and values-driven education.",
  notices: [
    { title: "Admissions Open 2026-27", badge: "Admissions", date: "July 2026", text: "Enrollments open for Kindergarten through Class X." },
    { title: "100% SSLC Pass Result Maintained", badge: "Achievement", date: "June 2026", text: "Congratulations to our 22nd consecutive SSLC batch!" }
  ]
};

function getSiteData() {
  try {
    const saved = localStorage.getItem('godwin_site_data');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_DATA;
}

document.addEventListener('DOMContentLoaded', () => {
  const data = getSiteData();

  // Populate dynamic header elements if present
  document.querySelectorAll('.js-school-name').forEach(el => el.textContent = data.schoolName);
  document.querySelectorAll('.js-phone').forEach(el => {
    el.textContent = data.phonePrimary;
    if (el.tagName === 'A') el.href = `tel:${data.phonePrimary}`;
  });
  document.querySelectorAll('.js-address').forEach(el => el.textContent = data.address);
  document.querySelectorAll('.js-whatsapp-link').forEach(el => {
    const cleanNum = data.whatsappNumber.replace(/[^0-9]/g, '');
    el.href = `https://wa.me/${cleanNum}?text=Hi%20Godwin%20Public%20School%2C%20I%20have%20an%20admissions%20query.`;
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      mobileNav.style.display = mobileNav.style.display === 'flex' ? 'none' : 'flex';
    });
  }
});
