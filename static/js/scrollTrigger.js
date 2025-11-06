// Minimal ScrollTrigger implementation
// For production, use the actual GSAP ScrollTrigger plugin
(function () {
    gsap.registerPlugin({
        name: "scrollTrigger",
        init: function (target, vars) {
            this.vars = vars;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (this.animation) {
                            this.animation.play();
                        } else {
                            this.animation = gsap.getTweensOf(target)[0];
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: (vars.start && vars.start.includes('%')) ? `-${100 - parseInt(vars.start.split(' ')[1])}% 0px` : '0px'
            });

            if (target.nodeType) {
                observer.observe(target);
            } else if (target.length) {
                gsap.utils.toArray(target).forEach(el => observer.observe(el));
            }
            return true;
        }
    });
}());
