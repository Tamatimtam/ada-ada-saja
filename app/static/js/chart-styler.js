// static/js/chart-styler.js

/**
 * A helper function to read a CSS variable value from the root element.
 * @param {string} variable - The name of the CSS variable (e.g., '--chart-income').
 * @returns {string} The computed value of the variable.
 */
function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Applies styles from CSS variables to the Diverging Bar Chart.
 */
function styleDivergingBarChart() {
    const chartDiv = document.getElementById('diverging-bar-chart');
    if (!chartDiv || !chartDiv.data) return;

    const expenseColor = getCssVariable('--chart-expense');
    const expenseBorder = getCssVariable('--chart-expense-border');
    const incomeColor = getCssVariable('--chart-income');
    const incomeBorder = getCssVariable('--chart-income-border');

    // The order of traces is important. Trace 0 is 'Expense', Trace 1 is 'Income'.
    const update = {
        'marker.color': [expenseColor, incomeColor],
        'marker.line.color': [expenseBorder, incomeBorder],
        'marker.line.width': [1.5, 1.5]
    };

    Plotly.restyle(chartDiv, update);
}

/**
 * Applies styles from CSS variables to a stacked bar chart (Profession or Education).
 * @param {string} chartId - The ID of the chart div.
 */
function styleStackedBarChart(chartId) {
    const chartDiv = document.getElementById(chartId);
    if (!chartDiv || !chartDiv.data) return;

    const surplusColor = getCssVariable('--chart-surplus');
    const breakEvenColor = getCssVariable('--chart-break-even');
    const deficitColor = getCssVariable('--chart-deficit');

    const colorMap = {
        'Surplus': surplusColor,
        'Break-even': breakEvenColor,
        'Deficit': deficitColor
    };

    // Create an array of colors for each trace based on its name
    const traceColors = chartDiv.data.map(trace => colorMap[trace.name] || '#95a5a6');

    const update = {
        'marker.color': traceColors
    };

    Plotly.restyle(chartDiv, update);
}


/**
 * Main function to run all chart styling after the DOM is ready.
 * It uses a MutationObserver to wait for Plotly to render the charts.
 */
function initializeChartStyling() {
    const observer = new MutationObserver((mutationsList, observer) => {
        // Look for the creation of the Plotly chart elements
        const professionChartReady = document.querySelector('#profession-chart .main-svg');
        const educationChartReady = document.querySelector('#education-chart .main-svg');
        const divergingChartReady = document.querySelector('#diverging-bar-chart .main-svg');

        if (divergingChartReady) {
            styleDivergingBarChart();
        }
        if (professionChartReady) {
            styleStackedBarChart('profession-chart');
        }
        if (educationChartReady) {
            styleStackedBarChart('education-chart');
        }

        // If all charts are styled, we can disconnect the observer
        if (professionChartReady && educationChartReady && divergingChartReady) {
            observer.disconnect();
            console.log('Server-side charts dynamically styled.');
        }
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
}

// Wait for the DOM to be fully loaded before starting
document.addEventListener('DOMContentLoaded', initializeChartStyling);