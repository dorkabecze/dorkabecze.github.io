
/* HOMEPAGE OVERLAY */

const trigger = document.getElementById("hover-trigger");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-btn");
const hero = document.getElementById("hero");

function isHomepage() {
  const rect = hero.getBoundingClientRect();
  return rect.top <= 0 && rect.bottom > window.innerHeight / 2;
}

function openOverlay() {
  if (isHomepage()) {
    overlay.classList.add("show");
  }
}

function closeOverlay() {
  overlay.classList.remove("show");
}

trigger.addEventListener("mouseenter", openOverlay);
closeBtn.addEventListener("click", closeOverlay);

window.addEventListener("wheel", closeOverlay, { passive: true });
window.addEventListener("touchmove", closeOverlay, { passive: true });
window.addEventListener("scroll", closeOverlay);


/* PROJECT UNIVERSE */

const universe = document.getElementById("project-universe");
const openGallery = document.getElementById("open-gallery");
const closeGallery = document.getElementById("close-gallery");
const gallery = document.getElementById("gallery");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let animationId = null;

function updateGalleryPosition(e) {
  if (gridMode) return;
  const rect = universe.getBoundingClientRect();

  const x = Math.max(0, Math.min(1,
    (e.clientX - rect.left) / rect.width
  ));

  const y = Math.max(0, Math.min(1,
    (e.clientY - rect.top) / rect.height
  ));

  const maxX = Math.max(0, gallery.offsetWidth - rect.width);
  const maxY = Math.max(0, gallery.offsetHeight - rect.height);

  targetX = -maxX * x;
  targetY = -maxY * y;
}

function animateGallery() {
  currentX += (targetX - currentX) * 0.05;
  currentY += (targetY - currentY) * 0.05;

  gallery.style.transform =
    `translate3d(${currentX}px, ${currentY}px, 0)`;

  animationId = requestAnimationFrame(animateGallery);
}

function openUniverse() {
  universe.classList.add("open");
  document.body.style.overflow = "hidden";

  // Start at the center of the large canvas
  const maxX = Math.max(0, gallery.offsetWidth - universe.clientWidth);
  const maxY = Math.max(0, gallery.offsetHeight - universe.clientHeight);

  currentX = targetX = -maxX / 2;
  currentY = targetY = -maxY / 2;

  gallery.style.transform =
    `translate3d(${currentX}px, ${currentY}px, 0)`;

  cancelAnimationFrame(animationId);
  animateGallery();
}

function closeUniverse() {
  universe.classList.remove("open");
  document.body.style.overflow = "";
  cancelAnimationFrame(animationId);
  openGallery.focus();
}

openGallery.addEventListener("click", openUniverse);
closeGallery.addEventListener("click", closeUniverse);

universe.addEventListener("mousemove", updateGalleryPosition);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && universe.classList.contains("open")) {
    closeUniverse();
  }
});

let gridMode = false;

function setGridMode(enabled) {
  if (gridMode === enabled) return;

  gridMode = enabled;
universe.classList.toggle("grid-mode", enabled);
  if (enabled) {
    // Középre igazítjuk az egész vásznat
    const maxX = gallery.offsetWidth - universe.clientWidth;
    const maxY = gallery.offsetHeight - universe.clientHeight;

    targetX = -maxX / 2;
    targetY = -maxY / 2;
  }

  universe.classList.toggle("grid-mode", enabled);
}

universe.addEventListener("wheel", (e) => {
  if (!universe.classList.contains("open")) return;
  if (!e.ctrlKey) return;

  e.preventDefault();

  if (e.deltaY > 0) {
    setGridMode(true);
  } else {
    setGridMode(false);
  }
}, { passive: false });