// static/js/new_charts_animations.js

// --- UTILITY FUNCTIONS ---
function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

function styleStackedBarChart(chartId) {
    const chartDiv = document.getElementById(chartId);
    if (!chartDiv || !chartDiv.data) return;

    const surplusColor = getCssVariable('--chart-surplus');
    const breakEvenColor = getCssVariable('--chart-break-even');
    const deficitColor = getCssVariable('--chart-deficit');

    const colorMap = { 'Surplus': surplusColor, 'Break-even': breakEvenColor, 'Deficit': deficitColor };

    const traceColors = chartDiv.data.map(trace => colorMap[trace.name] || '#95a5a6');

    Plotly.restyle(chartDiv, { 'marker.color': traceColors });
}

// MODIFIED: This function now also handles subtitle updates
function renderChart(chartId, chartData, filterType, filterValue, chartConfig) {
    const chartDiv = document.getElementById(chartId);
    if (!chartDiv) return;

    // Update subtitle logic
    const panelId = chartId === 'profession-chart' ? 'profession-panel' : 'education-panel';
    const subtitleEl = document.querySelector(`#${panelId} .viz-footer small`);
    if (subtitleEl) {
        if (filterType && filterValue) {
            const totalRespondents = chartData.total_respondents || 0;
            const filterTypeText = filterType.charAt(0).toUpperCase() + filterType.slice(1);
            subtitleEl.innerHTML = `Filtered by <b>${filterTypeText}: ${filterValue}</b><br><i>Based on ${totalRespondents} respondents</i>`;
        } else {
            const defaultText = chartId === 'profession-chart'
                ? 'Employment status vs financial outcomes'
                : "Education level's impact on stability";
            subtitleEl.textContent = defaultText;
        }
    }

    // Show placeholder if data is empty
    if (!chartData || !chartData.categories || chartData.categories.length === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content" style="display:flex; flex-direction: column; align-items:center; justify-content:center; height:100%;"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2" style="font-size:0.8rem; text-align:center;">No Data for<br>${filterValue || 'Overall'}</h6></div>`;
        return;
    }
    
    if (chartDiv.querySelector('.placeholder-content')) chartDiv.innerHTML = '';
    
    const traces = [];
    const standings = ["Surplus", "Break-even", "Deficit"];
    const abbreviatedCats = chartConfig.abbreviate(chartData.categories);

    standings.forEach(standing => {
        if (chartData.data[standing]) {
            const values = chartData.data[standing];
            const hover_text = chartData.categories.map((cat, i) => {
                const count = chartData.total_counts[cat] || 0;
                const pct = values[i];
                const actual_count = Math.round((pct / 100) * count);
                return `${cat}<br>${standing}: ${pct.toFixed(1)}% (${actual_count} people)`;
            });
            traces.push({
                name: standing, x: abbreviatedCats, y: values, type: 'bar',
                hovertext: hover_text, hoverinfo: 'text',
                text: values.map(v => v > 8 ? `${Math.round(v)}%` : ''),
                textposition: 'inside', textfont: { size: 8, color: 'white' }
            });
        }
    });
    
    Plotly.react(chartDiv, traces, chartConfig.layout, { responsive: true, displayModeBar: false })
        .then(() => styleStackedBarChart(chartId));
}

const professionChartConfig = {
    abbreviate: (cats) => cats,
    layout: {
        title: { text: "💼<b>Employment vs<br>Financial Standing(%)</b>", x: 0.5, xanchor: "center", y: 0.98, yanchor: "top", pad: { t: 5 }, font: { size: 12, color: "#2c3e50", family: "Stack Sans Notch, sans-serif" } },
        xaxis: { tickfont: { size: 8, color: "#34495e" }, showgrid: false, tickangle: -45 },
        yaxis: { tickfont: { size: 8, color: "#34495e" }, gridcolor: "rgba(189, 195, 199, 0.2)", range: [0, 100] },
        barmode: "stack", template: "plotly_white", height: 264, width: 188, showlegend: false,
        margin: { l: 20, r: 28, t: 48, b: 40 }, hoverlabel: { bgcolor: "white", font_size: 10 }
    }
};

const educationChartConfig = {
    abbreviate: (cats) => cats.map(cat => {
        if (cat.length > 15) {
            if (cat.includes("Bachelor")) return "Bachelor/D4";
            if (cat.includes("Diploma I")) return "Diploma I-III";
            if (cat.includes("Senior High")) return "High School";
            if (cat.includes("Junior High")) return "Junior High";
            if (cat.includes("Elementary")) return "Elementary";
            if (cat.includes("Postgraduate")) return "Postgrad";
        }
        return cat;
    }),
    layout: {
        title: { text: "<b>🎓 Education vs<br>Financial Standing (%)</b>", x: 0.5, xanchor: "center", y: 0.98, yanchor: "top", pad: { t: 4 }, font: { size: 14, color: "#2c3e50", family: "Stack Sans Notch, sans-serif" } },
        xaxis: { tickfont: { size: 8, color: "#34495e" }, showgrid: false, tickangle: -45 },
        yaxis: { tickfont: { size: 8, color: "#34495e" }, gridcolor: "rgba(189, 195, 199, 0.2)", range: [0, 100] },
        barmode: "stack", template: "plotly_white", height: 264, width: 188, showlegend: false,
        margin: { l: 20, r: 28, t: 48, b: 40 }, hoverlabel: { bgcolor: "white", font_size: 10 }
    }
};

// MODIFIED: Passes filterType and filterValue to renderChart
function updateChartData(chartId, endpoint, filterType, filterValue, chartConfig) {
    const panel = document.getElementById(chartId).closest('.viz-panel');
    if (panel) panel.classList.add('is-loading');

    let url = endpoint;
    if (filterType && filterValue) {
        url += `?filter_type=${filterType}&filter_value=${encodeURIComponent(filterValue)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderChart(chartId, data, filterType, filterValue, chartConfig);
        })
        .catch(error => {
            console.error(`Error updating ${chartId}:`, error);
            document.getElementById(chartId).innerHTML = `<div class="placeholder-content" style="color:red;">Error loading data.</div>`;
        })
        .finally(() => {
            if (panel) panel.classList.remove('is-loading');
        });
}

function updateProfessionChart(filterType, filterValue) {
    updateChartData('profession-chart', '/api/profession-chart', filterType, filterValue, professionChartConfig);
}

function updateEducationChart(filterType, filterValue) {
    updateChartData('education-chart', '/api/education-chart', filterType, filterValue, educationChartConfig);
}

function initializeNewCharts() {
    if (typeof initializeLoanCharts === 'function') initializeLoanCharts();
    if (typeof initializeDigitalTimeChart === 'function') initializeDigitalTimeChart();

    document.addEventListener('applyDashboardFilter', (e) => {
        const { filterType, filterValue } = e.detail;
        console.log(`Applying filter: ${filterType} = ${filterValue}`);
        updateLoanPanel(filterType, filterValue);
        updateLoanPurposeChart(filterType, filterValue);
        updateDigitalTimeChart(filterType, filterValue);
        updateProfessionChart(filterType, filterValue);
        updateEducationChart(filterType, filterValue);
    });

    document.addEventListener('resetDashboardFilter', () => {
        console.log('Resetting all filters');
        updateLoanPanel(null, null);
        updateLoanPurposeChart(null, null);
        updateDigitalTimeChart(null, null);
        updateProfessionChart(null, null);
        updateEducationChart(null, null);
    });
}