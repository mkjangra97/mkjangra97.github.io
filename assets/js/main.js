/*===== MENU SHOW =====*/ 
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show')
        })
    }
}
showMenu('nav-toggle','nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
    const scrollDown = window.scrollY

  sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        
        if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        }else{
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 200,
//     reset: true
});

sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text',{}); 
sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img',{delay: 400}); 
sr.reveal('.home__social-icon',{ interval: 200}); 
sr.reveal('.skills__data, .work__img, .contact__input',{interval: 200}); 

/* ========= GITHUB PROJECTS ========= */
const GITHUB_USERNAME = "mkjangra97";
const projectsContainer = document.getElementById("github-projects");

async function fetchGitHubRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`);
    if (!res.ok) throw new Error("GitHub API limit or error");

    const repos = await res.json();
    const filtered = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6); // show latest 6 repos

    projectsContainer.innerHTML = "";

    filtered.forEach(repo => {
      const card = document.createElement("a");
      card.href = repo.html_url;
      card.target = "_blank";
      card.classList.add("work__card");

      card.innerHTML = `
        <div class="work__content">
          <h3 class="work__title">${repo.name}</h3>
          <p class="work__desc">${repo.description || "No description available."}</p>
          <div class="work__meta">
            <span>⭐ ${repo.stargazers_count}</span>
            <span>🍴 ${repo.forks_count}</span>
            <span>🕒 ${new Date(repo.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      `;
      projectsContainer.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    projectsContainer.innerHTML = `<p class="error-text">⚠️ Unable to fetch repositories.</p>`;
  }
}

fetchGitHubRepos();
