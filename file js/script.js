AOS.init({ once: true, offset: 80 });

const nav = document.getElementById('mainNav');
if (nav) {
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    });
}

const backBtn = document.getElementById('backToTop');
if (backBtn) {
    window.addEventListener('scroll', () => {
        backBtn.classList.toggle('visible', window.scrollY > 400);
    });
    backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const collapse = document.querySelector('.navbar-collapse.show');
    if (collapse) bootstrap.Collapse.getInstance(collapse)?.hide();
});

// Theme toggle
const htmlEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function setIcon(theme) {
    if (!themeToggle) return;
    themeToggle.querySelector('i').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

const saved = localStorage.getItem('avu-theme');
if (saved) {
    htmlEl.setAttribute('data-theme', saved);
    setIcon(saved);
} else {
    setIcon('dark');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('avu-theme', next);
        setIcon(next);
    });
}

// Rule cards
const ruleCards = document.querySelectorAll('.rule-card');
ruleCards.forEach((card) => {
    const toggle = () => {
        const wasActive = card.classList.contains('active');
        ruleCards.forEach((c) => c.classList.remove('active'));
        if (!wasActive) card.classList.add('active');
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    });
});

// Scroll progress bar
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

const updateProgress = () => {
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    progressBar.style.width = pct + '%';
};
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

// Spotlight cursor
const spotlight = document.createElement('div');
spotlight.className = 'cursor-spotlight';
document.body.appendChild(spotlight);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let spotX = mouseX;
let spotY = mouseY;

window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    spotlight.classList.add('active');
});
window.addEventListener('blur', () => spotlight.classList.remove('active'));

const animateSpotlight = () => {
    spotX += (mouseX - spotX) * 0.12;
    spotY += (mouseY - spotY) * 0.12;
    spotlight.style.setProperty('--mx', spotX + 'px');
    spotlight.style.setProperty('--my', spotY + 'px');
    requestAnimationFrame(animateSpotlight);
};
requestAnimationFrame(animateSpotlight);

// Letter-by-letter reveal + typewriter highlight
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const textHeadings = document.querySelectorAll('.hero-title, .page-hero h1, .section-title');

function splitHeading(el) {
    const state = { index: 0 };

    const walk = (node) => {
        Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) {
                        frag.appendChild(document.createTextNode(part));
                        return;
                    }
                    const word = document.createElement('span');
                    word.className = 'reveal-word';
                    Array.from(part).forEach((ch) => {
                        const span = document.createElement('span');
                        span.className = 'reveal-char';
                        span.textContent = ch;
                        span.style.transitionDelay = (state.index * 28) + 'ms';
                        state.index++;
                        word.appendChild(span);
                    });
                    frag.appendChild(word);
                });
                child.parentNode.replaceChild(frag, child);
            } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
                if (child.classList.contains('highlight')) {
                    const fullText = child.textContent;
                    child.dataset.typeText = fullText;
                    child.dataset.typeDelay = String(state.index * 28 + 200);
                    child.textContent = '';
                    state.index += fullText.trim().length;
                } else {
                    walk(child);
                }
            }
        });
    };

    walk(el);
    el.classList.add('split-ready');
}

function typeHighlight(el) {
    const text = el.dataset.typeText || '';
    const delay = parseInt(el.dataset.typeDelay, 10) || 0;
    el.textContent = '';
    setTimeout(() => {
        el.classList.add('typing');
        let i = 0;
        const timer = setInterval(() => {
            i++;
            el.textContent = text.slice(0, i);
            if (i >= text.length) {
                clearInterval(timer);
                setTimeout(() => el.classList.remove('typing'), 700);
            }
        }, 55);
    }, delay);
}

if (!reduceMotion) {
    const headingObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            requestAnimationFrame(() => {
                el.classList.add('revealed');
                el.querySelectorAll('.highlight').forEach(typeHighlight);
            });
            headingObserver.unobserve(el);
        });
    }, { threshold: 0.15 });

    textHeadings.forEach((el) => {
        splitHeading(el);
        headingObserver.observe(el);
    });
}