// static/js/components/loan_panel.js

/**
 * A helper function to read a CSS variable value from the root element.
 * @param {string} variable - The name of the CSS variable (e.g., '--chart-income').
 * @returns {string} The computed value of the variable.
 */
function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

function formatCurrency(amount) {
    if (!amount || amount === 0) return 'Rp 0';
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(1)}K`;
    return `Rp ${amount.toFixed(0)}`;
}

function updateKPICard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = value;
}

function renderLoanChart(data) {
    const chartDiv = document.getElementById('loan-overview-chart');
    if (!chartDiv) return;

    const distribution = data.distribution || [];
    const categories = distribution.map(d => d.category);
    const percentages = distribution.map(d => d.percentage);
    const counts = distribution.map(d => d.count);

    const colorMapping = {
        'No Loan': getCssVariable('--chart-loan-no-loan'),
        '<5M': getCssVariable('--chart-loan-tier-1'),
        '5M-10M': getCssVariable('--chart-loan-tier-2'),
        '10M-15M': getCssVariable('--chart-loan-tier-3'),
        '>15M': getCssVariable('--chart-loan-tier-4')
    };
    const colors = categories.map(cat => colorMapping[cat] || '#95a5a6');

    const totalWithLoans = distribution.filter(d => d.category !== 'No Loan').reduce((sum, d) => sum + d.count, 0);
    const filterText = data.filter_applied && data.filter_applied !== 'All' ? ` (${totalWithLoans} borrowers in ${data.filter_applied})` : ` (${totalWithLoans} borrowers)`;
    const centerText = data.filter_applied && data.filter_applied !== 'All' ? `<b style="font-size:12px">${data.with_loan}</b><br><span style='font-size:8px;color:#7f8c8d'>with loans</span><br><span style='font-size:8px;color:#95a5a6'>in ${data.filter_applied}</span>` : `<b style="font-size:12px">${data.with_loan}</b><br><span style='font-size:8px;color:#7f8c8d'>with loans</span>`;

    const chartData = [{
        labels: categories,
        values: percentages,
        hole: 0.60,
        type: 'pie',
        marker: { colors: colors, line: { color: '#ffffff', width: 2 } },
        textposition: 'inside',
        textfont: { size: 8, color: '#ffffff', family: 'Outfit, sans-serif', weight: 'bold' },
        hovertemplate: '<b>%{label}</b><br>%{value:.1f}% (%{customdata} people)<extra></extra>',
        customdata: counts,
        direction: 'clockwise',
        sort: false
    }];

    const layout = {
        title: { text: `<b>💳 Outstanding Loan<br>Distribution${filterText}</b>`, x: 0.5, xanchor: 'center', font: { size: 8, color: '#2c3e50', family: 'Outfit, sans-serif' } },
        annotations: [{ text: centerText, x: 0.5, y: 0.5, font: { size: 7, family: 'Outfit, sans-serif' }, showarrow: false }],
        showlegend: false,
        legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center', font: { size: 4 }, itemwidth: 5, itemheight: 5, tracegroupgap: 2, itemsizing: 'constant', bgcolor: 'transparent', valign: 'top', traceorder: 'normal' },
        margin: { l: 15, r: 15, t: 35, b: 5 },
        paper_bgcolor: 'white',
        height: 140, width: 140,
        template: 'plotly_white'
    };

    // UPDATED: Use Plotly.animate for smooth transitions on updates
    const transitionConfig = {
        duration: 800,
        easing: 'cubic-in-out'
    };

    if (chartDiv.data) {
        Plotly.animate(chartDiv, { data: chartData, layout: layout }, transitionConfig);
    } else {
        Plotly.newPlot(chartDiv, chartData, layout, { displayModeBar: false, responsive: true });
    }
}

function renderLoanPurposeChart(data, category) {
    const chartDiv = document.getElementById('loan-purpose-chart');
    if (!chartDiv) return;

    if (!data || data.length === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2">No Loan Purpose Data</h6></div>`;
        return;
    }

    const labels = data.map(d => d.purpose);
    const emojis = data.map(d => d.icon);
    const counts = data.map(d => d.count);
    const percentages = data.map(d => d.percentage);
    const colors = data.map(d => d.color);
    const totalCount = counts.reduce((a, b) => a + b, 0);
    const titleText = category && category !== 'All' ? `Loan Usage (${totalCount} borrowers in ${category})` : `Loan Usage Purpose (${totalCount} borrowers)`;

    const pieTrace = {
        values: percentages,
        type: 'pie',
        domain: { x: [0, 0.35], y: [0.15, 0.95] },
        marker: { colors: colors, line: { color: '#ffffff', width: 1.5 } },
        textposition: 'inside', textinfo: 'percent', textfont: { size: 9, color: '#ffffff', weight: 'bold' },
        automargin: true, insidetextorientation: 'auto',
        hovertemplate: '<b>%{label}</b><br>%{value:.1f}%<br>(%{customdata} borrowers)<extra></extra>',
        customdata: counts, showlegend: false
    };

    pieTrace.labels = labels; // Ensure labels are set for animation

    const barTrace = {
        y: emojis, x: counts, type: 'bar', orientation: 'h', xaxis: 'x2', yaxis: 'y2',
        marker: { color: colors, line: { color: '#ffffff', width: 1 } },
        textposition: 'outside', textfont: { size: 7 },
        hovertemplate: '<b>%{y}</b><br>Count: %{x}<extra></extra>', width: 0.6
    };

    const layout = {
        title: { text: `<b>🎯 ${titleText}</b>`, x: 0.5, xanchor: 'center', font: { size: 8 } },
        height: 140, width: 220, template: 'plotly_white', margin: { l: 1, r: 12, t: 30, b: 0 }, showlegend: false,
        xaxis2: { domain: [0.50, 1], anchor: 'y2', showgrid: true, range: [0, Math.max(...counts) * 1.15], tickfont: { size: 7 } },
        yaxis2: { domain: [0, 1], anchor: 'x2', autorange: 'reversed', showgrid: false, tickfont: { size: 7 } }
    };

    const chartTraces = [pieTrace, barTrace];

    // UPDATED: Use Plotly.animate for smooth transitions
    const transitionConfig = {
        duration: 800,
        easing: 'cubic-in-out'
    };

    if (chartDiv.data) {
        Plotly.animate(chartDiv, { data: chartTraces, layout: layout }, transitionConfig);
    } else {
        Plotly.newPlot(chartDiv, chartTraces, layout, { displayModeBar: false, responsive: true });
    }
}

function updateLoanPanel(category) {
    const categoryParam = category || 'All';
    fetch(`/api/loan-filtered/${encodeURIComponent(categoryParam)}`)
        .then(response => response.json())
        .then(data => {
            updateKPICard('loan-total-value', data.with_loan);
            updateKPICard('loan-total-subtext', `${data.with_loan_pct}% of ${data.total_respondents} respondents`);
            updateKPICard('loan-avg-value', formatCurrency(data.mean));
            updateKPICard('loan-third-label', 'Total Outstanding');
            updateKPICard('loan-third-value', formatCurrency(data.total_outstanding));
            updateKPICard('loan-third-subtext', category && category !== 'All' ? `In ${category}` : 'Sum of all loans');
            updateKPICard('loan-max-value', formatCurrency(data.max));
            renderLoanChart(data);
        });
}

function updateLoanPurposeChart(category) {
    const categoryParam = category || 'All';
    fetch(`/api/loan-purpose/${encodeURIComponent(categoryParam)}`)
        .then(response => response.json())
        .then(data => renderLoanPurposeChart(data, category));
}

function initializeLoanCharts() {
    updateLoanPanel(null);
    updateLoanPurposeChart(null);
}