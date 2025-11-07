function getChartConfig(originalColors) {
    // 1. This function returns the configuration object for the Highcharts chart.
    return {
        // 2. Basic chart settings.
        chart: {
            type: 'bar',
            backgroundColor: 'transparent',
            height: '16%'
        },
        title: { text: null },
        // 3. X-axis configuration.
        xAxis: {
            categories: [], // To be filled with data later
            title: { text: null },
            labels: { step: 1, style: { fontSize: '10px' } }
        },
        // 4. Y-axis configuration.
        yAxis: {
            min: 0,
            max: 4,
            title: { text: 'Average Anxiety Score', align: 'middle' },
            labels: { overflow: 'justify' }
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
            bar: {
                dataLabels: { enabled: true },
                colorByPoint: true,
                colors: originalColors
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