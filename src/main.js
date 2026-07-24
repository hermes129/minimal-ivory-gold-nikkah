import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const opener = $('#opener');
const openButton = $('#open-invitation');
const hero = $('.hero');
const mainContent = $('#main-content');

document.body.classList.add('is-covered');

function revealInvitation() {
  if (!opener || opener.dataset.opened === 'true') return;
  opener.dataset.opened = 'true';
  openButton.disabled = true;

  if (reduceMotion) {
    opener.hidden = true;
    document.body.classList.remove('is-covered');
    mainContent?.focus({ preventScroll: true });
    return;
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      opener.hidden = true;
      document.body.classList.remove('is-covered');
      mainContent?.focus({ preventScroll: true });
      ScrollTrigger.refresh();
    },
  });

  timeline
    .to('.opener__content', { autoAlpha: 0, y: -36, duration: 0.55 })
    .to('.opener__hint', { autoAlpha: 0, y: 14, duration: 0.3 }, '<')
    .to(
      '.opener__corner',
      {
        autoAlpha: 0,
        scale: 0.75,
        duration: 0.45,
        stagger: 0.06,
      },
      '<',
    )
    .to('.opener__panel--left', { xPercent: -102, duration: 1.35 }, '-=.08')
    .to('.opener__panel--right', { xPercent: 102, duration: 1.35 }, '<')
    .fromTo(
      '.hero__image',
      { scale: 1.08 },
      { scale: 1, duration: 1.7, ease: 'power2.out' },
      '-=1.15',
    )
    .fromTo(
      ['.hero__copy > *', '.hero__meta', '.scroll-cue'],
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.09, ease: 'power2.out' },
      '-=.75',
    );
}

openButton?.addEventListener('click', revealInvitation);

$$('[data-scroll-to]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.scrollTo);
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});

if (!reduceMotion) {
  gsap.set('.reveal', { autoAlpha: 0, y: 44 });

  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: (elements) => {
      gsap.to(elements, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.11,
        ease: 'power3.out',
        overwrite: true,
      });
    },
  });

  $$('.image-parallax').forEach((element) => {
    gsap.fromTo(
      element,
      { backgroundPosition: '50% 38%' },
      {
        backgroundPosition: '50% 62%',
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      },
    );
  });

  gsap.to('.invitation__art', {
    rotate: 8,
    yPercent: 8,
    ease: 'none',
    scrollTrigger: {
      trigger: '.invitation',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });
}

const eventDetails = {
  title: 'The Nikkah of Noor & Zayn',
  start: '20261017T110000Z',
  end: '20261017T140000Z',
  location: 'Beach Luxury Hotel, M. T. Khan Road, Karachi, Pakistan',
  description: 'With gratitude and joy, Noor and Zayn invite you to celebrate their nikkah.',
};

$('#add-calendar')?.addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Noor and Zayn//Nikkah Invitation//EN',
    'BEGIN:VEVENT',
    `DTSTART:${eventDetails.start}`,
    `DTEND:${eventDetails.end}`,
    `SUMMARY:${eventDetails.title}`,
    `DESCRIPTION:${eventDetails.description}`,
    `LOCATION:${eventDetails.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  link.download = 'noor-zayn-nikkah.ics';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  announce('Calendar invitation downloaded.');
});

$('#copy-address')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(eventDetails.location);
    announce('Venue address copied.');
  } catch {
    announce('Please copy: Beach Luxury Hotel, M. T. Khan Road, Karachi.');
  }
});

function announce(message) {
  const status = $('#action-status');
  if (!status) return;
  status.textContent = message;
  window.setTimeout(() => {
    if (status.textContent === message) status.textContent = '';
  }, 4000);
}

const weddingDate = new Date('2026-10-17T16:00:00+05:00').getTime();

function updateCountdown() {
  const remaining = Math.max(0, weddingDate - Date.now());
  const units = {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
  };

  Object.entries(units).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value).padStart(2, '0');
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const dialog = $('#rsvp-dialog');
const rsvpForm = $('#rsvp-form');

$('#open-rsvp')?.addEventListener('click', () => {
  dialog?.showModal();
  if (!reduceMotion) {
    gsap.fromTo(
      dialog,
      { autoAlpha: 0, scale: 0.94, y: 22 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' },
    );
  }
});

function closeDialog() {
  if (!dialog?.open) return;
  if (reduceMotion) {
    dialog.close();
    return;
  }

  gsap.to(dialog, {
    autoAlpha: 0,
    scale: 0.96,
    y: 14,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => {
      dialog.close();
      gsap.set(dialog, { clearProps: 'all' });
    },
  });
}

$('#close-rsvp')?.addEventListener('click', closeDialog);
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog();
});

rsvpForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(rsvpForm);
  const name = String(data.get('name') || 'Dear guest').trim();
  const safeName = name.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);
  const attending = data.get('attendance') === 'yes';
  const content = $('#dialog-content');

  if (content) {
    content.innerHTML = `
      <p class="section-kicker">Your response is noted</p>
      <h2>${attending ? 'We cannot wait.' : 'You will be missed.'}</h2>
      <p>${safeName}, ${attending
        ? 'thank you for being part of this beautiful beginning. We look forward to celebrating with you.'
        : 'thank you for sending your love. Your duas will be with us on the day.'}</p>
      <button class="solid-button dialog-done" type="button">Done</button>
    `;
    $('.dialog-done', content)?.addEventListener('click', closeDialog);
  }

  if (attending) celebrate();
});

function celebrate() {
  const container = $('#confetti');
  if (!container || reduceMotion) return;
  container.replaceChildren();

  const colours = ['#a8833d', '#d8c39f', '#f5efe3', '#7e846c'];
  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}%`);
    piece.style.setProperty('--colour', colours[index % colours.length]);
    piece.style.setProperty('--rotation', `${Math.random() * 180}deg`);
    container.append(piece);
  }

  gsap.fromTo(
    [...container.children],
    {
      x: () => gsap.utils.random(-170, 170),
      y: -40,
      rotate: 0,
      scale: () => gsap.utils.random(0.7, 1.2),
      autoAlpha: 1,
    },
    {
      y: () => gsap.utils.random(360, 620),
      x: '+=random(-70, 70)',
      rotate: () => gsap.utils.random(200, 760),
      autoAlpha: 0,
      duration: () => gsap.utils.random(1.7, 2.8),
      stagger: 0.025,
      ease: 'power1.in',
    },
  );
}
