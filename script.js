'use strict';

/* 01 — HEADER AND CONTACT OVERLAY */
const header = document.querySelector('header');
const about = document.getElementById('about');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('close-btn');
const contactLink = document.querySelector('header a[href="#contact"]');
const overlayContactLink = document.getElementById('overlay-contact-link') || overlay?.querySelector('a[href="#contact"]');
const getInTouchLink = document.querySelector('.footer-contact a');
const contactSection = document.getElementById('contact');

function updateHeader() {
  const navHeight = header.querySelector('nav').getBoundingClientRect().height;
  header.classList.toggle('is-solid', about.getBoundingClientRect().top <= navHeight);
}
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader);
updateHeader();

function openOverlay() { overlay?.classList.add('show'); }
function closeOverlay() { overlay?.classList.remove('show'); }

// Only a click on Contact opens the overlay; the original overlay styling remains unchanged.
contactLink?.addEventListener('click', (event) => {
  event.preventDefault();
  contactSection?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  openOverlay();
});
closeBtn?.addEventListener('click', closeOverlay);
overlay?.addEventListener('click', (event) => {
  if (event.target === overlay) closeOverlay();
});
// Scrolling closes the overlay, including when an overlay intercepts wheel/touch scrolling.
window.addEventListener('wheel', closeOverlay, { passive: true });
window.addEventListener('touchmove', closeOverlay, { passive: true });

// The blue overlay link closes it, scrolls to the footer and briefly highlights GET IN TOUCH.
overlayContactLink?.addEventListener('click', (event) => {
  event.preventDefault();
  closeOverlay();
  contactSection?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  if (getInTouchLink) {
    getInTouchLink.classList.remove('contact-flash');
    void getInTouchLink.offsetWidth; // restart the existing CSS animation
    getInTouchLink.classList.add('contact-flash');
  }
});
getInTouchLink?.addEventListener('animationend', () => {
  getInTouchLink.classList.remove('contact-flash');
});

/* 02 — EXPLORE — original p5.js Spot sketch, embedded in the page.
   The Spot motion, forces and render style match the supplied reference. */
if (typeof p5 !== 'undefined') {
  new p5((p) => {
    let font;
    let spots = [];
    let isOrigin = false;
    let canvas;
    let textBounds = null;
    let hoveringExplore = false;
    const container = document.getElementById('project-particles');

    p.preload = () => {
  font = p.loadFont("fonts/IBMPlexMono-Regular.ttf");
};

    function buildSpots() {
      spots = [];

      let fontSize = Math.min(150, p.width * 0.19);

      let bounds = font.textBounds("EXPLORE", 0, 0, fontSize);

      // A felirat maximum a vászon 80%-át foglalhatja el
      if (bounds.w > p.width * 0.8) {
        fontSize *= (p.width * 0.8) / bounds.w;
        bounds = font.textBounds("EXPLORE", 0, 0, fontSize);
      }

      // Pontos vízszintes és függőleges középre igazítás
      const x = (p.width - bounds.w) / 2 - bounds.x;
      const y = (p.height - bounds.h) / 2 - bounds.y;

      textBounds = {
        left: x + bounds.x,
        right: x + bounds.x + bounds.w,
        top: y + bounds.y,
        bottom: y + bounds.y + bounds.h,
      };

      const points = font.textToPoints("EXPLORE", x, y, fontSize, {
        sampleFactor: 0.1,
      });

      for (let point of points) {
        spots.push(new Spot(point.x, point.y));
      }
    }

    p.draw = () => {
      hoveringExplore = Boolean(
        isOrigin &&
        textBounds &&
        canvas?.elt.matches(':hover') &&
        p.mouseX >= textBounds.left &&
        p.mouseX <= textBounds.right &&
        p.mouseY >= textBounds.top &&
        p.mouseY <= textBounds.bottom
      );
      if (canvas) canvas.elt.style.cursor = hoveringExplore ? 'pointer' : 'default';

      p.background(0);
      for (let s of spots) {
        if (isOrigin) {
          s.originalize();
        } else {
          s.diffuse();
        }
        s.checkEdges();
        s.run();
        s.show();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      p.resizeCanvas(
        container.clientWidth,
        container.clientHeight
      );

      buildSpots();
    });

    p.setup = () => {
      canvas = p.createCanvas(
        container.clientWidth,
        container.clientHeight
      );

      canvas.parent(container);
      buildSpots();

      resizeObserver.observe(container);
    };

    p.mouseClicked = (event) => {
      if (event.target !== canvas.elt) return;

      if (isOrigin) {
        openUniverse();
      } else {
        isOrigin = true;
        document.querySelector(".explore-hint")?.classList.add("hidden");
      }
    };

    // Reset when leaving the Explore section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            isOrigin = false;
            document.querySelector(".explore-hint")?.classList.remove("hidden");
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(document.getElementById("explore"));

    // When returning from the Project Universe, start with drifting dots.
    window.addEventListener("resetExplore", () => {
      isOrigin = false;
      hoveringExplore = false;
      document.querySelector(".explore-hint")?.classList.remove("hidden");
      for (const spot of spots) {
        spot.pos.set(p.random(0, p.width), p.random(0, p.height));
        spot.vel.mult(0);
        spot.acc.mult(0);
      }
    });

    class Spot {
      constructor(x, y) {
        this.origin = p.createVector(x, y);
        this.pos = p.createVector(p.random(0, p.width), p.random(0, p.height));
        this.acc = p.createVector(0, 0);
        this.vel = p.createVector(0, 0);
        this.maxforce = 8.0;
      }

      // F = ma
      applyForce(force) {
        let limited = force.limit(this.maxforce);
        this.acc.add(limited);
      }

      checkEdges() {
        // UpSide
        if (this.pos.y <= 0) {
          this.vel.y *= -1;
        }
        // DownSide
        else if (this.pos.y >= p.height) {
          this.vel.y *= -1;
        }
        // LeftSide
        else if (this.pos.x <= 0) {
          this.vel.x *= -1;
        }
        // RightSide
        else if (this.pos.x >= p.width) {
          this.vel.x *= -1;
        }
      }

      run() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
      }

      diffuse() {
        let randomed = p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5));
        this.applyForce(randomed);
      }

      originalize() {
        let desired = p5.Vector.sub(this.origin, this.pos);
        let d = desired.mag();
        if (d < 100) {
          let m = p.map(d, 0, 100, 0, this.maxforce);
          desired.setMag(m);
        } else {
          desired.setMag(this.maxforce);
        }
        let steer = p5.Vector.sub(desired, this.vel);
        this.applyForce(steer);
      }

      show() {
        p.stroke(hoveringExplore ? 255 : 136);
        p.strokeWeight(3);
        p.point(this.pos.x, this.pos.y);
      }
    }
  }, document.getElementById('project-particles'));
}

/* 03 — PROJECT ARCHIVE */
const universe = document.getElementById('project-universe');
const gallery = document.getElementById('gallery');
const openGalleryButton = document.getElementById('open-gallery');
const closeGalleryButton = document.getElementById('close-gallery');
const organizeGalleryButton = document.getElementById('organize-gallery');
let gridMode = false;
let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
let galleryFrame = null;
const mobileQuery = window.matchMedia('(max-width: 768px)');

function animateGallery() {
  if (!universe.classList.contains('open') || mobileQuery.matches) { galleryFrame = null; return; }
  currentX += (targetX - currentX) * .05;
  currentY += (targetY - currentY) * .05;
  gallery.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  galleryFrame = requestAnimationFrame(animateGallery);
}
function centerGallery() {
  const maxX = Math.max(0, gallery.offsetWidth - universe.clientWidth);
  const maxY = Math.max(0, gallery.offsetHeight - universe.clientHeight);
  targetX = currentX = -maxX / 2;
  targetY = currentY = -maxY / 2;
  gallery.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
}
function openUniverse() {
  universe.classList.add('open');
  universe.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  universe.scrollTop = 0;
  if (galleryFrame) cancelAnimationFrame(galleryFrame);
  if (mobileQuery.matches) {
    gallery.style.transform = 'none';
  } else {
    centerGallery();
    galleryFrame = requestAnimationFrame(animateGallery);
  }
  closeGalleryButton.focus();
}

function closeUniverse() {
  window.dispatchEvent(new Event('resetExplore'));

  universe.classList.remove('open');
  universe.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (galleryFrame) cancelAnimationFrame(galleryFrame);
  galleryFrame = null;

  if (location.hash === '#project-universe') {
    history.replaceState(
      null,
      '',
      location.pathname + location.search + '#explore'
    );
  }

  // Return to EXPLORE section
  document.getElementById('explore')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

  openGalleryButton.focus({ preventScroll: true });
}

openGalleryButton.addEventListener('click', openUniverse);
closeGalleryButton.addEventListener('click', closeUniverse);
universe.addEventListener('mousemove', (event) => {
  if (gridMode || mobileQuery.matches) return;
  const rect = universe.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  targetX = -Math.max(0, gallery.offsetWidth - rect.width) * x;
  targetY = -Math.max(0, gallery.offsetHeight - rect.height) * y;
});
function setGridMode(enabled) {
  if (gridMode === enabled) return;
  gridMode = enabled;
  organizeGalleryButton?.setAttribute('aria-pressed', String(enabled));
  if (organizeGalleryButton) organizeGalleryButton.textContent = enabled ? '[\u200ASCATTER\u200A]' : '[\u200AORGANIZE\u200A]';
  universe.classList.toggle('grid-mode', enabled);
  if (enabled) {
    const maxX = Math.max(0, gallery.offsetWidth - universe.clientWidth);
    const maxY = Math.max(0, gallery.offsetHeight - universe.clientHeight);
    targetX = -maxX / 2;
    targetY = -maxY / 2;
  }
}
organizeGalleryButton?.addEventListener('click', () => {
  if (!mobileQuery.matches) setGridMode(!gridMode);
});
universe.addEventListener('wheel', event => {
  if (!universe.classList.contains('open') || mobileQuery.matches || !event.ctrlKey) return;
  event.preventDefault();
  setGridMode(event.deltaY > 0);
}, { passive: false });
window.addEventListener('resize', () => {
  if (!universe.classList.contains('open')) return;
  if (galleryFrame) cancelAnimationFrame(galleryFrame);
  galleryFrame = null;
  if (mobileQuery.matches) {
    setGridMode(false);
    gallery.style.transform = 'none';
  }
  else { centerGallery(); galleryFrame = requestAnimationFrame(animateGallery); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (universe.classList.contains('open')) closeUniverse();
    else closeOverlay();
  }
});
if (location.hash === '#project-universe') {
  window.addEventListener('load', openUniverse, { once: true });
}

/* 04 — EMAIL COPY: accessible confirmation, no external icon image */
const copyEmail = document.querySelector('.copy-email');
let copyFeedbackTimer;
copyEmail?.addEventListener('click', async () => {
  const email = copyEmail.querySelector('.email-address')?.textContent?.trim();
  const feedback = copyEmail.querySelector('.copy-feedback');
  if (!email || !feedback) return;

  clearTimeout(copyFeedbackTimer);
  try {
    await navigator.clipboard.writeText(email);
    feedback.textContent = 'COPIED!';
    copyEmail.classList.add('copied');
  } catch (error) {
    console.warn('Email copy failed:', error);
    feedback.textContent = '';
    copyEmail.classList.remove('copied');
  }
  copyFeedbackTimer = setTimeout(() => {
    feedback.textContent = '';
    copyEmail.classList.remove('copied');
  }, 2200);
});
