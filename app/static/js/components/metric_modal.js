// static/js/components/metric_modal.js

/**
 * A helper function to read a CSS variable value from the root element.
 * @param {string} variable - The name of the CSS variable (e.g., '--chart-income').
 * @returns {string} The computed value of the variable.
 */
function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

function initMetricModal() { // REMOVED metricsData parameter
    const modal = document.getElementById('metric-modal');
    const modalTitleEl = document.getElementById('metric-modal-title');
    const modalSubtitleEl = document.getElementById('metric-modal-subtitle');
    const modalBody = document.getElementById('metric-modal-body');
    const modalClose = document.getElementById('metric-modal-close');
    const detailContainer = document.getElementById('metric-modal-detail');
    const questionTextEl = document.getElementById('metric-question-text');
    const chartContainer = document.getElementById('metric-distribution-chart');

    const kpiCards = document.querySelectorAll('.card-knowledge, .card-behavior, .card-wellbeing');

    if (!modal || !kpiCards.length) {
        console.warn('Metric modal or KPI cards not found. Skipping initialization.');
        return;
    }

    gsap.set(detailContainer, { height: 0, opacity: 0, marginTop: 0, paddingTop: 0 });

    // --- Event Listeners ---
    kpiCards.forEach(card => {
        card.addEventListener('click', () => {
            const metricKeys = card.dataset.metrics.split(',');
            populateAndShowModal(metricKeys);
        });
    });

    modalClose.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    modalBody.addEventListener('click', handleCircleClick);

    // --- Functions ---
    async function populateAndShowModal(metricKeys) {
        modalBody.innerHTML = '<div class="metric-modal-loader">Loading...</div>'; // Show loader
        showModal(); // Show modal structure immediately

        const currentFilter = window.activeDashboardFilter;
        let url;
        let cardTitle = "Metric"; // Default

        // --- MODIFICATION START ---
        // Map for user-friendly filter labels
        const filterLabels = {
            employment_status: "Pekerjaan",
            education_level: "Pendidikan",
            gender: "Gender",
            birth_year: "Usia"
        };

        if (currentFilter) {
            const { by, value } = currentFilter;
            const filterLabel = filterLabels[by] || by.replace('_', ' '); // Get friendly label or format the key
            url = `/api/metrics-deep-dive/filtered/${encodeURIComponent(by)}/${encodeURIComponent(normalizeFilterValue(by, value))}`;
            modalSubtitleEl.textContent = `Menampilkan hasil survei untuk ${filterLabel}: ${value}`;
        } else {
            url = '/api/metrics-deep-dive/unfiltered';
            modalSubtitleEl.textContent = 'Menampilkan hasil survei untuk seluruh responden.';
        }
        // --- MODIFICATION END ---


        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch modal data');
            const metricsData = await response.json();

            // Set the main title based on the first metric's group title
            if (metricsData && metricsData[metricKeys[0]]) {
                cardTitle = metricsData[metricKeys[0]].title;
            }
            modalTitleEl.textContent = `${cardTitle} Deep Dive`;

            modalBody.innerHTML = ''; // Clear loader

            metricKeys.forEach(key => {
                const metric = metricsData[key];
                if (metric) {
                    const groupEl = document.createElement('div');
                    groupEl.className = 'metric-group';
                    const circlesHTML = metric.questions.map(q => `
                        <div class="question-circle ${q.is_negative ? 'is-negative' : ''}" 
                             data-question-id="${q.id}"
                             data-question-text="${q.text}">
                             ${q.number}
                        </div>
                    `).join('');

                    groupEl.innerHTML = `
                        <div class="metric-header">
                            <h3 class="metric-title">${key}</h3>
                            <div class="metric-progress-bar-container">
                                <div class="metric-progress-bar" style="width: ${metric.score}%;"></div>
                                <span class="metric-score-label">${metric.score}</span>
                            </div>
                        </div>
                        <div class="question-circles">${circlesHTML}</div>
                    `;
                    modalBody.appendChild(groupEl);
                }
            });
            gsap.set(detailContainer, { height: 0, opacity: 0, marginTop: 0, paddingTop: 0 });
            questionTextEl.textContent = '';
            chartContainer.innerHTML = '';
        } catch (error) {
            console.error('Error populating modal:', error);
            modalBody.innerHTML = '<p style="color:red; text-align:center;">Could not load data.</p>';
        }
    }

    function showModal() {
        modal.style.display = 'flex';
        gsap.to(modal, { opacity: 1, duration: 0.3 });
        gsap.to('.metric-modal-content', { scale: 1, duration: 0.3, delay: 0.1 });
        modal.style.pointerEvents = 'auto';
    }

    function hideModal() {
        gsap.to('.metric-modal-content', { scale: 0.95, duration: 0.3 });
        gsap.to(modal, {
            opacity: 0, duration: 0.3, delay: 0.1,
            onComplete: () => { modal.style.display = 'none'; modal.style.pointerEvents = 'none'; }
        });
    }

    async function handleCircleClick(e) {
        const circle = e.target.closest('.question-circle');
        if (!circle) return;

        const questionId = circle.dataset.questionId;
        const questionText = circle.dataset.questionText;

        document.querySelectorAll('.question-circle.active').forEach(c => c.classList.remove('active'));
        if (circle.classList.contains('active-question')) {
            circle.classList.remove('active-question');
            hideDetailView();
            return;
        }

        circle.classList.add('active', 'active-question');

        try {
            const currentFilter = window.activeDashboardFilter;
            let url = `/api/question-distribution/${questionId}`;
            if (currentFilter) {
                const safeValue = normalizeFilterValue(currentFilter.by, currentFilter.value);
                url += `?filter_by=${encodeURIComponent(currentFilter.by)}&filter_value=${encodeURIComponent(safeValue)}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch distribution data');
            const data = await response.json();

            questionTextEl.textContent = `"${questionText}"`;
            renderDistributionChart(data.distribution, data.most_common);
            showDetailView();

        } catch (error) {
            console.error('Error handling circle click:', error);
            chartContainer.innerHTML = `<p style="color: red; text-align: center;">Could not load chart data.</p>`;
            showDetailView();
        }
    }

    function renderDistributionChart(distribution, mostCommon) {
        const labels = Object.keys(distribution).map(Number).sort(); // Ensure labels are numeric and sorted
        const values = labels.map(label => distribution[String(label)] || 0);

        // Define colors from CSS variables for consistency
        const highlightColor = getCssVariable('--modal-chart-highlight') || '#1ba991';
        const baseColor = '#dfe4ea'; // A lighter, more subtle base color

        const colors = labels.map(label => String(label) === mostCommon ? highlightColor : baseColor);
        const barBorders = labels.map(label => String(label) === mostCommon ? highlightColor : '#adb5bd');

        const trace = {
            x: labels,
            y: values,
            type: 'bar',
            text: values.map(v => `<b>${v}</b>`), // Make text bold
            textposition: 'outside',
            textfont: {
                size: 11,
                color: '#495057', // Darker text for better contrast
                family: 'Outfit, sans-serif'
            },
            marker: {
                color: colors,
                line: {
                    color: barBorders,
                    width: 1.5
                }
            },
            // Custom hover tooltip for a richer experience
            hovertemplate: 'Jawaban "<b>%{x}</b>"<br>Jumlah Responden: <b>%{y}</b><extra></extra>'
        };

        const layout = {
            title: {
                text: '<b>Distribusi Jawaban Responden</b>',
                font: {
                    size: 16,
                    family: 'Stack Sans Notch, sans-serif',
                    color: '#3A4150'
                },
                y: 0.95 // Adjust title position
            },
            xaxis: {
                title: 'Pilihan Jawaban (1=Sangat Tidak Setuju, 4=Sangat Setuju)',
                tickmode: 'array',
                tickvals: [1, 2, 3, 4], // Force whole number ticks
                ticktext: ['1', '2', '3', '4'],
                zeroline: false,
                showgrid: false,
                tickfont: {
                    size: 12,
                    family: 'Outfit, sans-serif'
                },
                titlefont: {
                    size: 10,
                    color: '#8C93A0'
                }
            },
            yaxis: {
                showticklabels: false, // Hide Y-axis numbers
                showgrid: false,
                zeroline: false,
                showline: false,
                title: null, // Remove Y-axis title
                range: [0, Math.max(...values) * 1.25] // Add padding for outside text
            },
            bargap: 0.25,
            height: 200, // Increased height for better spacing
            margin: { t: 40, b: 40, l: 10, r: 10 },
            template: 'plotly_white',
            paper_bgcolor: 'transparent', // Transparent background
            plot_bgcolor: 'transparent',
            hoverlabel: {
                bgcolor: "#3A4150",
                font: {
                    size: 12,
                    color: 'white',
                    family: 'Outfit, sans-serif'
                }
            }
        };

        Plotly.newPlot(chartContainer, [trace], layout, { displayModeBar: false, responsive: true });
    }

    function showDetailView() {
        gsap.to(detailContainer, { height: 'auto', opacity: 1, marginTop: 20, paddingTop: 20, duration: 0.4, ease: 'power2.out' });
    }

    function hideDetailView() {
        gsap.to(detailContainer, {
            height: 0, opacity: 0, marginTop: 0, paddingTop: 0, duration: 0.3, ease: 'power2.in',
            onComplete: () => { questionTextEl.textContent = ''; chartContainer.innerHTML = ''; }
        });
        document.querySelectorAll('.question-circle.active-question').forEach(c => c.classList.remove('active-question', 'active'));
    }
}