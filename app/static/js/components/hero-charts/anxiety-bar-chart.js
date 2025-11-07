function initAnxietyBarChart() {
    // 1. Get the chart container element from the HTML.
    const anxietyBarChartEl = document.getElementById('anxietyBarChart');

    // 2. If the container doesn't exist, we can't create the chart.
    if (!anxietyBarChartEl) {
        console.error("Missing required element for anxiety bar chart: #anxietyBarChart");
        return;
    }

    // 3. Define the state of the chart.
    const state = {
        selectedFilter: null, // {category, value, pointIndex}
        currentFilterCategory: 'employment_status', // Default category
    };

    // 4. Get the chart configuration.
    const chartConfig = getChartConfig();

    // 5. Create the Highcharts chart instance.
    const chart = Highcharts.chart('anxietyBarChart', chartConfig);

    // 6. Attach state and colors to the chart object to be accessible by event handlers.
    chart.state = state;

    // 7. Load the chart with the default filter.
    updateChart(chart, state, 'employment_status');

    // 8. Listen for a custom event to change the chart filter.
    document.addEventListener('filterChanged', (e) => {
        updateChart(chart, state, e.detail.filterBy);
    });

    // 9. Animate the chart's entrance for a nice visual effect.
    gsap.from(anxietyBarChartEl, {
        duration: 1,
        scale: 0.5,
        opacity: 0,
        delay: 0.5,
        ease: 'back.out(1.7)'
    });
}