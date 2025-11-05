// Animate counter values
function animateCounter(elementId, targetValue, duration = 2) {
    const counter = { val: 0 };
    gsap.to(counter, {
        val: targetValue,
        duration: duration,
        ease: "power1.inOut",
        onUpdate: () => {
            document.getElementById(elementId).textContent = Math.round(counter.val);
        },
        scrollTrigger: {
            trigger: `#${elementId}`,
            start: "top 90%",
        }
    });
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
