// static/js/new_charts_animations.js

// --- UTILITY FUNCTIONS (Moved from chart-styler.js for accessibility) ---

/**
 * A helper function to read a CSS variable value from the root element.
 * @param {string} variable - The name of the CSS variable (e.g., '--chart-income').
 * @returns {string} The computed value of the variable.
 */
function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
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


// --- CHART RENDERING FUNCTIONS (Updated with correct layout and styling calls) ---

function renderProfessionChart(chartData, category) {
    const chartDiv = document.getElementById('profession-chart');
    if (!chartDiv) return;

    // Handle case where there is no data for the filter
    if (!chartData || !chartData.categories || chartData.categories.length === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content" style="display:flex; flex-direction: column; align-items:center; justify-content:center; height:100%;"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2" style="font-size:0.8rem; text-align:center;">No Data for<br>${category}</h6></div>`;
        return;
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
                name: standing,
                x: chartData.categories,
                y: values,
                type: 'bar',
                // Temporarily assign a color, styleStackedBarChart will override it
                marker: { color: '#bdc3c7', line: { color: 'rgba(255,255,255,0.5)', width: 1 } },
                hovertext: hover_text,
                hoverinfo: 'text',
                text: values.map(v => v > 8 ? `${Math.round(v)}%` : ''),
                textposition: 'inside',
                textfont: { size: 8, color: 'white' }
            });
        }
    });

    // UPDATED: Use the exact layout from python to maintain size and fonts
    const layout = {
        title: { text: "💼<b>Employment vs<br>Financial Standing(%)</b>", x: 0.5, xanchor: "center", y: 0.98, yanchor: "top", pad: { t: 5 }, font: { size: 14, color: "#2c3e50", family: "Stack Sans Notch, sans-serif" } },
        xaxis: { tickfont: { size: 8, color: "#34495e" }, showgrid: false, tickangle: -45 },
        yaxis: { tickfont: { size: 8, color: "#34495e" }, gridcolor: "rgba(189, 195, 199, 0.2)", range: [0, 100] },
        barmode: "stack", template: "plotly_white", height: 294, width: 188, showlegend: false,
        margin: { l: 20, r: 28, t: 48, b: 40 },
        hoverlabel: { bgcolor: "white", font_size: 10 }
    };

    // Use Plotly.react and then apply styling
    Plotly.react(chartDiv, traces, layout, { displayModeBar: false, responsive: true })
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
                name: standing,
                x: abbreviated_cats,
                y: values,
                type: 'bar',
                marker: { color: '#bdc3c7', line: { color: 'rgba(255,255,255,0.5)', width: 1 } },
                hovertext: hover_text,
                hoverinfo: 'text',
                text: values.map(v => v > 8 ? `${Math.round(v)}%` : ''),
                textposition: 'inside',
                textfont: { size: 8, color: 'white' }
            });
        }
    });

    // UPDATED: Use the exact layout from python to maintain size and fonts
    const layout = {
        title: { text: "<b>🎓 Education vs<br>Financial Standing (%)</b>", x: 0.5, xanchor: "center", y: 0.98, yanchor: "top", pad: { t: 4 }, font: { size: 14, color: "#2c3e50", family: "Stack Sans Notch, sans-serif" } },
        xaxis: { tickfont: { size: 8, color: "#34495e" }, showgrid: false, tickangle: -45 },
        yaxis: { tickfont: { size: 8, color: "#34495e" }, gridcolor: "rgba(189, 195, 199, 0.2)", range: [0, 100] },
        barmode: "stack", template: "plotly_white", height: 294, width: 188, showlegend: false,
        margin: { l: 20, r: 28, t: 48, b: 40 },
        hoverlabel: { bgcolor: "white", font_size: 10 }
    };

    Plotly.react(chartDiv, traces, layout, { displayModeBar: false, responsive: true })
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


// --- MAIN INITIALIZATION LOGIC (Updated to call new filter functions) ---

function initializeNewCharts() {
    console.log('Initializing new charts...');

    // Initialize all the charts
    if (typeof initializeLoanCharts === 'function') {
        initializeLoanCharts();
    }
    if (typeof initializeDigitalTimeChart === 'function') {
        initializeDigitalTimeChart();
    }

    // Set up a listener for the filter changes from the main diverging bar chart
    document.addEventListener('categoryFiltered', (e) => {
        const category = e.detail.category;
        console.log('Category filter changed event detected in new charts:', category);

        if (typeof updateLoanPanel === 'function') {
            updateLoanPanel(category);
        }
        if (typeof updateLoanPurposeChart === 'function') {
            updateLoanPurposeChart(category);
        }
        if (typeof updateDigitalTimeChart === 'function') {
            updateDigitalTimeChart(category);
        }
        // ADDED: Update profession and education charts
        if (typeof updateProfessionChart === 'function') {
            updateProfessionChart(category);
        }
        if (typeof updateEducationChart === 'function') {
            updateEducationChart(category);
        }
    });

    // We also need to handle the reset event
    document.addEventListener('categoryFilterReset', () => {
        console.log('Category filter reset event detected in new charts');

        if (typeof updateLoanPanel === 'function') {
            updateLoanPanel(null);
        }
        if (typeof updateLoanPurposeChart === 'function') {
            updateLoanPurposeChart(null);
        }
        if (typeof updateDigitalTimeChart === 'function') {
            updateDigitalTimeChart(null);
        }
        // ADDED: Reset profession and education charts
        if (typeof updateProfessionChart === 'function') {
            updateProfessionChart(null);
        }
        if (typeof updateEducationChart === 'function') {
            updateEducationChart(null);
        }
    });
}