function initAnxietyFaceAnimation() {
    // 1. Get all the necessary DOM elements.
    const elements = getFaceAnimationElements();
    if (!elements) return;

    // 2. Get the target score from the data attribute.
    const parsedScore = parseFloat(elements.anxietyScoreEl.getAttribute('data-score') || '0');
    const targetScore = isNaN(parsedScore) ? 3.2 : parsedScore;

    // 3. MODIFIED: We no longer create a timeline here.
    // Instead, we pass the data the observer needs to trigger the animation itself.
    setupFaceAnimationObservers(elements, targetScore);
}