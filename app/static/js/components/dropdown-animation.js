function initDropdownAnimation() {
    const dropdown = document.querySelector('.custom-dropdown');
    if (!dropdown) return;

    const selected = dropdown.querySelector('.dropdown-selected');
    const options = dropdown.querySelector('.dropdown-options');

    // Wrap initial text in a span for animation
    selected.innerHTML = `<span>${selected.textContent}</span>`;

    // GSAP timeline for the dropdown opening
    const tl = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
            // Explicitly set pointerEvents to none when closed
            gsap.set(options, { pointerEvents: 'none' });
        }
    });
    tl.fromTo(options,
        { opacity: 0, y: 10, pointerEvents: 'none' },
        {
            opacity: 1,
            y: 0,
            pointerEvents: 'auto',
            duration: 0.3,
            ease: 'power2.out'
        }
    );

    // Hover animation for the selected item
    selected.addEventListener('mouseenter', () => {
        gsap.to(selected, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    selected.addEventListener('mouseleave', () => {
        gsap.to(selected, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    selected.addEventListener('click', () => {
        dropdown.classList.toggle('open');
        if (dropdown.classList.contains('open')) {
            tl.play();
        } else {
            tl.reverse();
        }
    });

    options.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const newValue = e.target.textContent;
            const textSpan = selected.querySelector('span');

            if (textSpan && textSpan.textContent !== newValue) {
                if (gsap.isTweening(textSpan)) return;

                const animTl = gsap.timeline();
                animTl.to(textSpan, {
                    opacity: 0,
                    y: -10,
                    duration: 0.2,
                    ease: 'power2.in'
                })
                    .add(() => {
                        textSpan.textContent = newValue + ' ▼';
                    })
                    .to(textSpan, {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
            }

            selected.dataset.value = e.target.dataset.value;
            dropdown.classList.remove('open');
            tl.reverse();
            document.dispatchEvent(new CustomEvent('filterChanged', { detail: { filterBy: e.target.dataset.value } }));
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            if (dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
                tl.reverse();
            }
        }
    });
}
