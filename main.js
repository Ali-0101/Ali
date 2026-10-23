const root = document.documentElement;

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Theme toggle (remembers choice; falls back to system preference)
const themeBtn = document.querySelector(".theme-toggle");
const systemDark = matchMedia("(prefers-color-scheme: dark)");
const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
const syncThemeLabel = () =>
  themeBtn.setAttribute("aria-label", currentTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode");
syncThemeLabel();
systemDark.addEventListener("change", syncThemeLabel);
themeBtn.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.classList.add("theme-anim");
  root.dataset.theme = next;
  syncThemeLabel();
  setTimeout(() => root.classList.remove("theme-anim"), 500);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");
const setMenu = (open) => {
  links.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

// Header border on scroll
const header = document.querySelector(".site-header");
const progressBar = document.querySelector(".progress-bar");
const toTop = document.querySelector(".to-top");
const heroTitle = document.querySelector(".hero h1");
const onScroll = () => {
  header.classList.toggle("scrolled", scrollY > 8);
  header.classList.toggle("at-top", heroTitle.getBoundingClientRect().bottom > header.offsetHeight);
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  toTop.classList.toggle("show", scrollY > innerHeight * 0.8);
};
toTop.addEventListener("click", () => scrollTo({ top: 0 }));
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Reveal-on-scroll
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    io.observe(el);
  });
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
}

// Highlight current section in the nav
const navAnchors = [...links.querySelectorAll('a[href^="#"]')];
const spy = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
      );
    }),
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

// Typing effect in the hero terminal
const typed = document.getElementById("typed");
const cmds = ["./audit --network --report", "nmap -sV opportunities.local", "echo \"available for graduate roles\""];
if (typed && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let c = 0, i = 0, deleting = false;
  const tick = () => {
    const word = cmds[c];
    typed.textContent = word.slice(0, i);
    if (!deleting && i === word.length) { deleting = true; return setTimeout(tick, 1600); }
    if (deleting && i === 0) { deleting = false; c = (c + 1) % cmds.length; }
    i += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 35 : 75);
  };
  tick();
} else if (typed) {
  typed.textContent = cmds[0];
}

// Copy email to clipboard with a small confirmation toast
const toast = document.querySelector(".toast");
let toastTimer;
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
};
document.querySelectorAll(".copy-email").forEach((btn) =>
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      showToast("Email copied to clipboard");
    } catch (e) {
      showToast(btn.dataset.email);
    }
  })
);
