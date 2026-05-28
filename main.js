const revealPage = () => {
  document.body.classList.remove("site-loading");
  document.body.classList.add("site-ready");
};

if (document.readyState === "complete") {
  revealPage();
} else {
  window.addEventListener("load", revealPage, { once: true });
}

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
