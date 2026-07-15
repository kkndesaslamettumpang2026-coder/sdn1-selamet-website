/* ==========================================================================
   SCRIPT.JS — SMA Negeri 1 Nusantara
   Semua interaksi di halaman: preloader, navbar sticky, menu mobile,
   link navbar aktif, animasi scroll reveal, dan tombol back to top.

   Struktur: tiap fitur dibungkus dalam satu fungsi kecil (init...), lalu
   dipanggil sekali saat DOM siap. Supaya mudah dipelihara: kalau mau
   menonaktifkan satu fitur, tinggal comment satu baris pemanggilannya
   di dalam DOMContentLoaded di bawah.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavbarScroll();
  initMobileMenu();
  initActiveNavLink();
  initScrollReveal();
  initBackToTop();
  setCurrentYear();
});


/* --------------------------------------------------------------------------
   1. PRELOADER
   Sembunyikan preloader begitu semua aset (gambar, font, dll) selesai dimuat.
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    preloader.classList.add('hide');
  });

  // Jaring pengaman: kalau event 'load' lambat (koneksi lemot dsb), preloader
  // tetap disembunyikan setelah 3 detik supaya pengunjung tidak terjebak.
  setTimeout(() => preloader.classList.add('hide'), 3000);
}


/* --------------------------------------------------------------------------
   2. NAVBAR — bayangan muncul begitu halaman mulai discroll
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const toggleShadow = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  };

  toggleShadow(); // set kondisi awal saat halaman pertama kali dibuka
  window.addEventListener('scroll', throttleWithRAF(toggleShadow));
}


/* --------------------------------------------------------------------------
   3. MENU MOBILE (hamburger)
   Dibuka/ditutup lewat tombol, otomatis tertutup saat: memilih menu,
   klik di luar area menu, atau menekan tombol Escape.
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('navbarToggle');
  const menu = document.getElementById('navbarMenu');
  if (!toggleBtn || !menu) return;

  const openMenu = () => {
    menu.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    menu.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = menu.classList.contains('active');
    isOpen ? closeMenu() : openMenu();
  });

  // Tutup menu otomatis saat salah satu link diklik (relevan di tampilan mobile)
  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Tutup menu saat pengguna klik di luar panel menu
  document.addEventListener('click', (e) => {
    const clickedInsideMenu = menu.contains(e.target) || toggleBtn.contains(e.target);
    if (!clickedInsideMenu && menu.classList.contains('active')) closeMenu();
  });

  // Tutup menu dengan tombol Escape (aksesibilitas keyboard)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}


/* --------------------------------------------------------------------------
   4. LINK NAVBAR AKTIF MENGIKUTI SECTION YANG SEDANG DILIHAT
   -------------------------------------------------------------------------- */
function initActiveNavLink() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' } // section dianggap "aktif" saat berada di tengah layar
  );

  sections.forEach((section) => observer.observe(section));
}


/* --------------------------------------------------------------------------
   5. ANIMASI SCROLL REVEAL
   Elemen dengan atribut [data-animate] muncul (fade + geser ke atas) begitu
   masuk area pandang, lalu berhenti diawasi supaya hemat performa.
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const animatedEls = document.querySelectorAll('[data-animate]');
  if (!animatedEls.length) return;

  // Fallback untuk browser lama tanpa dukungan IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    animatedEls.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target); // cukup dianimasikan sekali per elemen
        }
      });
    },
    { threshold: 0.15 }
  );

  animatedEls.forEach((el) => observer.observe(el));
}


/* --------------------------------------------------------------------------
   6. TOMBOL BACK TO TOP
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle('show', window.scrollY > 400);
  };

  toggleVisibility();
  window.addEventListener('scroll', throttleWithRAF(toggleVisibility));

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* --------------------------------------------------------------------------
   7. TAHUN BERJALAN DI FOOTER
   Supaya teks hak cipta tidak perlu diedit manual setiap tahun.
   -------------------------------------------------------------------------- */
function setCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}


/* --------------------------------------------------------------------------
   UTILITAS — throttle event scroll dengan requestAnimationFrame.
   Mencegah callback dipanggil berlebihan saat scroll cepat (baik untuk performa).
   -------------------------------------------------------------------------- */
function throttleWithRAF(callback) {
  let ticking = false;
  return () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      callback();
      ticking = false;
    });
  };
}
