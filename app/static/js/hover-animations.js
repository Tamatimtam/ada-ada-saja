function initCardHoverAnimations() {
    const cards = document.querySelectorAll('.grid-item, .full-width-row');

    cards.forEach(card => {
        // Set a transform origin for smooth scaling
        gsap.set(card, { transformOrigin: 'center center' });

        // Create a GSAP timeline for the animation
        const tl = gsap.timeline({ paused: true });

        tl.to(card, {
            scale: 1.02,
            y: -4,
            /* boxShadow: '0px 15px 25px rgba(0,0,0,0.12)', */
            duration: 0.3,
            ease: 'power2.out'
        });

        card.addEventListener('mouseenter', () => tl.play());
        card.addEventListener('mouseleave', () => tl.reverse());
    });
}

// --- ADD THIS NEW FUNCTION ---
function initMainCardHoverAnimations() {
    // Animate illustration on Knowledge card hover
    const knowledgeCard = document.querySelector('.card-knowledge');
    if (knowledgeCard) {
        const bulb = knowledgeCard.querySelector('#lightbulb');
        knowledgeCard.addEventListener('mouseenter', () => {
            gsap.to(bulb, { scale: 1.1, y: -5, duration: 0.4, ease: 'back.out(1.7)' });
        });
        knowledgeCard.addEventListener('mouseleave', () => {
            gsap.to(bulb, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        });
    }

    // Animate illustration on Behavior card hover
    const behaviorCard = document.querySelector('.card-behavior');
    if (behaviorCard) {
        const scales = behaviorCard.querySelector('#scales');
        behaviorCard.addEventListener('mouseenter', () => {
            gsap.to(scales, { rotation: -3, duration: 0.4, ease: 'back.out(1.7)' });
        });
        behaviorCard.addEventListener('mouseleave', () => {
            gsap.to(scales, { rotation: 0, duration: 0.4, ease: 'power2.out' });
        });
    }

    // Animate illustration on Wellbeing card hover
    const wellbeingCard = document.querySelector('.card-wellbeing');
    if (wellbeingCard) {
        const house = wellbeingCard.querySelector('#wellbeing');
        wellbeingCard.addEventListener('mouseenter', () => {
            gsap.to(house, { scale: 1.05, y: -3, duration: 0.4, ease: 'back.out(1.7)' });
        });
        wellbeingCard.addEventListener('mouseleave', () => {
            gsap.to(house, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        });
    }
}
