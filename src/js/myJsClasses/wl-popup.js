export class WLPopUp {
    constructor(options) {
        this.overlay = options.overlay
        this.id = options.id
        if (options.parent && document.querySelector(`[popup-id=${options.id}]`)) {
            this.parent = document.querySelector(`[popup-id=${options.id}]`)
            this.elements = this.parent.querySelectorAll('[popup-item="child"]');
            console.log('@--POPUP--@ Родитель ' + options.id + ' найден ! OK !');
            this.valid = true
        } else if (!options.parent && !document.querySelector(`[popup-id=${options.id}]`) ||
            !options.parent && document.querySelector(`[popup-id=${options.id}]`)) {
            console.log('@--POPUP--@ Родитель ' + options.id + ' не обнаружен, либо {parent: false} в main.js, будут взяты все элементы с атрубатами [popup-item = "' + options.item + '"], если найдутся !');
            this.elements = document.querySelectorAll(`[popup-item=${options.item}]`);
            this.valid = true
        } else if (options.parent && !document.querySelector(`[popup-id=${options.id}]`)) {
            console.log('@--POPUP--@ В DOM родителя [popup-id = ' + options.id + ' нет, но в main.js установленно true ( нужно исправить ! )');
            this.valid = false
        }
        this.bodyElement = document.querySelector('body');
    }
    addPopUp() {       
        
        let id = this.id
        this.bodyElement.insertAdjacentHTML('beforeend', this.popupWindow(id));
        let overlay = this.overlay
        let popup = document.getElementById(id);
        let origin = popup.querySelector('.popup__fullimg')
        let caption = popup.querySelector('.popup__caption')
        let arrowCounter

        if (this.elements.length > 1) {
            var arrowLeft = popup.querySelector('.popup__arrows-left')
            var arrowRight = popup.querySelector('.popup__arrows-right')
        }

        for (let i = 0; i < this.elements.length; i++) {
            let el = this.elements[i]
            el.insertAdjacentHTML('beforeend', overlay);
            el.addEventListener('click', (e) => {
                popup.classList.add('show')
                origin.classList.add('open')
                let curr = el.querySelector('img')
                origin.src = curr.getAttribute('src')
                caption.textContent = curr.alt
                arrowCounter = i
                e.stopPropagation()
                e.preventDefault()
            })
        };

        let popupClose = popup.querySelector('.popup__close')
        popupClose.addEventListener('click', (e) => {
            popup.classList.remove('show')
            origin.classList.remove('open')
            e.stopPropagation()
            e.preventDefault()
        })
        if (this.elements.length > 1) {
            arrowLeft.addEventListener('click', (e) => {
                arrowCounter--;
                if (arrowCounter < 0) { arrowCounter = this.elements.length - 1 }
                let targetImg = this.elements[arrowCounter].querySelector('img')
                origin.src = targetImg.getAttribute('src')
                caption.textContent = targetImg.alt
                e.stopPropagation()
                e.preventDefault()
            })
            arrowRight.addEventListener('click', (e) => {
                arrowCounter++;
                if (arrowCounter > this.elements.length - 1) { arrowCounter = 0 }
                let targetImg = this.elements[arrowCounter].querySelector('img')
                origin.src = targetImg.getAttribute('src')
                caption.textContent = targetImg.alt
                e.stopPropagation()
                e.preventDefault()
            })
        }
    }
    popupWindow(id) {
        let html = `<div class="popup" id=${id}>
                <img src="" alt="" class="popup__fullimg">
                    <p class="popup__caption"></p>
                    <span class="popup__close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                        </svg>
                    </span>`;
        if (this.elements.length > 1) {
            html += `
                    <div class="popup__arrows">
                        <span class="popup__arrows-left">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                                <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"></path>
                            </svg>
                        </span>
                        <span class="popup__arrows-right">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                                <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"></path>
                            </svg>
                        </span>
                    </div>
                </div>`
        }
        return html;
    }
    init() {
        this.valid && this.addPopUp();
    }
}