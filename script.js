const navbar = document.querySelector(".navbar");
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu .nav-link");
const navLinks = document.querySelectorAll(".nav-link[href^='#']");
const revealElements = document.querySelectorAll(".fade-in-scroll");
const trackedSections = Array.from(document.querySelectorAll("section[id]")).filter(
  (section) => section.id !== "home"
);

// Navbar scroll effect
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });
}

// Mobile menu helpers
const setHamburgerIcon = (isOpen) => {
  const icon = hamburger?.querySelector("i");
  if (!icon) {
    return;
  }

  icon.classList.toggle("fa-bars", !isOpen);
  icon.classList.toggle("fa-times", isOpen);
};

const setMobileMenuState = (isOpen) => {
  if (!mobileMenu) {
    return;
  }

  mobileMenu.classList.toggle("active", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  setHamburgerIcon(isOpen);
};

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("active");
    setMobileMenuState(isOpen);
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMobileMenuState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMobileMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && mobileMenu.classList.contains("active")) {
      setMobileMenuState(false);
    }
  });
}

// Active section highlight in navbar
const linkGroupsBySection = new Map();
navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || !href.startsWith("#")) {
    return;
  }

  const sectionId = href.slice(1);
  const links = linkGroupsBySection.get(sectionId) ?? [];
  links.push(link);
  linkGroupsBySection.set(sectionId, links);
});

const setActiveSection = (sectionId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const getClosestSectionInView = () => {
  const triggerLine = window.scrollY + (window.innerHeight * 0.35);
  let activeId = trackedSections[0]?.id ?? "";

  trackedSections.forEach((section) => {
    if (triggerLine >= section.offsetTop) {
      activeId = section.id;
    }
  });

  return activeId;
};

if (trackedSections.length > 0) {
  let activeSectionId = getClosestSectionInView();
  if (activeSectionId) {
    setActiveSection(activeSectionId);
  }

  window.addEventListener("scroll", () => {
    const nextActiveId = getClosestSectionInView();
    if (nextActiveId && nextActiveId !== activeSectionId) {
      activeSectionId = nextActiveId;
      setActiveSection(activeSectionId);
    }
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const sectionId = entry.target.getAttribute("id");
        if (!sectionId || !linkGroupsBySection.has(sectionId)) {
          return;
        }

        activeSectionId = sectionId;
        setActiveSection(activeSectionId);
      });
    }, {
      threshold: 0.3,
      rootMargin: "-20% 0px -55% 0px"
    });

    trackedSections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }
}

// Scroll reveal animations
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -55px 0px"
  });

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}
