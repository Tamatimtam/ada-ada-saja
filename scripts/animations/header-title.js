// Animate the header title
function initHeaderTitleAnimation() {
    const chars = gsap.utils.toArray('.title-char');
    const accent = document.querySelector('.title-accent');
    const title = document.querySelector('.gen-z-title');
    const container = document.querySelector('.logo-container');

    // Check if elements exist before animating
    if (!title || !container || chars.length === 0 || !accent) {
        console.warn('Header title elements not found, skipping animation');
        return;
    }

    // Initial entrance animation
    const tl = gsap.timeline({ delay: 0.3 });

    tl.from(chars, {
        y: -50,
        opacity: 0,
        scale: 0.5,
        rotation: -15,
        duration: 0.8,
        ease: "back.out(2)",
        stagger: {
            each: 0.05,
            from: "start"
        }
    })
        .from(accent, {
            scaleX: 0,
            duration: 0.6,
            ease: "power3.out"
        }, "-=0.3");


    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = e.clientX - rect.left - rect.width / 2;
        mouse.y = e.clientY - rect.top - rect.height / 2;

        gsap.to(titlePos, {
            x: mouse.x * 0.15,
            y: mouse.y * 0.15,
            duration: 0.6,
            ease: "power2.out",
            onUpdate: () => {
                gsap.set(title, {
                    x: titlePos.x,
                    y: titlePos.y
                });
            }
        });
    });

    container.addEventListener('mouseleave', () => {
        gsap.to(titlePos, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
            onUpdate: () => {
                gsap.set(title, {
                    x: titlePos.x,
                    y: titlePos.y
                });
            }
        });
    });

    // Individual character hover interactions
    chars.forEach((char, i) => {
        char.addEventListener('mouseenter', () => {
            gsap.to(char, {
                scale: 1.3,
                rotation: gsap.utils.random(-15, 15),
                y: -10,
                color: i % 3 === 0 ? '#FF6B9D' : i % 3 === 1 ? '#5DADE2' : '#9B59B6',
                duration: 0.3,
                ease: "back.out(2)"
            });

            // Create ripple effect on neighbors
            const neighbors = [chars[i - 1], chars[i + 1]].filter(Boolean);
            gsap.to(neighbors, {
                scale: 1.15,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        char.addEventListener('mouseleave', () => {
            gsap.to(char, {
                scale: 1,
                rotation: 0,
                y: 0,
                color: 'transparent',
                duration: 0.4,
                ease: "elastic.out(1, 0.5)"
            });

            const neighbors = [chars[i - 1], chars[i + 1]].filter(Boolean);
            gsap.to(neighbors, {
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });



}
