// Helper function remains to define the rules.
function getEmojiForScore(score) {
    if (score <= 2.7) return '🙂';
    if (score <= 3.0) return '🥲';
    if (score <= 3.3) return '😥';
    return '😭';
}

// This helper is now a clean, stateless utility.
function performEmojiTransition(element, newEmoji) {
    if (!element || element.textContent === newEmoji) return;

    gsap.to(element, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            element.textContent = newEmoji;
            gsap.fromTo(element,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }
            );
        }
    });
}

// MODIFIED: This function no longer needs to do anything with timelines.
// It is now the one-time trigger for the initial animation.
function createFaceAnimation(elements, targetScore) {
    // 1. Set the initial emoji state immediately before animating.
    if (elements.emojiContainer) {
        elements.emojiContainer.textContent = getEmojiForScore(0);
    }

    // 2. Call the master animation controller with the slow startup duration.
    updateAnxietyGauge(targetScore, 2.6);
}

// The hover animation remains unchanged.
function createHoverAnimation(elements) {
    const { emojiContainer } = elements;
    if (!emojiContainer) return { onMouseEnter: () => { }, onMouseLeave: () => { } };

    return {
        onMouseEnter: () => {
            gsap.to(emojiContainer, {
                scale: 1.2,
                duration: 0.3,
                ease: 'back.out(2)'
            });
        },
        onMouseLeave: () => {
            gsap.to(emojiContainer, {
                scale: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        }
    };
}