function getFaceAnimationElements() {
    // 1. This function gets all the DOM elements needed for the face animation.
    const elements = {
        anxietyContainer: document.getElementById('anxiety-container'),
        anxietyScoreEl: document.getElementById('avgAnxietyScore'),
        anxietyGaugeFill: document.getElementById('anxiety-gauge-fill'),
        // MODIFIED: Replaced SVG elements with the new emoji container
        emojiContainer: document.getElementById('anxiety-emoji')
    };

    // 2. Check if all elements are present.
    for (const key in elements) {
        if (!elements[key] || (elements[key] instanceof NodeList && elements[key].length === 0)) {
            console.error(`Missing required element for anxiety face animation: ${key}`);
            return null;
        }
    }

    // 3. Return the elements object.
    return elements;
}