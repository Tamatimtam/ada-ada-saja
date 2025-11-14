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
        // PHASE 2: Replaced externalFilterCategory with a structured object
        externalFilter: {
            type: null, // 'income' or 'expense'
            value: null // e.g., '6-10jt'
        }
    };

    function initDropdown(dropdownEl, onSelect) {
        const selected = dropdownEl.querySelector('.dropdown-selected');
        const options = dropdownEl.querySelector('.dropdown-options');
        selected.addEventListener('click', () => dropdownEl.classList.toggle('open'));
        options.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                const value = e.target.dataset.value;
                selected.textContent = e.target.textContent + ' ▼';
                dropdownEl.classList.remove('open');
                onSelect(value);
            }
        });
        document.addEventListener('click', (e) => { if (!dropdownEl.contains(e.target)) dropdownEl.classList.remove('open'); });
    }

    function updateMetricSelector(datasetKey) {
        const config = datasetsConfig[datasetKey];
        const metricOptions = metricDropdown.querySelector('.dropdown-options');
        const metricSelected = metricDropdown.querySelector('.dropdown-selected');
        metricOptions.innerHTML = '';
        let firstMetric = null;
        for (const [value, details] of Object.entries(config.metrics)) {
            if (!firstMetric) firstMetric = { value, label: details.label };
            const li = document.createElement('li');
            li.dataset.value = value;
            li.textContent = details.label;
            metricOptions.appendChild(li);
        }
        if (firstMetric) {
            state.selectedMetric = firstMetric.value;
            metricSelected.textContent = firstMetric.label + ' ▼';
        }
    }

    async function loadDataset(datasetKey) {
        try {
            let endpoint = new URL(datasetsConfig[datasetKey].endpoint, window.location.origin);
            // Apply external filter ONLY if the financial dataset is selected
            if (datasetKey === 'financial' && state.externalFilter.type && state.externalFilter.value) {
                endpoint.searchParams.append('filter_type', state.externalFilter.type);
                endpoint.searchParams.append('filter_value', state.externalFilter.value);
            }
            state.currentApiData = await fetchApiData(endpoint);
        } catch (err) {
            console.error('Failed to load API data:', err);
            container.innerHTML = `<p style="color:red; text-align:center;">Failed to load data.</p>`;
        }
    }

    function renderMap() {
        if (!state.currentApiData || !state.mapData) return;

        const config = datasetsConfig[state.selectedDataset];
        const metricDetails = config.metrics[state.selectedMetric];

        const baseTitle = `${config.titlePrefix}: ${metricDetails.label}`;
        const filterLabel = state.externalFilter.value ? `(${state.externalFilter.type}: ${state.externalFilter.value})` : '';
        const finalTitle = state.selectedDataset === 'financial' && filterLabel ? `${baseTitle} ${filterLabel}` : baseTitle;

        const common = {
            mapData: state.mapData, currentApiData: state.currentApiData, config,
            metricDetails, reverseNameMapping, selectedMetric: state.selectedMetric,
            datasetKey: state.selectedDataset, containerId: 'container', title: finalTitle
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
                state.externalFilter = { type: null, value: null }; // Clear external filter on manual change
                await loadDataset(selectedValue);
                renderMap();
            });

            initDropdown(metricDropdown, (selectedValue) => {
                state.selectedMetric = selectedValue;
                renderMap();
            });

            // --- PHASE 2: NEW GLOBAL EVENT LISTENERS ---
            document.addEventListener('applyDashboardFilter', async (e) => {
                state.externalFilter = e.detail;

                if (state.selectedDataset !== 'financial') {
                    state.selectedDataset = 'financial';
                    datasetDropdown.querySelector('.dropdown-selected').textContent = 'Profil Finansial Gen Z ▼';
                    updateMetricSelector('financial');
                }

                await loadDataset(state.selectedDataset);
                renderMap();
            });

            document.addEventListener('resetDashboardFilter', async () => {
                const wasFiltered = !!state.externalFilter.type;
                state.externalFilter = { type: null, value: null };

                if (wasFiltered && state.selectedDataset === 'financial') {
                    await loadDataset(state.selectedDataset);
                    renderMap();
                }
            });
            // --- END NEW LISTENERS ---

            updateMetricSelector(state.selectedDataset);
            await loadDataset(state.selectedDataset);
            renderMap();

        } catch (error) {
            console.error('Initialization failed:', error);
            container.innerHTML = `<p style="color:red; text-align:center;">Failed to load map or initial data.</p>`;
        }
    }

    initializeApp();
});