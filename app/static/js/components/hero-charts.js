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


    // --- 2. The NEW Anxiety Bar Chart ---
    const anxietyBarChartEl = document.getElementById('anxietyBarChart');
    if (anxietyBarChartEl) {
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
                valueSuffix: ' '
            },
            plotOptions: {
                series: {
                    animation: {
                        duration: 1000,
                        easing: 'easeOutBounce'
                    },
                    point: {
                        events: {
                            click: function () {
                                const filterValue = this.category;
                                fetch(`/api/filter_metrics/${filterValue}`)
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
                                        const oldScore = parseFloat(anxietyScoreEl.getAttribute('data-score'));
                                        const newScore = data.average_anxiety_score;
                                        anxietyScoreEl.setAttribute('data-score', newScore);

                                        // GSAP animation to update the score smoothly
                                        gsap.to(anxietyScoreEl, {
                                            duration: 1.5,
                                            innerText: newScore,
                                            roundProps: "innerText",
                                            ease: "power3.out",
                                            onUpdate: function() {
                                                anxietyScoreEl.textContent = parseFloat(this.targets()[0].innerText).toFixed(1);
                                            }
                                        });
                                        gsap.to(anxietyGaugeFill, {
                                            height: `${(newScore / 5) * 100}%`,
                                            duration: 1.5,
                                            ease: "power1.inOut"
                                        });
                                    });
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
                        '#FF6B9D',
                        '#5DADE2',
                        '#9B59B6',
                        '#F1C40F',
                        '#E67E22',
                        '#1ABC9C'
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

        // Function to update the chart
        const updateChart = (filterBy) => {
            fetch(`/data/anxiety_by/${filterBy}`)
                .then(response => response.json())
                .then(data => {
                    chart.xAxis[0].setCategories(data.categories, false);
                    chart.series[0].setData(data.scores, true);
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