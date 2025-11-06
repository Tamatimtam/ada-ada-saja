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


    // --- 2. The "Digital Time Spent" Bubble Chart ---
    const digitalTimeChartEl = document.getElementById('digitalTimeChart');
    if (digitalTimeChartEl) {
        Highcharts.chart('digitalTimeChart', {
            chart: {
                type: 'packedbubble',
                backgroundColor: 'transparent',
                height: '100%'
            },
            title: {
                text: null
            },
            tooltip: {
                useHTML: true,
                pointFormat: '<b>{point.name}</b>: {point.value} hrs/day'
            },
            plotOptions: {
                packedbubble: {
                    minSize: '30%',
                    maxSize: '120%',
                    zMin: 0,
                    zMax: 1000,
                    layoutAlgorithm: {
                        splitSeries: false,
                        gravitationalConstant: 0.02
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        style: {
                            color: 'black',
                            textOutline: 'none',
                            fontWeight: 'normal',
                            fontSize: '10px'
                        }
                    }
                }
            },
            series: [{
                name: 'Time Spent',
                data: [
                    { name: '2-4h', value: 180 },
                    { name: '4-6h', value: 250 },
                    { name: '6-8h', value: 300 },
                    { name: '8-10h', value: 220 },
                    { name: '>10h', value: 150 }
                ]
            }],
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            }
        });

        // Animate the chart entrance with GSAP
        gsap.from('.hero-chart-container', {
            duration: 1,
            scale: 0.9,
            opacity: 0,
            stagger: 0.2,
            delay: 0.3,
            ease: 'back.out(1.7)'
        });
    }
}