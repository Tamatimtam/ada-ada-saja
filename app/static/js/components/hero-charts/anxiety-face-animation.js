function initAnxietyFaceAnimation() {
    // 1. Get all the necessary DOM elements.
    const elements = getFaceAnimationElements();
    if (!elements) return;

    // 2. Get the target score from the data attribute.
    const parsedScore = parseFloat(elements.anxietyScoreEl.getAttribute('data-score') || '0');
    const targetScore = isNaN(parsedScore) ? 3.2 : parsedScore;

    // 3. Create the main GSAP animation timeline, but don't play it yet.
    const animationTimeline = createFaceAnimation(elements, targetScore);
    animationTimeline.pause();

    // 4. Set up the Intersection Observer and hover event listeners.
    setupFaceAnimationObservers(elements, animationTimeline);
}