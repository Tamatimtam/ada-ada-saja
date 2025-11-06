// static/js/main.js - NEW, SIMPLIFIED VERSION
document.addEventListener("DOMContentLoaded", () => {
    // The DOM is now fully built by the server.
    // We just need to initialize our animations.
    if (typeof initAllAnimations === 'function') {
        initAllAnimations();
    } else {
        console.error("initAllAnimations function not found!");
    }
});