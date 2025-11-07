// MODIFIED: The function now accepts 'targetScore' instead of 'animationTimeline'.
function setupFaceAnimationObservers(elements, targetScore) {
    const { anxietyContainer } = elements;
    let hasPlayed = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When the element is intersecting and the animation hasn't played yet...
            if (entry.isIntersecting && !hasPlayed) {
                hasPlayed = true;

                // MODIFIED: ...directly call the function that starts our animation.
                // This replaces the old 'animationTimeline.play()'
                createFaceAnimation(elements, targetScore);

                // We can also unobserve now to save resources.
                observer.unobserve(anxietyContainer);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(anxietyContainer);

    // Set up the hover animations.
    const hoverAnimation = createHoverAnimation(elements);
    anxietyContainer.addEventListener('mouseenter', hoverAnimation.onMouseEnter);
    anxietyContainer.addEventListener('mouseleave', hoverAnimation.onMouseLeave);
}