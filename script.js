const navbar = document.querySelector(".navbar");
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileBackdrop = document.querySelector(".mobile-menu-backdrop");
const navLinks = document.querySelectorAll(".nav-link[href^='#']");
const revealElements = Array.from(document.querySelectorAll(".fade-in-scroll"));

const sectionIds = Array.from(
  new Set(
    Array.from(navLinks)
      .map((link) => link.getAttribute("href"))
      .filter((href) => href && href.startsWith("#"))
      .map((href) => href.slice(1))
  )
);

const trackedSections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const setNavbarScrolled = () => {
  if (!navbar) {
    return;
  }

  navbar.classList.toggle("scrolled", window.scrollY > 26);
};

const setHamburgerIcon = (isOpen) => {
  if (!hamburger) {
    return;
  }

  const icon = hamburger.querySelector("i");
  if (!icon) {
    return;
  }

  icon.classList.toggle("fa-bars", !isOpen);
  icon.classList.toggle("fa-times", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
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

  hamburger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const isOpen = !mobileMenu.classList.contains("active");
      setMobileMenuState(isOpen);
    }
  });
}

if (mobileBackdrop) {
  mobileBackdrop.addEventListener("click", () => {
    setMobileMenuState(false);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMobileMenuState(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820 && mobileMenu?.classList.contains("active")) {
    setMobileMenuState(false);
  }
});

const smoothScrollToSection = (targetId) => {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  const navOffset = (navbar?.offsetHeight ?? 0) + 12;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth"
  });
};

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) {
      return;
    }

    const targetId = href.slice(1);
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    smoothScrollToSection(targetId);
    setMobileMenuState(false);
  });
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
  const scanLine = window.scrollY + window.innerHeight * 0.34;
  let activeId = trackedSections[0]?.id ?? "";

  trackedSections.forEach((section) => {
    if (scanLine >= section.offsetTop) {
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

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const sectionId = entry.target.getAttribute("id");
          if (!sectionId) {
            return;
          }

          activeSectionId = sectionId;
          setActiveSection(sectionId);
        });
      },
      {
        threshold: 0.38,
        rootMargin: "-20% 0px -45% 0px"
      }
    );

    trackedSections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        setNavbarScrolled();

        const nextActiveId = getClosestSectionInView();
        if (nextActiveId && nextActiveId !== activeSectionId) {
          activeSectionId = nextActiveId;
          setActiveSection(activeSectionId);
        }

        ticking = false;
      });
    },
    { passive: true }
  );
}

setNavbarScrolled();

if (revealElements.length > 0) {
  revealElements.forEach((element, index) => {
    const staggerDelay = (index % 7) * 70;
    element.style.setProperty("--stagger-delay", `${staggerDelay}ms`);
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }
}
