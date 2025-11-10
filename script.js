// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Theme toggle
const root = document.documentElement;
const toggleBtn = document.getElementById("theme-toggle");
const saved = localStorage.getItem("theme");
if (saved === "light") root.classList.add("light");
toggleBtn.textContent = root.classList.contains("light") ? "🌞" : "🌙";
toggleBtn.addEventListener("click", () => {
  root.classList.toggle("light");
  const mode = root.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", mode);
  toggleBtn.textContent = mode === "light" ? "🌞" : "🌙";
});

// Reveal on scroll
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const faders = document.querySelectorAll(".fade");
if (!prefersReduced && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  faders.forEach(el => io.observe(el));
} else {
  faders.forEach(el => el.classList.add("revealed"));
}

// Resume modal
const resumeModal = document.getElementById("resume-modal");
document.getElementById("open-resume").addEventListener("click", () => resumeModal.showModal());
document.getElementById("close-resume").addEventListener("click", () => resumeModal.close());

// Project modal
const pm = document.getElementById("project-modal");
const pmTitle = document.getElementById("pm-title");
const pmContent = document.getElementById("pm-content");
const pmOpen = document.getElementById("pm-open");
document.getElementById("close-project").addEventListener("click", () => pm.close());

// GitHub projects
const projectsEl = document.getElementById("github-projects");
const GITHUB_USER = "mkjangra97";

const starSVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 17.3l-6.2 3.3 1.2-6.9L1 8.9l7-1 3-6.2 3 6.2 7 1-5 4.8 1.2 6.9z"/></svg>`;
const forkSVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3a3 3 0 103 3V9a4 4 0 004 4h1a3 3 0 100-2h-1a2 2 0 01-2-2V6a3 3 0 10-2 0v1a6 6 0 006 6h1a3 3 0 100 2h-1a8 8 0 01-8-8V6A3 3 0 007 3z"/></svg>`;

async function loadRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, {
      headers: { "Accept": "application/vnd.github+json" }
    });
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const repos = await res.json();

    const curated = repos
      .filter(r => !r.fork)
      .map(r => ({ name:r.name, url:r.html_url, desc:r.description||"—", stars:r.stargazers_count, forks:r.forks_count, topics:r.topics||[], pushed:new Date(r.pushed_at).getTime(), default_branch:r.default_branch }))
      .sort((a,b) => (b.stars + b.forks*0.6 + b.pushed/1e12) - (a.stars + a.forks*0.6 + a.pushed/1e12))
      .slice(0,6);

    projectsEl.innerHTML = "";
    curated.forEach(r => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>${r.name}</h3>
        <p>${escapeHTML(r.desc)}</p>
        <div class="meta">
          <span class="badge">${starSVG}${r.stars}</span>
          <span class="badge">${forkSVG}${r.forks}</span>
          <a class="btn tiny" href="${r.url}" target="_blank" rel="noopener">Open ↗</a>
          <button class="btn tiny ghost" data-readme="${r.name}">Details</button>
        </div>
        <div class="topics">
          ${r.topics.slice(0,5).map(t=>`<span class="topic">${escapeHTML(t)}</span>`).join("")}
        </div>`;
      projectsEl.appendChild(card);
    });

    projectsEl.querySelectorAll('[data-readme]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const repo = e.currentTarget.getAttribute('data-readme');
        await openProjectModal(repo);
      });
    });

    if (!curated.length) projectsEl.innerHTML = `<p class="muted">No highlighted repos yet.</p>`;
  } catch (e) {
    console.error(e);
    projectsEl.innerHTML = `<p class="muted">Couldn’t load GitHub projects right now.</p>`;
  }
}

async function openProjectModal(repo) {
  pmTitle.textContent = repo;
  pmOpen.href = `https://github.com/mkjangra97/${repo}`;
  pmContent.innerHTML = `<p class="muted">Loading README…</p>`;

  try {
    const res = await fetch(`https://raw.githubusercontent.com/mkjangra97/${repo}/HEAD/README.md`);
    if (res.ok) {
      const md = await res.text();
      const html = window.marked ? window.marked.parse(md) : `<pre>${escapeHTML(md)}</pre>`;
      pmContent.innerHTML = html;
    } else {
      pmContent.innerHTML = `<p class="muted">No README found.</p>`;
    }
  } catch (err) {
    pmContent.innerHTML = `<p class="muted">Failed to load README.</p>`;
  }

  pm.showModal();
}

function escapeHTML(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

loadRepos();

// EmailJS (configure keys to enable)
(function() {
  if (window.emailjs) {
    try { emailjs.init("YOUR_PUBLIC_KEY"); } catch (e) { /* not set */ }
  }
})();

document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = {
    from_name: form.name.value,
    reply_to: form.email.value,
    message: form.message.value
  };

  if (!window.emailjs || !emailjs.send) {
    alert("EmailJS not configured yet. Replace YOUR_PUBLIC_KEY/service/template in script.js");
    return;
  }

  try {
    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", data);
    alert("Message sent! I will get back to you soon.");
    form.reset();
  } catch (err) {
    console.error(err);
    alert("Sorry, could not send right now.");
  }
});
