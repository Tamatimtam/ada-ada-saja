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


// --- CHART RENDERING FUNCTIONS ---
function renderProfessionChart(chartData, category) {
    const chartDiv = document.getElementById('profession-chart');
    if (!chartDiv) return;

    if (!chartData || !chartData.categories || chartData.categories.length === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content" style="display:flex; flex-direction: column; align-items:center; justify-content:center; height:100%;"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2" style="font-size:0.8rem; text-align:center;">No Data for<br>${category}</h6></div>`;
        return;
    }

    // If the placeholder was visible, clear it before drawing the chart
    if (chartDiv.querySelector('.placeholder-content')) {
        chartDiv.innerHTML = '';
    }

    const traces = [];
    const standings = ["Surplus", "Break-even", "Deficit"];

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
                name: standing, x: chartData.categories, y: values, type: 'bar',
                hovertext: hover_text, hoverinfo: 'text',
                text: values.map(v => v > 8 ? `${Math.round(v)}%` : ''),
                textposition: 'inside', textfont: { size: 8, color: 'white' }
            });
        }
    });

    const layout = {
        title: { text: "💼<b>Employment vs<br>Financial Standing(%)</b>", x: 0.5, xanchor: "center", y: 0.98, yanchor: "top", pad: { t: 5 }, font: { size: 14, color: "#2c3e50", family: "Stack Sans Notch, sans-serif" } },
        xaxis: { tickfont: { size: 8, color: "#34495e" }, showgrid: false, tickangle: -45 },
        yaxis: { tickfont: { size: 8, color: "#34495e" }, gridcolor: "rgba(189, 195, 199, 0.2)", range: [0, 100] },
        barmode: "stack", template: "plotly_white", height: 264, width: 188, showlegend: false,
        margin: { l: 20, r: 28, t: 48, b: 40 },
        hoverlabel: { bgcolor: "white", font_size: 10 }
    };

    const transitionConfig = { duration: 800, easing: 'cubic-in-out' };

    // Use Plotly.animate to smoothly transition the chart data and layout
    Plotly.animate(chartDiv, { data: traces, layout: layout }, transitionConfig)
        .then(() => {
            styleStackedBarChart('profession-chart');
        });
}

function renderEducationChart(chartData, category) {
    const chartDiv = document.getElementById('education-chart');
    if (!chartDiv) return;

    if (!chartData || !chartData.categories || chartData.categories.length === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content" style="display:flex; flex-direction: column; align-items:center; justify-content:center; height:100%;"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2" style="font-size:0.8rem; text-align:center;">No Data for<br>${category}</h6></div>`;
        return;
    }

    // If the placeholder was visible, clear it before drawing the chart
    if (chartDiv.querySelector('.placeholder-content')) {
        chartDiv.innerHTML = '';
    }

    const traces = [];
    const standings = ["Surplus", "Break-even", "Deficit"];

    const abbreviated_cats = chartData.categories.map(cat => {
        if (cat.length > 15) {
            if (cat.includes("Bachelor")) return "Bachelor/D4";
            if (cat.includes("Diploma I")) return "Diploma I-III";
            if (cat.includes("Senior High")) return "High School";
            if (cat.includes("Junior High")) return "Junior High";
            if (cat.includes("Elementary")) return "Elementary";
            if (cat.includes("Postgraduate")) return "Postgrad";
            return cat.substring(0, 15);
        }
        return cat;
    });

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
                name: standing, x: abbreviated_cats, y: values, type: 'bar',
                hovertext: hover_text, hoverinfo: 'text',
                text: values.map(v => v > 8 ? `${Math.round(v)}%` : ''),
                textposition: 'inside', textfont: { size: 8, color: 'white' }
            });
        }
    });

    const layout = {
        title: { text: "<b>🎓 Education vs<br>Financial Standing (%)</b>", x: 0.5, xanchor: "center", y: 0.98, yanchor: "top", pad: { t: 4 }, font: { size: 14, color: "#2c3e50", family: "Stack Sans Notch, sans-serif" } },
        xaxis: { tickfont: { size: 8, color: "#34495e" }, showgrid: false, tickangle: -45 },
        yaxis: { tickfont: { size: 8, color: "#34495e" }, gridcolor: "rgba(189, 195, 199, 0.2)", range: [0, 100] },
        barmode: "stack", template: "plotly_white", height: 264, width: 188, showlegend: false,
        margin: { l: 20, r: 28, t: 48, b: 40 },
        hoverlabel: { bgcolor: "white", font_size: 10 }
    };

    const transitionConfig = { duration: 800, easing: 'cubic-in-out' };

    Plotly.animate(chartDiv, { data: traces, layout: layout }, transitionConfig)
        .then(() => {
            styleStackedBarChart('education-chart');
        });
}


function updateProfessionChart(category) {
    const categoryParam = category || 'All';
    fetch(`/api/profession-chart/${encodeURIComponent(categoryParam)}`)
        .then(response => response.json())
        .then(data => renderProfessionChart(data, categoryParam));
}

function updateEducationChart(category) {
    const categoryParam = category || 'All';
    fetch(`/api/education-chart/${encodeURIComponent(categoryParam)}`)
        .then(response => response.json())
        .then(data => renderEducationChart(data, categoryParam));
}


// --- MAIN INITIALIZATION LOGIC ---
function initializeNewCharts() {
    console.log('Initializing new charts...');

    if (typeof initializeLoanCharts === 'function') {
        initializeLoanCharts();
    }
    if (typeof initializeDigitalTimeChart === 'function') {
        initializeDigitalTimeChart();
    }

    document.addEventListener('categoryFiltered', (e) => {
        const category = e.detail.category;
        console.log('Category filter changed:', category);

        updateLoanPanel(category);
        updateLoanPurposeChart(category);
        updateDigitalTimeChart(category);
        updateProfessionChart(category);
        updateEducationChart(category);
    });

    document.addEventListener('categoryFilterReset', () => {
        console.log('Category filter reset');

        updateLoanPanel(null);
        updateLoanPurposeChart(null);
        updateDigitalTimeChart(null);
        updateProfessionChart(null);
        updateEducationChart(null);
    });
}