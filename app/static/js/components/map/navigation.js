export function attachNavigationEnhancements(chart) {
    const mv = chart.mapView;
    if (!mv) return;
    const initialCenter = mv.center && mv.center.slice ? mv.center.slice() : null;
    const initialZoom = mv.zoom;

    const resetButton = document.getElementById('reset-zoom-btn');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (initialCenter != null && typeof initialZoom === 'number') {
                mv.setView(initialCenter, initialZoom, { duration: 600, easing: 'easeOutCubic' });
            }
        });
    }

    chart.container?.addEventListener('dblclick', () => {
        if (initialCenter != null && typeof initialZoom === 'number') {
            mv.setView(initialCenter, initialZoom, { duration: 600, easing: 'easeOutCubic' });
        }
    });
}
