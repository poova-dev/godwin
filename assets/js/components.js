/**
 * Godwin Public School - Component Loader
 * Loads modular navbar and footer components across all pages.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Ensure Bootstrap JS is available globally
  if (!window.bootstrap) {
    const bsScript = document.createElement('script');
    bsScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
    document.head.appendChild(bsScript);
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

  // Load Navbar
  if (navbarContainer) {
    fetch(`${componentsPrefix}navbar.html`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(html => {
        navbarContainer.innerHTML = html;

        // Highlight active navigation link
        const activeLink = navbarContainer.querySelector(`[data-nav="${pageName}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }

        // Auto-close Bootstrap mobile menu on link click
        const collapseElement = navbarContainer.querySelector('#godwinNavbar') || navbarContainer.querySelector('#navbarNav');
        if (collapseElement && window.bootstrap) {
          const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
          navbarContainer.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
              if (collapseElement.classList.contains('show')) {
                bsCollapse.hide();
              }
            });
          });
        }
      })
      .catch(err => {
        console.error('Navbar component fetch failed:', err);
      });
  }

  // Load Footer
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
        console.error('Footer component fetch failed:', err);
      });
  }
});
