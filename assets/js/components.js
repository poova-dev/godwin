/**
 * Godwin Public School - Pure Tailwind Component & Animation Loader
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Auto-inject AOS (Animate On Scroll) script if missing
  if (typeof AOS === 'undefined') {
    const aosScript = document.createElement('script');
    aosScript.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
    aosScript.onload = () => {
      if (window.AOS) {
        AOS.init({ duration: 800, once: true, offset: 50 });
      }
    };
    document.head.appendChild(aosScript);
  } else {
    AOS.init({ duration: 800, once: true, offset: 50 });
  }

  const navbarContainer = document.getElementById('navbar-placeholder');
  const footerContainer = document.getElementById('footer-placeholder');

  // Determine current page path
  const fullPath = window.location.pathname;
  let pageName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
  if (!pageName || pageName === 'index.html') {
    pageName = 'index';
  } else {
    pageName = pageName.replace('.html', '');
  }

  const isSubdir = fullPath.includes('/admin/');
  const componentsPrefix = isSubdir ? '../components/' : 'components/';

  // Load Navbar Component
  if (navbarContainer) {
    fetch(`${componentsPrefix}navbar.html`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(html => {
        navbarContainer.innerHTML = html;

        // Highlight active nav link
        navbarContainer.querySelectorAll(`[data-nav="${pageName}"]`).forEach(link => {
          link.classList.add('active');
        });

        // Pure Tailwind Mobile Drawer Toggle
        const toggleBtn = navbarContainer.querySelector('#tw-mobile-menu-btn');
        const mobileMenu = navbarContainer.querySelector('#tw-mobile-menu');
        if (toggleBtn && mobileMenu) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
          });

          // Auto close mobile drawer on link click
          mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
              mobileMenu.classList.add('hidden');
            });
          });
        }
      })
      .catch(err => {
        console.error('Navbar fetch error:', err);
      });
  }

  // Load Footer Component
  if (footerContainer) {
    fetch(`${componentsPrefix}footer.html`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(html => {
        footerContainer.innerHTML = html;
      })
      .catch(err => {
        console.error('Footer fetch error:', err);
      });
  }
});
