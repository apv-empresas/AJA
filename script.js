(function () {
  "use strict";

  const CONFIG = window.AJA_CONFIG || {};

  function trackEvent(eventName, payload = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      project: CONFIG.projectName || "DO ZERO | AJA",
      page_version: CONFIG.version || "1.0.0",
      ...payload
    });

    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, payload);
    }
  }

  function loadGTM() {
    if (!CONFIG.enableGTM || !CONFIG.googleTagManagerId || CONFIG.googleTagManagerId === "GTM-XXXXXXX") return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CONFIG.googleTagManagerId);
    document.head.appendChild(script);
  }

  function loadMetaPixel() {
    if (!CONFIG.enableMetaPixel || !CONFIG.metaPixelId || CONFIG.metaPixelId === "000000000000000") return;

    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){
        n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments);
      };
      if(!f._fbq)f._fbq=n;
      n.push=n;
      n.loaded=!0;
      n.version="2.0";
      n.queue=[];
      t=b.createElement(e);
      t.async=!0;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", CONFIG.metaPixelId);
    window.fbq("track", "PageView");
  }

  function enableBasicProtection() {
    if (!CONFIG.enableBasicProtection) return;

    document.addEventListener("contextmenu", function (event) {
      event.preventDefault();
      return false;
    });

    document.addEventListener("keydown", function (event) {
      const key = event.key ? event.key.toLowerCase() : "";

      const blocked =
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.metaKey && event.altKey && ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && key === "u") ||
        (event.metaKey && key === "u");

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });
  }

  function initHeaderAndMenu() {
    const header = document.getElementById("header");
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");

    if (header) {
      window.addEventListener("scroll", () => {
        header.classList.toggle("scrolled", window.scrollY > 40);
      }, { passive: true });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", () => {
        mobileNav.classList.toggle("open");

        if (mobileNav.classList.contains("open")) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }
      });

      document.querySelectorAll(".mobile-link").forEach(link => {
        link.addEventListener("click", () => {
          mobileNav.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  function initRevealAnimations() {
    const revealEls = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(el => revealObserver.observe(el));

    document.querySelectorAll("#hero .reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), 100 + i * 130);
    });
  }

  function initFAQ() {
    document.querySelectorAll(".faq-question").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const isOpen = item.classList.contains("open");

        document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));

        if (!isOpen) item.classList.add("open");
      });
    });
  }

  function initBenefitCards() {
    document.querySelectorAll(".benefit-card").forEach(card => {
      card.addEventListener("click", () => {
        card.classList.toggle("active");
      });
    });
  }

  function initPhoneMask() {
    const phoneInput = document.getElementById("inputPhone");

    if (!phoneInput) return;

    phoneInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 11);

      if (val.length > 10) {
        val = val.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      } else if (val.length > 6) {
        val = val.replace(/^(\d{2})(\d{4,5})(\d{0,4})/, "($1) $2-$3");
      } else if (val.length > 2) {
        val = val.replace(/^(\d{2})(\d+)/, "($1) $2");
      } else if (val.length > 0) {
        val = val.replace(/^(\d+)/, "($1");
      }

      e.target.value = val;
    });
  }

  function initCustomSelect() {
    const goalInput = document.getElementById("inputGoal");
    const customGoalSelect = document.getElementById("customGoalSelect");
    const customGoalTrigger = document.getElementById("customGoalTrigger");
    const customGoalText = document.getElementById("customGoalText");
    const customGoalOptions = document.getElementById("customGoalOptions");

    if (!customGoalSelect || !customGoalTrigger || !customGoalText || !customGoalOptions || !goalInput) return;

    customGoalTrigger.addEventListener("click", () => {
      customGoalSelect.classList.toggle("open");
    });

    customGoalOptions.querySelectorAll("button").forEach(option => {
      option.addEventListener("click", () => {
        const value = option.dataset.value;
        const text = option.textContent.trim();

        goalInput.value = value;
        customGoalText.textContent = text;

        customGoalOptions.querySelectorAll("button").forEach(btn => {
          btn.classList.remove("selected");
        });

        option.classList.add("selected");
        customGoalSelect.classList.remove("open");

        trackEvent("aja_goal_selected", {
          objetivo: value
        });
      });
    });

    document.addEventListener("click", (event) => {
      if (!customGoalSelect.contains(event.target)) {
        customGoalSelect.classList.remove("open");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        customGoalSelect.classList.remove("open");
      }
    });
  }

  function showError(el) {
    if (el) el.classList.add("visible");
  }

  function hideError(el) {
    if (el) el.classList.remove("visible");
  }

  function firstName(fullName) {
    return fullName.trim().split(" ")[0];
  }

  function buildWhatsAppURL(name, goal) {
    const whatsappDestino = CONFIG.whatsappDestino || "55SEUNUMEROAQUI";

    const msg = encodeURIComponent(
      `Olá! Meu nome é ${name.trim()}. Quero entrar na Jornada AJA e receber o primeiro passo. Quero reconstruir primeiro: ${goal || "minha disciplina e minha rotina"}.`
    );

    return `https://wa.me/${whatsappDestino}?text=${msg}`;
  }

  async function postJSON(url, payload) {
    if (!url || url.includes("COLOQUE_SEU")) return { skipped: true };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let data = null;

    try {
      data = await response.json();
    } catch (_) {
      data = { status: response.status };
    }

    return {
      ok: response.ok,
      status: response.status,
      data
    };
  }

  async function sendLead(payload) {
    const results = {
      n8n: null,
      appScript: null
    };

    const tasks = [];

    if (CONFIG.enableN8N) {
      tasks.push(
        postJSON(CONFIG.n8nWebhook, payload)
          .then(result => results.n8n = result)
          .catch(error => results.n8n = { ok: false, error: String(error) })
      );
    }

    if (CONFIG.enableAppScript) {
      tasks.push(
        postJSON(CONFIG.appScriptWebhook, payload)
          .then(result => results.appScript = result)
          .catch(error => results.appScript = { ok: false, error: String(error) })
      );
    }

    await Promise.allSettled(tasks);

    return results;
  }

  function initForm() {
    const form = document.getElementById("leadForm");
    const submitBtn = document.getElementById("submitBtn");

    const nameInput = document.getElementById("inputName");
    const phoneInput = document.getElementById("inputPhone");
    const goalInput = document.getElementById("inputGoal");
    const consentInput = document.getElementById("consent");

    const nameError = document.getElementById("nameError");
    const phoneError = document.getElementById("phoneError");
    const consentError = document.getElementById("consentError");

    const formSuccess = document.getElementById("formSuccess");
    const whatsappLink = document.getElementById("whatsappLink");

    if (!form || !submitBtn || !nameInput || !phoneInput || !goalInput || !consentInput) return;

    function validateForm() {
      let valid = true;

      hideError(nameError);
      hideError(phoneError);
      hideError(consentError);

      const name = nameInput.value.trim();
      const phone = phoneInput.value.replace(/\D/g, "");

      if (name.length < 2) {
        showError(nameError);
        valid = false;
      }

      if (phone.length < 10 || phone.length > 11) {
        showError(phoneError);
        valid = false;
      }

      if (!consentInput.checked) {
        showError(consentError);
        valid = false;
      }

      return valid;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      trackEvent("aja_form_submit_attempt");

      if (!validateForm()) {
        trackEvent("aja_form_validation_error");
        return;
      }

      const name = nameInput.value.trim();
      const phoneRaw = phoneInput.value.replace(/\D/g, "");
      const goal = goalInput.value || "";
      const waURL = buildWhatsAppURL(name, goal);

      const payload = {
        nome: name,
        primeiro_nome: firstName(name),
        whatsapp: "55" + phoneRaw,
        whatsapp_raw: phoneRaw,
        objetivo: goal,
        origem: CONFIG.source || "landing_page_aja",
        consentimento: "sim",
        status: "ativo",
        projeto: CONFIG.projectName || "DO ZERO | AJA",
        versao: CONFIG.version || "1.0.0",
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        referrer: document.referrer || "",
        timestamp: new Date().toISOString()
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      trackEvent("aja_lead_payload_ready", {
        objetivo: goal
      });

      const integrations = await sendLead(payload);

      trackEvent("aja_lead_sent", {
        objetivo: goal,
        n8n_status: integrations.n8n ? integrations.n8n.status || "ok" : "skipped",
        appscript_status: integrations.appScript ? integrations.appScript.status || "ok" : "skipped"
      });

      form.style.display = "none";
      formSuccess.classList.add("visible");
      whatsappLink.href = waURL;

      if (CONFIG.redirectToWhatsApp !== false) {
        setTimeout(() => {
          trackEvent("aja_whatsapp_redirect", {
            objetivo: goal
          });

          window.open(waURL, "_blank");
        }, CONFIG.redirectDelayMs || 1600);
      }
    });
  }


  function initTruthVideoTracking() {
  const truthVideo = document.getElementById("truthVideo");

  if (!truthVideo) return;

  let played = false;
  let watched50 = false;
  let watched90 = false;

  truthVideo.addEventListener("play", () => {
    if (!played) {
      played = true;

      trackEvent("aja_truth_video_play", {
        section: "sem_depoimentos_falsos"
      });
    }
  });

  truthVideo.addEventListener("timeupdate", () => {
    if (!truthVideo.duration) return;

    const progress = truthVideo.currentTime / truthVideo.duration;

    if (progress >= 0.5 && !watched50) {
      watched50 = true;

      trackEvent("aja_truth_video_50", {
        section: "sem_depoimentos_falsos"
      });
    }

    if (progress >= 0.9 && !watched90) {
      watched90 = true;

      trackEvent("aja_truth_video_90", {
        section: "sem_depoimentos_falsos"
      });
    }
  });

  truthVideo.addEventListener("ended", () => {
    trackEvent("aja_truth_video_completed", {
      section: "sem_depoimentos_falsos"
    });
  });
}


  function init() {
    loadGTM();
    loadMetaPixel();
    enableBasicProtection();

    initHeaderAndMenu();
    initRevealAnimations();
    initFAQ();
    initBenefitCards();
    initPhoneMask();
    initCustomSelect();
    initForm();
    initTruthVideoTracking();

    trackEvent("aja_page_loaded");
  }

  document.addEventListener("DOMContentLoaded", init);
})();