export class OneSelect {

    constructor(element, options = {}) {
        let defaults = {
            placeholder: 'Выбирайте фруктики !',
            searchText: 'Поиск...',
            search: true,
            closeListOnItemSelect: false,
            edge: 0,
            numberCells: 7,                                 // количество выпадающих пунктов
            selectInDOM: true,
            name: '',
            width: '',
            height: '',
            dropdownWidth: '',
            data: [],
            onChange: function () { },
            onSelect: function () { },
            onUnselect: function () { }
        };

        this.wl_searchPlaceholder = options.searchText

        this.options = Object.assign(defaults, options);
        this.selectElement = typeof element === 'string' ? document.querySelector(element) : element;
        for (const prop in this.selectElement.dataset) {
            if (this.options[prop] !== undefined) {
                this.options[prop] = this.selectElement.dataset[prop];
            }
        }
        this.name = this.selectElement.getAttribute('name') ? this.selectElement.getAttribute('name') : 'one-select-' + Math.floor(Math.random() * 1000000);
        if (!this.options.data.length) {
            let options = this.selectElement.querySelectorAll('option');
            for (let i = 0; i < options.length; i++) {
                this.options.data.push({
                    value: options[i].value,
                    text: options[i].innerHTML,
                    selected: options[i].selected,
                    html: options[i].getAttribute('data-html')
                });
            }
        }
        this.options.max = 1
        this.related

        this.element = this._template();
        if (this.options.selectInDOM) {
            this.selectElement.after(this.element);
            this.selectElement.classList.add('visually-hidden')
            this.selectElement.setAttribute('tabindex', '-1')
            this.selectElement.setAttribute('aria-hidden', 'true')
        } else {
            this.selectElement.replaceWith(this.element);
        }
        this._updateSelected();
        this._eventHandlers();
        this.current
        this.visibleOptions
        this.doll
        this.memoryCellHeight
        this.searching = this.element.querySelector('.one-select-search')
    }

    _updateSelectElement(option) {
        this.selectElement.querySelectorAll('option').forEach(opt => {
            opt.removeAttribute('selected')
            if (opt.getAttribute('value') == option.getAttribute('data-value')) {
                opt.setAttribute('selected', '')
            }
        })
    }
    _openHeightSelect() {
        if (this.options.search) { var searchElement = this.element.querySelector('div.one-select-search-wrap') }
        var cellHeight
        var cellElement = this.element.querySelector('div.one-select-option')
        var optionsAllElement = this.element.querySelector('div.one-select-options')
        var optionsOnlyElement = this.element.querySelector('div.one-select-options-only')
        !this.memoryCellHeight ? this.memoryCellHeight = cellElement.scrollHeight : ''
        this.memoryCellHeight ? cellHeight = this.memoryCellHeight : cellHeight = cellElement.scrollHeight
        var optionsOnlyHeight = this.options.numberCells * cellHeight

        // console.log('Высота поиска - ', searchElement.scrollHeight,
        //     ' Высота ячейки -  ', cellElement.scrollHeight,
        //     ' Высота Оптионс  - ', optionsOnlyHeight);

        let paddingDropdownTop = parseInt(getComputedStyle(optionsAllElement, null).paddingTop)
        let paddingDropdownBottom = parseInt(getComputedStyle(optionsAllElement, null).paddingBottom)
        if (this.options.search) { var searchElementHeight = searchElement.scrollHeight } else { var searchElementHeight = 0 }
        optionsAllElement.style.height = optionsOnlyHeight + searchElementHeight + paddingDropdownTop + paddingDropdownBottom + 'px';
        optionsOnlyElement.style.height = optionsOnlyHeight + 'px'

        this.element.querySelectorAll('.one-select-option').forEach(el => {
            el.classList.remove('key-item-current')
        })
    }
    _consoleFormOptions(){
         // -------------- ВЫВОДИМ ВЫБРАННЫЕ ОПЦИИ ИЗ ОБЪЕКТА FormData ------------      
         var currentElement
         if (this.element.querySelector('.one-select-search')) { currentElement = this.element.querySelector('.one-select-search') }
         if (this.element.querySelector('[name="doll"]')) { currentElement = this.element.querySelector('[name="doll"]') }
         if (this.selectInDOM) { currentElement = this.selectElement }
         console.log('Набор кастомного Cелекта - ', new FormData(currentElement.form).getAll(this.name));    
    }

    _closeHeightSelect() {
        var optionsAllElement = this.element.querySelector('div.one-select-options')
        optionsAllElement.style.height = 0;  
        // this._consoleFormOptions()     
    }

    _scrollDown(optionItem, counter, optionAmount) {
        let scrollWindow = document.querySelector('.one-select-options-only')
        let scrollWindowHeight = scrollWindow.scrollHeight
        let clientWindowHeight = scrollWindow.clientHeight
        let elementHeight = optionItem.offsetHeight
        let numberVisibleItems = parseInt(clientWindowHeight / elementHeight)

        this.current++
        if (this.current >= numberVisibleItems - this.options.edge) { this.current = numberVisibleItems - this.options.edge }
        if (counter >= optionAmount) { this.current = 0 }

        if (counter === 0) {
            scrollWindow.scrollTo(0, - scrollWindowHeight);
            this.current = 0
        }

        if (this.current === numberVisibleItems - this.options.edge) {
            scrollWindow.scrollBy(0, elementHeight + 0.5);
        }
    }

    _scrollUp(optionItem, counter, optionAmount) {
        let scrollWindow = document.querySelector('.one-select-options-only')
        let scrollWindowHeight = scrollWindow.scrollHeight
        let clientWindowHeight = scrollWindow.clientHeight
        let elementHeight = optionItem.offsetHeight
        let numberVisibleItems = parseInt(clientWindowHeight / elementHeight)

        this.current--

        if (counter === optionAmount - 1) {
            scrollWindow.scrollTo(0, scrollWindowHeight);
            this.current = numberVisibleItems - this.options.edge
        }
        if (this.current <= 0) {
            scrollWindow.scrollBy(0, - elementHeight);
            this.current = 0
        }
    }
    _template() {
        let optionsHTML = '';

        for (let i = 0; i < this.data.length; i++) {
            optionsHTML += `
                <div class="one-select-option key-item ${this.selectedValues.includes(this.data[i].value) ? ' one-select-selected' : ''}" data-value="${this.data[i].value}">
                    <span class="one-select-option-radio"></span>
                    <span class="one-select-option-text">${this.data[i].html ? this.data[i].html : this.data[i].text}</span>
                </div>
            `;
        }
        let template = `
            <div class="one-select ${this.name}"${this.selectElement.id ? ' id="' + this.selectElement.id + '"' : ''} style="${this.width ? 'width:' + this.width + ';' : ''}${this.height ? 'height:' + this.height + ';' : ''}">
                ${this.selectedValues.map(value => `<input type="hidden" name="${this.name}" value="${value}">`).join('')}
                <div class="one-select-header" style="${this.width ? 'width:' + this.width + ';' : ''}${this.height ? 'height:' + this.height + ';' : ''}">
                <span class="one-select-header-placeholder">${this.placeholder}</span>                
                  
                </div>
                <div class="one-select-options" style="${this.options.dropdownWidth ? 'width:' + this.options.dropdownWidth + ';' : ''}">
                    ${this.options.search === true || this.options.search === 'true' ? `<div class='one-select-search-wrap'><input type="text" class="one-select-search" autocomplete = "off" placeholder=${this.wl_searchPlaceholder} name='search-${this.name}'></div>` : ''}
                      <div class="one-select-options-only">
                    ${optionsHTML}
                     </div>
                </div>
            </div>
        `;
        let element = document.createElement('div');
        element.setAttribute('name', `${this.name}`)
        element.innerHTML = template;
        return element;
    }

    _eventHandlers() {
        // ---------------------------- КЛАВА ----------------------------------
        if (this.options.selectInDOM) this.selectElement.querySelectorAll('option')[0].setAttribute('selected', '')
        if (this.options.selectInDOM) { this.element.querySelectorAll(`input[name="${this.name}"]`).forEach(el => { el.disabled = 'true'; el.style.display = 'none'; el.removeAttribute('type') }) }

        let counter = 15
        let related

        if (this.options.search) {
            var listener = this.element.querySelector('.one-select-search')
        } else {
            this.doll = document.createElement('input')
            this.doll.classList.add('visually-hidden')
            this.doll.setAttribute('name', 'doll')    /// ----1111
            this.doll.setAttribute('tabindex', '-1')   /// ---1111
            document.querySelector('div.one-select-options').appendChild(this.doll)
            var listener = this.doll;
        }

        listener.addEventListener('keydown', (event) => {

            this.visibleOptions = []
            this.element.querySelectorAll('.one-select-option').forEach(item => {
                getComputedStyle(item, null).display == 'flex' ? this.visibleOptions.push(item) : ''
            })
            let searchItems = this.visibleOptions
            event.stopPropagation()

            if (event.code === "ArrowUp" || event.code === "ArrowDown") {
                event.code === "ArrowUp" ? counter-- : counter++;

                if (counter < 0) counter = searchItems.length - 1
                if (counter > searchItems.length - 1) counter = 0

                if (event.code === "ArrowDown") this._scrollDown(searchItems[counter], counter, searchItems.length);
                if (event.code === "ArrowUp") this._scrollUp(searchItems[counter], counter, searchItems.length);

                if (related && (counter !== 0 || counter !== searchItems.length)) related.classList.remove("key-item-current")
                searchItems[counter].classList.add("key-item-current");
                related = searchItems[counter]
            }

            if (event.code === "Enter" || event.code === "Space") {

                const currentDropdownItem = document.querySelector(
                    ".key-item-current"
                );

                document.querySelectorAll(".key-item-current").forEach(el => {
                    el.classList.remove('key-item-current')
                });
                currentDropdownItem && currentDropdownItem.click();
                event.preventDefault()
            }
        })

        // ---------------------------- Мышка ----------------------------------
        let headerElement = this.element.querySelector('.one-select-header');
        this.related = this.element.querySelector('.one-select-options').querySelector('.one-select-selected')
        this.element.querySelectorAll('.one-select-option').forEach(option => {
            option.onclick = () => {

                this.options.selectInDOM ? this._updateSelectElement(option) : ''
                this.doll ? this.doll.focus() : this.searching.focus();
                let selected = true;

                if (!option.classList.contains('one-select-selected')) {
                    if (this.options.max && this.selectedValues.length >= 1) {
                        this.related.classList.remove('one-select-selected');
                        this.element.querySelectorAll('.one-select-header-option').forEach(headerOption => headerOption.dataset.value == this.related.dataset.value ? headerOption.remove() : '');
                        this.element.querySelector(`input[value="${this.related.dataset.value}"]`).remove();
                        this.data.filter(data => data.value == this.related.dataset.value)[0].selected = false;
                        selected = false;
                        option.classList.add('one-select-selected');
                        if (this.options.closeListOnItemSelect === true || this.options.closeListOnItemSelect === 'true') {
                            headerElement.classList.remove('one-select-header-active');
                            this._closeHeightSelect()
                            this.doll ? this.doll.blur() : this.searching.blur();
                        }
                        this.related = option
                        if (this.element.querySelector('.one-select-header-option')) {
                            let opt = Array.from(this.element.querySelectorAll('.one-select-header-option')).pop();
                            opt.insertAdjacentHTML('afterend', `<span class="one-select-header-option" data-value="${option.dataset.value}">${option.querySelector('.one-select-option-text').innerHTML}</span>`);
                        } else {
                            headerElement.insertAdjacentHTML('afterbegin', `<span class="one-select-header-option" data-value="${option.dataset.value}">${option.querySelector('.one-select-option-text').innerHTML}</span>`);
                        }

                        this.element.querySelector('.one-select').insertAdjacentHTML('afterbegin', `<input type="hidden" name="${this.name}" value="${option.dataset.value}">`);
                        this.data.filter(data => data.value == option.dataset.value)[0].selected = true;
                        if (this.options.selectInDOM) { this.element.querySelectorAll(`input[name="${this.name}"]`).forEach(el => { el.disabled = 'true'; el.style.display = 'none'; el.removeAttribute('type') }) }

                        return;
                    }
                    option.classList.add('one-select-selected');
                    this.related = option

                    if (this.element.querySelector('.one-select-header-option')) {
                        let opt = Array.from(this.element.querySelectorAll('.one-select-header-option')).pop();
                        opt.insertAdjacentHTML('afterend', `<span class="one-select-header-option" data-value="${option.dataset.value}">${option.querySelector('.one-select-option-text').innerHTML}</span>`);
                    } else {
                        headerElement.insertAdjacentHTML('afterbegin', `<span class="one-select-header-option" data-value="${option.dataset.value}">${option.querySelector('.one-select-option-text').innerHTML}</span>`);
                    }

                    this.element.querySelector('.one-select').insertAdjacentHTML('afterbegin', `<input type="hidden" name="${this.name}" value="${option.dataset.value}">`);
                    this.data.filter(data => data.value == option.dataset.value)[0].selected = true;
                    if (this.options.selectInDOM) { this.element.querySelectorAll(`input[name="${this.name}"]`).forEach(el => { el.disabled = 'true'; el.style.display = 'none'; el.removeAttribute('type') }) }

                } else {
                    option.classList.remove('one-select-selected');
                    this.element.querySelectorAll('.one-select-header-option').forEach(headerOption => headerOption.dataset.value == option.dataset.value ? headerOption.remove() : '');
                    this.element.querySelector(`input[value="${option.dataset.value}"]`).remove();
                    this.data.filter(data => data.value == option.dataset.value)[0].selected = false;
                    selected = false;
                }
                if (!this.element.querySelector('.one-select-header-option')) {
                    headerElement.insertAdjacentHTML('afterbegin', `<span class="one-select-header-placeholder">${this.placeholder}</span>`);
                } else if (this.element.querySelector('.one-select-header-placeholder')) {
                    this.element.querySelector('.one-select-header-placeholder').remove();
                }
                if (this.options.search === true || this.options.search === 'true') {
                    this.element.querySelector('.one-select-search').value = '';
                }
                this.element.querySelectorAll('.one-select-option').forEach(option => option.style.display = 'flex');
                if (this.options.closeListOnItemSelect === true || this.options.closeListOnItemSelect === 'true') {
                    headerElement.classList.remove('one-select-header-active');
                    this._closeHeightSelect()
                    this.doll ? this.doll.blur() : this.searching.blur();
                }
                this.options.onChange(option.dataset.value, option.querySelector('.one-select-option-text').innerHTML, option);
                if (selected) {
                    this.options.onSelect(option.dataset.value, option.querySelector('.one-select-option-text').innerHTML, option);
                } else {
                    this.options.onUnselect(option.dataset.value, option.querySelector('.one-select-option-text').innerHTML, option);
                }
            };
        });

        // ----------------------------- Клик по каретке ОТКРЫТЬ\ЗАКРЫТЬ Мультиселект --------------------------------------
        headerElement.onclick = () => {
            headerElement.classList.toggle('one-select-header-active')
            if (headerElement.classList.contains('one-select-header-active')) {
                this._openHeightSelect()
                counter = 15
                setTimeout(() => { this.doll ? this.doll.focus() : this.searching.focus() }, 400)


            } else {
                this._closeHeightSelect()

                this.doll ? this.doll.blur() : this.searching.blur();

            }
        }
        if (this.options.search === true || this.options.search === 'true') {
            let search = this.element.querySelector('.one-select-search');
            search.oninput = () => {
                var filtered = []
                this.element.querySelectorAll('.one-select-option').forEach(option => {
                    option.style.display = option.querySelector('.one-select-option-text').innerHTML.toLowerCase().indexOf(search.value.toLowerCase()) > -1 ? 'flex' : 'none';
                    option.classList.remove('key-item-current')
                    if (option.style.display !== 'none') filtered.push(option)
                })

                counter = 15
                filtered.length === 1 ? filtered[0].classList.add('key-item-current') : ''
            }
        }

        if (this.selectElement.id && document.querySelector('label[for="' + this.selectElement.id + '"]')) {
            document.querySelector('label[for="' + this.selectElement.id + '"]').onclick = () => {
                headerElement.classList.toggle('one-select-header-active');
                if (headerElement.classList.contains('one-select-header-active')) {
                    this._openHeightSelect()
                    this.doll && this.doll.focus();
                    this.searching && this.searching.focus();
                } else {
                    this._closeHeightSelect()
                    this.doll && this.doll.blur();
                    this.searching && this.searching.blur()
                }
            };
        }
        document.addEventListener('click', event => {
            if (!event.target.closest('.' + this.name) && !event.target.closest('label[for="' + this.selectElement.id + '"]')) {
                headerElement.classList.remove('one-select-header-active');
                this._closeHeightSelect()
                this.doll ? this.doll.blur() : this.searching.blur();
            }
        });
    }

    _updateSelected() {
        this.element.querySelectorAll('.one-select-option').forEach(option => {
            if (option.classList.contains('one-select-selected')) {
                this.element.querySelector('.one-select-header').insertAdjacentHTML('afterbegin', `<span class="one-select-header-option" data-value="${option.dataset.value}">${option.querySelector('.one-select-option-text').innerHTML}</span>`);
            }
        });

        if (this.element.querySelector('.one-select-header-option')) {
            this.element.querySelector('.one-select-header-placeholder').remove();

        }
    }

    get selectedValues() {
        return this.data.filter(data => data.selected).map(data => data.value);
    }

    get selectedItems() {
        return this.data.filter(data => data.selected);
    }

    set data(value) {
        this.options.data = value;
    }

    get data() {
        return this.options.data;
    }

    set selectElement(value) {
        this.options.selectElement = value;
    }

    get selectElement() {
        return this.options.selectElement;
    }

    set element(value) {
        this.options.element = value;
    }

    get element() {
        return this.options.element;
    }

    set placeholder(value) {
        this.options.placeholder = value;
    }

    get placeholder() {
        return this.options.placeholder;
    }

    set name(value) {
        this.options.name = value;
    }

    get name() {
        return this.options.name;
    }

    set width(value) {
        this.options.width = value;
    }

    get width() {
        return this.options.width;
    }

    set height(value) {
        this.options.height = value;
    }

    get height() {
        return this.options.height;
    }

}
