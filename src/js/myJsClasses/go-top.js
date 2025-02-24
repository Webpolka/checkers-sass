export class GoTop {    
    constructor(options) {
        this.btn = document.querySelector(options.element);
        this.showClass = options.activeClass;
    }    
    gotop() {
        window.addEventListener("scroll", () => {
            let scrolled = window.pageYOffset;
            let coords = document.documentElement.clientHeight;
            scrolled > coords ?
                this.btn.classList.add(this.showClass) :
                this.btn.classList.remove(this.showClass);
        });
        this.btn.addEventListener("click", () => {
            window.pageYOffset > 0 ? window.scrollTo({ top: 0, behavior: 'smooth' }) : ''
        });
    }    
    init() {
        this.gotop();
    }
}
