// ========== Dynamic Year ==========
document.getElementById("year").textContent = new Date().getFullYear();

// ========== Theme Toggle ==========
const themeBtn = document.getElementById("theme-toggle");
const root = document.body;

if (localStorage.getItem("theme") === "light") {
  root.classList.add("light");
  themeBtn.textContent = "🌞";
}

themeBtn.addEventListener("click", () => {
  root.classList.toggle("light");
  const mode = root.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", mode);
  themeBtn.textContent = mode === "light" ? "🌞" : "🌙";
});

// ========== Scroll Reveal ==========
const faders = document.querySelectorAll(".fade");
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

faders.forEach(el => observer.observe(el));

// ========== Resume Modal ==========
const resumeModal = document.getElementById("resume-modal");
const openResume = document.getElementById("open-resume");
const closeResume = document.getElementById("close-resume");

openResume.addEventListener("click", () => resumeModal.showModal());
closeResume.addEventListener("click", () => resumeModal.close());

// ========== Project Modal ==========
const projectModal = document.getElementById("project-modal");
const pmTitle = document.getElementById("pm-title");
const pmContent = document.getElementById("pm-content");
const pmOpen = document.getElementById("pm-open");
const closeProject = document.getElementById("close-project");

closeProject.addEventListener("click", () => projectModal.close());

// ========== GitHub Projects ==========
const username = "mkjangra97";
const projectsContainer = document.getElementById("github-projects");

async function fetchProjects() {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
    if (!res.ok) throw new Error("GitHub API limit or error");

    const data = await res.json();
    const filtered = data
      .filter(repo => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);

    projectsContainer.innerHTML = "";

    filtered.forEach(repo => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || "No description available."}</p>
        <div style="margin-top:0.8rem;display:flex;justify-content:space-between;align-items:center;">
          <a href="${repo.html_url}" target="_blank" class="btn tiny primary">GitHub ↗</a>
          <button class="btn tiny ghost" data-repo="${repo.name}">Readme</button>
        </div>
      `;
      projectsContainer.appendChild(card);
    });

    // Add README modal functionality
    const readmeButtons = document.querySelectorAll("[data-repo]");
    readmeButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const repoName = btn.getAttribute("data-repo");
        await openProjectModal(repoName);
      });
    });

  } catch (err) {
    console.error(err);
    projectsContainer.innerHTML = `<p style="text-align:center;color:#94a3b8;">⚠️ Unable to load projects right now.</p>`;
  }
}

async function openProjectModal(repoName) {
  pmTitle.textContent = repoName;
  pmOpen.href = `https://github.com/${username}/${repoName}`;
  pmContent.innerHTML = `<p style="color:#94a3b8;">Loading README...</p>`;

  try {
    const res = await fetch(`https://raw.githubusercontent.com/${username}/${repoName}/HEAD/README.md`);
    if (res.ok) {
      const md = await res.text();
      const html = convertMarkdown(md);
      pmContent.innerHTML = html;
    } else {
      pmContent.innerHTML = `<p style="color:#94a3b8;">No README found.</p>`;
    }
  } catch (err) {
    pmContent.innerHTML = `<p style="color:#94a3b8;">Error loading README.</p>`;
  }

  projectModal.showModal();
}

function convertMarkdown(md) {
  // minimal markdown to HTML converter (headings + links + lists)
  return md
    .replace(/^# (.*$)/gim, "<h2>$1</h2>")
    .replace(/^## (.*$)/gim, "<h3>$1</h3>")
    .replace(/^\* (.*$)/gim, "<li>$1</li>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
    .replace(/\n$/gim, "<br>");
}

// Load projects on page load
fetchProjects();
