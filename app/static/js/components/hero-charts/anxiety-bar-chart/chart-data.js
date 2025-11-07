// This function now becomes the single source of truth for the gauge animation.
// It accepts a duration to handle both the slow startup and fast updates.
function updateAnxietyGauge(newScore, duration = 1.5) {
    const anxietyScoreEl = document.getElementById('avgAnxietyScore');
    const anxietyGaugeFill = document.getElementById('anxiety-gauge-fill');
    const emojiContainer = document.getElementById('anxiety-emoji');
    if (!anxietyScoreEl || !anxietyGaugeFill || !emojiContainer) return;

    // 1. CRITICAL: Kill any previous animations on these elements to prevent conflicts.
    gsap.killTweensOf([anxietyScoreEl, anxietyGaugeFill, emojiContainer]);

    const currentScore = parseFloat(anxietyScoreEl.textContent) || 0;
    const counter = { val: currentScore };

    // 2. Define thresholds and state for the emoji transition. This resets on every new animation.
    const thresholds = [
        { score: 2.8, emoji: '🥲' },
        { score: 3.1, emoji: '😥' },
        { score: 3.4, emoji: '😭' }
    ];
    let nextThresholdIndex = 0;
    // Find what the next threshold should be based on the starting score.
    while (nextThresholdIndex < thresholds.length && currentScore >= thresholds[nextThresholdIndex].score) {
        nextThresholdIndex++;
    }

    // 3. Animate the score counter. The onUpdate callback now handles everything.
    gsap.to(counter, {
        val: newScore,
        duration: duration,
        ease: "power3.out",
        onUpdate: function () {
            // Update the score text.
            anxietyScoreEl.textContent = counter.val.toFixed(1);

            // Check if the score has passed the next emotional threshold.
            if (nextThresholdIndex < thresholds.length) {
                const nextThreshold = thresholds[nextThresholdIndex];
                if (counter.val >= nextThreshold.score) {
                    performEmojiTransition(emojiContainer, nextThreshold.emoji);
                    nextThresholdIndex++; // Advance to the next threshold.
                }
            }
        }
    });

    // 4. Animate the gauge fill height simultaneously.
    gsap.to(anxietyGaugeFill, {
        height: `${Math.max(0, (newScore - 1) / 4) * 100}%`,
        duration: duration,
        ease: "power1.inOut"
    });

    // 5. Set the final emoji state immediately if there are no thresholds to cross.
    const finalEmoji = getEmojiForScore(newScore);
    if (emojiContainer.textContent !== finalEmoji && thresholds.every(t => newScore < t.score || currentScore >= t.score)) {
        performEmojiTransition(emojiContainer, finalEmoji);
    }
}


// Function to reset all metrics to their original, unfiltered state.
function resetAllData() {
    // Animate all metric cards back to their original scores.
    document.querySelectorAll('[data-original-score]').forEach(el => {
        const originalScore = parseFloat(el.getAttribute('data-original-score'));
        if (!isNaN(originalScore)) {
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

    // Reset the main anxiety gauge to its original score using our master function.
    const anxietyScoreEl = document.getElementById('avgAnxietyScore');
    if (anxietyScoreEl) {
        const originalAnxietyScore = parseFloat(anxietyScoreEl.getAttribute('data-original-score'));
        if (!isNaN(originalAnxietyScore)) {
            // Call the unified function with the default (fast) duration.
            updateAnxietyGauge(originalAnxietyScore);
        }
    }
}


// Function to fetch data and update the chart.
function updateChart(chart, state, filterBy) {
    state.currentFilterCategory = filterBy;
    state.selectedFilter = null; // Reset selection when the category changes.

    fetch(`/data/anxiety_by/${filterBy}`)
        .then(response => response.json())
        .then(data => {
            // Update the chart's categories and data. Highcharts will apply the pink gradient automatically.
            chart.xAxis[0].setCategories(data.categories, false);
            chart.series[0].setData(data.scores, true);

            // Reset all metrics to their original state.
            resetAllData();
        })
        .catch(error => console.error('Error updating chart:', error));
}