// static/js/main.js - NEW, SIMPLIFIED VERSION
document.addEventListener("DOMContentLoaded", () => {
    // The DOM is now fully built by the server.
    // We just need to initialize our animations and interactive components.
    
    // Initialize animations
    if (typeof initAllAnimations === 'function') {
        initAllAnimations();
    } else {
        console.error("initAllAnimations function not found!");
    }

    // NEW: Initialize the metric modal
    // The metricsData is passed from the server in a script tag in layout.html
    if (typeof initMetricModal === 'function' && typeof metricsData !== 'undefined') {
        initMetricModal(metricsData);
    } else {
        console.error("initMetricModal function or metricsData not found!");
    }
});
