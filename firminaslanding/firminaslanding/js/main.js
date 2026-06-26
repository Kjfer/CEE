document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initCarousel();
  initStickyFooter();
  initFormSteps();
  initSidebarForm();
  initScrollAnimations();
  initScrollProgress();
  initCounters();
  initCardTilt();
  initFAQ();
  initSidebarReveal();
  initCTABannerReveal();
});

const config = window.LANDING_CONFIG || {
  webhookURL: '',
  cursoNombre: '',
  cursoId: '',
  timeout: 10000,
  messages: { loading: 'Enviando...', success: '¡Enviado!', error: 'Error al enviar.' }
};

async function sendLead(formData, source) {
  const honeypot = formData.get('website_url');
  if (honeypot) {
    console.warn('Bot detected via honeypot');
    return { success: true };
  }

  const payload = {
    nombre: formData.get('nombre') || '',
    email: formData.get('email') || '',
    telefono: formData.get('telefono') || '',
    empresa: formData.get('empresa') || '',
    cargo: formData.get('cargo') || '',
    source: source,
    cursoId: config.cursoId,
    cursoNombre: config.cursoNombre,
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
    userAgent: navigator.userAgent
  };

  if (!config.webhookURL || config.webhookURL === 'https://tu-webhook-url.com/endpoint') {
    console.log('[DEV MODE] Lead captured:', payload);
    return { success: true };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(config.webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error sending lead:', error);
    return { success: false, error: error.message };
  }
}

function setFormState(form, state) {
  const loadingEl = form.querySelector('.form-loading');
  const errorEl = form.querySelector('.form-error');
  const submitBtn = form.querySelector('.btn-submit-form, [type="submit"]');

  if (state === 'loading') {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('opacity-50', 'cursor-not-allowed'); }
  } else if (state === 'error') {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) errorEl.classList.remove('hidden');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('opacity-50', 'cursor-not-allowed'); }
  } else if (state === 'idle') {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('opacity-50', 'cursor-not-allowed'); }
  }
}

function initModal() {
  const modal = document.getElementById('conversionModal');
  const closeBtn = modal.querySelector('.modal-close');
  const overlay = modal.querySelector('.modal-overlay-bg');
  const triggers = document.querySelectorAll('.cta-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetFormSteps();
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function initFormSteps() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const steps = form.querySelectorAll('.form-step');
  const dots = form.querySelectorAll('.step-dot');
  const nextBtn = form.querySelector('.btn-next-step');
  const prevBtn = form.querySelector('.btn-prev-step');
  const submitBtn = form.querySelector('.btn-submit-form');
  const successMsg = form.querySelector('.form-success');
  let currentStep = 1;

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateStep(1)) {
        goToStep(2);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToStep(1);
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (validateStep(2)) {
        setFormState(form, 'loading');
        const formData = new FormData(form);
        const result = await sendLead(formData, 'modal');

        if (result.success) {
          steps.forEach(s => s.classList.add('hidden'));
          form.querySelector('.step-indicator')?.classList.add('hidden');
          if (successMsg) {
            successMsg.classList.remove('hidden');
            const msgEl = successMsg.querySelector('.success-message');
            if (msgEl) msgEl.textContent = config.messages.success;
          }
        } else {
          setFormState(form, 'error');
        }
      }
    });
  }

  function goToStep(step) {
    steps.forEach(s => s.classList.add('hidden'));
    dots.forEach(d => { d.classList.remove('active'); d.classList.remove('bg-orange-500'); d.classList.add('bg-gray-300'); });

    const activeStep = form.querySelector(`.form-step[data-step="${step}"]`);
    if (activeStep) activeStep.classList.remove('hidden');

    dots.forEach((d, i) => {
      if (i < step) {
        d.classList.add('active', 'bg-orange-500');
        d.classList.remove('bg-gray-300');
      }
    });

    currentStep = step;
  }

  function validateStep(step) {
    const stepEl = form.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = stepEl.querySelectorAll('input[required]');
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('border-red-500');
        valid = false;
      } else {
        input.classList.remove('border-red-500');
      }
    });
    return valid;
  }

  window.resetFormSteps = function() {
    goToStep(1);
    setFormState(form, 'idle');
    form.querySelectorAll('input').forEach(i => { i.value = ''; i.classList.remove('border-red-500'); });
    if (successMsg) {
      successMsg.classList.add('hidden');
      form.querySelector('.step-indicator')?.classList.remove('hidden');
      form.querySelector('.form-step[data-step="1"]')?.classList.remove('hidden');
    }
  };
}

function initSidebarForm() {
  const form = document.getElementById('sidebarForm');
  if (!form) return;

  const successMsg = form.querySelector('.form-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const requiredInputs = form.querySelectorAll('input[required]');
    let valid = true;
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('border-red-500');
        valid = false;
      } else {
        input.classList.remove('border-red-500');
      }
    });

    if (!valid) return;

    setFormState(form, 'loading');
    const formData = new FormData(form);
    const result = await sendLead(formData, 'sidebar');

    if (result.success) {
      form.querySelectorAll('input, button[type="submit"]').forEach(el => el.classList.add('hidden'));
      if (successMsg) {
        successMsg.classList.remove('hidden');
        const msgEl = successMsg.querySelector('.success-message');
        if (msgEl) msgEl.textContent = config.messages.success;
      }
    } else {
      setFormState(form, 'error');
    }
  });
}

function initCarousel() {
  const track = document.getElementById('testimonialTrack');
  if (!track) return;

  const wrapper = track.parentElement;
  const cards = track.querySelectorAll('.carousel-card');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const totalCards = cards.length;
  const halfCards = totalCards / 2;
  let scrollPos = 0;
  let animationId;
  let isUserInteracting = false;
  let resumeTimeout;
  const speed = 0.5;

  function getCardWidth() {
    return cards[0].offsetWidth + 24;
  }

  function autoScroll() {
    if (!isUserInteracting) {
      scrollPos += speed;
      const cardWidth = getCardWidth();
      const halfWidth = cardWidth * halfCards;

      if (scrollPos >= halfWidth) {
        scrollPos -= halfWidth;
      }

      track.style.transform = `translateX(-${scrollPos}px)`;
    }
    animationId = requestAnimationFrame(autoScroll);
  }

  function pauseAutoplay() {
    isUserInteracting = true;
    clearTimeout(resumeTimeout);
  }

  function resumeAutoplay() {
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      isUserInteracting = false;
    }, 3000);
  }

  function slideByCards(count) {
    pauseAutoplay();
    const cardWidth = getCardWidth();
    const halfWidth = cardWidth * halfCards;
    scrollPos += cardWidth * count;

    if (scrollPos < 0) scrollPos += halfWidth;
    if (scrollPos >= halfWidth) scrollPos -= halfWidth;

    track.style.transition = 'transform 0.4s ease';
    track.style.transform = `translateX(-${scrollPos}px)`;

    setTimeout(() => {
      track.style.transition = '';
      resumeAutoplay();
    }, 400);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => slideByCards(-1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => slideByCards(1));
  }

  wrapper.addEventListener('mouseenter', pauseAutoplay);
  wrapper.addEventListener('mouseleave', () => {
    isUserInteracting = false;
  });

  wrapper.addEventListener('touchstart', pauseAutoplay, { passive: true });
  wrapper.addEventListener('touchend', resumeAutoplay, { passive: true });

  let isDragging = false;
  let startX = 0;
  let startScroll = 0;

  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startScroll = scrollPos;
    wrapper.style.cursor = 'grabbing';
    pauseAutoplay();
  });

  wrapper.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    const cardWidth = getCardWidth();
    const halfWidth = cardWidth * halfCards;

    scrollPos = startScroll + diff;

    if (scrollPos < 0) scrollPos += halfWidth;
    if (scrollPos >= halfWidth) scrollPos -= halfWidth;

    track.style.transform = `translateX(-${scrollPos}px)`;
  });

  wrapper.addEventListener('mouseup', () => {
    isDragging = false;
    wrapper.style.cursor = 'grab';
    resumeAutoplay();
  });

  wrapper.addEventListener('mouseleave', () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    }
  });

  wrapper.style.cursor = 'grab';
  wrapper.style.userSelect = 'none';

  const expandBtns = track.querySelectorAll('.btn-expand');
  expandBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.carousel-card');
      const fadeEl = card.querySelector('.fade-bottom');
      if (fadeEl) {
        fadeEl.classList.toggle('expanded');
        btn.textContent = fadeEl.classList.contains('expanded') ? 'Ver menos' : 'Ver más';
      }
    });
  });

  animationId = requestAnimationFrame(autoScroll);
}

function initStickyFooter() {
  const footer = document.getElementById('stickyFooterMobile');
  if (!footer) return;

  const hero = document.getElementById('heroSection');
  if (!hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        footer.classList.add('visible');
      } else {
        footer.classList.remove('visible');
      }
    },
    { threshold: 0 }
  );

  observer.observe(hero);
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
  );

  elements.forEach(el => {
    observer.observe(el);
  });
}

function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

function initCounters() {
  const counters = document.querySelectorAll('.counter-value');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.countTarget);
    const suffix = el.dataset.countSuffix || '';
    const format = el.dataset.countFormat || '';
    const duration = 1500;
    const startTime = performance.now();

    const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = Math.floor(easedProgress * target);

      let displayValue = currentValue.toString();
      if (format === 'comma') {
        displayValue = currentValue.toLocaleString('es-PE');
      }

      el.textContent = displayValue + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}

function initCardTilt() {
  const cards = document.querySelectorAll('.card-premium');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  cards.forEach(card => {
    card.classList.add('card-tilt');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -2;
      const rotateY = ((x - centerX) / centerX) * 2;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('open')) {
          otherItem.classList.remove('open');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          const otherContent = otherItem.querySelector('.faq-content');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherContent) otherContent.style.maxHeight = '0';
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

function initSidebarReveal() {
  const sidebarForm = document.querySelector('.sidebar-col .form-premium');
  if (!sidebarForm) return;

  const hero = document.getElementById('heroSection');
  if (!hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        sidebarForm.classList.add('sidebar-visible');
      } else {
        sidebarForm.classList.remove('sidebar-visible');
      }
    },
    { threshold: 0 }
  );

  observer.observe(hero);
}

function initCTABannerReveal() {
  const banner = document.querySelector('.cta-banner-reveal');
  if (!banner) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          banner.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(banner);
}
