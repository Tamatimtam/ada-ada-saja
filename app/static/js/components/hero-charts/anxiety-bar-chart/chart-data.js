// 1. Function to animate the main anxiety gauge.
function updateAnxietyGauge(newScore) {
    const anxietyScoreEl = document.getElementById('avgAnxietyScore');
    const anxietyGaugeFill = document.getElementById('anxiety-gauge-fill');
    if (!anxietyScoreEl || !anxietyGaugeFill) return;

    anxietyScoreEl.setAttribute('data-score', newScore);

    // 2. Create a proxy object to animate the score value.
    const currentScore = parseFloat(anxietyScoreEl.textContent) || 0;
    const counter = { val: currentScore };

    // 3. Use GSAP to smoothly animate the score text.
    gsap.to(counter, {
        val: newScore,
        duration: 1.5,
        ease: "power3.out",
        onUpdate: function () {
            // 4. Update the text content with one decimal place during the animation.
            anxietyScoreEl.textContent = counter.val.toFixed(1);
        }
    });

    // 5. Animate the gauge fill height simultaneously.
    gsap.to(anxietyGaugeFill, {
        // MODIFIED: Adjust the formula to correctly map a 1-5 score range to a 0-100% height.
        // This makes the visual representation more accurate.
        height: `${Math.max(0, (newScore - 1) / 4) * 100}%`,
        duration: 1.5,
        ease: "power1.inOut"
    });
}

// 6. Function to reset all metrics to their original, unfiltered state.
function resetAllData() {
    // 7. Animate all metric cards back to their original scores.
    document.querySelectorAll('[data-original-score]').forEach(el => {
        const originalScore = parseFloat(el.getAttribute('data-original-score'));
        if (!isNaN(originalScore)) {
            // For the main cards, we need to re-run the counter animation.
            if (el.id.startsWith('score')) {
                const counter = { val: parseFloat(el.textContent) || 0 };
                gsap.to(counter, {
                    val: originalScore,
                    duration: 1.5,
                    ease: 'power3.out',
                    onUpdate: () => {
                        el.textContent = Math.round(counter.val);
                    }
                });
            }
        }
    });

    // 8. Reset the main anxiety gauge to its original score.
    const anxietyScoreEl = document.getElementById('avgAnxietyScore');
    if (anxietyScoreEl) {
        const originalAnxietyScore = parseFloat(anxietyScoreEl.getAttribute('data-original-score'));
        if (!isNaN(originalAnxietyScore)) {
            updateAnxietyGauge(originalAnxietyScore);
        }
    }
}


// 9. Function to fetch data and update the chart.
function updateChart(chart, state, filterBy) {
    state.currentFilterCategory = filterBy;
    state.selectedFilter = null; // 10. Reset selection when the category changes.

    fetch(`/data/anxiety_by/${filterBy}`)
        .then(response => response.json())
        .then(data => {
            // 11. Update the chart's categories and data.
            chart.xAxis[0].setCategories(data.categories, false);
            chart.series[0].setData(data.scores, true);

            // 12. A short delay to ensure the chart is ready before redrawing.
            setTimeout(() => {
                chart.series[0].points.forEach(point => {
                    point.update({ color: null, borderWidth: 0 }, false);
                });
                chart.redraw();
            }, 100);

            // 13. Reset all metrics to their original state.
            resetAllData();
        })
        .catch(error => console.error('Error updating chart:', error));
}