document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    document.querySelectorAll(".faq-item").forEach((other) => {
      if (other !== item) other.removeAttribute("open");
    });
  });
});
