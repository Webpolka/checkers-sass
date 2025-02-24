// ------------------------------------------ HTML --------------------------------------------------
// <div class="sidebar">
//    <div class="sidebar-sticky">
//        Sidebar content
//    </div>
// </div>
// -------------------------------------------- SCSS -------------------------------------------------
//
// .sidebar{
//     min-height: 100%;
//     &-sticky{
//         position: sticky;
//         transition: top 1s ease-in-out; 
//     }
// }
//
// -------------------------------------------- main.js -----------------------------------------------
//
// import {StickySidebar} from './myJsClasses/wl-sidebar-sticky.js'
//  new StickySidebar({
//   header: '.header',           // --- шапка сайта нужна для определения высоты шапки -- 
//   sidebar: '.sidebar',         // --- сайдбар который должен стать липким 
//   delay: 250                   // --- задержка при скроле (желательно ставить не меньше 100)
//  }).init();
//
// ---------------------------------------------- JS ---------------------------------------------------

export class StickySidebar {
    constructor(options) {
        this.header = document.querySelector(options.header)
        this.sidebarSticky = document.querySelector(options.sidebar).querySelector('.sidebar-sticky')
        this.delay = options.delay
    }
    listening() {
        var temp = 0
        var timer
        let pause = this.delay
        let header = this.header;
        let sidebarSticky = this.sidebarSticky


        scrollCheck()
        function scrollCheck() {
            var currentScrollTop = parseInt(document.documentElement.scrollTop);
            if (temp > currentScrollTop) {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    sidebarSticky.style.top = header.offsetHeight + (3 * 16) + 'px';
                }, pause)
            } else if (temp < currentScrollTop) {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    if (window.innerHeight < sidebarSticky.offsetHeight) {
                        sidebarSticky.style.top =  window.innerHeight - sidebarSticky.scrollHeight + 'px';
                    }
                }, pause)
            } else {
                return;
            }
            temp = currentScrollTop
        }

        document.addEventListener('scroll', scrollCheck)
    }

    init() {
        this.listening();
    }
}


