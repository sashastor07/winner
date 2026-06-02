document.addEventListener('DOMContentLoaded', () => {
  initImageFallback();
  initBurgerMenu();
  initHeroSlider();
  initServicesSlider();
});

/* ===== BURGER MENU ===== */
function initBurgerMenu() {
  const burger = document.querySelector('.burger-menu');
  const nav = document.querySelector('.header__nav');

  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('toggle');
    nav.classList.toggle('nav-active');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      burger.classList.remove('toggle');
      nav.classList.remove('nav-active');
    });
  });
}

/* ===== IMAGE FALLBACK (PNG / JPG / JPEG) ===== */
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

function stripImageExtension(path) {
  return path.replace(/\.(png|jpe?g)$/i, '');
}

function resolveImageUrl(basePath) {
  const base = stripImageExtension(basePath);

  return new Promise((resolve) => {
    let index = 0;
    const probe = new Image();

    const tryNext = () => {
      if (index >= IMAGE_EXTENSIONS.length) {
        resolve(null);
        return;
      }

      const url = `${base}.${IMAGE_EXTENSIONS[index++]}`;
      probe.onload = () => resolve(url);
      probe.onerror = tryNext;
      probe.src = url;
    };

    tryNext();
  });
}

async function initImageFallback() {
  const imgTasks = [...document.querySelectorAll('[data-img]')].map(async (el) => {
    const url = await resolveImageUrl(el.dataset.img);
    if (url) el.src = url;
  });

  const bgTasks = [...document.querySelectorAll('[data-bg]')].map(async (el) => {
    const url = await resolveImageUrl(el.dataset.bg);
    if (url) el.style.backgroundImage = `url('${url}')`;
  });

  await Promise.all([...imgTasks, ...bgTasks]);
}
/* ===== MAIN HERO SLIDER ===== */
function initHeroSlider() {
  const track = document.querySelector('.hero-slider__track');
  const slides = document.querySelectorAll('.hero-slider__slide');
  const dotsContainer = document.querySelector('.hero-slider__dots');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  const autoplayInterval = 6000;
  let autoplayTimer;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('hero-slider__dot');
    dot.setAttribute('aria-label', `Слайд ${index + 1}`);
    if (index === 0) dot.classList.add('hero-slider__dot--active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.hero-slider__dot');

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    currentIndex = index;
    slides[currentIndex].classList.add('active');

    dots.forEach((dot, i) => {
      dot.classList.toggle('hero-slider__dot--active', i === currentIndex);
    });

    resetAutoplay();
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % totalSlides);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, autoplayInterval);
  }

  resetAutoplay();
}

/* ===== SERVICES SLIDER ===== */
function initServicesSlider() {
  const track = document.querySelector('.services__track');
  const slides = document.querySelectorAll('.services__slide');
  const prevBtn = document.querySelector('.services__arrow--prev');
  const nextBtn = document.querySelector('.services__arrow--next');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }
}
