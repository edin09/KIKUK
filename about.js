// === ASTRALIS GALLERY + METEORS ENGINE — FINAL VERSION ===
// Napravljeno za sve stranice, sa pravilom:
// index.html → meteori samo u hero sekciji
// sve ostale stranice → meteori svugdje

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

// 🌟 Zvijezde
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

// ☄️ Kreiranje meteora
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
// 🔥 METEORI LOGIKA (INDEX vs OSTALE)
// ================================
function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = 0;

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

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ===============================
// 🧠 POPUP SISTEM
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  const items = document.querySelectorAll('.gallery-item');
  const popup = document.getElementById('popup');
  const popupMedia = document.getElementById('popup-media');
  const popupPrompt = document.getElementById('popup-prompt');
  const popupTitle = document.getElementById('popup-title');
  const popupModel = document.getElementById('popup-model');
  const popupAI = document.getElementById('popup-ai');
  const popupAIicon = document.getElementById('popup-ai-icon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const closeBtn = document.getElementById('closePopupBtn');

  let currentIndex = 0;
  let typingTimeout;

  // ✍️ Pisanje teksta
  function typeWriterEffect(element, text, speed = 20) {
    element.textContent = '';
    let i = 0;
    clearTimeout(typingTimeout);

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        typingTimeout = setTimeout(type, speed);
      }
    }
    type();
  }

  // 🎨 AI IKONICE
  const aiIcons = {
    "DALL·E": "icons/dalle.jpg",
    "DALL-E": "icons/dalle.jpg",
    "Sora": "icons/sora.png",
    "ChatGPT": "icons/dalle.jpg",
    "ElevenLabs": "icons/elevenlabs.jpg",
    "default": "icons/ai.png"
  };

  // 🔥 OTVARANJE POPUPA
  function openPopup(index) {
    const item = items[index];
    const { type, src, key, model, ai } = item.dataset;

    let translatedTitle = '';
    let translatedPrompt = '';

    if (typeof i18next !== 'undefined' && i18next.isInitialized) {
      translatedTitle = i18next.t(`gallery.${key}.title`);
      translatedPrompt = i18next.t(`gallery.${key}.prompt`);
    }

    popupMedia.innerHTML =
      type === 'video'
        ? `<video src="${src}" controls autoplay loop></video>`
        : `<img src="${src}" alt="${translatedTitle}">`;

    popupTitle.textContent = translatedTitle;
    popupModel.textContent = model;
    popupAI.textContent = ai;

    // 🖼️ ikona AI alata
    popupAIicon.src = aiIcons[ai] || aiIcons["default"];
    popupAIicon.alt = ai + " Icon";

    typeWriterEffect(popupPrompt, translatedPrompt, 20);

    popup.classList.add('active');
    currentIndex = index;
  }

  // ZATVARANJE
  function closePopup() {
    popup.classList.remove('active');
    popupMedia.innerHTML = '';
    clearTimeout(typingTimeout);
  }

  // NAVIGACIJA
  function showNext() {
    openPopup((currentIndex + 1) % items.length);
  }
  function showPrev() {
    openPopup((currentIndex - 1 + items.length) % items.length);
  }

  // Klikovi
  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (!i18next.isInitialized) {
        setTimeout(() => openPopup(i), 100);
      } else {
        openPopup(i);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  });

  document.addEventListener('keydown', (e) => {
    if (!popup.classList.contains('active')) return;
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'Escape') closePopup();
  });
});

// ==================================
// 🎵 HERO MUZIKA — ULTRA SMOOTH FADE
// ==================================
const heroMusic = document.getElementById('hero-music');
let heroVolume = 0;
let targetVolume = 0;
let heroShouldPlay = true;

let heroBaseVolume = 0.28;
const heroFocusVolume = 0.70;
const fadeSpeed = 0.004;

function checkHeroVisibility() {
  if (!heroMusic) return;

  const hero =
    document.getElementById("hero-story") ||
    document.getElementById("hero");

  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const visible = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;

  if (visible) {
    targetVolume = heroFocusVolume;
    if (heroShouldPlay) heroMusic.play().catch(() => {});
  } else {
    targetVolume = heroBaseVolume;
    if (heroShouldPlay) heroMusic.play().catch(() => {});
  }
}

if (heroMusic) {
  heroMusic.volume = 0;

  function fadeLoop() {
    if (heroVolume < targetVolume) heroVolume += fadeSpeed;
    if (heroVolume > targetVolume) heroVolume -= fadeSpeed;

    heroVolume = Math.max(0, Math.min(heroVolume, 1));
    heroMusic.volume = heroVolume;

    if (heroVolume <= 0.002 && targetVolume === 0) heroMusic.pause();

    requestAnimationFrame(fadeLoop);
  }

  fadeLoop();

  window.addEventListener("scroll", checkHeroVisibility);
  window.addEventListener("load", () => setTimeout(checkHeroVisibility, 100));

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
