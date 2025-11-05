// Helper to get CSS variables
const rootStyles = getComputedStyle(document.documentElement);
const getColor = (variable) => rootStyles.getPropertyValue(variable).trim();

// Initialize page animations
function initPageAnimations() {
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

// Initialize all animations
function initAllAnimations() {
    console.log('Initializing all animations...');

    initPageAnimations();
    // REMOVED old header animation call
    // initHeaderTitleAnimation();

    // Initializing new hero charts
    initHeroCharts();
    initHeroTextAnimation(); // Animate title and description

    // Card 1 - Knowledge scores
    animateCounter('scoreLiterasiFin', 78);
    animateCounter('scoreLiterasiDigital', 82);

    // Card 2 - Behavior scores
    animateCounter('scorePengelolaan', 85);
    animateCounter('scorePerilaku', 73);
    animateCounter('scoreDisiplin', 68);

    // Card 3 - Wellbeing scores
    animateCounter('scoreKesejahteraan', 76);
    animateCounter('scoreInvestasi', 71);

    animateSmallCardValues();
    initLightbulbAnimation();
    initScalesAnimation();
    initBgShapesAnimation();
    initWellbeingAnimations();
    initSparkleAnimations();
    initCoinAnimations();
}