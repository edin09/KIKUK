// === ASTRALIS UNIVERSAL TRANSLATION SYSTEM v15 ===
// Edin 2025 – potpuno sinhronizovano prebacivanje jezika sa i18next inicijalizacijom
// ✅ FIXED: Hero audio se ne mijenja prilikom promjene jezika

// Čekaj da se i18next učita
function waitForI18next() {
  return new Promise((resolve) => {
    if (typeof i18next !== 'undefined') {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof i18next !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    }
  });
}

async function loadLanguage(lang) {
  // Čekaj da se i18next učita
  await waitForI18next();
  
  let file = "";

  // 🌍 Odredi JSON fajl prema stranici
  const path = window.location.pathname.toLowerCase();
  console.log('Current path:', path); // Debug
  
  if (path.includes("o_projektu") || path.includes("about")) {
    file = lang === "de" ? "lang/deProjekat.json" : "lang/bsProjekat.json";
  } else if (path.includes("prica") || path.includes("story")) {
    file = lang === "de" ? "lang/dePrica.json" : "lang/bsPrica.json";
  } else {
    file = lang === "de" ? "lang/de.json" : "lang/bs.json";
  }
  
  console.log('Loading translation file:', file); // Debug

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Greška učitavanja: ${file}`);
    const data = await response.json();

    // 🔧 Inicijalizuj i18next ako još nije
    if (!i18next.isInitialized) {
      await i18next.init({
        lng: lang,
        resources: {
          [lang]: {
            translation: data
          }
        }
      });
    } else {
      // Dodaj novi jezik u postojeći i18next
      i18next.addResourceBundle(lang, 'translation', data, true, true);
      await i18next.changeLanguage(lang);
    }

    // 🔹 Prevedi sve elemente sa data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = i18next.t(key);
      console.log(`Translating ${key}:`, value); // Debug
      
      if (value && value !== key) {
        if (/<\/?[a-z][\s\S]*>/i.test(value)) {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
        
        // Ako je narration-text, moraćemo ponovo pripremiti riječi za sync
        if (el.classList.contains('narration-text')) {
          delete el.dataset.prepared;
          console.log('Reset prepared flag for:', key);
        }
      }
    });

    // 🎧 Promijeni audio fajlove i timestamps za "prica.html"
    if (path.includes("prica")) {
      const folder = lang === "de" ? "njemacki" : "bosanski";

      // 🔊 Promijeni sve audio fajlove OSIM hero music-a
      document.querySelectorAll("audio").forEach((audio) => {
        const id = audio.id;
        
        // ✅ PRESKOČI hero audio - on ne mijenja jezik i ostaje na audio/hero.mp3
        if (id === "hero-music" || id === "hero") {
          console.log(`⏭️ Preskočen hero audio: ${id} (ostaje audio/hero.mp3)`);
          return; // Ne diraj hero audio
        }
        
        const baseName = id.replace("-audio", "");
        const newSrc = `audio/${folder}/${baseName}.mp3`;
        audio.setAttribute("src", newSrc);
        audio.pause();
        audio.load();
        console.log(`🎵 Promijenjen audio: ${newSrc}`);
      });
    }

    // 💾 Zapamti jezik
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;

    // 🧹 Očisti syncCache i ponovo učitaj sve timestampove
    if (typeof syncCache !== "undefined") {
      syncCache = {};
      console.log("🧠 Sync cache resetovan poslije promjene jezika.");
    }

    // 🔄 Forsiraj ponovno učitavanje sync-a s novim jezikom
    if (typeof loadSync === "function") {
      const sections = ["intro", "chapter1", "chapter2", "chapter3"];
      sections.forEach((id) => {
        const audio = document.getElementById(`${id}-audio`);
        if (!audio) return;

        audio.pause();
        audio.load();

        audio.addEventListener(
          "canplaythrough",
          async () => {
            await loadSync(id);
            console.log(`🔄 Reloadovan sync za ${id} (${localStorage.getItem("lang")})`);
          },
          { once: true }
        );
      });
    }

    // 🧩 Ako postoji reset funkcija, očisti highlight odmah
    if (typeof resetSyncedNarration === "function") {
      ["intro", "chapter1", "chapter2", "chapter3"].forEach((id) => {
        resetSyncedNarration(id);
      });
    }

    // 🧠 FORCE SYNC RESET – garantuje da sve radi odmah bez reload-a
    setTimeout(() => {
      if (typeof syncCache !== "undefined") syncCache = {};
      if (typeof activeSync !== "undefined") activeSync = null;
      if (typeof rafId !== "undefined") cancelAnimationFrame(rafId);

      ["intro", "chapter1", "chapter2", "chapter3"].forEach((id) => {
        const audio = document.getElementById(`${id}-audio`);
        const container = document.getElementById(`${id}-text`);
        if (!audio || !container) return;

        audio.pause();
        audio.load();

        audio.addEventListener(
          "canplaythrough",
          async () => {
            if (typeof loadSync === "function") {
              await loadSync(id);
              console.log(`✅ Sync ponovo učitan za ${id} (${localStorage.getItem("lang")})`);
            }
            if (typeof clearHighlights === "function") clearHighlights(container);
          },
          { once: true }
        );
      });
    }, 400);

    console.log(`🌍 Jezik aktiviran: ${lang} (bez reload-a)`);

  } catch (error) {
    console.error("❌ Greška pri učitavanju prevoda:", error);
  }
}

// 📘 Funkcija za promjenu jezika
function setLanguage(lang) {
  loadLanguage(lang);
}

// 🕒 Pokreni nakon učitavanja DOM-a
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "bs";
  loadLanguage(savedLang);

  // Dugmad za promjenu jezika (bez skoka na vrh)
  document.querySelectorAll("#lang-bs, #lang-de").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const lang = link.id === "lang-de" ? "de" : "bs";
      setLanguage(lang);
    });
  });
});

// === ASTRALIS Dropdown UX Controller v3.0 ===
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.querySelector(".dropdown");
  const dropBtn = document.querySelector(".dropbtn");
  const menu = document.querySelector(".dropdown-content");
  if (!dropdown || !dropBtn || !menu) return;

  let hideTimeout = null;

  const openMenu = () => {
    clearTimeout(hideTimeout);
    dropdown.classList.add("open");
  };

  const closeMenu = () => {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => dropdown.classList.remove("open"), 300);
  };

  dropdown.addEventListener("mouseenter", openMenu);
  dropdown.addEventListener("mouseleave", closeMenu);
  dropBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("open");
  });
});