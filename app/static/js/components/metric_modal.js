// static/js/components/metric_modal.js

function initMetricModal(metricsData) {
    const modal = document.getElementById('metric-modal');
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
    
    // Hide detail section initially
    gsap.set(detailContainer, { height: 0, opacity: 0, marginTop: 0, paddingTop: 0 });

    // --- Event Listeners ---
    kpiCards.forEach(card => {
        card.addEventListener('click', () => {
            const metricKeys = card.dataset.metrics.split(',');
            populateAndShowModal(metricKeys);
        });
    });

    modalClose.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    modalBody.addEventListener('click', handleCircleClick);

    // --- Functions ---
    function populateAndShowModal(metricKeys) {
        modalBody.innerHTML = ''; // Clear previous content

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
        
        // Hide detail section before showing
        gsap.set(detailContainer, { height: 0, opacity: 0, marginTop: 0, paddingTop: 0 });
        questionTextEl.textContent = '';
        chartContainer.innerHTML = '';
        
        showModal();
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
            opacity: 0,
            duration: 0.3,
            delay: 0.1,
            onComplete: () => {
                modal.style.display = 'none';
                modal.style.pointerEvents = 'none';
            }
        });
    }

    async function handleCircleClick(e) {
        const circle = e.target.closest('.question-circle');
        if (!circle) return;

        const questionId = circle.dataset.questionId;
        const questionText = circle.dataset.questionText;

        // Deactivate all other circles
        document.querySelectorAll('.question-circle.active').forEach(c => c.classList.remove('active'));
        
        // If clicking an active circle, close the detail view
        if (circle.classList.contains('active-question')) {
            circle.classList.remove('active-question');
            hideDetailView();
            return;
        }

        circle.classList.add('active', 'active-question');

        try {
            const response = await fetch(`/api/question-distribution/${questionId}`);
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
        const labels = Object.keys(distribution);
        const values = Object.values(distribution);
        
        const colors = labels.map(label => label === mostCommon ? 'var(--modal-chart-highlight)' : '#bdc3c7');

        const trace = {
            x: labels,
            y: values,
            type: 'bar',
            text: values.map(String),
            textposition: 'auto',
            marker: {
                color: colors,
            }
        };

        const layout = {
            title: { text: 'Distribution of Answers (1-4)', font: { size: 14 } },
            xaxis: { title: 'Answer Choice' },
            yaxis: { title: 'Number of Respondents', showgrid: false },
            bargap: 0.2,
            height: 150,
            margin: { t: 30, b: 40, l: 40, r: 20 },
            template: 'plotly_white'
        };

        Plotly.newPlot(chartContainer, [trace], layout, { displayModeBar: false, responsive: true });
    }

    function showDetailView() {
        gsap.to(detailContainer, { height: 'auto', opacity: 1, marginTop: 20, paddingTop: 20, duration: 0.4, ease: 'power2.out' });
    }

    function hideDetailView() {
        gsap.to(detailContainer, {
            height: 0,
            opacity: 0,
            marginTop: 0,
            paddingTop: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                questionTextEl.textContent = '';
                chartContainer.innerHTML = '';
            }
        });
        document.querySelectorAll('.question-circle.active-question').forEach(c => c.classList.remove('active-question', 'active'));
    }
}
