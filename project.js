
const slides = document.querySelectorAll(".slide");
const prevButton = document.querySelector(".slider-prev");
const nextButton = document.querySelector(".slider-next");
const counter = document.getElementById("slide-counter");

let currentIndex = 0;

function updateSlider() {
  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentIndex);
  });

  counter.textContent =
    `${String(currentIndex + 1).padStart(2, "0")} / ` +
    `${String(slides.length).padStart(2, "0")}`;
}

nextButton.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlider();
});

prevButton.addEventListener("click", () => {
  currentIndex =
    (currentIndex - 1 + slides.length) % slides.length;
  updateSlider();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    nextButton.click();
  }

  if (event.key === "ArrowLeft") {
    prevButton.click();
  }
});

updateSlider();
const customCursor = document.getElementById("custom-cursor");

const sliderContainer = document.querySelector(".slider-container");

sliderContainer.addEventListener("mousemove", (event) => {
  const rect = sliderContainer.getBoundingClientRect();

  const middle = rect.left + rect.width / 2;

  customCursor.textContent =
    event.clientX < middle ? "←" : "→";

  customCursor.style.left = `${event.clientX}px`;
  customCursor.style.top = `${event.clientY}px`;
  customCursor.style.display = "block";
});

sliderContainer.addEventListener("mouseleave", () => {
  customCursor.style.display = "none";
});

// RETURN TO PROJECT UNIVERSE

function returnToUniverse() {
  if (window.location.hash !== "#project-universe") return;

  const universe = document.getElementById("project-universe");
  const explore = document.getElementById("explore");

  if (!universe) return;

  // Position homepage at Explore
  if (explore) {
    explore.scrollIntoView({ behavior: "instant" });
  }

  // Open the fullscreen universe
  universe.classList.add("open");

  // Disable background scrolling
  document.body.style.overflow = "hidden";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", returnToUniverse);
} else {
  returnToUniverse();
}
