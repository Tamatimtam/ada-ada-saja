
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

    // 4. Define the original colors for the chart bars.
    const originalColors = [
        '#FF6B9D', '#FF7FAA', '#FF93B7', '#FFA7C4', '#FFBBD1', '#FFCFDE', '#FFE3EB', '#FFF0F5',
        '#FF6B9D', '#FF7FAA', '#FF93B7', '#FFA7C4', '#FFBBD1', '#FFCFDE', '#FFE3EB', '#FFF0F5'
    ];

    // 5. Get the chart configuration.
    const chartConfig = getChartConfig(originalColors);

    // 6. Create the Highcharts chart instance.
    const chart = Highcharts.chart('anxietyBarChart', chartConfig);

    // 7. Attach state and colors to the chart object to be accessible by event handlers.
    chart.state = state;
    chart.originalColors = originalColors;

    // 8. Load the chart with the default filter.
    updateChart(chart, state, 'employment_status');

    // 9. Listen for a custom event to change the chart filter.
    document.addEventListener('filterChanged', (e) => {
        updateChart(chart, state, e.detail.filterBy);
    });

    // 10. Animate the chart's entrance for a nice visual effect.
    gsap.from(anxietyBarChartEl, {
        duration: 1,
        scale: 0.5,
        opacity: 0,
        delay: 0.5,
        ease: 'back.out(1.7)'
    });
}
