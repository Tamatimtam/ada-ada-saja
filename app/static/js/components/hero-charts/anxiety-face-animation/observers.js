
function setupFaceAnimationObservers(elements, animationTimeline) {
    // 1. This function sets up the Intersection Observer to trigger the animation.
    const { anxietyContainer } = elements;
    let hasPlayed = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasPlayed) {
                hasPlayed = true;
                animationTimeline.play();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(anxietyContainer);

    // 2. Set up the hover animations.
    const hoverAnimation = createHoverAnimation(elements);
    anxietyContainer.addEventListener('mouseenter', hoverAnimation.onMouseEnter);
    anxietyContainer.addEventListener('mouseleave', hoverAnimation.onMouseLeave);
}
