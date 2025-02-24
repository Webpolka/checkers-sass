
export class WLScrollAnimation {
    constructor(options) {
        this.point = options.point
        this.delay = options.delay
        this.parent = options.parent
        this.child = options.child
        this.activeClass = options.activeClass
    }

    colAnimation() {
        let point = this.point
        let child = this.child
        let activeClass = this.activeClass
        let revels = document.querySelectorAll(child)        
        var revealpoint = point;

        reveal()
        window.addEventListener('scroll', reveal);

        function reveal() {           
            var windowheight = window.innerHeight
            for (var j = 0; j < revels.length; j++) {               
                let revealtop = revels[j].getBoundingClientRect().top;
                if (revealtop < windowheight - revealpoint) {
                    revels[j].classList.add(activeClass)
                } else {
                    revels[j].classList.remove(activeClass)
                }
            }
        }
    }

    rowAnimation() {
        let point = this.point
        let delay = this.delay
        let parent = this.parent
        let child = this.child
        let activeClass = this.activeClass
        let revels = document.querySelectorAll(parent)        
        var revealpoint = point;

        revealRow()
        window.addEventListener('scroll', revealRow);
        
        function revealRow() {           
            var windowheight = window.innerHeight
            for (var j = 0; j < revels.length; j++) {                
                var revealtop = revels[j].getBoundingClientRect().top;                
                if (revealtop < windowheight - revealpoint) {
                    revels[j].classList.add(activeClass)
                    if (revels[j].classList.contains(activeClass)) {
                        let cc = 0
                        revels[j].querySelectorAll(child).forEach(el => {
                            el.classList.add(activeClass)
                            el.style.transitionDelay = (cc * delay) + 'ms'
                            cc++;
                        })
                        cc = 0
                    }
                } else {
                    revels[j].classList.remove(activeClass)
                    if (!revels[j].classList.contains(activeClass)) {
                        revels[j].querySelectorAll(child).forEach(el => {
                            el.classList.remove(activeClass)
                            el.style.transitionDelay = 0 + 'ms'
                        })

                    }
                }
            }
        }
    }
    init() {
        if (this.parent && this.delay && this.child && this.activeClass) {
            this.rowAnimation();           
        } else if (!this.parent && !this.delay){
            this.colAnimation();          
        }

    }
}

