// Wellbeing card animations
function initWellbeingAnimations() {
    const house = document.querySelector("#house");
    const coins = document.querySelectorAll("#coins .coin");
    const windows = document.querySelectorAll("#left-window, #right-window");

    if (!house) {
        console.warn('Wellbeing house element not found, skipping animation');
        return;
    }

    // House floating animation
    gsap.to(house, {
        y: -2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Coins bouncing animation
    if (coins.length > 0) {
        gsap.to(coins, {
            y: -8,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.2
        });
    }

    // Windows glowing animation
    if (windows.length > 0) {
        gsap.to(windows, {
            fill: getColor('--card3-illust-main'),
            duration: 1.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 0.3
        });
    }
}
