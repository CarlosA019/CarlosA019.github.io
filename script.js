/* Compact, manually controlled galleries. Motion only plays in the expanded viewer. */
(function () {
  const dialog = document.querySelector('.gallery-dialog');
  const stage = dialog.querySelector('.dialog-stage');
  let currentGallery = null;
  let returnFocus = null;
  function clearStage() {
    stage.querySelectorAll('video').forEach(video => video.pause());
    stage.replaceChildren();
  }
  function renderDialog() {
    clearStage();
    const media = currentGallery.slides[currentGallery.index].cloneNode(true);
    media.removeAttribute('aria-hidden');
    media.removeAttribute('class');
    if (media.tagName === 'VIDEO') {
      media.controls = true;
      media.preload = 'metadata';
    } else media.loading = 'eager';
    stage.append(media);
    dialog.querySelector('.dialog-count').textContent = `${currentGallery.index + 1} / ${currentGallery.slides.length}`;
  }
  document.querySelectorAll('.carousel').forEach(gallery => {
    const slides = Array.from(gallery.querySelectorAll('.slide'));
    const controls = gallery.nextElementSibling;
    const state = {slides, index: 0, render};
    function render(n) {
      state.index = (n + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === state.index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      controls.querySelector('.count').textContent = `${String(state.index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      if (dialog.open && currentGallery === state) renderDialog();
    }
    controls.querySelectorAll('[data-step]').forEach(button => {
      button.addEventListener('click', () => render(state.index + Number(button.dataset.step)));
    });
    gallery.querySelector('.gallery-open').addEventListener('click', event => {
      currentGallery = state;
      returnFocus = event.currentTarget;
      dialog.querySelector('#gallery-title').textContent = gallery.closest('.entry').querySelector('h3').textContent;
      renderDialog();
      dialog.showModal();
    });
    render(0);
  });
  dialog.querySelector('.dialog-prev').addEventListener('click', () => currentGallery.render(currentGallery.index - 1));
  dialog.querySelector('.dialog-next').addEventListener('click', () => currentGallery.render(currentGallery.index + 1));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    // Let native video controls retain their arrow-key behavior.
    if (event.target.tagName === 'VIDEO') return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      currentGallery.render(currentGallery.index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('close', () => {
    clearStage();
    returnFocus?.focus();
  });
})();

(function () {
  const github = document.getElementById('github-contributions');
  const leetcode = document.getElementById('leetcode-solved');
  if (!github || !leetcode) return;

  // This file will eventually be refreshed by GitHub Actions.
  fetch('./stats.json', { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('Stats unavailable');
      return response.json();
    })
    .then(function (stats) {
      const valid = function (value) {
        return Number.isSafeInteger(value) && value >= 0;
      };
      if (valid(stats.githubContributions30d)) {
        github.textContent = stats.githubContributions30d.toLocaleString('en-US');
      }
      if (valid(stats.leetcodeSolvedTotal)) {
        leetcode.textContent = stats.leetcodeSolvedTotal.toLocaleString('en-US');
      }
    })
    .catch(function () {
      // Leave placeholders if stats.json is unavailable or malformed.
    });
})();

/* Scroll-driven background accents; no looping animation or scroll interception. */
(function () {
  const drone = document.querySelector('.scene-drone');
  const solar = document.querySelector('.scene-solar');
  if (!drone || !solar) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function draw() {
    queued = false;
    const p = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 1.1)));
    drone.style.setProperty('--drone-x', `${p * Math.max(290, window.innerWidth * .27)}px`);
    drone.style.setProperty('--drone-y', `${-p * 85}px`);
    drone.style.setProperty('--drone-tilt', `${-8 + p * 14}deg`);
    drone.style.setProperty('--drone-scale', String(1 - p * .58));
    solar.style.setProperty('--solar-x', `${-p * 460}px`);
    solar.style.setProperty('--solar-y', `${p * 24}px`);
  }
  function schedule() {
    if (!queued) { queued = true; window.requestAnimationFrame(draw); }
  }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule, {passive: true});
  reducedMotion.addEventListener('change', schedule);
  draw();
})();
