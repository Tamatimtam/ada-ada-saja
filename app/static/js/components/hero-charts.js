function initHeroCharts() {
    // --- 1. The Award-Winning Anxiety Face Animation ---
    const anxietyContainer = document.getElementById('anxiety-container');
    const anxietyScoreEl = document.getElementById('avgAnxietyScore');
    const anxietyGaugeFill = document.getElementById('anxiety-gauge-fill');
    const face = document.getElementById('face-group');
    const mouth = document.getElementById('mouth');
    const eyes = document.querySelectorAll('#eye-left, #eye-right');
    const sweatDrop = document.getElementById('sweat-drop');
    const parsedScore = parseFloat(anxietyScoreEl ? anxietyScoreEl.getAttribute('data-score') : '0');
    const targetScore = isNaN(parsedScore) ? 3.2 : parsedScore;

    if (anxietyContainer && anxietyScoreEl && anxietyGaugeFill && face && mouth && eyes && sweatDrop) {
        let hasPlayed = false;

        const runAnxietyAnimation = () => {
            if (hasPlayed) return;
            hasPlayed = true;

            const counter = { val: 0 };
            let anxietyWobble; // To control the hover animation

            // Base nervous twitch animation (made gentler)
            gsap.to(face, {
                y: -0.5,
                x: 0.5,
                rotation: -1,
                duration: 0.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                repeatDelay: 1.5 // Added a pause for subtlety
            });

            // Main timeline for counting up, changing expression, and filling the gauge
            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                onUpdate: () => {
                    // onUpdate is now only responsible for updating the text
                    anxietyScoreEl.textContent = counter.val.toFixed(1);
                }
            });

            const animationDuration = 2.6;
            const targetHeight = (targetScore / 5) * 100;

            // Animate counter and gauge fill in perfect sync on the same timeline
            tl.to(counter, { val: targetScore, duration: animationDuration }, 0)
                .to(anxietyGaugeFill, { height: `${targetHeight}%`, duration: animationDuration, ease: "power1.inOut" }, 0);

            // Add expression changes at specific points on the timeline for better performance
            tl.to(mouth, { attr: { d: "M 35 70 Q 50 62 65 70" }, duration: 0.5 }, animationDuration * (1.5 / targetScore))
                .to(eyes, { scale: 1.3, transformOrigin: 'center center', duration: 0.4, ease: "back.out(2)" }, animationDuration * (2.5 / targetScore))
                .fromTo(sweatDrop, { opacity: 0, y: 0 }, { opacity: 1, y: 20, duration: 1.2, ease: "none" }, animationDuration * (3.0 / targetScore));
        };

        // Trigger when visible using IntersectionObserver
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) runAnxietyAnimation();
            });
        }, { threshold: 0.3 });
        io.observe(anxietyContainer);

        // Interactivity on hover (smoother, less jarring "anxious" wobble)
        let anxietyWobble;
        anxietyContainer.addEventListener('mouseenter', () => {
            gsap.to(face, { scale: 1.05, duration: 0.3, ease: 'back.out(2)' });
            // Start a continuous, gentle wobble
            anxietyWobble = gsap.to(face, {
                x: 'random(-1, 1)',
                rotation: 'random(-2, 2)',
                duration: 0.1,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
            });
        });

        anxietyContainer.addEventListener('mouseleave', () => {
            if (anxietyWobble) anxietyWobble.kill(); // Stop the wobble explicitly
            // Return to normal state
            gsap.to(face, {
                scale: 1,
                x: 0,
                rotation: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    }


    // --- 2. The NEW Anxiety Bar Chart with Interactive Filtering ---
    const anxietyBarChartEl = document.getElementById('anxietyBarChart');
    if (anxietyBarChartEl) {
        let selectedFilter = null; // Track selected filter {category, value, pointIndex}
        let currentFilterCategory = 'employment_status'; // Track current chart category

        let chart = Highcharts.chart('anxietyBarChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                height: '38%'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: [], // Will be populated with data
                title: {
                    text: null
                },
                labels: {
                    step: 1,
                    style: {
                        fontSize: '10px'
                    }
                }
            },
            yAxis: {
                min: 0,
                max: 4,
                title: {
                    text: 'Average Anxiety Score',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' ',
                formatter: function () {
                    return `<b>${this.x}</b><br/>Anxiety Score: ${this.y.toFixed(1)}<br/><i>Click to filter</i>`;
                }
            },
            plotOptions: {
                series: {
                    animation: {
                        duration: 1000,
                        easing: 'easeOutBounce'
                    },
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                const clickedCategory = this.category;
                                const clickedIndex = this.index;

                                // Check if clicking the same bar (deselect)
                                if (selectedFilter &&
                                    selectedFilter.value === clickedCategory &&
                                    selectedFilter.category === currentFilterCategory) {
                                    // Deselect - reset to original data
                                    selectedFilter = null;
                                    resetAllData();
                                    // Reset all bars to original colors (gradient from pink)
                                    const originalColors = [
                                        '#FF6B9D', // Highest anxiety - Full saturation
                                        '#FF7FAA',
                                        '#FF93B7',
                                        '#FFA7C4',
                                        '#FFBBD1',
                                        '#FFCFDE',
                                        '#FFE3EB',
                                        '#FFF0F5', // Lowest anxiety - Very light
                                        '#FF6B9D',
                                        '#FF7FAA',
                                        '#FF93B7',
                                        '#FFA7C4',
                                        '#FFBBD1',
                                        '#FFCFDE',
                                        '#FFE3EB',
                                        '#FFF0F5'
                                    ];
                                    chart.series[0].points.forEach((point, idx) => {
                                        point.update({
                                            color: originalColors[idx % originalColors.length],
                                            borderWidth: 0
                                        }, false);
                                    });
                                    chart.redraw();
                                } else {
                                    // Select new filter
                                    selectedFilter = {
                                        category: currentFilterCategory,
                                        value: clickedCategory,
                                        index: clickedIndex
                                    };

                                    // Highlight selected bar
                                    chart.series[0].points.forEach((point, idx) => {
                                        if (idx === clickedIndex) {
                                            point.update({
                                                color: '#FFD700', // Gold color for selected
                                                borderWidth: 3,
                                                borderColor: '#FFA500'
                                            }, false);
                                        } else {
                                            point.update({
                                                color: null,
                                                borderWidth: 0
                                            }, false);
                                        }
                                    });
                                    chart.redraw();

                                    // Fetch and update filtered data
                                    fetch(`/api/filter_metrics/${currentFilterCategory}/${encodeURIComponent(clickedCategory)}`)
                                        .then(response => response.json())
                                        .then(data => {
                                            // Update the 7 metrics with animation
                                            animateCounter('scoreLiterasiFin', data.scores['Literasi Finansial']);
                                            animateCounter('scoreLiterasiDigital', data.scores['Literasi Keuangan Digital']);
                                            animateCounter('scorePengelolaan', data.scores['Pengelolaan Keuangan']);
                                            animateCounter('scorePerilaku', data.scores['Sikap Finansial']);
                                            animateCounter('scoreDisiplin', data.scores['Disiplin Finansial']);
                                            animateCounter('scoreKesejahteraan', data.scores['Kesejahteraan Finansial']);
                                            animateCounter('scoreInvestasi', data.scores['Investasi Aset']);

                                            // Update the main anxiety score and trigger its animation
                                            const anxietyScoreEl = document.getElementById('avgAnxietyScore');
                                            const anxietyGaugeFill = document.getElementById('anxiety-gauge-fill');
                                            const newScore = data.average_anxiety_score;
                                            anxietyScoreEl.setAttribute('data-score', newScore);

                                            // GSAP animation to update the score smoothly
                                            gsap.to(anxietyScoreEl, {
                                                duration: 1.5,
                                                innerText: newScore,
                                                roundProps: "innerText",
                                                ease: "power3.out",
                                                onUpdate: function () {
                                                    anxietyScoreEl.textContent = parseFloat(this.targets()[0].innerText).toFixed(1);
                                                }
                                            });
                                            gsap.to(anxietyGaugeFill, {
                                                height: `${(newScore / 5) * 100}%`,
                                                duration: 1.5,
                                                ease: "power1.inOut"
                                            });
                                        })
                                        .catch(error => {
                                            console.error('Error fetching filtered metrics:', error);
                                        });
                                }
                            }
                        }
                    }
                },
                bar: {
                    dataLabels: {
                        enabled: true
                    },
                    colorByPoint: true,
                    colors: [
                        '#FF6B9D', // Highest anxiety - Full saturation
                        '#FF7FAA',
                        '#FF93B7',
                        '#FFA7C4',
                        '#FFBBD1',
                        '#FFCFDE',
                        '#FFE3EB',
                        '#FFF0F5', // Lowest anxiety - Very light
                        '#FF6B9D',
                        '#FF7FAA',
                        '#FF93B7',
                        '#FFA7C4',
                        '#FFBBD1',
                        '#FFCFDE',
                        '#FFE3EB',
                        '#FFF0F5'
                    ]
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Anxiety Score',
                data: [] // Will be populated with data
            }]
        });

        // Function to reset to original unfiltered data
        const resetAllData = () => {
            // Get original scores from data attributes
            const originalScores = {
                'Literasi Finansial': parseFloat(document.getElementById('scoreLiterasiFin').getAttribute('data-original-score')),
                'Literasi Keuangan Digital': parseFloat(document.getElementById('scoreLiterasiDigital').getAttribute('data-original-score')),
                'Pengelolaan Keuangan': parseFloat(document.getElementById('scorePengelolaan').getAttribute('data-original-score')),
                'Sikap Finansial': parseFloat(document.getElementById('scorePerilaku').getAttribute('data-original-score')),
                'Disiplin Finansial': parseFloat(document.getElementById('scoreDisiplin').getAttribute('data-original-score')),
                'Kesejahteraan Finansial': parseFloat(document.getElementById('scoreKesejahteraan').getAttribute('data-original-score')),
                'Investasi Aset': parseFloat(document.getElementById('scoreInvestasi').getAttribute('data-original-score'))
            };

            // Animate back to original values
            animateCounter('scoreLiterasiFin', originalScores['Literasi Finansial']);
            animateCounter('scoreLiterasiDigital', originalScores['Literasi Keuangan Digital']);
            animateCounter('scorePengelolaan', originalScores['Pengelolaan Keuangan']);
            animateCounter('scorePerilaku', originalScores['Sikap Finansial']);
            animateCounter('scoreDisiplin', originalScores['Disiplin Finansial']);
            animateCounter('scoreKesejahteraan', originalScores['Kesejahteraan Finansial']);
            animateCounter('scoreInvestasi', originalScores['Investasi Aset']);

            // Reset anxiety score
            const anxietyScoreEl = document.getElementById('avgAnxietyScore');
            const anxietyGaugeFill = document.getElementById('anxiety-gauge-fill');
            const originalAnxietyScore = parseFloat(anxietyScoreEl.getAttribute('data-original-score'));
            anxietyScoreEl.setAttribute('data-score', originalAnxietyScore);

            gsap.to(anxietyScoreEl, {
                duration: 1.5,
                innerText: originalAnxietyScore,
                roundProps: "innerText",
                ease: "power3.out",
                onUpdate: function () {
                    anxietyScoreEl.textContent = parseFloat(this.targets()[0].innerText).toFixed(1);
                }
            });
            gsap.to(anxietyGaugeFill, {
                height: `${(originalAnxietyScore / 5) * 100}%`,
                duration: 1.5,
                ease: "power1.inOut"
            });
        };

        // Function to update the chart
        const updateChart = (filterBy) => {
            currentFilterCategory = filterBy;
            selectedFilter = null; // Reset selection when changing chart category

            fetch(`/data/anxiety_by/${filterBy}`)
                .then(response => response.json())
                .then(data => {
                    chart.xAxis[0].setCategories(data.categories, false);
                    chart.series[0].setData(data.scores, true);

                    // Reset all bars to normal state after data update
                    setTimeout(() => {
                        chart.series[0].points.forEach(point => {
                            point.update({
                                color: null,
                                borderWidth: 0
                            }, false);
                        });
                        chart.redraw();
                    }, 100);

                    // Reset to original unfiltered data
                    resetAllData();
                })
                .catch(error => {
                    console.error('Error updating chart:', error);
                });
        };

        // Initial chart load
        updateChart('employment_status');

        // Listen for filter changes
        document.addEventListener('filterChanged', (e) => {
            updateChart(e.detail.filterBy);
        });

        // Animate the chart entrance with GSAP
        gsap.from(anxietyBarChartEl, {
            duration: 1,
            scale: 0.5,
            opacity: 0,
            delay: 0.5,
            ease: 'back.out(1.7)'
        });
    }
}