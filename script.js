/* =========================
   ARYA DESIGNS – script.js
   ========================= */

(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  // ---------- Sticky header shadow ----------
  const header = $(".topbar");
  const onScrollHeader = () => {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add("topbar--scrolled");
    else header.classList.remove("topbar--scrolled");
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  // ---------- Smooth scroll for anchor links ----------
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = header ? header.offsetHeight + 14 : 90;
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    a.addEventListener("click", (e) => {
      const id = href.replace("#", "");
      const target = document.getElementById(id);
      if (!target) return; // allow normal if not found

      e.preventDefault();
      scrollToId(id);

      // Close mobile menu if open
      closeMobileMenu();
    });
  });

  // ---------- Active nav highlight on scroll ----------
  const navLinks = $$(".nav a").filter((a) => a.getAttribute("href")?.startsWith("#"));
  const sections = navLinks
    .map((a) => {
      const id = a.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  const setActiveNav = () => {
    if (!sections.length) return;

    const headerOffset = header ? header.offsetHeight + 40 : 120;
    const scrollPos = window.scrollY + headerOffset;

    let activeId = sections[0].id;

    for (const sec of sections) {
      const top = sec.offsetTop;
      if (scrollPos >= top) activeId = sec.id;
    }

    navLinks.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      if (id === activeId) a.classList.add("is-active");
      else a.classList.remove("is-active");
    });
  };

  window.addEventListener("scroll", setActiveNav, { passive: true });
  window.addEventListener("resize", setActiveNav);
  setActiveNav();

  // ---------- Mobile menu (optional) ----------
  // If you don’t have a mobile toggle button yet, this script will create one automatically.
  const nav = $(".nav");
  let mobileBtn = $("#mobileMenuBtn");

  function createMobileMenuButton() {
    if (!header || !nav) return;

    const btn = document.createElement("button");
    btn.id = "mobileMenuBtn";
    btn.type = "button";
    btn.className = "menu-btn";
    btn.setAttribute("aria-label", "Open menu");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "☰";

    // Place button before primary CTA (if present) or at end
    const cta = $(".topbar .btn--primary");
    if (cta && cta.parentElement) {
      cta.parentElement.insertBefore(btn, cta);
    } else {
      $(".topbar__inner")?.appendChild(btn);
    }

    return btn;
  }

  if (!mobileBtn) mobileBtn = createMobileMenuButton() || null;

  function openMobileMenu() {
    if (!nav || !mobileBtn) return;
    nav.classList.add("nav--open");
    mobileBtn.setAttribute("aria-expanded", "true");
    mobileBtn.setAttribute("aria-label", "Close menu");
    mobileBtn.innerHTML = "✕";
  }

  function closeMobileMenu() {
    if (!nav || !mobileBtn) return;
    nav.classList.remove("nav--open");
    mobileBtn.setAttribute("aria-expanded", "false");
    mobileBtn.setAttribute("aria-label", "Open menu");
    mobileBtn.innerHTML = "☰";
  }

  function toggleMobileMenu() {
    if (!nav || !mobileBtn) return;
    if (nav.classList.contains("nav--open")) closeMobileMenu();
    else openMobileMenu();
  }

  if (mobileBtn) {
    mobileBtn.addEventListener("click", toggleMobileMenu);

    // Close menu if user clicks outside
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("nav--open")) return;
      const clickedInsideNav = nav.contains(e.target);
      const clickedMenuBtn = mobileBtn.contains(e.target);
      if (!clickedInsideNav && !clickedMenuBtn) closeMobileMenu();
    });
  }

  // ---------- Scroll-to-top button ----------
  const topBtn = document.createElement("button");
  topBtn.className = "to-top";
  topBtn.type = "button";
  topBtn.setAttribute("aria-label", "Back to top");
  topBtn.textContent = "↑";
  document.body.appendChild(topBtn);

  const toggleTopBtn = () => {
    if (window.scrollY > 800) topBtn.classList.add("to-top--show");
    else topBtn.classList.remove("to-top--show");
  };

  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", toggleTopBtn, { passive: true });
  toggleTopBtn();

  // ---------- Form UX (Formspree) ----------
  const form = $('form[action^="https://formspree.io/"]');

  function showFormMessage(msg, type = "success") {
    if (!form) return;

    let box = $("#formMessage");
    if (!box) {
      box = document.createElement("div");
      box.id = "formMessage";
      box.className = "form-msg";
      form.appendChild(box);
    }

    box.textContent = msg;
    box.classList.remove("form-msg--success", "form-msg--error");
    box.classList.add(type === "error" ? "form-msg--error" : "form-msg--success");
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      // Let native validation run first
      if (!form.checkValidity()) return;

      e.preventDefault();

      const submitBtn = $("button[type='submit']", form);
      const originalText = submitBtn ? submitBtn.textContent : "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        const formData = new FormData(form);
        const res = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          form.reset();
          showFormMessage("✅ Thanks! We received your enquiry. We'll get back to you shortly.", "success");
        } else {
          showFormMessage("⚠️ Something went wrong. Please try again, or email us at aryadesignsaus@gmail.com.", "error");
        }
      } catch (err) {
        showFormMessage("⚠️ Network error. Please try again, or email us at aryadesignsaus@gmail.com.", "error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText || "Send Enquiry";
        }
      }
    });
  }

})();
