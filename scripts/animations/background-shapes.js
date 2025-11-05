// Generic background shapes animation (DRY)
function initBgShapesAnimation() {
    const animateShapes = (card, selector, config) => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card.querySelectorAll(selector), {
                x: () => (Math.random() - 0.5) * (config.moveRange || 30),
                y: () => (Math.random() - 0.5) * (config.moveRange || 30),
                scale: () => 1 + (Math.random() - 0.5) * (config.scaleRange || 0.2),
                duration: config.duration || 1,
                ease: config.ease || 'elastic.out(1, 0.5)',
                stagger: config.stagger || 0.1
            });
        });
    };

    // Card 1 - Knowledge shapes
    const cardKnowledge = document.querySelector('.card-knowledge');
    if (cardKnowledge) {
        animateShapes(cardKnowledge, '.shape', { moveRange: 30, scaleRange: 0.2 });
    }

    // Card 2 - Decision particles
    const cardBehavior = document.querySelector('.card-behavior');
    if (cardBehavior) {
        animateShapes(cardBehavior, '.particle', { moveRange: 25, scaleRange: 0.4, duration: 1 });
        initParticleFloating();
    }

    // Card 3 - Wellbeing elements
    const cardWellbeing = document.querySelector('.card-wellbeing');
    if (cardWellbeing) {
        animateShapes(cardWellbeing, '.coin-shape', { moveRange: 15, scaleRange: 0.15, duration: 1.2 });
    }
}

// Particle floating animation for card 2
function initParticleFloating() {
    const particles = document.querySelectorAll('.card-behavior .particle');

    particles.forEach((particle, index) => {
        gsap.to(particle, {
            y: () => -15 - (Math.random() * 10),
            x: () => (Math.random() - 0.5) * 15,
            duration: 2 + (Math.random() * 1.5),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2
        });

        gsap.to(particle, {
            opacity: 0.4,
            scale: 1.2,
            duration: 1.8 + (Math.random() * 1),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.15
        });
    });
}

// Sparkle twinkle animation for card 3
function initSparkleAnimations() {
    const sparkles = document.querySelectorAll('.card-wellbeing .sparkle');

    gsap.to(sparkles, {
        opacity: 1,
        scale: 1.3,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
            each: 0.3,
            repeat: -1
        }
    });

    // Rotate sparkles
    gsap.to(sparkles, {
        rotation: 45,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2
    });
}

// Coin floating animation for card 3
function initCoinAnimations() {
    const coins = document.querySelectorAll('.card-wellbeing .coin-shape');

    gsap.to(coins, {
        y: -10,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3
    });
}
