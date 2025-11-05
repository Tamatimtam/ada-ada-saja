// Scales animation
function initScalesAnimation() {
    const scaleBeam = document.querySelector("#scale-beam");

    if (!scaleBeam) {
        console.warn('Scales elements not found, skipping animation');
        return;
    }

    const scalesTl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    scalesTl.to(scaleBeam, { rotation: -3, duration: 2, delay: 1 })
        .to(scaleBeam, { rotation: 3, duration: 2 })
        .to(scaleBeam, { rotation: 0, duration: 2 });
}
