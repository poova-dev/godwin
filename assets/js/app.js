/**
 * Client App Core JavaScript - Godwin Public School
 * Handles CMS data binding, pure Tailwind hero slider, video modal, and WhatsApp links.
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
  cloudinaryCampusHero1: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1920&q=80",
  cloudinaryCampusHero2: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80",
  notices: [
    { title: "Admissions Open 2026-27", badge: "Admissions", date: "July 2026", text: "Enrollments open for Kindergarten through Class X." },
    { title: "100% SSLC Pass Result Maintained", badge: "Achievement", date: "June 2026", text: "Congratulations to our 22nd consecutive SSLC batch!" }
  ],
  testimonials: [
    {
      name: "Ramesh Sharma",
      role: "Parent of Class X Topper",
      quote: "Sending our son to Godwin Public School was the best decision. The 20:1 student-teacher ratio ensures every child gets individual guidance.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Ananya Hegde",
      role: "Parent of Primary Student",
      quote: "The emphasis on both NCERT academics and moral values gives me total peace of mind as a parent. Highly recommended school in Sahakar Nagar!",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    }
  ]
};

function getSiteData() {
  try {
    const saved = localStorage.getItem('godwin_site_data');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Local storage read error:', e);
  }
  return DEFAULT_DATA;
}

document.addEventListener('DOMContentLoaded', () => {
  const data = getSiteData();

  // 1. Populate dynamic CMS elements
  document.querySelectorAll('.js-school-name').forEach(el => el.textContent = data.schoolName);
  document.querySelectorAll('.js-phone').forEach(el => {
    el.textContent = data.phonePrimary;
    if (el.tagName === 'A') el.href = `tel:${data.phonePrimary}`;
  });
  document.querySelectorAll('.js-address').forEach(el => el.textContent = data.address);
  document.querySelectorAll('.js-whatsapp-link').forEach(el => {
    const cleanNum = (data.whatsappNumber || '+919448052366').replace(/[^0-9]/g, '');
    el.href = `https://wa.me/${cleanNum}?text=Hi%20Godwin%20Public%20School%2C%20I%20have%20an%20admissions%20query.`;
  });

  // 2. Pure Tailwind Hero Auto-Slider
  const heroSlider = document.getElementById('pure-tw-hero-slider');
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll('.tw-hero-slide');
    let currentSlide = 0;
    if (slides.length > 1) {
      setInterval(() => {
        slides[currentSlide].classList.add('opacity-0', 'pointer-events-none');
        slides[currentSlide].classList.remove('opacity-100');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.remove('opacity-0', 'pointer-events-none');
        slides[currentSlide].classList.add('opacity-100');
      }, 5500);
    }
  }

  // 3. Virtual Tour Modal Handler
  const tourModalBtn = document.getElementById('btn-open-tour-modal');
  const tourModal = document.getElementById('virtual-tour-modal');
  const tourModalClose = document.getElementById('btn-close-tour-modal');
  if (tourModalBtn && tourModal && tourModalClose) {
    tourModalBtn.addEventListener('click', () => {
      tourModal.classList.remove('hidden');
      tourModal.classList.add('flex');
    });
    tourModalClose.addEventListener('click', () => {
      tourModal.classList.add('hidden');
      tourModal.classList.remove('flex');
    });
    tourModal.addEventListener('click', (e) => {
      if (e.target === tourModal) {
        tourModal.classList.add('hidden');
        tourModal.classList.remove('flex');
      }
    });
  }
});
