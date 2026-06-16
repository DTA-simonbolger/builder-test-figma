const revealPage = () => {
  document.body.classList.remove("site-loading");
  document.body.classList.add("site-ready");
};

const waitForWindowLoad = () => new Promise((resolve) => {
  if (document.readyState === "complete") {
    resolve();
    return;
  }

  window.addEventListener("load", resolve, { once: true });
});

const waitForHeroVideo = () => new Promise((resolve) => {
  const heroVideo = document.querySelector(".hero-video");

  if (!heroVideo) {
    resolve();
    return;
  }

  let isFinished = false;
  let timeout;

  const finish = () => {
    if (isFinished) return;
    isFinished = true;
    if (timeout) window.clearTimeout(timeout);
    heroVideo.classList.add("is-ready");
    heroVideo.play().catch(() => {});
    resolve();
  };

  if (heroVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    finish();
    return;
  }

  timeout = window.setTimeout(finish, 7000);
  heroVideo.addEventListener("loadeddata", finish, { once: true });
  heroVideo.addEventListener("canplay", finish, { once: true });
  heroVideo.addEventListener("error", finish, { once: true });
  heroVideo.load();
});

const initDropdownToggle = () => {
  const dropdownButtons = Array.from(document.querySelectorAll('.nav-dropdown-button'));

  function closeAllDropdowns() {
    document.querySelectorAll('.nav-menu.open').forEach((menu) => {
      menu.classList.remove('open');
      const btn = menu.querySelector('.nav-dropdown-button');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  if (!dropdownButtons.length) return;

  dropdownButtons.forEach((button) => {
    const menu = button.closest('.nav-menu');
    if (!menu) return;

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = menu.classList.contains('open');
      closeAllDropdowns();

      if (!isOpen) {
        menu.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });

    menu.querySelectorAll('.services-dropdown a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu')) closeAllDropdowns();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') closeAllDropdowns();
  });
};

const initFaqAccordion = () => {
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      document.querySelectorAll(".faq-item").forEach((other) => {
        if (other !== item) other.removeAttribute("open");
      });
    });
  });
};

const initFilters = () => {
  document.querySelectorAll("[data-filter-group]").forEach((filterGroup) => {
    const groupName = filterGroup.dataset.filterGroup;
    const filterList = document.querySelector(`[data-filter-list="${groupName}"]`);
    const emptyState = document.querySelector(`[data-filter-empty="${groupName}"]`);
    const buttons = [...filterGroup.querySelectorAll("[data-filter]")];

    if (!filterList || !buttons.length) return;

    const items = [...filterList.querySelectorAll("[data-categories]")];

    const applyFilter = (activeFilter) => {
      let visibleCount = 0;

      items.forEach((item) => {
        const categories = item.dataset.categories.split(/\s+/);
        const isVisible = activeFilter === "all" || categories.includes(activeFilter);

        item.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (emptyState) emptyState.hidden = visibleCount !== 0;
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((other) => {
          const isActive = other === button;
          other.classList.toggle("active", isActive);
          other.setAttribute("aria-pressed", String(isActive));
        });

        applyFilter(button.dataset.filter);
      });
    });

    applyFilter(buttons.find((button) => button.classList.contains("active"))?.dataset.filter || "all");
  });
};

const initContactForms = () => {
  document.querySelectorAll(".contact-form").forEach((form) => {
    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');

    if (!status || !submitButton) return;

    const setStatus = (message, type) => {
      status.textContent = message;
      status.dataset.status = type;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const originalLabel = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      setStatus("", "");

      try {
        const response = await fetch(form.action, {
          method: form.method || "POST",
          body: new FormData(form),
          headers: { accept: "application/json" }
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.error) {
          throw new Error(result.error || "The enquiry could not be sent. Please email contact@deltatango.com.au directly.");
        }

        form.reset();
        setStatus("Thanks. Your enquiry has been sent.", "success");
      } catch (error) {
        setStatus(error.message, "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    });
  });
};

const initPage = () => {
  initDropdownToggle();
  initFaqAccordion();
  initFilters();
  initContactForms();

  Promise.all([waitForWindowLoad(), waitForHeroVideo()]).then(revealPage);

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) revealPage();
  });
};

initPage();
