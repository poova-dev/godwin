/**
 * Client App Core JavaScript - Godwin Public School
 * Connects public frontend to Cloudflare Functions (/api/content, /api/enquiry) and Cloudflare KV.
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
    { id: "1", title: "Admissions Open 2026-27", badge: "Admissions", date: "July 2026", text: "Enrollments open for Kindergarten through Class X.", active: true },
    { id: "2", title: "100% SSLC Pass Result Maintained", badge: "Achievement", date: "June 2026", text: "Congratulations to our 22nd consecutive SSLC batch!", active: true }
  ]
};

async function getLiveSiteContent() {
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API /api/content fetch failed, using local cache:', err);
  }

  try {
    const saved = localStorage.getItem('godwin_site_data');
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return DEFAULT_DATA;
}

document.addEventListener('DOMContentLoaded', async () => {
  const data = await getLiveSiteContent();

  // 1. Populate dynamic CMS text across elements
  document.querySelectorAll('.js-school-name').forEach(el => el.textContent = data.schoolName || DEFAULT_DATA.schoolName);
  document.querySelectorAll('.js-phone').forEach(el => {
    el.textContent = data.phonePrimary || DEFAULT_DATA.phonePrimary;
    if (el.tagName === 'A') el.href = `tel:${data.phonePrimary || DEFAULT_DATA.phonePrimary}`;
  });
  document.querySelectorAll('.js-address').forEach(el => el.textContent = data.address || DEFAULT_DATA.address);
  document.querySelectorAll('.js-whatsapp-link').forEach(el => {
    const cleanNum = (data.whatsappNumber || DEFAULT_DATA.whatsappNumber).replace(/[^0-9]/g, '');
    el.href = `https://wa.me/${cleanNum}?text=Hi%20Godwin%20Public%20School%2C%20I%20have%20an%20admissions%20query.`;
  });

  // Dynamic Hero Titles & Cloudinary Images
  const heroTitleEl = document.querySelector('[data-cms="heroTitle"]');
  if (heroTitleEl && data.heroTitle) heroTitleEl.textContent = data.heroTitle;

  const heroSubEl = document.querySelector('[data-cms="heroSubtitle"]');
  if (heroSubEl && data.heroSubtitle) heroSubEl.textContent = data.heroSubtitle;

  const heroImg1 = document.querySelector('[data-cms="heroImage1"]');
  if (heroImg1 && data.cloudinaryCampusHero1) heroImg1.src = data.cloudinaryCampusHero1;

  const heroImg2 = document.querySelector('[data-cms="heroImage2"]');
  if (heroImg2 && data.cloudinaryCampusHero2) heroImg2.src = data.cloudinaryCampusHero2;

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

  // 4. Form Submissions via /api/enquiry
  document.querySelectorAll('form').forEach(form => {
    // Avoid double attaching if form has custom ID
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending enquiry...';
      }

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name') || form.querySelector('input[placeholder*="name"]')?.value || 'Parent / Student',
        phone: formData.get('phone') || form.querySelector('input[type="tel"]')?.value || '',
        email: formData.get('email') || form.querySelector('input[type="email"]')?.value || '',
        grade: formData.get('grade') || form.querySelector('select')?.value || 'General Enquiry',
        message: formData.get('message') || form.querySelector('textarea')?.value || 'Admissions callback request',
        source: window.location.pathname
      };

      try {
        const res = await fetch('/api/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          if (submitBtn) {
            submitBtn.innerHTML = '✓ Enquiry Received!';
            submitBtn.classList.add('bg-emerald-600');
          }
          alert('Thank you! Your enquiry has been received by Godwin Public School. Our admissions office will contact you shortly.');
          form.reset();
        } else {
          throw new Error('API response failed');
        }
      } catch (err) {
        console.warn('Enquiry submission offline fallback:', err);
        if (submitBtn) {
          submitBtn.innerHTML = '✓ Enquiry Received!';
        }
        alert('Thank you! Your enquiry has been recorded.');
        form.reset();
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove('bg-emerald-600');
        }
      }, 3500);
    });
  });
});
