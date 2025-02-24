export class MultiSelect {

    constructor(element, options = {}) {
        let defaults = {
            placeholder: 'Выбирайте фруктики !',
            selectAllText: 'Выбрать все !',
            howMuchText: "выбрано !",
            searchText: 'Поиск...',
            showCounter: true,
            max: 5,
            search: true,
            selectAll: false,
            listAll: true,
            closeListOnItemSelect: false,
            edge: 0,
            numberCells: 5,
            selectInDOM: false,                              // если true то остаеться select, если false то только inputs в div
            name: '',
            width: '',
            height: '',
            dropdownWidth: '',
            dropdownHeight: '',
            data: [],
            onChange: function () { },
            onSelect: function () { },
            onUnselect: function () { }
        };

        this.wl_selectAllPlaceholder = options.selectAllText
        this.wl_searchPlaceholder = options.searchText
        this.wl_selectedPlaceholder = options.howMuchText
        this.wl_counterPlaceHolder = options.showCounter

        this.options = Object.assign(defaults, options);
        this.selectElement = typeof element === 'string' ? document.querySelector(element) : element;
        for (const prop in this.selectElement.dataset) {
            if (this.options[prop] !== undefined) {
                this.options[prop] = this.selectElement.dataset[prop];
            }
        }
        this.name = this.selectElement.getAttribute('name') ? this.selectElement.getAttribute('name') : 'multi-select-' + Math.floor(Math.random() * 1000000);
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
        this.searching = this.element.querySelector('.multi-select-search')
    }
    _updateSelectElement(optionsArray) {
        this.selectElement.querySelectorAll('option').forEach(opt => {
            opt.removeAttribute('selected')
            optionsArray.forEach(arrayItem => {
                if (opt.getAttribute('value') == arrayItem.getAttribute('data-value')) {
                    opt.setAttribute('selected', '')
                }
            })

        })
    }
    _scrollDown(optionItem, counter, optionAmount) {
        if (!optionItem.classList.contains('multi-select-all')) {
            let scrollWindow = document.querySelector('.multi-select-options-only')
            let scrollWindowHeight = scrollWindow.scrollHeight
            let clientWindowHeight = scrollWindow.clientHeight
            let elementHeight = optionItem.offsetHeight
            let numberVisibleItems = parseInt(clientWindowHeight / elementHeight)

            this.current++
            if (this.current >= numberVisibleItems - this.options.edge) { this.current = numberVisibleItems - this.options.edge }
            if (counter === 0) { this.current = 0 }

            if (counter === 0) {
                scrollWindow.scrollTo(0, - scrollWindowHeight);
                this.current = 0
            }
            if (this.current === numberVisibleItems - this.options.edge) {
                scrollWindow.scrollBy(0, elementHeight + 0.5);
            }
        }
    }

    _scrollUp(optionItem, counter, optionAmount) {
        if (!optionItem.classList.contains('multi-select-all')) {
            let scrollWindow = document.querySelector('.multi-select-options-only')
            let scrollWindowHeight = scrollWindow.scrollHeight
            let clientWindowHeight = scrollWindow.clientHeight
            let elementHeight = optionItem.offsetHeight
            let numberVisibleItems = parseInt(clientWindowHeight / elementHeight)

            this.current--
            if (this.current < 1) { this.current = 0 }
            if (counter === optionAmount) { this.current = numberVisibleItems - this.options.edge }

            if (counter === optionAmount) {
                scrollWindow.scrollTo(0, scrollWindowHeight);
                this.current = numberVisibleItems - this.options.edge
            }
            if (this.current === 0) {
                scrollWindow.scrollBy(0, - (elementHeight - 0.5));
            }
        }
    }
    _openHeightSelect() {
        if (this.options.search) { var searchElement = this.element.querySelector('div.multi-select-search-wrap') }
        if (this.options.selectAll) { var allElement = this.element.querySelector('div.multi-select-all') }

        var cellHeight
        var cellElement = this.element.querySelector('div.multi-select-option')
        var optionsAllElement = this.element.querySelector('div.multi-select-options')
        var optionsOnlyElement = this.element.querySelector('div.multi-select-options-only')
        !this.memoryCellHeight ? this.memoryCellHeight = cellElement.scrollHeight : ''
        this.memoryCellHeight ? cellHeight = this.memoryCellHeight : cellHeight = cellElement.scrollHeight
        var optionsOnlyHeight = this.options.numberCells * cellHeight

        // console.log('Высота поиска - ', searchElement.scrollHeight,               
        //     ' Высота ячейки -  ', cellElement.scrollHeight,
        //     ' Высота Оптионс  - ', optionsOnlyHeight);

        let paddingDropdownTop = parseInt(getComputedStyle(optionsAllElement, null).paddingTop)
        let paddingDropdownBottom = parseInt(getComputedStyle(optionsAllElement, null).paddingBottom)
        if (this.options.selectAll) { var allElementHeight = allElement.scrollHeight } else { var allElementHeight = 0 }
        if (this.options.search) { var searchElementHeight = searchElement.scrollHeight } else { var searchElementHeight = 0 }
        optionsAllElement.style.height = optionsOnlyHeight + allElementHeight + searchElementHeight + paddingDropdownTop + paddingDropdownBottom + 'px';
        optionsOnlyElement.style.height = optionsOnlyHeight + 'px'
        this.element.querySelectorAll('.multi-select-option').forEach(el => {
            el.classList.remove('key-item-current')
        })
    }
    _consoleFormOptions(){
        // -------------- ВЫВОДИМ ВЫБРАННЫЕ ОПЦИИ ИЗ ОБЪЕКТА FormData ------------      
        var currentElement
        if (this.element.querySelector('.multi-select-search')) { currentElement = this.element.querySelector('.multi-select-search') }
        if (this.element.querySelector('[name="doll"]')) { currentElement = this.element.querySelector('[name="doll"]') }
        if (this.selectInDOM) { currentElement = this.selectElement }
        console.log('Набор кастомного Мультиселекта - ', new FormData(currentElement.form).getAll(this.name));    
   }

    _closeHeightSelect() {
        var optionsAllElement = this.element.querySelector('div.multi-select-options')
        optionsAllElement.style.height = 0;
        // this._consoleFormOptions()           
    }

    _template() {
        let optionsHTML = '';


        for (let i = 0; i < this.data.length; i++) {
            optionsHTML += `<div class="multi-select-option key-item ${this.selectedValues.includes(this.data[i].value) ? ' multi-select-selected' : ''}" data-value="${this.data[i].value}">
                    <span class="multi-select-option-radio"></span>
                    <span class="multi-select-option-text">${this.data[i].html ? this.data[i].html : this.data[i].text}</span>
                </div>`;
        }

        let selectAllHTML = '';
        if (this.options.selectAll === true || this.options.selectAll === 'true') {
            selectAllHTML = `<div class="multi-select-all key-item">
                <span class="multi-select-option-radio"></span>
                <span class="multi-select-option-text">${this.wl_selectAllPlaceholder}</span>
            </div>`;
        }
        let template = `
            <div class="multi-select ${this.name}"${this.selectElement.id ? ' id="' + this.selectElement.id + '"' : ''} style="${this.width ? 'width:' + this.width + ';' : ''}${this.height ? 'height:' + this.height + ';' : ''}">
                ${this.selectedValues.map(value => `<input type="hidden" name="${this.name}" value="${value}">`).join('')}
                <div class="multi-select-header" style="${this.width ? 'width:' + this.width + ';' : ''}${this.height ? 'height:' + this.height + ';' : ''}">
                <span class="multi-select-header-placeholder">${this.placeholder}</span> 
                <span class="multi-select-header-max">${this.options.max && this.wl_counterPlaceHolder ? this.selectedValues.length + '/' + this.options.max : ''}</span>
                  
                </div>
                <div class="multi-select-options" style="${this.options.dropdownWidth ? 'width:' + this.options.dropdownWidth + ';' : ''}${this.options.dropdownHeight ? 'height:' + this.options.dropdownHeight + ';' : ''}">
                    ${this.options.search === true || this.options.search === 'true' ? `<div class='multi-select-search-wrap'><input type="text" class="multi-select-search" autocomplete="off" placeholder=${this.wl_searchPlaceholder} name='search-${this.name}'></div>` : ''}
                   ${selectAllHTML}
                   <div class="multi-select-options-only">
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
        // ---------------------------- КЛАВА ---------------------------------
        let counter = 15
        let related

        if (this.options.search) {
            var listener = this.element.querySelector('.multi-select-search')
        } else {
            this.doll = document.createElement('input')
            this.doll.classList.add('visually-hidden')
            this.doll.setAttribute('name', 'doll')
            this.doll.setAttribute('tabindex', '-1')
            document.querySelector('div.multi-select-options').appendChild(this.doll)
            var listener = this.doll;
        }

        listener.addEventListener('keydown', (event) => {
            if (!this.options.search) { event.preventDefault() }

            this.visibleOptions = []
            this.element.querySelectorAll('.multi-select-option').forEach(item => {
                getComputedStyle(item, null).display == 'flex' ? this.visibleOptions.push(item) : ''
            })

            let searchItems = this.visibleOptions
            event.stopPropagation()

            if (event.code === "ArrowUp" || event.code === "ArrowDown") {
                event.code === "ArrowUp" ? counter-- : counter++;


                if (counter < 0) counter = searchItems.length - 1
                if (counter > searchItems.length - 1) counter = 0

                if (event.code === "ArrowDown") this._scrollDown(searchItems[counter], counter, searchItems.length - 1);
                if (event.code === "ArrowUp") this._scrollUp(searchItems[counter], counter, searchItems.length - 1);

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
                if (this.options.search) { event.preventDefault() }
            }
        })




        // -------------------------  КЛИКИ МЫШКОЙ -----------------------------
        let headerElement = this.element.querySelector('.multi-select-header');
        this.element.querySelectorAll('.multi-select-option').forEach(option => {
            option.onclick = () => {

                this.doll ? this.doll.focus() : this.searching.focus();
                let selected = true;
                if (!option.classList.contains('multi-select-selected')) {
                    if (this.options.max && this.selectedValues.length >= this.options.max) {
                        return;
                    }
                    option.classList.add('multi-select-selected');
                    if (this.options.listAll === true || this.options.listAll === 'true') {
                        if (this.element.querySelector('.multi-select-header-option')) {
                            let opt = Array.from(this.element.querySelectorAll('.multi-select-header-option')).pop();
                            opt.insertAdjacentHTML('afterend', `<span class="multi-select-header-option" data-value="${option.dataset.value}">${option.querySelector('.multi-select-option-text').innerHTML}</span>`);
                        } else {
                            headerElement.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-option" data-value="${option.dataset.value}">${option.querySelector('.multi-select-option-text').innerHTML}</span>`);
                        }
                    }
                    this.element.querySelector('.multi-select').insertAdjacentHTML('afterbegin', `<input type="hidden" name="${this.name}" value="${option.dataset.value}">`);
                    this.data.filter(data => data.value == option.dataset.value)[0].selected = true;
                    if (this.options.selectInDOM) { this.element.querySelectorAll(`input[name="${this.name}"]`).forEach(el => { el.disabled = 'true'; el.style.display = 'none'; el.removeAttribute('type') }) }
                } else {
                    option.classList.remove('multi-select-selected');
                    this.element.querySelectorAll('.multi-select-header-option').forEach(headerOption => headerOption.dataset.value == option.dataset.value ? headerOption.remove() : '');
                    this.element.querySelector(`input[value="${option.dataset.value}"]`).remove();
                    this.data.filter(data => data.value == option.dataset.value)[0].selected = false;
                    selected = false;
                }
                if (this.options.listAll === false || this.options.listAll === 'false') {
                    if (this.element.querySelector('.multi-select-header-option')) {
                        this.element.querySelector('.multi-select-header-option').remove();
                    }
                    // ------------------------------------------------------------------------СКОЛЬКО ВЫБРАНО ЗДЕСЬ PLACEHOLDER ----------
                    if (this.selectedValues.length) {
                        headerElement.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-option">${this.selectedValues.length} ${this.wl_selectedPlaceholder}</span>`);
                    }
                }
                if (!this.element.querySelector('.multi-select-header-option')) {
                    headerElement.insertAdjacentHTML('afterbegin', `<span class="multi-select-header-placeholder">${this.placeholder}</span>`);
                } else if (this.element.querySelector('.multi-select-header-placeholder')) {
                    this.element.querySelector('.multi-select-header-placeholder').remove();
                }// ---------------------------------------------------------------------------ВЫВОДИТ СКОЛЬКО ИЗ СКОЛЬКИ PLACEHOLDER----------------
                if (this.options.max) {
                    if (this.wl_counterPlaceHolder) {
                        this.element.querySelector('.multi-select-header-max').innerHTML = `${this.selectedValues.length} / ${this.options.max}`
                    }
                }
                if (this.options.search === true || this.options.search === 'true') {
                    this.element.querySelector('.multi-select-search').value = '';
                }
                this.element.querySelectorAll('.multi-select-option').forEach(option => option.style.display = 'flex');
                if ((this.options.closeListOnItemSelect === true || this.options.closeListOnItemSelect === 'true') &&
                    this.selectedValues.length >= this.options.max) {
                    headerElement.classList.remove('multi-select-header-active');
                    this.element.querySelectorAll('.multi-select-option').forEach(el => {
                        el.classList.remove("key-current")
                        this._closeHeightSelect()
                        this.doll ? this.doll.blur() : this.searching.blur();
                    })

                }
                this.options.onChange(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                if (selected) {
                    this.options.onSelect(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                } else {
                    this.options.onUnselect(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                }
                ////  ----------------- OPTIONS ARRAY  ---------------------
                if (this.options.selectInDOM) {
                    let optionsArray = []
                    this.element.querySelectorAll('.multi-select-option').forEach(opt => {
                        if (opt.classList.contains('multi-select-selected')) optionsArray.push(opt)
                    })
                    this._updateSelectElement(optionsArray)
                }
                //// ------------- END OPTIONS ARRAY  ----------------------
            };
        });

        // ----------------------------- Клик по каретке ОТКРЫТЬ\ЗАКРЫТЬ Мультиселект --------------------------------------
        headerElement.onclick = () => {
            headerElement.classList.toggle('multi-select-header-active')
            if (headerElement.classList.contains('multi-select-header-active')) {
                this._openHeightSelect()
                counter = 15
                setTimeout(() => { this.doll ? this.doll.focus() : this.searching.focus() }, 400)
            } else {
                this._closeHeightSelect()

                this.doll ? this.doll.blur() : this.searching.blur();
            }

        }
        if (this.options.search === true || this.options.search === 'true') {
            let search = this.element.querySelector('.multi-select-search');
            search.oninput = () => {
                var filtered = []
                this.element.querySelectorAll('.multi-select-option').forEach(option => {
                    option.style.display = option.querySelector('.multi-select-option-text').innerHTML.toLowerCase().indexOf(search.value.toLowerCase()) > -1 ? 'flex' : 'none';
                    option.classList.remove('key-item-current')
                    if (option.style.display !== 'none') filtered.push(option)
                })
                counter = 15
                filtered.length === 1 ? filtered[0].classList.add('key-item-current') : ''
            };
        }
        if (this.options.selectAll === true || this.options.selectAll === 'true') {
            let selectAllButton = this.element.querySelector('.multi-select-all');
            selectAllButton.onclick = () => {
                let allSelected = selectAllButton.classList.contains('multi-select-selected');
                this.element.querySelectorAll('.multi-select-option').forEach(option => {
                    let dataItem = this.data.find(data => data.value == option.dataset.value);
                    if (dataItem && ((allSelected && dataItem.selected) || (!allSelected && !dataItem.selected))) {
                        option.click();
                    }
                });
                selectAllButton.classList.toggle('multi-select-selected');
            };
        }
        if (this.selectElement.id && document.querySelector('label[for="' + this.selectElement.id + '"]')) {
            document.querySelector('label[for="' + this.selectElement.id + '"]').onclick = () => {
                headerElement.classList.toggle('multi-select-header-active');
                if (headerElement.classList.contains('multi-select-header-active')) {
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
                headerElement.classList.remove('multi-select-header-active');
                this.doll ? this.doll.blur() : this.searching.blur();
                this._closeHeightSelect()
            }
        });
    }

    _updateSelected() {
        if (this.options.listAll === true || this.options.listAll === 'true') {
            this.element.querySelectorAll('.multi-select-option').forEach(option => {
                if (option.classList.contains('multi-select-selected')) {
                    this.element.querySelector('.multi-select-header').insertAdjacentHTML('afterbegin', `<span class="multi-select-header-option" data-value="${option.dataset.value}">${option.querySelector('.multi-select-option-text').innerHTML}</span>`);
                }
            });
        } else {

            if (this.selectedValues.length > 0) {
                this.element.querySelector('.multi-select-header').insertAdjacentHTML('afterbegin', `<span class="multi-select-header-option">${this.selectedValues.length} selected</span>`);
            }
        }
        if (this.element.querySelector('.multi-select-header-option')) {
            this.element.querySelector('.multi-select-header-placeholder').remove();

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
