// static/js/components/loan_panel.js

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

    const colorMapping = { 'No Loan': '#27ae60', '<5M': '#ffb3ba', '5M-10M': '#ff8a8a', '10M-15M': '#ff5757', '>15M': '#e74c3c' };
    const colors = categories.map(cat => colorMapping[cat] || '#95a5a6');

    const totalWithLoans = distribution.filter(d => d.category !== 'No Loan').reduce((sum, d) => sum + d.count, 0);
    const filterText = data.filter_applied && data.filter_applied !== 'All' ? ` (${totalWithLoans} borrowers in ${data.filter_applied})` : ` (${totalWithLoans} borrowers)`;
    const centerText = data.filter_applied && data.filter_applied !== 'All' ? `<b style="font-size:22px">${data.with_loan}</b><br><span style='font-size:12px;color:#7f8c8d'>with loans</span><br><span style='font-size:10px;color:#95a5a6'>in ${data.filter_applied}</span>` : `<b style="font-size:22px">${data.with_loan}</b><br><span style='font-size:12px;color:#7f8c8d'>with loans</span>`;

    const chartData = [{
        labels: categories,
        values: percentages,
        hole: 0.60,
        type: 'pie',
        marker: { colors: colors, line: { color: '#ffffff', width: 2 } },
        textposition: 'outside',
        textfont: { size: 11, color: '#2c3e50' },
        hovertemplate: '<b>%{label}</b><br>%{value:.1f}% (%{customdata} people)<extra></extra>',
        customdata: counts,
        direction: 'clockwise',
        sort: false
    }];

    const layout = {
        title: { text: `<b>💳 Outstanding Loan Distribution${filterText}</b>`, x: 0.5, xanchor: 'center', font: { size: 12, color: '#2c3e50' } },
        annotations: [{ text: centerText, x: 0.5, y: 0.5, font: { size: 12 }, showarrow: false }],
        showlegend: true,
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.08, yanchor: 'top', font: { size: 7 } },
        margin: { l: 25, r: 70, t: 35, b: 35 },
        paper_bgcolor: 'white',
        height: 240,
        template: 'plotly_white'
    };

    Plotly.newPlot(chartDiv, chartData, layout, { displayModeBar: false, responsive: true });
}

function renderLoanPurposeChart(data, category) {
    const chartDiv = document.getElementById('loan-purpose-chart');
    if (!chartDiv) return;

    if (!data || data.length === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2">No Loan Purpose Data</h6></div>`;
        return;
    }

    // Clean, consistent labels
    const labels = data.map(d => d.purpose);                 // For pie (no emoji to avoid clutter)
    const purposesWithIcons = data.map(d => `${d.icon} ${d.purpose}`); // For bar
    const counts = data.map(d => d.count);
    const percentages = data.map(d => d.percentage);
    const colors = data.map(d => d.color);
    const totalCount = counts.reduce((a, b) => a + b, 0);
    const titleText = category && category !== 'All' ? `Loan Usage (${totalCount} borrowers in ${category})` : `Loan Usage Purpose (${totalCount} borrowers)`;

    const pieTrace = {
        values: percentages,
        labels: labels,
        type: 'pie',
        // Reduce pie size - smaller domain
        domain: { x: [0, 0.35], y: [0.15, 0.95] },
        marker: { colors: colors, line: { color: '#ffffff', width: 1.5 } },
        textposition: 'outside',
        textinfo: 'label+percent',
        textfont: { size: 9, color: '#2c3e50' },
        automargin: true,
        insidetextorientation: 'auto',
        hovertemplate: '<b>%{label}</b><br>%{value:.1f}%<br>(%{customdata} borrowers)<extra></extra>',
        customdata: counts,
        showlegend: false
    };

    const barTrace = {
        y: purposesWithIcons,
        x: counts,
        type: 'bar',
        orientation: 'h',
        xaxis: 'x2',
        yaxis: 'y2',
        marker: { color: colors, line: { color: '#ffffff', width: 0.5 } },
        text: counts.map(c => `${c}`), textposition: 'outside', textfont: { size: 9 },
        hovertemplate: '<b>%{y}</b><br>Count: %{x}<extra></extra>', width: 0.5,
        cliponaxis: false
    };

    const layout = {
        title: { text: `<b>🎯 ${titleText}</b>`, x: 0.5, xanchor: 'center', font: { size: 13 } },
        height: 240,
        template: 'plotly_white',
        margin: { l: 12, r: 35, t: 35, b: 20 },
        showlegend: false,
        xaxis2: {
            domain: [0.35, 1],
            anchor: 'y2',
            showgrid: false,
            range: [0, Math.ceil(Math.max(...counts) * 1.15)]
        },
        yaxis2: {
            domain: [0, 1],
            anchor: 'x2',
            showgrid: false,
            tickfont: { size: 8 },
            side: 'right',
            categoryorder: 'array',
            categoryarray: purposesWithIcons
        }
    };

    Plotly.newPlot(chartDiv, [pieTrace, barTrace], layout, { displayModeBar: false, responsive: true });
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
