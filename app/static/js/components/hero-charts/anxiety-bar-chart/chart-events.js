function chartClickHandler() {
    // 1. `this` refers to the point that was clicked.
    const chart = this.series.chart;
    const state = chart.state;
    const originalColors = chart.originalColors;

    const clickedCategory = this.category;
    const clickedIndex = this.index;

    // 2. Check if the same bar is clicked again to deselect it.
    if (state.selectedFilter && state.selectedFilter.value === clickedCategory && state.selectedFilter.category === state.currentFilterCategory) {
        state.selectedFilter = null;
        resetAllData(); // 3. Reset all metrics to their original state.
        // 4. Reset bar colors to the original gradient.
        chart.series[0].points.forEach((point, idx) => {
            point.update({ color: originalColors[idx % originalColors.length], borderWidth: 0 }, false);
        });
        chart.redraw();
    } else {
        // 5. A new bar is selected.
        state.selectedFilter = { category: state.currentFilterCategory, value: clickedCategory, index: clickedIndex };

        // 6. Highlight the selected bar.
        chart.series[0].points.forEach((point, idx) => {
            const config = (idx === clickedIndex)
                ? { color: '#FFD700', borderWidth: 3, borderColor: '#FFA500' }
                : { color: null, borderWidth: 0 };
            point.update(config, false);
        });
        chart.redraw();

        // 7. Fetch filtered data from the server.
        fetch(`/api/filter_metrics/${state.currentFilterCategory}/${encodeURIComponent(clickedCategory)}`)
            .then(response => response.json())
            .then(data => {
                // 8. Update all the metric cards with the new filtered data.
                animateCounter('scoreLiterasiFin', data.scores['Literasi Finansial']);
                animateCounter('scoreLiterasiDigital', data.scores['Literasi Keuangan Digital']);
                animateCounter('scorePengelolaan', data.scores['Pengelolaan Keuangan']);
                animateCounter('scorePerilaku', data.scores['Sikap Finansial']);
                animateCounter('scoreDisiplin', data.scores['Disiplin Finansial']);
                animateCounter('scoreKesejahteraan', data.scores['Kesejahteraan Finansial']);
                animateCounter('scoreInvestasi', data.scores['Investasi Aset']);

                // 9. Update the main anxiety score gauge.
                updateAnxietyGauge(data.average_anxiety_score);
            })
            .catch(error => console.error('Error fetching filtered metrics:', error));
    }
}