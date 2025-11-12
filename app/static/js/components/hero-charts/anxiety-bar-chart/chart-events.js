function chartClickHandler() {
    // 1. `this` refers to the point that was clicked.
    const chart = this.series.chart;
    const state = chart.state;

    const clickedCategory = this.category;
    const clickedIndex = this.index;

    // 2. Check if the same bar is clicked again to deselect it.
    if (state.selectedFilter && state.selectedFilter.index === clickedIndex && state.selectedFilter.category === state.currentFilterCategory) {
        state.selectedFilter = null;
        resetAllData(); // 3. Reset all metrics to their original state.
        // 4. Reset bar colors to the original gradient.
        chart.series[0].points.forEach((point, idx) => {
            point.update({ color: chart.generatedColors[idx], borderWidth: 0 }, false);
        });
        chart.redraw();
    } else {
        // 5. A new bar is selected.
        state.selectedFilter = { category: state.currentFilterCategory, value: clickedCategory, index: clickedIndex };

        // 6. Highlight the selected bar.
        chart.series[0].points.forEach((point, idx) => {
            const isSelected = idx === clickedIndex;
            const config = {
                color: isSelected ? '#FFD700' : chart.generatedColors[idx],
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? '#FFA500' : 'transparent'
            };
            point.update(config, false);
        });
        chart.redraw();

        // 7. Fetch filtered data from the server.
        const safeValue = normalizeFilterValue(state.currentFilterCategory, clickedCategory);
        fetch(`/api/filter_metrics/${state.currentFilterCategory}/${encodeURIComponent(safeValue)}`)
            .then(response => response.json())
            .then(data => {
                // Update all cards through a single, consistent function
                updateAllScoreCards(data.scores, false);

                // 9. Update the main anxiety score gauge.
                updateAnxietyGauge(data.average_anxiety_score);
            })
            .catch(error => console.error('Error fetching filtered metrics:', error));
    }
}

// --- NEW: normalize incoming label to backend-friendly value ---
function normalizeFilterValue(filterBy, value) {
    if (filterBy !== 'employment_status') return value;
    const v = String(value || '').trim();
    const aliases = {
        'Civil Servant/BUMN or Local Government': 'Civil Servant/BUMN',
        'Civil Servant / BUMN': 'Civil Servant/BUMN',
        'ASN/BUMN': 'Civil Servant/BUMN'
    };
    return aliases[v] || v;
}

// --- NEW: centralized updater + event hook used by both click and sort paths ---
function updateAllScoreCards(scores, useScrollTrigger = true) {
    if (!scores) return;
    animateCounter('scoreLiterasiFin', scores['Literasi Finansial'], 2, useScrollTrigger);
    animateCounter('scoreLiterasiDigital', scores['Literasi Keuangan Digital'], 2, useScrollTrigger);
    animateCounter('scorePengelolaan', scores['Pengelolaan Keuangan'], 2, useScrollTrigger);
    animateCounter('scorePerilaku', scores['Sikap Finansial'], 2, useScrollTrigger);
    animateCounter('scoreDisiplin', scores['Disiplin Finansial'], 2, useScrollTrigger);
    // Ensure Financial Wellbeing is always updated, too
    animateCounter('scoreKesejahteraan', scores['Kesejahteraan Finansial'], 2, useScrollTrigger);
    animateCounter('scoreInvestasi', scores['Investasi Aset'], 2, useScrollTrigger);
}

// Expose the updater so the sorting routine can call it directly if it already has the scores
window.updateAllScoreCards = updateAllScoreCards;

// Optional: if your sort logic emits an event with the freshly computed scores,
// this listener will update every card (including Wellbeing) automatically.
document.addEventListener('filterMetricsUpdated', (e) => {
    // Expected payload: { detail: { scores, average_anxiety_score } }
    const { scores, average_anxiety_score } = e.detail || {};
    updateAllScoreCards(scores, false);
    if (typeof average_anxiety_score === 'number') {
        updateAnxietyGauge(average_anxiety_score);
    }
});