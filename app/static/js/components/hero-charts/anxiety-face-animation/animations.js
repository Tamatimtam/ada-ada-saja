// NEW: Helper function to determine which emoji to show based on the score.
function getEmojiForScore(score) {
    if (score <= 2.7) return '🙂';
    if (score <= 3.0) return '🥲';
    if (score <= 3.3) return '😥';
    return '😭';
}

// NEW: A dedicated, reusable function to handle the emoji animation.
function updateAnxietyEmoji(newScore) {
    const emojiContainer = document.getElementById('anxiety-emoji');
    if (!emojiContainer) return; // Safety check

    const currentEmoji = emojiContainer.textContent;
    const newEmoji = getEmojiForScore(newScore);

    // Only run the animation if the emoji has actually changed.
    if (newEmoji !== currentEmoji) {
        gsap.to(emojiContainer, {
            scale: 0,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => {
                emojiContainer.textContent = newEmoji;
                gsap.fromTo(emojiContainer,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
                );
            }
        });
    }
}

function createFaceAnimation(elements, targetScore) {
    // 1. Destructure the updated elements.
    const { anxietyScoreEl, anxietyGaugeFill, emojiContainer } = elements;
    const counter = { val: 0 };

    // 2. Set the initial emoji.
    if (emojiContainer) {
        emojiContainer.textContent = getEmojiForScore(0);
    }

    // 3. Create the main GSAP timeline.
    const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onUpdate: () => {
            // 4. Update the score text.
            anxietyScoreEl.textContent = counter.val.toFixed(1);

            // 5. MODIFIED: Call our new reusable function on every update.
            // This keeps the logic consistent and DRY.
            updateAnxietyEmoji(counter.val);
        }
    });

    // 6. Define the main animation for the counter and gauge fill.
    const animationDuration = 2.6;
    const targetHeight = Math.max(0, (targetScore - 1) / 4) * 100;

    tl.to(counter, { val: targetScore, duration: animationDuration }, 0)
        .to(anxietyGaugeFill, { height: `${targetHeight}%`, duration: animationDuration, ease: "power1.inOut" }, 0);

    return tl;
}

function createHoverAnimation(elements) {
    // 1. This function animates the emoji container on hover.
    const { emojiContainer } = elements;
    if (!emojiContainer) return { onMouseEnter: () => { }, onMouseLeave: () => { } };

    return {
        onMouseEnter: () => {
            // 2. Scale up the emoji with a bounce effect on mouse enter.
            gsap.to(emojiContainer, {
                scale: 1.2,
                duration: 0.3,
                ease: 'back.out(2)'
            });
        },
        onMouseLeave: () => {
            // 3. Return the emoji to its original state with an elastic effect.
            gsap.to(emojiContainer, {
                scale: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        }
    };
}