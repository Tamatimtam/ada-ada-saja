// static/js/components/digital_time_chart.js

/**
 * A helper function to read a CSS variable value from the root element.
 * @param {string} variable - The name of the CSS variable (e.g., '--chart-income').
 * @returns {string} The computed value of the variable.
 */
function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

function renderDigitalTimeChart(responseData, category) {
    const chartDiv = document.getElementById('digital-time-chart');
    if (!chartDiv) return;

    // Clear placeholder
    chartDiv.innerHTML = '';

    const { filtered_data, baseline_kde } = responseData;
    const { stats, histogram, kde } = filtered_data;

    if (stats.count === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2">No Digital Engagement Data</h6></div>`;
        return;
    }

    // MODIFIED: Read main color from CSS variables
    const mainColor = getCssVariable('--chart-digital-main');

    // Helper to convert hex to rgba
    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const histogramTrace = {
        x: histogram.x.slice(0, -1).map((edge, i) => (edge + histogram.x[i + 1]) / 2),
        y: histogram.y,
        type: 'bar', name: 'Frequency',
        marker: {
            color: hexToRgba(mainColor, 0.2),
            line: { color: hexToRgba(mainColor, 0.4), width: 1 }
        },
        hovertemplate: 'Time: %{x:.1f} hrs<br>Count: %{y}<extra></extra>',
    };

    const kdeTrace = {
        x: kde.x, y: kde.y, type: 'scatter', mode: 'lines', name: 'Smoothed Trend',
        line: { color: mainColor, width: 3 },
        fill: 'tozeroy', fillcolor: hexToRgba(mainColor, 0.1),
        hoverinfo: 'none'
    };

    const baselineKdeTrace = {
        x: baseline_kde.x, y: baseline_kde.y, type: 'scatter', mode: 'lines', name: 'Overall Trend',
        line: { color: getCssVariable('--chart-digital-baseline'), width: 2, dash: 'dash' },
        hoverinfo: 'none',
        visible: (category && category !== 'All') ? true : 'legendonly'
    };

    const titleCategory = category && category !== 'All' ? `for ${category}` : 'Overall';
    const chartTitle = `<b>📱 Digital Time Spent Distribution</b><br><span style="font-size:12px; color:#7f8c8d;">${stats.count} Respondents ${titleCategory}</span>`;

    const layout = {
        title: { text: chartTitle, x: 0.5, xanchor: 'center', font: { size: 14, family: 'Stack Sans Notch, sans-serif' } },
        xaxis: { title: 'Digital Time Spent per Day (hours)' },
        yaxis: { title: 'Number of Respondents' },
        annotations: [{
            x: stats.mean, y: Math.max(...kde.y) * 0.95, text: `<b>Avg: ${stats.mean} hrs</b>`,
            showarrow: true, arrowhead: 2, ax: 0, ay: -40,
        }],
        barmode: 'overlay', showlegend: true,
        legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
        height: 230, margin: { l: 20, r: 3, t: 30, b: 10 },
        template: 'plotly_white',
        font: { family: 'Outfit, sans-serif', size: 10 }
    };

    Plotly.newPlot(chartDiv, [histogramTrace, kdeTrace, baselineKdeTrace], layout, { displayModeBar: false, responsive: true });
}

function updateDigitalTimeChart(category) {
    const categoryParam = category || 'All';
    fetch(`/api/digital-time/${encodeURIComponent(categoryParam)}`)
        .then(response => response.json())
        .then(data => renderDigitalTimeChart(data, category));
}

function initializeDigitalTimeChart() {
    updateDigitalTimeChart(null);
}