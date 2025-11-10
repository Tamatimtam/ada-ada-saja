// static/js/components/digital_time_chart.js

function renderDigitalTimeChart(responseData, category) {
    const chartDiv = document.getElementById('digital-time-chart');
    if (!chartDiv) return;

    const { filtered_data, baseline_kde } = responseData;
    const { stats, histogram, kde } = filtered_data;

    if (stats.count === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2">No Digital Engagement Data</h6></div>`;
        return;
    }

    const histogramTrace = {
        x: histogram.x.slice(0, -1).map((edge, i) => (edge + histogram.x[i+1]) / 2),
        y: histogram.y,
        type: 'bar', name: 'Frequency',
        marker: { color: 'rgba(52, 152, 219, 0.2)', line: { color: 'rgba(52, 152, 219, 0.4)', width: 1 } },
        hovertemplate: 'Time: %{x:.1f} hrs<br>Count: %{y}<extra></extra>',
    };

    const kdeTrace = {
        x: kde.x, y: kde.y, type: 'scatter', mode: 'lines', name: 'Smoothed Trend',
        line: { color: '#3498db', width: 3 },
        fill: 'tozeroy', fillcolor: 'rgba(52, 152, 219, 0.1)',
        hoverinfo: 'none'
    };

    const baselineKdeTrace = {
        x: baseline_kde.x, y: baseline_kde.y, type: 'scatter', mode: 'lines', name: 'Overall Trend',
        line: { color: 'rgba(128, 128, 128, 0.5)', width: 2, dash: 'dash' },
        hoverinfo: 'none',
        visible: (category && category !== 'All') ? true : 'legendonly'
    };

    const titleCategory = category && category !== 'All' ? `for ${category}` : 'Overall';
    const chartTitle = `<b>📱 Digital Time Spent Distribution</b><br><span style="font-size:12px; color:#7f8c8d;">${stats.count} Respondents ${titleCategory}</span>`;

    const layout = {
        title: { text: chartTitle, x: 0.5, xanchor: 'center', font: { size: 16 } },
        xaxis: { title: 'Digital Time Spent per Day (hours)' },
        yaxis: { title: 'Number of Respondents' },
        annotations: [{
            x: stats.mean, y: Math.max(...kde.y) * 0.95, text: `<b>Avg: ${stats.mean} hrs</b>`,
            showarrow: true, arrowhead: 2, ax: 0, ay: -40,
        }],
        barmode: 'overlay', showlegend: true,
        legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
        height: 380, margin: { l: 60, r: 30, t: 70, b: 50 },
        template: 'plotly_white'
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
