
// 1. Function to animate the main anxiety gauge.
function updateAnxietyGauge(newScore) {
    const anxietyScoreEl = document.getElementById('avgAnxietyScore');
    const anxietyGaugeFill = document.getElementById('anxiety-gauge-fill');
    if (!anxietyScoreEl || !anxietyGaugeFill) return;

    anxietyScoreEl.setAttribute('data-score', newScore);

    // 2. Use GSAP to smoothly animate the score and gauge height.
    gsap.to(anxietyScoreEl, {
        duration: 1.5,
        innerText: newScore,
        roundProps: "innerText",
        ease: "power3.out",
        onUpdate: function () {
            anxietyScoreEl.textContent = parseFloat(this.targets()[0].innerText).toFixed(1);
        }
    });
    gsap.to(anxietyGaugeFill, {
        height: `${(newScore / 5) * 100}%`,
        duration: 1.5,
        ease: "power1.inOut"
    });
}

// 3. Function to reset all metrics to their original, unfiltered state.
function resetAllData() {
    // 4. Animate all metric cards back to their original scores.
    document.querySelectorAll('[data-original-score]').forEach(el => {
        const originalScore = parseFloat(el.getAttribute('data-original-score'));
        if (!isNaN(originalScore)) {
            animateCounter(el.id, originalScore);
        }
    });

    // 5. Reset the main anxiety gauge to its original score.
    const anxietyScoreEl = document.getElementById('avgAnxietyScore');
    if (anxietyScoreEl) {
        const originalAnxietyScore = parseFloat(anxietyScoreEl.getAttribute('data-original-score'));
        if (!isNaN(originalAnxietyScore)) {
            updateAnxietyGauge(originalAnxietyScore);
        }
    }
}

// 6. Function to fetch data and update the chart.
function updateChart(chart, state, filterBy) {
    state.currentFilterCategory = filterBy;
    state.selectedFilter = null; // 7. Reset selection when the category changes.

    fetch(`/data/anxiety_by/${filterBy}`)
        .then(response => response.json())
        .then(data => {
            // 8. Update the chart's categories and data.
            chart.xAxis[0].setCategories(data.categories, false);
            chart.series[0].setData(data.scores, true);

            // 9. A short delay to ensure the chart is ready before redrawing.
            setTimeout(() => {
                chart.series[0].points.forEach(point => {
                    point.update({ color: null, borderWidth: 0 }, false);
                });
                chart.redraw();
            }, 100);

            // 10. Reset all metrics to their original state.
            resetAllData();
        })
        .catch(error => console.error('Error updating chart:', error));
}
