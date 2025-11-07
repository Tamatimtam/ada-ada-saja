function createFaceAnimation(elements, targetScore) {
    // 1. This function creates the GSAP timeline for the face animation.
    const { anxietyScoreEl, anxietyGaugeFill, face, mouth, eyes, sweatDrop } = elements;

    // 2. Create a counter object to animate the score number.
    const counter = { val: 0 };

    // 3. A gentle, continuous nervous twitch for the face.
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

    // 4. Create the main timeline for the animation sequence.
    const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onUpdate: () => {
            // 5. Update the score text as the animation progresses.
            anxietyScoreEl.textContent = counter.val.toFixed(1);
        }
    });

    // 6. Define the animation's duration and the gauge's target height.
    const animationDuration = 2.6;
    // MODIFIED: Use the corrected formula to accurately map the 1-5 score to a 0-100% range.
    const targetHeight = Math.max(0, (targetScore - 1) / 4) * 100;

    // 7. Animate the counter and the gauge fill at the same time.
    tl.to(counter, { val: targetScore, duration: animationDuration }, 0)
        .to(anxietyGaugeFill, { height: `${targetHeight}%`, duration: animationDuration, ease: "power1.inOut" }, 0);

    // 8. Schedule expression changes at specific points in the timeline.
    tl.to(mouth, { attr: { d: "M 35 70 Q 50 62 65 70" }, duration: 0.5 }, animationDuration * (1.5 / targetScore))
        .to(eyes, { scale: 1.3, transformOrigin: 'center center', duration: 0.4, ease: "back.out(2)" }, animationDuration * (2.5 / targetScore))
        .fromTo(sweatDrop, { opacity: 0, y: 0 }, { opacity: 1, y: 20, duration: 1.2, ease: "none" }, animationDuration * (3.0 / targetScore));

    // 9. Return the timeline.
    return tl;
}

function createHoverAnimation(elements) {
    // 1. This function creates the hover animation for the face.
    const { face } = elements;
    let anxietyWobble;

    return {
        onMouseEnter: () => {
            // 2. Make the face slightly bigger.
            gsap.to(face, { scale: 1.05, duration: 0.3, ease: 'back.out(2)' });
            // 3. Start a more pronounced wobble animation.
            anxietyWobble = gsap.to(face, {
                x: 'random(-1, 1)',
                rotation: 'random(-2, 2)',
                duration: 0.1,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
            });
        },
        onMouseLeave: () => {
            // 4. When the mouse leaves, return the face to its normal state.
            if (anxietyWobble) anxietyWobble.kill(); // 5. Stop the wobble.
            gsap.to(face, {
                scale: 1,
                x: 0,
                rotation: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        }
    };
}