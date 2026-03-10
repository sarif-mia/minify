// Carousel logic for "Shop by Brands" section
// Initialized on section load; supports multiple instances on a page.

(function() {
  function initBrandsCarousel(wrapper) {
    const sectionId = wrapper.dataset.sectionId;
    const section = document.getElementById(`BrandsCarousel-${sectionId}`);
    if (!section) return;

    const prevBtn = wrapper.querySelector('.brands-arrow--prev');
    const nextBtn = wrapper.querySelector('.brands-arrow--next');
    const dotsContainer = wrapper.querySelector('.brands-dots');
    const items = section.querySelectorAll('.brand-item');
    const totalItems = items.length;

    const desktopVisible = parseInt(wrapper.dataset.visibleOnDesktop || 5, 10);
    const mobileVisible = parseInt(wrapper.dataset.visibleOnMobile || 2, 10);
    const enableAutoplay = wrapper.dataset.enableAutoplay === 'true';
    const autoPlayDelay = parseInt(wrapper.dataset.autoplayDelay || 3000, 10);
    const pauseOnHover = wrapper.dataset.pauseOnHover === 'true';
    const navStyle = wrapper.dataset.navigationStyle || 'arrows';
    const gap = parseInt(wrapper.dataset.carouselGap || 24, 10);

    let currentIndex = 0;
    let intervalId = null;
    let isAnimating = false;

    function getVisibleCount() {
      return window.innerWidth <= 749 ? mobileVisible : desktopVisible;
    }

    function getItemWidth() {
      const containerWidth = section.offsetWidth;
      const visible = getVisibleCount();
      return ((containerWidth - (gap * (visible - 1))) / visible);
    }

    function getMaxIndex() {
      return Math.max(0, totalItems - getVisibleCount());
    }

    function updateCarousel() {
      if (isAnimating) return;
      isAnimating = true;

      const visible = getVisibleCount();
      const itemWidth = getItemWidth();
      const translateX = -(currentIndex * (itemWidth + gap));

      section.style.transition = 'transform 0.5s ease';
      section.style.transform = `translateX(${translateX}px)`;

      items.forEach((item) => {
        item.style.flex = `0 0 ${itemWidth}px`;
        item.style.maxWidth = `${itemWidth}px`;
      });

      // announce slide position for screen readers
      wrapper.setAttribute('aria-roledescription', `Slide ${currentIndex + 1} of ${totalItems}`);

      if (dotsContainer && (navStyle === 'dots' || navStyle === 'both')) {
        const dots = dotsContainer.querySelectorAll('.brand-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentIndex);
        });
      }

      setTimeout(() => { isAnimating = false; }, 500);
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, getMaxIndex()));
      updateCarousel();
    }

    function nextSlide() {
      const maxIndex = getMaxIndex();
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateCarousel();
    }

    function prevSlide() {
      const maxIndex = getMaxIndex();
      currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      updateCarousel();
    }

    function startAutoPlay() {
      if (!enableAutoplay) return;
      if (autoPlayDelay > 0) intervalId = setInterval(nextSlide, autoPlayDelay);
    }

    function stopAutoPlay() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }

    // generate dots
    if (dotsContainer && (navStyle === 'dots' || navStyle === 'both')) {
      const maxIndex = getMaxIndex();
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.className = 'brand-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => { stopAutoPlay(); goToSlide(i); startAutoPlay(); });
        dotsContainer.appendChild(dot);
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoPlay(); prevSlide(); startAutoPlay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoPlay(); nextSlide(); startAutoPlay(); });

    if (pauseOnHover) {
      wrapper.addEventListener('mouseenter', stopAutoPlay);
      wrapper.addEventListener('mouseleave', startAutoPlay);
    }

    // keyboard navigation
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        stopAutoPlay();
        nextSlide();
        startAutoPlay();
      } else if (e.key === 'ArrowLeft') {
        stopAutoPlay();
        prevSlide();
        startAutoPlay();
      }
    });

    // touch support
    let touchStartX = 0;
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
      }
      startAutoPlay();
    }, { passive: true });

    // initial setup & resize listener
    setTimeout(updateCarousel, 100);
    startAutoPlay();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => { currentIndex = 0; updateCarousel(); }, 250);
    });
  }

  // initialise all instances on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.shop-by-brands .brands-carousel-wrapper').forEach(initBrandsCarousel);
  });
})();