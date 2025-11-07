
function initAnxietyFaceAnimation() {
    // 1. Get all the elements we need for the animation.
    const anxietyContainer = document.getElementById('anxiety-container');
    const anxietyScoreEl = document.getElementById('avgAnxietyScore');
    const anxietyGaugeFill = document.getElementById('anxiety-gauge-fill');
    const face = document.getElementById('face-group');
    const mouth = document.getElementById('mouth');
    const eyes = document.querySelectorAll('#eye-left, #eye-right');
    const sweatDrop = document.getElementById('sweat-drop');

    // 2. If any of these elements don't exist, we can't run the animation.
    if (!anxietyContainer || !anxietyScoreEl || !anxietyGaugeFill || !face || !mouth || !eyes || !sweatDrop) {
        console.error("Missing required elements for anxiety face animation.");
        return;
    }

    // 3. Get the score from the HTML, or use a default value.
    const parsedScore = parseFloat(anxietyScoreEl.getAttribute('data-score') || '0');
    const targetScore = isNaN(parsedScore) ? 3.2 : parsedScore;

    // 4. This flag prevents the animation from running more than once.
    let hasPlayed = false;

    // 5. This is the main animation function.
    const runAnxietyAnimation = () => {
        if (hasPlayed) return;
        hasPlayed = true;

        // 6. Create a counter object to animate the score number.
        const counter = { val: 0 };

        // 7. A gentle, continuous nervous twitch for the face.
        gsap.to(face, {
            y: -0.5,
            x: 0.5,
            rotation: -1,
            duration: 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            repeatDelay: 1.5
        });

        // 8. Create the main timeline for the animation sequence.
        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            onUpdate: () => {
                // 9. Update the score text as the animation progresses.
                anxietyScoreEl.textContent = counter.val.toFixed(1);
            }
        });

        // 10. Define the animation's duration and the gauge's target height.
        const animationDuration = 2.6;
        const targetHeight = (targetScore / 5) * 100;

        // 11. Animate the counter and the gauge fill at the same time.
        tl.to(counter, { val: targetScore, duration: animationDuration }, 0)
          .to(anxietyGaugeFill, { height: `${targetHeight}%`, duration: animationDuration, ease: "power1.inOut" }, 0);

        // 12. Schedule expression changes at specific points in the timeline.
        tl.to(mouth, { attr: { d: "M 35 70 Q 50 62 65 70" }, duration: 0.5 }, animationDuration * (1.5 / targetScore))
          .to(eyes, { scale: 1.3, transformOrigin: 'center center', duration: 0.4, ease: "back.out(2)" }, animationDuration * (2.5 / targetScore))
          .fromTo(sweatDrop, { opacity: 0, y: 0 }, { opacity: 1, y: 20, duration: 1.2, ease: "none" }, animationDuration * (3.0 / targetScore));
    };

    // 13. Use an Intersection Observer to trigger the animation when it becomes visible.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runAnxietyAnimation();
            }
        });
    }, { threshold: 0.3 });
    observer.observe(anxietyContainer);

    // 14. Add interactivity on mouse hover.
    let anxietyWobble;
    anxietyContainer.addEventListener('mouseenter', () => {
        // 15. Make the face slightly bigger.
        gsap.to(face, { scale: 1.05, duration: 0.3, ease: 'back.out(2)' });
        // 16. Start a more pronounced wobble animation.
        anxietyWobble = gsap.to(face, {
            x: 'random(-1, 1)',
            rotation: 'random(-2, 2)',
            duration: 0.1,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });
    });

    // 17. When the mouse leaves, return the face to its normal state.
    anxietyContainer.addEventListener('mouseleave', () => {
        if (anxietyWobble) anxietyWobble.kill(); // 18. Stop the wobble.
        gsap.to(face, {
            scale: 1,
            x: 0,
            rotation: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)'
        });
    });
}
