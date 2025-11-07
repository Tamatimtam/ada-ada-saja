function getChartConfig() {
    // 1. This function returns the configuration object for the Highcharts chart.
    return {
        // 2. Basic chart settings.
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            height: '16%'
        },
        title: { text: null },
        // 3. X-axis configuration.
        xAxis: {
            categories: [], // To be filled with data later
            title: { text: null },
            labels: {
                step: 1,
                style: { fontSize: '10px', color: '#666' },
                rotation: 0
            },
            lineWidth: 0,
            tickWidth: 0
        },
        // 4. Y-axis configuration.
        yAxis: {
            min: 0,
            max: 4,
            title: { text: null },
            labels: { enabled: false },
            gridLineWidth: 0
        },
        // 5. Tooltip customization.
        tooltip: {
            valueSuffix: ' ',
            formatter: function () {
                return `<b>${this.x}</b><br/>Anxiety Score: ${this.y.toFixed(1)}<br/><i>Click to filter</i>`;
            }
        },
        // 6. Plot options for the series.
        plotOptions: {
            series: {
                animation: { duration: 1000, easing: 'easeOutBounce' },
                cursor: 'pointer',
                point: {
                    events: {
                        // 7. Pass the click handler function to the chart configuration.
                        click: chartClickHandler
                    }
                }
            },
            // 8. Bar-specific options.
            column: {
                dataLabels: {
                    enabled: true,
                    format: '{y:.1f}',
                    style: {
                        fontSize: '9px',
                        color: '#333',
                        textOutline: 'none'
                    }
                },
                borderRadius: 4,
                borderWidth: 0
            }
        },
        legend: { enabled: false },
        credits: { enabled: false },
        // 9. The data series for the chart.
        series: [{
            name: 'Anxiety Score',
            data: [] // To be filled with data later
        }]
    };
}