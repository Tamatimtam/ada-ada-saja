// static/js/animations.js - UPDATED

// ... (keep the getColor helper function) ...
const rootStyles = getComputedStyle(document.documentElement);
const getColor = (variable) => rootStyles.getPropertyValue(variable).trim();

function initPageAnimations() {
    // ... (this function is fine as is) ...
    const dashboardWindow = document.querySelector(".dashboard-window");
    const mainCards = document.querySelectorAll(".main-card");

    if (!dashboardWindow) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(dashboardWindow, { scale: 0.9, opacity: 0, duration: 0.8 });

    // Animate hero and card-grid separately
    if (document.querySelector(".hero-section")) {
        tl.from(".hero-section", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4");
    }
    if (mainCards.length > 0) {
        tl.from(mainCards, { scale: 0.95, opacity: 0, duration: 0.5, stagger: 0.2 }, "-=0.4");
    }
}

function initAllAnimations() {
    console.log('Initializing all animations...');

    initPageAnimations();
    initHeroCharts();
    initHeroTextAnimation();
    initDropdownAnimation();

    // NEW DYNAMIC COUNTER LOGIC
    // Find all elements with an ID starting with 'score' and a data-score attribute
    const scoreElements = document.querySelectorAll('[id^="score"][data-score]');
    scoreElements.forEach(el => {
        const targetValue = parseFloat(el.getAttribute('data-score'));
        // Check if the target is a valid number before animating
        if (!isNaN(targetValue)) {
            // We pass the element's ID and the dynamic target value
            animateCounter(el.id, targetValue);
        }
    });

    // The rest of the initializations are fine
    animateSmallCardValues(); // This function should also be checked if it uses hardcoded values
    initLightbulbAnimation();
    initScalesAnimation();
    initBgShapesAnimation();
    initWellbeingAnimations();
    initSparkleAnimations();
    initCoinAnimations();
}