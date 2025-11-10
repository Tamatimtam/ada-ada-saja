function initHeroTextAnimation() {
    // Animate the main hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        // Split the title into characters
        const chars = heroTitle.textContent.split('').map(char => {
            const span = document.createElement('span');
            span.textContent = char;
            // MODIFIED: Removed the line that converted spaces to &nbsp;
            // The browser will now correctly handle wrapping.
            return span;
        });
        heroTitle.innerHTML = '';
        heroTitle.append(...chars);

        // Animate characters with GSAP
        gsap.from(chars, {
            yPercent: 100,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.03,
            delay: 0.2
        });
    }

    // Animate the description paragraph
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
        // Split the paragraph into lines for a line-by-line reveal
        const lines = heroDescription.innerHTML.split('<br>').map(lineText => {
            const lineWrapper = document.createElement('div');
            lineWrapper.className = 'line-wrapper';
            const lineContent = document.createElement('div');
            lineContent.className = 'line-content';
            lineContent.innerHTML = lineText.trim();
            lineWrapper.appendChild(lineContent);
            return lineWrapper;
        });
        heroDescription.innerHTML = '';
        heroDescription.append(...lines);

        // Animate lines with GSAP
        gsap.from('.line-content', {
            yPercent: 110,
            duration: 1,
            ease: "power3.out",
            stagger: 0.15,
            delay: 0.5
        });
    }
}