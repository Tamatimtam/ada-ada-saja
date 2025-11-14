import { appColors } from './config.js';
import { attachNavigationEnhancements } from './navigation.js';

export function renderPatternMap({
    mapData,
    currentApiData,
    config,
    metricDetails,
    reverseNameMapping,
    selectedMetric,
    datasetKey,
    title, // Accept the title as a parameter
    containerId = 'container'
}) {
    if (!currentApiData || !mapData) return;

    // Build mapping appName -> numeric category index for dataClasses legend
    const appIndexMap = {};
    let nextIndex = 0;

    const chartData = currentApiData.map(item => {
        const appName = item[selectedMetric];
        const provinceName = item[config.keyColumn];
        const geoName = reverseNameMapping[provinceName] || provinceName;
        const isAcehFinancial = datasetKey === 'financial' && (provinceName === 'Aceh' || geoName === 'Aceh');

        if (appName && !isAcehFinancial) {
            if (!(appName in appIndexMap)) appIndexMap[appName] = nextIndex++;
            return {
                name: geoName,
                appName,
                value: appIndexMap[appName],
                logoUrl: `/static/logos/${appName}.png`
            };
        }
        // Aceh (financial) gets sentinel -1 to appear in legend; other missing remain null
        return { name: geoName, appName: null, value: isAcehFinancial ? -1 : null };
    });

    // Generate dataClasses for legend (one per fintech app)
    const dataClasses = Object.entries(appIndexMap).map(([appName, idx]) => ({
        from: idx,
        to: idx,
        color: appColors[appName] || '#757575',
        name: appName
    }));

    if (datasetKey === 'financial') {
        // Legend item for Aceh only
        dataClasses.push({
            from: -1,
            to: -1,
            color: '#E0E0E0',
            name: 'Data Tidak Tersedia'
        });
    }

    Highcharts.mapChart(containerId, {
        chart: {
            map: mapData,
            backgroundColor: '#ffffff',
            style: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
            events: {
                load: function () {
                    // Fit map to container on initial load to remove dead space
                    if (this.series[0] && this.series[0].bounds) {
                        this.mapView.fitToBounds(this.series[0].bounds, { padding: 15 });
                    }
                    attachNavigationEnhancements(this);
                }
            }
        },
        credits: { enabled: false }, // Disable Highcharts.com credit
        exporting: {
            buttons: { contextButton: { align: 'right', verticalAlign: 'bottom', y: -10 } }
        },
        title: {
            text: `${config.titlePrefix}: ${metricDetails.label}`,
            align: 'right',
            style: { fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', fontFamily: "'Stack Sans Notch', sans-serif" }
        },
        subtitle: {
            text: 'Sumber data: Gelarrasa (Simulasi)',
            align: 'right',
            style: { fontSize: '0.95rem', color: '#718096' }
        },
        legend: {
            // Hapus title untuk tampilan lebih bersih
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            floating: false,
            itemStyle: { fontSize: '0.75rem' },
            symbolRadius: 6,
            padding: 8,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 8
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
                            if (typeof this.zoomTo === 'function') { this.zoomTo(60, { duration: 800, easing: 'easeOutCubic' }); return; }
                            if (this.bounds) mv.fitToBounds(this.bounds, { padding: 60, animation: { duration: 800, easing: 'easeOutCubic' } });
                        }
                    }
                }
            }
        },
        colorAxis: {
            // Use dataClasses for categorical legend
            dataClasses,
            nullColor: '#E0E0E0'
        },
        tooltip: {
            useHTML: true,
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderColor: '#e2e8f0',
            borderRadius: 12,
            borderWidth: 1,
            style: { fontSize: '0.95rem' },
            formatter: function () {
                const geoProvinceName = this.point.name;
                const csvProvinceName = reverseNameMapping[geoProvinceName] || geoProvinceName;
                const provinceData = currentApiData.find(d => d[config.keyColumn] === csvProvinceName);
                if (!provinceData) return `<b>${geoProvinceName}</b><br/><em style="color:#999;">Data tidak tersedia</em>`;
                const appName = provinceData[selectedMetric];
                if (!appName) {
                    return `<div style="padding:12px;min-width:220px;font-family:Inter,sans-serif;">
						<div style="font-weight:700;margin-bottom:10px;font-size:1.05rem;color:#2d3748;">${provinceData[config.keyColumn]}</div>
						<div style="color:#a0aec0;font-size:0.875rem;">Data tidak tersedia</div>
					</div>`;
                }
                const percentage = provinceData.fintech_percentage || 0;
                const logoUrl = `/static/logos/${appName}.png`;
                return `<div style="padding:12px;min-width:220px;font-family:Inter,sans-serif;">
					<div style="font-weight:700;margin-bottom:10px;font-size:1.05rem;color:#2d3748;">${provinceData[config.keyColumn]}</div>
					<div style="display:flex;align-items:center;gap:12px;">
						<img src="${logoUrl}" style="width:48px;height:48px;object-fit:contain;background:#fff;border:2px solid #e2e8f0;border-radius:10px;padding:6px;" onerror="this.style.display='none'" />
						<div>
							<div style="font-weight:600;color:#2d3748;font-size:1rem;">${appName}</div>
							<div style="color:#718096;font-size:0.875rem;margin-top:2px;">Pengguna: <b style="color:#667eea;">${percentage}%</b></div>
						</div>
					</div>
				</div>`;
            }
        },
        series: [{
            data: chartData,
            joinBy: ['PROVINSI', 'name'],
            name: metricDetails.label,
            nullColor: '#E0E0E0',
            dataLabels: { enabled: false },
            states: { hover: { brightness: 0.15, borderColor: '#667eea', borderWidth: 2.5 } },
            borderColor: '#FFFFFF',
            borderWidth: 1.5
        }]
    });
}