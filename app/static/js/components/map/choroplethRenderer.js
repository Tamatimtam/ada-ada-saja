import { attachNavigationEnhancements } from './navigation.js';

export function renderChoroplethMap({
    mapData,
    currentApiData,
    config,
    metricDetails,
    reverseNameMapping,
    selectedMetric,
    datasetKey,
    title, // Title is received from app.js
    containerId = 'container'
}) {
    if (!currentApiData || !mapData) return;

    const isCategorical = metricDetails.categorical === true;
    const allProvinces = mapData.features.map(f => f.properties.PROVINSI);
    let chartData;
    let colorAxisOptions;

    if (isCategorical) {
        // --- Logic for categorical data (e.g., Investment Type) ---
        const categoryMap = {};
        let nextIndex = 0;
        Object.keys(metricDetails.categories).forEach(key => {
            categoryMap[key] = nextIndex++;
        });

        chartData = allProvinces.map(geoName => {
            const csvProvinceName = reverseNameMapping[geoName] || geoName;
            const item = currentApiData.find(d => d[config.keyColumn] === csvProvinceName);
            let value = null;
            if (item && item[selectedMetric] && categoryMap.hasOwnProperty(item[selectedMetric])) {
                value = categoryMap[item[selectedMetric]];
            }
            const isAcehFinancial = datasetKey === 'financial' && (geoName === 'Aceh' || csvProvinceName === 'Aceh');
            return { name: geoName, value: isAcehFinancial ? -1 : value, color: (isAcehFinancial ? '#E0E0E0' : (value === null ? metricDetails.nullColor : undefined)) };
        });

        const dataClasses = Object.keys(metricDetails.categories).map(key => ({
            from: categoryMap[key],
            to: categoryMap[key],
            name: metricDetails.categories[key].name,
            color: metricDetails.categories[key].color
        }));

        if (chartData.some(d => d.value === -1)) {
            dataClasses.push({ from: -1, to: -1, color: '#E0E0E0', name: 'Data Tidak Tersedia' });
        }

        colorAxisOptions = { dataClasses };

    } else {
        // --- Existing logic for numerical data ---
        chartData = allProvinces.map(geoName => {
            const csvProvinceName = reverseNameMapping[geoName] || geoName;
            const item = currentApiData.find(d => d[config.keyColumn] === csvProvinceName);
            let value = null;
            if (item) value = item[selectedMetric] != null ? parseFloat(item[selectedMetric]) : null;

            const isAcehFinancial = datasetKey === 'financial' && (geoName === 'Aceh' || csvProvinceName === 'Aceh');
            const isFinancialBalance = datasetKey === 'financial' && selectedMetric === 'financial_balance';

            const finalValue = (isAcehFinancial && isFinancialBalance) ? -1 : (isAcehFinancial ? null : value);

            return {
                name: geoName,
                value: finalValue,
                color: (finalValue === null || finalValue === -1) ? '#E0E0E0' : undefined
            };
        });
        colorAxisOptions = metricDetails.dataClasses
            ? (() => {
                const isFinancialBalance = datasetKey === 'financial' && selectedMetric === 'financial_balance';
                const dc = [...metricDetails.dataClasses];
                if (isFinancialBalance) {
                    dc.push({ from: -1, to: -1, color: '#E0E0E0', name: 'Data Tidak Tersedia' });
                }
                return { dataClasses: dc };
            })()
            : (() => {
                let colorSettings = {};
                if (selectedMetric === 'outstanding_pinjaman_miliar') {
                    colorSettings = {
                        stops: [
                            [0, '#87CEFA'],
                            [1, metricDetails.maxColor]
                        ]
                    };
                } else {
                    colorSettings = {
                        minColor: metricDetails.minColor,
                        maxColor: metricDetails.maxColor
                    };
                }

                return {
                    type: metricDetails.type,
                    endOnTick: false,
                    ... (selectedMetric === 'outstanding_pinjaman_miliar' || selectedMetric === 'dana_diberikan_miliar'
                        ? { max: 100000 }
                        : selectedMetric === 'pdrb_ribu_rp'
                            ? { min: 10000, max: 1000000 }
                            : selectedMetric === 'rekening_penerima_aktif'
                                ? { min: 1000, max: 10000000 }
                                : selectedMetric === 'jumlah_penduduk_ribu'
                                    ? { min: 100, max: 100000 }
                                    : { min: metricDetails.type === 'logarithmic' ? 1 : null }),
                    ...colorSettings,
                    labels: {
                        formatter: function () { return this.value ? this.value.toLocaleString('id-ID') : 'N/A'; },
                        style: { fontSize: '0.875rem', color: '#4a5568' }
                    }
                };
            })();
    }

    Highcharts.mapChart(containerId, {
        chart: {
            map: mapData,
            backgroundColor: '#ffffff',
            style: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
            events: {
                load: function () {
                    if (this.series[0] && this.series[0].bounds) {
                        this.mapView.fitToBounds(this.series[0].bounds, { padding: 15 });
                    }
                    attachNavigationEnhancements(this);
                }
            }
        },
        credits: { enabled: false },
        exporting: { buttons: { contextButton: { align: 'right', verticalAlign: 'bottom', y: -10 } } },
        title: {
            text: title,
            align: 'center',
            style: { fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', fontFamily: "'Stack Sans Notch', sans-serif" }
        },
        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom',
                theme: {
                    fill: 'rgba(255,255,255,0.9)',
                    stroke: '#e2e8f0',
                    'stroke-width': 2,
                    r: 8,
                    style: { color: '#2d3748', fontWeight: '600' },
                    states: {
                        hover: { fill: '#667eea', style: { color: '#ffffff' } },
                        select: { fill: '#667eea', style: { color: '#ffffff' } }
                    }
                }
            }
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            const mv = this.series.chart.mapView;
                            if (!mv) return;
                            if (typeof this.zoomTo === 'function') { this.zoomTo(60, { duration: 1000, easing: 'easeOutCubic' }); return; }
                            if (this.bounds) mv.fitToBounds(this.bounds, { padding: 60, animation: { duration: 1000, easing: 'easeOutCubic' } });
                        }
                    }
                }
            }
        },
        colorAxis: colorAxisOptions,
        // --- MODIFICATION START: Corrected legend logic ---
        legend: {
            enabled: true, // Always enable the legend for any choropleth map
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: { fontSize: '0.65rem' } /* Add this line */
        },
        // --- MODIFICATION END ---
        series: [{
            data: chartData,
            joinBy: ['PROVINSI', 'name'],
            name: metricDetails.label,
            nullColor: metricDetails.nullColor || '#E0E0E0',
            borderColor: '#ffffff',
            borderWidth: 1.5,
            states: { hover: { color: '#667eea', borderColor: '#ffffff', brightness: 0.1 } },
            tooltip: {
                headerFormat: '<span></span>',
                backgroundColor: 'rgba(255,255,255,0.98)',
                borderColor: '#e2e8f0',
                borderRadius: 12,
                borderWidth: 1,
                style: { fontSize: '0.95rem', fontWeight: '500' },
                pointFormatter: function () {
                    const geoProvinceName = this.name;
                    const csvProvinceName = reverseNameMapping[geoProvinceName] || geoProvinceName;
                    const provinceData = currentApiData.find(d => d[config.keyColumn] === csvProvinceName);
                    if (!provinceData) return `<b>${geoProvinceName}</b><br/><em style="color:#999;">Data tidak tersedia</em>`;

                    let value = provinceData[selectedMetric];
                    if (value == null) return `<b>${geoProvinceName}</b><br/><em style="color:#999;">Data tidak tersedia</em>`;

                    let out = `<b>${provinceData[config.keyColumn]}</b><br/>`;

                    if (isCategorical) {
                        out += `${metricDetails.label}: <b>${value}</b>`;
                    } else {
                        if (selectedMetric === 'financial_balance') {
                            const status = value >= 0 ? '<span style="color:#1565C0;font-weight:bold;">Surplus</span>' : '<span style="color:#C62828;font-weight:bold;">Defisit</span>';
                            out += `Status Keuangan: ${status}`;
                        } else {
                            const formatted = parseFloat(value).toLocaleString('id-ID');
                            let display = `<b>${formatted}</b>`;
                            if (['avg_income', 'avg_expense'].includes(selectedMetric)) display = `<b>Rp ${formatted}</b>`;
                            else if (selectedMetric === 'avg_digital_time') display = `<b>${formatted} jam</b>`;
                            out += `${metricDetails.label}: ${display}`;
                        }
                    }
                    return out;
                }
            }
        }]
    });
}