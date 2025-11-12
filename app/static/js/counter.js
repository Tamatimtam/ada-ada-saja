// Animate counter values
function animateCounter(elementId, targetValue, duration = 2, useScrollTrigger = true) {
    const counter = { val: 0 };
    const animationProps = {
        val: targetValue,
        duration: duration,
        ease: "power1.inOut",
        onUpdate: () => {
            const el = document.getElementById(elementId);
            if (el) {
                el.textContent = Math.round(counter.val);
            }
        }
    };

    if (useScrollTrigger) {
        animationProps.scrollTrigger = {
            trigger: `#${elementId}`,
            start: "top 90%",
        };
    }

    gsap.to(counter, animationProps);
}

// Animate all small card values
function animateSmallCardValues() {
    gsap.utils.toArray(".small-card .value").forEach(el => {
        const targetValue = el.dataset.value;
        const counter = { val: 0 };
        gsap.to(counter, {
            val: targetValue,
            duration: 2,
            ease: "power1.inOut",
            onUpdate: () => {
                el.textContent = Math.round(counter.val);
            },
            scrollTrigger: {
                trigger: el,
                start: "top 90%",
            }
        });
    });
}