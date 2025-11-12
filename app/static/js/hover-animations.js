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
