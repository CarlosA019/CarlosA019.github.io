/* TODO MEDIA: Consider moving base64 photos/videos to an assets/ folder so the HTML loads faster and is easier to maintain. */
(function () {
  document.querySelectorAll('.carousel').forEach(function (gallery) {
    const slides = Array.from(gallery.querySelectorAll('.slide'));
    const controls = gallery.nextElementSibling;
    const counter = controls.querySelector('.count');
    let index = 0, timer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function stop() { clearTimeout(timer); timer = null; }
    function render(n) {
      stop();
      slides.forEach(function (s) { if (s.tagName === 'VIDEO') s.pause(); });
      index = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        const active = i === index;
        s.classList.toggle('active', active);
        s.setAttribute('aria-hidden', String(!active));
      });
      counter.textContent = String(index + 1).padStart(2,'0') + ' / ' + String(slides.length).padStart(2,'0');
      if (document.hidden || reduceMotion.matches) return;
      const current = slides[index];
      if (current.tagName === 'VIDEO') {
        current.currentTime = 0;
        current.play().catch(function () { timer = setTimeout(next, 8000); });
      } else {
        timer = setTimeout(next, 8000);
      }
    }
    function next() { render(index + 1); }
    slides.forEach(function (s) {
      if (s.tagName === 'VIDEO') {
        s.addEventListener('ended', function () {
          if (slides[index] === s) next();
        });
      }
    });
    controls.querySelectorAll('[data-step]').forEach(function (button) {
      button.addEventListener('click', function () { render(index + Number(button.dataset.step)); });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
        slides.forEach(function (s) { if (s.tagName === 'VIDEO') s.pause(); });
      } else render(index);
    });
    reduceMotion.addEventListener('change', function () { render(index); });
    render(0);
  });
})();
