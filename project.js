
const slides = document.querySelectorAll(".slide");
const prevButton = document.querySelector(".slider-prev");
const nextButton = document.querySelector(".slider-next");
const counter = document.getElementById("slide-counter");

let currentIndex = 0;


function updateSlider() {
  slides.forEach((slide, index) => {
    const isActive = index === currentIndex;
    slide.classList.toggle("active", isActive);

    if (slide.tagName === "VIDEO") {
  if (isActive) {
    slide.currentTime = 0;
    slide.play().catch((error) => {
      console.error("Video playback failed:", error);
    });
  } else {
    slide.pause();
  }
}
  });

  if (counter) counter.textContent =
    `${String(currentIndex + 1).padStart(2, "0")} / ` +
    `${String(slides.length).padStart(2, "0")}`;
}

nextButton?.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlider();
});

prevButton?.addEventListener("click", () => {
  currentIndex =
    (currentIndex - 1 + slides.length) % slides.length;
  updateSlider();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" && nextButton) {
    nextButton.click();
  }

  if (event.key === "ArrowLeft" && prevButton) {
    prevButton.click();
  }
});

if (slides.length) updateSlider();
const customCursor = document.getElementById("custom-cursor");

const sliderContainer = document.querySelector(".slider-container");

sliderContainer?.addEventListener("mousemove", (event) => {
  const rect = sliderContainer.getBoundingClientRect();

  const middle = rect.left + rect.width / 2;

  if (!customCursor || window.matchMedia("(hover: none)").matches) return;
  customCursor.textContent =
    event.clientX < middle ? "←" : "→";

  customCursor.style.left = `${event.clientX}px`;
  customCursor.style.top = `${event.clientY}px`;
  customCursor.style.display = "block";
});

sliderContainer?.addEventListener("mouseleave", () => {
  if (customCursor) customCursor.style.display = "none";
});

