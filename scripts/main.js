document.addEventListener("DOMContentLoaded", () => {
    const loadComponent = (url, parentSelector, position = 'beforeend') => {
        return fetch(url)
            .then(response => response.ok ? response.text() : Promise.reject(`Failed to load ${url}`))
            .then(data => {
                const parentElement = document.querySelector(parentSelector);
                if (parentElement) {
                    parentElement.insertAdjacentHTML(position, data);
                } else {
                    console.error(`Parent element not found: ${parentSelector}`);
                }
            })
            .catch(error => console.error(error));
    };

    const loadApp = async () => {
        const dashboardWindow = document.querySelector('.dashboard-window');

        // 1. Load the hero section first
        await loadComponent("components/hero-section/hero-section.html", ".dashboard-window", 'afterbegin');

        // 2. Create and inject the card grid container
        dashboardWindow.insertAdjacentHTML('beforeend', '<main class="card-grid"></main>');

        // 3. Load all main cards into the new card grid container
        const cardComponents = [
            "components/knowledge-card/knowledge-card.html",
            "components/behavior-card/behavior-card.html",
            "components/wellbeing-card/wellbeing-card.html"
        ];

        await Promise.all(cardComponents.map(url => loadComponent(url, ".card-grid")));

        // 4. All components are loaded, initialize animations
        setTimeout(() => {
            if (typeof initAllAnimations === 'function') {
                initAllAnimations();
            }
        }, 100);
    };

    loadApp();
});