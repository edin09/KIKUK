// === ASTRALIS VISUAL + AUDIO ENGINE — ULTIMATE FINAL ===
// Edin 2025 — zvijezde, meteori, hero muzika, naracija

// =====================
// 🌐 DETEKCIJA STRANICE
// =====================
const isIndexPage = window.location.pathname.toLowerCase().includes("index");

// =====================
// 🌌 POZADINA – ZVIJEZDE I METEORI
// =====================
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const numStars = 200;
const meteors = [];

// ✨ Zvijezde
for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    vx: Math.random() * 0.1 - 0.05,
    vy: Math.random() * 0.1 - 0.05,
    depth: Math.random() * 1.5 + 0.5
  });
}

// ☄️ Meteori
function createMeteor() {
  const margin = 250;
  const startX = margin + Math.random() * (canvas.width - 2 * margin);
  const startY = Math.random() * 80;
  const length = Math.random() * 120 + 100;
  const speed = Math.random() * 3 + 2.5;
  const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
  const brightness = Math.random() * 0.4 + 0.6;

  meteors.push({
    x: startX,
    y: startY,
    length,
    speed,
    angle,
    opacity: 0,
    life: 1,
    brightness
  });
}

// 🎨 Crtanje meteora
function drawMeteor(meteor) {
  const endX = meteor.x - Math.cos(meteor.angle) * meteor.length;
  const endY = meteor.y + Math.sin(meteor.angle) * meteor.length;

  const gradient = ctx.createLinearGradient(meteor.x, meteor.y, endX, endY);
  gradient.addColorStop(0, `rgba(255,255,255,0)`);
  gradient.addColorStop(1, `rgba(255,255,255,${meteor.opacity * meteor.brightness})`);

  ctx.save();
  ctx.shadowBlur = 80 * meteor.brightness;
  ctx.shadowColor = `rgba(255,255,255,${meteor.opacity})`;
  ctx.beginPath();
  ctx.moveTo(meteor.x, meteor.y);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

let lastMeteorTime = 0;
const meteorCooldown = 3000;

// ================================
// 🔥 METEORI LOGIKA PO STRANICAMA
// ================================
function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = 0;

  // zvijezde
  stars.forEach(star => {
    const twinkle = 0.8 + Math.sin(Date.now() * 0.002 + star.x) * 0.2;
    ctx.globalAlpha = twinkle;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    star.x += star.vx * star.depth;
    star.y += star.vy * star.depth;

    if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
    if (star.y < 0 || star.y > canvas.height) star.vy *= -1;
  });

  // DETEKCIJA HERO SEKCIJE
  let heroVisible = true;

  if (isIndexPage) {
    heroVisible = window.scrollY < window.innerHeight * 0.8;
  } else {
    heroVisible = true;
  }

  // meteori
  for (let i = meteors.length - 1; i >= 0; i--) {
    const meteor = meteors[i];
    drawMeteor(meteor);

    meteor.x -= Math.cos(meteor.angle) * meteor.speed;
    meteor.y += Math.sin(meteor.angle) * meteor.speed;

    if (meteor.opacity < 1 && meteor.life > 0.9) meteor.opacity += 0.02;
    else meteor.life -= 0.005;

    if (meteor.life < 0.3) meteor.opacity -= 0.02;

    if (!heroVisible || meteor.y > canvas.height + 200 || meteor.opacity <= 0) {
      meteors.splice(i, 1);
    }
  }

  const now = Date.now();
  if (heroVisible && now - lastMeteorTime > meteorCooldown && Math.random() < 0.05) {
    createMeteor();
    lastMeteorTime = now;
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}

drawStars();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ==================================
// 🎵 HERO MUZIKA — ULTRA SMOOTH FADE + GLASNIJI BACKGROUND
// ==================================

const heroMusic = document.getElementById('hero-music');
let heroVolume = 0;
let targetVolume = 0;

// 🔊 Glasnije ispod hero sekcije
let heroShouldPlay = true;
let heroBaseVolume = 0.28;   // tiši background, ali čujan

// 🔊 Jači zvuk u hero sekciji
const heroFocusVolume = 0.70;

// 🎚 Super smooth fade
const fadeSpeed = 0.004;

// 👉 GLOBALNA funkcija da je mogu koristiti i naracija i scroll
function checkHeroVisibility() {
  if (!heroMusic) return;

  const hero =
    document.getElementById("hero-story") ||
    document.getElementById("hero");

  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const visible = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;

  if (visible) {
    targetVolume = heroFocusVolume;  // jače u hero sekciji
    if (heroShouldPlay) heroMusic.play().catch(() => {});
  } else {
    targetVolume = heroBaseVolume;   // malo tiše ali i dalje čujno
    if (heroShouldPlay) heroMusic.play().catch(() => {});
  }
}

if (!heroMusic) {
  console.warn("⚠️ hero-music nije pronađen!");
} else {

  heroMusic.volume = 0;

  function fadeLoop() {
    if (heroVolume < targetVolume) heroVolume += fadeSpeed;
    if (heroVolume > targetVolume) heroVolume -= fadeSpeed;

    heroVolume = Math.max(0, Math.min(heroVolume, 1));
    heroMusic.volume = heroVolume;

    // Ako želimo full mute (kod naracije)
    if (heroVolume <= 0.002 && targetVolume === 0 && !heroMusic.paused) {
      heroMusic.pause();
    }

    requestAnimationFrame(fadeLoop);
  }

  fadeLoop();
  window.addEventListener("scroll", checkHeroVisibility);
  window.addEventListener("load", () => setTimeout(checkHeroVisibility, 100));

  // AUTOPLAY UNLOCK (potrebno zbog browser policy)
  function unlockHeroAudio() {
    heroMusic.play().catch(() => {});
  }

  document.addEventListener("click", unlockHeroAudio, { once: true });
  document.addEventListener("scroll", unlockHeroAudio, { once: true });
  document.addEventListener("mousemove", unlockHeroAudio, { once: true });
  document.addEventListener("keydown", unlockHeroAudio, { once: true });
}

function tryPlayHeroMusic() {
  if (!heroMusic) return;
  if (heroShouldPlay) {
    heroMusic.volume = heroBaseVolume;
    heroMusic.play().catch(() => {});
  }
}

// =====================
// 🎤 AUDIO KONTROLE — NARACIJA
// =====================

function startSyncedNarration(sectionId) {
  const audio = document.getElementById(`${sectionId}-audio`);
  const controls = document.querySelector(`#${sectionId} .audio-controls`);
  if (!audio || !controls) return;

  const playBtn = controls.querySelector('.play');
  const pauseBtn = controls.querySelector('.pause');
  const resetBtn = controls.querySelector('.reset');

  // 🔇 ugasi hero muziku dok ide naracija
  heroShouldPlay = false;
  targetVolume = 0;
  if (heroMusic) heroMusic.pause();

  audio.currentTime = 0;
  audio.play().catch(() => {});

  if (playBtn) playBtn.style.display = "none";
  if (pauseBtn) pauseBtn.style.display = "inline-flex";
  if (resetBtn) resetBtn.style.display = "inline-flex";

  audio.onended = () => {
    if (playBtn) playBtn.style.display = "inline-flex";
    if (pauseBtn) pauseBtn.style.display = "none";
    if (resetBtn) resetBtn.style.display = "none";

    // vrati hero muziku
    heroShouldPlay = true;
    tryPlayHeroMusic();
    checkHeroVisibility();
  };
}

function pauseSyncedNarration(sectionId) {
  const audio = document.getElementById(`${sectionId}-audio`);
  const pauseBtn = document.querySelector(`#${sectionId} .audio-controls .pause`);
  if (!audio || !pauseBtn) return;

  if (audio.paused) {
    // nastavljamo naraciju → stišaj hero muziku
    targetVolume = 0;
    heroShouldPlay = false;
    if (heroMusic) heroMusic.pause();

    audio.play().catch(() => {});
    pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    // pauza naracije → vrati hero muziku
    audio.pause();
    pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

    heroShouldPlay = true;
    tryPlayHeroMusic();
    checkHeroVisibility();
  }
}

function resetSyncedNarration(sectionId) {
  const audio = document.getElementById(`${sectionId}-audio`);
  const controls = document.querySelector(`#${sectionId} .audio-controls`);
  if (!audio || !controls) return;

  const playBtn = controls.querySelector('.play');
  const pauseBtn = controls.querySelector('.pause');
  const resetBtn = controls.querySelector('.reset');

  audio.pause();
  audio.currentTime = 0;

  if (playBtn) playBtn.style.display = "inline-flex";
  if (pauseBtn) pauseBtn.style.display = "none";
  if (resetBtn) resetBtn.style.display = "none";

  heroShouldPlay = true;
  tryPlayHeroMusic();
  checkHeroVisibility();
}
