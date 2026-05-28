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
