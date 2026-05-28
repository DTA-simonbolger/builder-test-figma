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

Promise.all([waitForWindowLoad(), waitForHeroVideo()]).then(revealPage);

window.addEventListener("pageshow", (event) => {
  if (event.persisted) revealPage();
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    document.querySelectorAll(".faq-item").forEach((other) => {
      if (other !== item) other.removeAttribute("open");
    });
  });
});

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
