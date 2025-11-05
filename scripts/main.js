document.addEventListener("DOMContentLoaded", () => {
    const componentsToLoad = [
        { url: "components/header/header.html", parent: ".dashboard-window", position: 'afterbegin' },
        { url: "components/knowledge-card/knowledge-card.html", parent: ".dashboard-content" },
        { url: "components/behavior-card/behavior-card.html", parent: ".dashboard-content" },
        { url: "components/wellbeing-card/wellbeing-card.html", parent: ".dashboard-content" }
    ];

    let loadedCount = 0;

    const loadComponent = (url, parentSelector, position = 'beforeend') => {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load component: ${url}`);
                }
                return response.text();
            })
            .then(data => {
                const parentElement = document.querySelector(parentSelector);
                if (parentElement) {
                    parentElement.insertAdjacentHTML(position, data);
                    loadedCount++;

                    // Initialize animations after all components are loaded
                    if (loadedCount === componentsToLoad.length) {
                        // Small delay to ensure DOM is fully rendered
                        setTimeout(() => {
                            if (typeof initAllAnimations === 'function') {
                                initAllAnimations();
                            }
                        }, 100);
                    }
                } else {
                    console.error(`Parent element not found: ${parentSelector}`);
                }
            })
            .catch(error => console.error(error));
    };

    // Load all components
    componentsToLoad.forEach(component => {
        loadComponent(component.url, component.parent, component.position);
    });
});
