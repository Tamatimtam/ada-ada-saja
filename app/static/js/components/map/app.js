import { datasetsConfig, GEOJSON_URL, reverseNameMapping } from './config.js';
import { fetchApiData, fetchGeoJSON } from './api.js';
import { renderChoroplethMap } from './choroplethRenderer.js';
import { renderPatternMap } from './patternRenderer.js';

document.addEventListener('DOMContentLoaded', async function () {
    const datasetDropdown = document.getElementById('map-dataset-dropdown');
    const metricDropdown = document.getElementById('map-metric-dropdown');
    const container = document.getElementById('container');

    // --- MODIFICATION: Updated the initial state to set the new default map ---
    const state = {
        currentApiData: [],
        mapData: null,
        selectedDataset: 'financial',         // Default dataset is now 'financial'
        selectedMetric: 'mode_fintech_app',   // Default metric is now the logo map
        externalFilter: {
            type: null,
            value: null
        }
    };
    // --- END MODIFICATION ---

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
        metricOptions.innerHTML = '';
        for (const [value, details] of Object.entries(config.metrics)) {
            const li = document.createElement('li');
            li.dataset.value = value;
            li.textContent = details.label;
            metricOptions.appendChild(li);
        }
    }

    async function loadDataset(datasetKey) {
        try {
            let endpoint = new URL(datasetsConfig[datasetKey].endpoint, window.location.origin);
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
        let finalTitle = baseTitle;
        if (state.selectedDataset === 'financial' && state.externalFilter.type && state.externalFilter.value) {
            const filterTypeLabel = state.externalFilter.type.charAt(0).toUpperCase() + state.externalFilter.type.slice(1);
            finalTitle += `<br><span style="font-size:0.9rem; color:#5E6573;">(Filtered by ${filterTypeLabel}: ${state.externalFilter.value})</span>`;
        }
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
                // When dataset changes, reset metric to the first available one
                const firstMetric = Object.keys(datasetsConfig[selectedValue].metrics)[0];
                state.selectedMetric = firstMetric;
                metricDropdown.querySelector('.dropdown-selected').textContent = datasetsConfig[selectedValue].metrics[firstMetric].label + ' ▼';
                state.externalFilter = { type: null, value: null };
                await loadDataset(selectedValue);
                renderMap();
            });

            initDropdown(metricDropdown, (selectedValue) => {
                state.selectedMetric = selectedValue;
                renderMap();
            });

            document.addEventListener('applyDashboardFilter', async (e) => {
                const { filterType, filterValue } = e.detail;
                state.externalFilter = { type: filterType, value: filterValue };
                if (state.selectedDataset !== 'financial') {
                    state.selectedDataset = 'financial';
                    datasetDropdown.querySelector('.dropdown-selected').textContent = 'Profil Finansial Gen Z ▼';
                    updateMetricSelector('financial');
                    // If switching, also default to a relevant metric
                    state.selectedMetric = 'financial_balance';
                    metricDropdown.querySelector('.dropdown-selected').textContent = datasetsConfig['financial'].metrics['financial_balance'].label + ' ▼';
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

            // --- MODIFICATION: Set UI dropdowns to match the new default state on load ---
            datasetDropdown.querySelector('.dropdown-selected').textContent = 'Profil Finansial Gen Z ▼';
            metricDropdown.querySelector('.dropdown-selected').textContent = 'Fintech Populer (Logo) ▼';
            // --- END MODIFICATION ---

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