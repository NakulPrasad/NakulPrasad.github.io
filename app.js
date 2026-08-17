/**
 * THE CODE GAZETTE — SCRIPT CONTROLLER
 * Handles theme switching, live dateline, project filtering, scroll-spy, and email clipboard.
 */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------------------
  // 1. LIVE DATELINE & COPYRIGHT YEAR
  // -------------------------------------------------------------------------
  const liveDateEl = document.getElementById("live-date");
  const copyrightYearEl = document.getElementById("copyright-year");

  const now = new Date();
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  if (liveDateEl) {
    liveDateEl.textContent = now.toLocaleDateString("en-US", dateOptions).toUpperCase();
  }

  if (copyrightYearEl) {
    copyrightYearEl.textContent = now.getFullYear();
  }

  // -------------------------------------------------------------------------
  // 2. THEME SWITCHER (DAY NEWSPRINT / NIGHT EDITION)
  // -------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById("theme-toggle");
  const htmlRoot = document.documentElement;

  // Retrieve stored theme or default to light
  const storedTheme = localStorage.getItem("gazette_theme") || "light";
  htmlRoot.setAttribute("data-theme", storedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = htmlRoot.getAttribute("data-theme");
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      
      htmlRoot.setAttribute("data-theme", nextTheme);
      localStorage.setItem("gazette_theme", nextTheme);
      
      showToast(`Switched to ${nextTheme === "dark" ? "Night Edition" : "Day Newsprint"}`);
    });
  }

  // -------------------------------------------------------------------------
  // 3. PROJECT FILTER TABS
  // -------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".dispatch-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.style.display = card.classList.contains("featured") ? "grid" : "flex";
          card.style.opacity = "0";
          setTimeout(() => {
            card.style.opacity = "1";
          }, 50);
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // 4. COPY EMAIL TO CLIPBOARD WITH TOAST FEEDBACK
  // -------------------------------------------------------------------------
  const copyButtons = document.querySelectorAll(".copy-email-btn");
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 3000);
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const email = btn.getAttribute("data-email") || "nakulprasad10@outlook.com";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(() => {
            showToast(`✓ Copied ${email} to clipboard!`);
          })
          .catch(() => {
            fallbackCopyText(email);
          });
      } else {
        fallbackCopyText(email);
      }
    });
  });

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast(`✓ Copied ${text} to clipboard!`);
    } catch (err) {
      showToast(`Email: ${text}`);
    }
    document.body.removeChild(textArea);
  }

  // -------------------------------------------------------------------------
  // 5. EDITORIAL SCROLL SPY (ACTIVE NAVIGATION LINK HIGHLIGHTING)
  // -------------------------------------------------------------------------
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px",
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // -------------------------------------------------------------------------
  // 6. CONTACT FORM DISPATCH SUBMISSION
  // -------------------------------------------------------------------------
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      const nameInput = document.getElementById("sender-name");
      const subjectInput = document.getElementById("message-subject");
      const bodyInput = document.getElementById("message-body");

      const name = nameInput ? nameInput.value.trim() : "Anonymous";
      const subject = subjectInput && subjectInput.value.trim() ? subjectInput.value.trim() : "Portfolio Dispatch";
      const body = bodyInput ? bodyInput.value.trim() : "";

      const mailtoUrl = `mailto:nakulprasad10@outlook.com?subject=${encodeURIComponent(
        `[Code Gazette] ${subject} - from ${name}`
      )}&body=${encodeURIComponent(body)}`;

      // Update action URL dynamically
      contactForm.setAttribute("action", mailtoUrl);
      showToast("Preparing telegram transmission via default email client...");
    });
  }

  // -------------------------------------------------------------------------
  // 7. LIVE GITHUB TELEMETRY & REPOSITORY SYNCHRONIZATION
  // -------------------------------------------------------------------------
  const GITHUB_USERNAME = "NakulPrasad";
  const reposCountEl = document.getElementById("gh-repos-count");
  const followersCountEl = document.getElementById("gh-followers-count");
  const followingCountEl = document.getElementById("gh-following-count");
  const syncStatusEl = document.getElementById("gh-sync-status");

  async function fetchGitHubTelemetry() {
    try {
      // 1. Fetch User Profile
      const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (reposCountEl && userData.public_repos !== undefined) {
          reposCountEl.textContent = userData.public_repos;
        }
        if (followersCountEl && userData.followers !== undefined) {
          followersCountEl.textContent = userData.followers;
        }
        if (followingCountEl && userData.following !== undefined) {
          followingCountEl.textContent = userData.following;
        }
        if (syncStatusEl) {
          syncStatusEl.innerHTML = `<span class="dot-pulse"></span> Telemetry Synchronized (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        }
      }

      // 2. Fetch Top 3 Flagship Repositories
      const targetRepos = [
        { id: "algonote", repo: "algonote" },
        { id: "foodd-mern", repo: "foodd-mern" },
        { id: "mern-dashboard", repo: "mern-dashboard" }
      ];

      for (const item of targetRepos) {
        try {
          const repoRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${item.repo}`);
          if (repoRes.ok) {
            const repoData = await repoRes.json();
            const starsEl = document.getElementById(`stars-${item.id}`);
            const forksEl = document.getElementById(`forks-${item.id}`);
            if (starsEl) starsEl.textContent = repoData.stargazers_count;
            if (forksEl) forksEl.textContent = repoData.forks_count;
          }
        } catch (e) {
          console.warn(`Could not sync repo telemetry for ${item.repo}`, e);
        }
      }
    } catch (err) {
      console.warn("GitHub API telemetry fallback active:", err);
      if (syncStatusEl) {
        syncStatusEl.innerHTML = `<span class="dot-live"></span> Telemetry Active (Offline Cache)`;
      }
    }
  }

  // Trigger telemetry fetch
  fetchGitHubTelemetry();
});
