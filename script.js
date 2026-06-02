document.addEventListener('DOMContentLoaded', () => {
  initImageFallback();
  initBurgerMenu();
  initSchedulePage();
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

function getSiteBase() {
  const path = window.location.pathname;
  if (/\.html?$/i.test(path)) {
    return path.slice(0, path.lastIndexOf('/') + 1);
  }
  if (path.endsWith('/')) return path;
  return `${path}/`;
}

function normalizeAssetPath(path) {
  return path.replace(/^(\.\/|\/)+/, '');
}

function stripImageExtension(path) {
  return path.replace(/\.(png|jpe?g)$/i, '');
}

function resolveImageUrl(basePath) {
  const base = stripImageExtension(normalizeAssetPath(basePath));
  const siteBase = getSiteBase();

  return new Promise((resolve) => {
    let index = 0;
    const probe = new Image();

    const tryNext = () => {
      if (index >= IMAGE_EXTENSIONS.length) {
        resolve(null);
        return;
      }

      const url = `${siteBase}${base}.${IMAGE_EXTENSIONS[index++]}`;
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

/* ===== INTERACTIVE SCHEDULE PAGE ===== */
const baseWeeklySchedule = {
  0: [
    { time: '10:00', name: 'Recovery Stretch' },
    { time: '12:00', name: 'Сімейне плавання' },
  ],
  1: [
    { time: '08:00', name: 'Full Body Strength' },
    { time: '11:00', name: 'Тренування для клієнток' },
    { time: '19:00', name: 'Functional Training' },
  ],
  2: [
    { time: '09:00', name: 'Cycle Energy' },
    { time: '12:00', name: 'Велотренажери' },
    { time: '18:30', name: 'Yoga Balance' },
  ],
  3: [
    { time: '08:30', name: 'Upper Body Power' },
    { time: '17:30', name: 'Kids Fitness' },
    { time: '20:00', name: 'HIIT Winner' },
  ],
  4: [
    { time: '09:30', name: 'Lower Body Strength' },
    { time: '13:00', name: 'Aqua Fitness' },
    { time: '19:00', name: 'Pilates Core' },
  ],
  5: [
    { time: '08:00', name: 'Performance Circuit' },
    { time: '18:00', name: 'Street Fit' },
    { time: '20:00', name: 'Cycle Race' },
  ],
  6: [
    { time: '10:00', name: 'Team Challenge' },
    { time: '12:00', name: 'Басейн: техніка плавання' },
    { time: '16:00', name: 'Mobility & SPA Recovery' },
  ],
};

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildScheduleData(startDate, totalDays = 92) {
  const data = {};
  const oneOffEvents = {
    [getLocalDateKey(addDays(startDate, 3))]: [
      { time: '18:00', name: 'Гостьовий майстер-клас: техніка присідання' },
    ],
    [getLocalDateKey(addDays(startDate, 14))]: [
      { time: '11:30', name: 'Функціональний тест Winner' },
    ],
    [getLocalDateKey(addDays(startDate, 30))]: [
      { time: '19:30', name: 'Cycle Night Ride' },
    ],
  };

  for (let i = 0; i < totalDays; i += 1) {
    const date = addDays(startDate, i);
    const key = getLocalDateKey(date);
    const weeklyEvents = baseWeeklySchedule[date.getDay()] || [];
    data[key] = [...weeklyEvents, ...(oneOffEvents[key] || [])].sort((a, b) =>
      a.time.localeCompare(b.time)
    );
  }

  return data;
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function initSchedulePage() {
  const dateStrip = document.getElementById('scheduleDateStrip');
  const scheduleList = document.getElementById('dailyScheduleList');
  const selectedDateLabel = document.getElementById('selectedDateLabel');

  if (!dateStrip || !scheduleList || !selectedDateLabel) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduleData = buildScheduleData(today);
  const dates = Object.keys(scheduleData);
  let activeDateKey = getLocalDateKey(today);

  window.scheduleData = scheduleData;

  function renderDateButtons() {
    dateStrip.innerHTML = dates
      .map((dateKey) => {
        const date = new Date(`${dateKey}T00:00:00`);
        const weekday = new Intl.DateTimeFormat('uk-UA', { weekday: 'short' }).format(date);
        const day = new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: '2-digit' }).format(date);
        const activeClass = dateKey === activeDateKey ? ' schedule-date-btn--active' : '';

        return `
          <button class="schedule-date-btn${activeClass}" type="button" data-date="${dateKey}">
            <span class="schedule-date-btn__weekday">${weekday}</span>
            <span class="schedule-date-btn__date">${day}</span>
          </button>
        `;
      })
      .join('');

    dateStrip.querySelectorAll('.schedule-date-btn').forEach((button) => {
      button.addEventListener('click', () => {
        activeDateKey = button.dataset.date;
        renderDateButtons();
        renderDailySchedule();
      });
    });
  }

  function renderDailySchedule() {
    const date = new Date(`${activeDateKey}T00:00:00`);
    const events = scheduleData[activeDateKey] || [];

    selectedDateLabel.textContent = formatDateLabel(date);

    if (events.length === 0) {
      scheduleList.innerHTML = `
        <div class="schedule-empty">
          На цей день занять немає. Оберіть іншу дату в календарі.
        </div>
      `;
      return;
    }

    scheduleList.innerHTML = events
      .map(
        (event) => `
          <div class="schedule-card">
            <span class="schedule-card__meta">${event.time}</span>
            <h3 class="schedule-card__title">${event.name}</h3>
          </div>
        `
      )
      .join('');
  }

  renderDateButtons();
  renderDailySchedule();
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
