// static/js/components/loan_panel.js

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
        'No Loan': getCssVariable('--chart-loan-no-loan'), '<5M': getCssVariable('--chart-loan-tier-1'),
        '5M-10M': getCssVariable('--chart-loan-tier-2'), '10M-15M': getCssVariable('--chart-loan-tier-3'),
        '>15M': getCssVariable('--chart-loan-tier-4')
    };
    const colors = categories.map(cat => colorMapping[cat] || '#95a5a6');
    const totalWithLoans = distribution.filter(d => d.category !== 'No Loan').reduce((sum, d) => sum + d.count, 0);
    const filterText = data.filter_value && data.filter_value !== 'All' 
        ? ` (${totalWithLoans} borrowers in ${data.filter_value})` 
        : ` (${totalWithLoans} total borrowers)`;
    const centerText = data.filter_value && data.filter_value !== 'All' 
        ? `<b style="font-size:12px">${data.with_loan}</b><br><span style='font-size:8px;color:#7f8c8d'>with loans</span><br><span style='font-size:8px;color:#95a5a6'>in ${data.filter_value}</span>` 
        : `<b style="font-size:12px">${data.with_loan}</b><br><span style='font-size:8px;color:#7f8c8d'>with loans</span>`;
    
    const chartTitle = `<b>💳 Outstanding Loan Distribution</b><br><span style="font-size:9px; color:#7f8c8d;">${filterText}</span>`;

    const chartData = [{
        labels: categories, values: percentages, hole: 0.60, type: 'pie',
        marker: { colors: colors, line: { color: '#ffffff', width: 2 } },
        textposition: 'inside', textfont: { size: 8, color: '#ffffff', family: 'Outfit, sans-serif', weight: 'bold' },
        hovertemplate: '<b>%{label}</b><br>%{value:.1f}% (%{customdata} people)<extra></extra>',
        customdata: counts, direction: 'clockwise', sort: false
    }];

    const layout = {
        title: { text: chartTitle, x: 0.5, xanchor: 'center', font: { size: 8, color: '#2c3e50', family: 'Outfit, sans-serif' } },
        annotations: [{ text: centerText, x: 0.5, y: 0.5, font: { size: 7, family: 'Outfit, sans-serif' }, showarrow: false }],
        showlegend: false, margin: { l: 15, r: 15, t: 35, b: 5 }, paper_bgcolor: 'white',
        height: 140, width: 140, template: 'plotly_white'
    };

    Plotly.react(chartDiv, chartData, layout, { displayModeBar: false, responsive: true });
    renderLegend('loan-overview-legend', categories, colorMapping);
}

function renderLoanPurposeChart(data, filterType, filterValue) {
    const chartDiv = document.getElementById('loan-purpose-chart');
    if (!chartDiv) return;

    if (!data || data.length === 0) {
        chartDiv.innerHTML = `<div class="placeholder-content" style="height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:8px;"><i class="fas fa-info-circle fa-2x text-muted"></i><h6 class="mt-2" style="font-size:0.7rem; text-align:center;">No Loan Purpose Data</h6></div>`;
        return;
    }
    if (chartDiv.querySelector('.placeholder-content')) chartDiv.innerHTML = '';
    
    const labels = data.map(d => d.purpose); const emojis = data.map(d => d.icon);
    const counts = data.map(d => d.count); const percentages = data.map(d => d.percentage);
    const colors = data.map(d => d.color); const totalCount = counts.reduce((a, b) => a + b, 0);

    const filterText = filterValue && filterValue !== 'All' 
        ? `(${totalCount} borrowers in ${filterValue})` 
        : `(${totalCount} total borrowers)`;
    const titleText = `Loan Usage ${filterText}`;
    
    const pieTrace = {
        values: percentages, labels: labels, type: 'pie', domain: { x: [0, 0.35], y: [0.15, 0.95] },
        marker: { colors: colors, line: { color: '#ffffff', width: 1.5 } }, textposition: 'inside', textinfo: 'percent',
        textfont: { size: 9, color: '#ffffff', weight: 'bold' }, automargin: true, insidetextorientation: 'auto',
        hovertemplate: '<b>%{label}</b><br>%{value:.1f}%<br>(%{customdata} borrowers)<extra></extra>',
        customdata: counts, showlegend: false
    };
    const barTrace = {
        y: emojis, x: counts, type: 'bar', orientation: 'h', xaxis: 'x2', yaxis: 'y2',
        marker: { color: colors, line: { color: '#ffffff', width: 1 } }, textposition: 'outside',
        textfont: { size: 7 }, hovertemplate: '<b>%{y}</b><br>Count: %{x}<extra></extra>', width: 0.6
    };
    const layout = {
        title: { text: `<b>🎯 ${titleText}</b>`, x: 0.5, xanchor: 'center', font: { size: 8 } },
        height: 140, width: 220, template: 'plotly_white', margin: { l: 1, r: 12, t: 30, b: 20 }, showlegend: false,
        xaxis2: { title: { text: 'Count', font: { size: 8 } }, domain: [0.50, 1], anchor: 'y2', showgrid: true, range: [0, Math.max(...counts) * 1.15], tickfont: { size: 7 } },
        yaxis2: { domain: [0, 1], anchor: 'x2', autorange: 'reversed', showgrid: false, tickfont: { size: 7 } }
    };
    Plotly.react(chartDiv, [pieTrace, barTrace], layout, { displayModeBar: false, responsive: true });
    const purposeColorMapping = data.reduce((acc, item) => { acc[item.purpose] = item.color; return acc; }, {});
    renderLegend('loan-purpose-legend', labels, purposeColorMapping);
}

function updateLoanPanel(filterType, filterValue) {
    const kpiContainer = document.querySelector('.loan-kpi-cards');
    const chartContainer = document.querySelector('#loan-overview-chart').parentElement;
    const titleEl = document.getElementById('loan-overview-title');
    if (kpiContainer) kpiContainer.classList.add('is-loading');
    if (chartContainer) chartContainer.classList.add('is-loading');

    let url = '/api/loan-filtered';
    if (filterType && filterValue) {
        url += `?filter_type=${filterType}&filter_value=${encodeURIComponent(filterValue)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (titleEl) {
                if (data.filter_type && data.filter_value !== 'All') {
                    const typeText = data.filter_type.charAt(0).toUpperCase() + data.filter_type.slice(1);
                    titleEl.innerHTML = `<i class="fas fa-hand-holding-usd"></i> Outstanding Loan Overview
                    <br><small style="font-size: 0.7rem; color: #5E6573; font-weight: 500;">
                        ${data.total_respondents} Respondents for ${data.filter_value} (${typeText})
                    </small>`;
                } else {
                    titleEl.innerHTML = `<i class="fas fa-hand-holding-usd"></i> Outstanding Loan Overview`;
                }
            }
            
            // --- MODIFIED SECTION START ---
            // Update 'Total with Loans' KPI to show fraction
            const totalWithLoansValue = `${data.with_loan} / ${data.total_respondents}`;
            const totalWithLoansSubtext = `${data.with_loan_pct}% with loans`;
            updateKPICard('loan-total-value', totalWithLoansValue);
            updateKPICard('loan-total-subtext', totalWithLoansSubtext);
            // --- MODIFIED SECTION END ---

            // Update other KPI cards
            updateKPICard('loan-avg-value', formatCurrency(data.mean));
            updateKPICard('loan-third-label', 'Total Outstanding');
            updateKPICard('loan-third-value', formatCurrency(data.total_outstanding));
            updateKPICard('loan-third-subtext', filterValue && filterValue !== 'All' ? `In ${filterValue}` : 'Sum of all loans');
            updateKPICard('loan-max-value', formatCurrency(data.max));
            
            renderLoanChart(data);
        })
        .finally(() => {
            if (kpiContainer) kpiContainer.classList.remove('is-loading');
            if (chartContainer) chartContainer.classList.remove('is-loading');
        });
}

function updateLoanPurposeChart(filterType, filterValue) {
    const chartContainer = document.querySelector('#loan-purpose-chart').parentElement;
    if (chartContainer) chartContainer.classList.add('is-loading');

    let url = '/api/loan-purpose';
    if (filterType && filterValue) {
        url += `?filter_type=${filterType}&filter_value=${encodeURIComponent(filterValue)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => renderLoanPurposeChart(data, filterType, filterValue))
        .finally(() => {
            if (chartContainer) chartContainer.classList.remove('is-loading');
        });
}

function initializeLoanCharts() {
    updateLoanPanel(null, null);
    updateLoanPurposeChart(null, null);
}

function renderLegend(legendId, categories, colorMapping) {
    const legendContainer = document.getElementById(legendId);
    if (!legendContainer) return;
    legendContainer.innerHTML = categories.map(category => `
        <div class="legend-item">
            <span class="legend-color-box" style="background-color: ${colorMapping[category] || '#95a5a6'};"></span>
            <span class="legend-label">${category}</span>
        </div>
    `).join('');
}