import { datasetsConfig, GEOJSON_URL, reverseNameMapping } from './config.js';
import { fetchApiData, fetchGeoJSON } from './api.js';
import { renderChoroplethMap } from './choroplethRenderer.js';
import { renderPatternMap } from './patternRenderer.js';

document.addEventListener('DOMContentLoaded', async function () {
    const datasetDropdown = document.getElementById('map-dataset-dropdown');
    const metricDropdown = document.getElementById('map-metric-dropdown');
    const container = document.getElementById('container');

    const state = {
        currentApiData: [],
        mapData: null,
        selectedDataset: 'regional',
        selectedMetric: null,
        externalFilterCategory: 'All' // State for the external filter
    };

    function initDropdown(dropdownEl, onSelect) {
        const selected = dropdownEl.querySelector('.dropdown-selected');
        const options = dropdownEl.querySelector('.dropdown-options');

        selected.addEventListener('click', () => {
            dropdownEl.classList.toggle('open');
        });

        options.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                const value = e.target.dataset.value;
                const text = e.target.textContent;
                selected.textContent = text + ' ▼';
                dropdownEl.classList.remove('open');
                onSelect(value);
            }
        });

        document.addEventListener('click', (e) => {
            if (!dropdownEl.contains(e.target)) {
                dropdownEl.classList.remove('open');
            }
        });
    }

    function updateMetricSelector(datasetKey) {
        const config = datasetsConfig[datasetKey];
        const metricOptions = metricDropdown.querySelector('.dropdown-options');
        const metricSelected = metricDropdown.querySelector('.dropdown-selected');

        metricOptions.innerHTML = '';

        let firstMetric = null;

        for (const [value, details] of Object.entries(config.metrics)) {
            if (!firstMetric) {
                firstMetric = { value, label: details.label };
            }
            const li = document.createElement('li');
            li.dataset.value = value;
            li.textContent = details.label;
            metricOptions.appendChild(li);
        }

        // Select the first metric by default
        if (firstMetric) {
            state.selectedMetric = firstMetric.value;
            metricSelected.textContent = firstMetric.label + ' ▼';
        }
    }

    async function loadDataset(datasetKey) {
        try {
            let endpoint = datasetsConfig[datasetKey].endpoint;
            // Apply the external filter ONLY if the financial dataset is selected
            if (datasetKey === 'financial' && state.externalFilterCategory !== 'All') {
                endpoint = `/api/financial-profile/${encodeURIComponent(state.externalFilterCategory)}`;
            }
            state.currentApiData = await fetchApiData(endpoint);
        } catch (err) {
            console.error('Gagal memuat data API:', err);
            container.innerHTML = `<p style="color:red; text-align:center;">Gagal memuat data.</p>`;
        }
    }

    function renderMap() {
        if (!state.currentApiData || !state.mapData) return;

        const config = datasetsConfig[state.selectedDataset];
        const metricDetails = config.metrics[state.selectedMetric];

        // Create the title string dynamically based on the current filter state
        const baseTitle = `${config.titlePrefix}: ${metricDetails.label}`;
        const finalTitle = state.selectedDataset === 'financial' && state.externalFilterCategory !== 'All'
            ? `${baseTitle} (${state.externalFilterCategory})`
            : baseTitle;

        const common = {
            mapData: state.mapData,
            currentApiData: state.currentApiData,
            config,
            metricDetails,
            reverseNameMapping,
            selectedMetric: state.selectedMetric,
            datasetKey: state.selectedDataset,
            containerId: 'container',
            title: finalTitle // Pass the dynamic title to the renderer
        };

        if (metricDetails.vizType === 'pattern') {
            renderPatternMap(common);
        } else {
            renderChoroplethMap(common);
        }
    }

    async function initializeApp() {
        try {
            state.mapData = await fetchGeoJSON(GEOJSON_URL);

            initDropdown(datasetDropdown, async (selectedValue) => {
                state.selectedDataset = selectedValue;
                updateMetricSelector(selectedValue);
                await loadDataset(selectedValue);
                renderMap();
            });

            initDropdown(metricDropdown, (selectedValue) => {
                state.selectedMetric = selectedValue;
                renderMap();
            });

            // Listen for filter events from the main diverging bar chart
            document.addEventListener('categoryFiltered', async (e) => {
                state.externalFilterCategory = e.detail.category;
                // Only reload and re-render if the financial map is currently active
                if (state.selectedDataset === 'financial') {
                    await loadDataset(state.selectedDataset);
                    renderMap();
                }
            });

            document.addEventListener('categoryFilterReset', async () => {
                state.externalFilterCategory = 'All';
                // Only reload and re-render if the financial map is currently active
                if (state.selectedDataset === 'financial') {
                    await loadDataset(state.selectedDataset);
                    renderMap();
                }
            });


            // Initial setup
            updateMetricSelector(state.selectedDataset);
            await loadDataset(state.selectedDataset);
            renderMap();

        } catch (error) {
            console.error('Inisialisasi aplikasi gagal:', error);
            container.innerHTML = `<p style="color:red; text-align:center;">Gagal memuat peta atau data awal.</p>`;
        }
    }

    initializeApp();
});