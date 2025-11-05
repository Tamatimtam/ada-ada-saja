// Lightbulb animation
function initLightbulbAnimation() {
    const bulbGlass = document.querySelector("#bulb-glass");
    const bulbRays = document.querySelector("#bulb-rays");

    if (!bulbGlass || !bulbRays) {
        console.warn('Lightbulb elements not found, skipping animation');
        return;
    }

    const bulbTl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1 });
    bulbTl.to(bulbGlass, { fillOpacity: 0.6, duration: 0.5 })
        .to(bulbRays, { opacity: 1, scale: 1.1, transformOrigin: 'center center', duration: 0.5 }, "<")
        .to("#bulb-rays line", {
            attr: {
                x2: (i, t) => parseFloat(t.getAttribute('x1')) + (Math.random() - 0.5) * 5,
                y2: (i, t) => parseFloat(t.getAttribute('y1')) + (Math.random() - 0.5) * 5
            },
            duration: 1,
            stagger: 0.1
        }, "<");
}
