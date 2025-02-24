// ----------------------------- Работает в связке BaseHelpers.js должен быть подключен в main.js ---------------------------------
//
//  import { BaseHelpers } from './helpers/base-helpers';
//  BaseHelpers.addLoadedClass();
//
// --------------------------------------------------------------------------------------------------------------------------------

function loadingPage(){
if (document.querySelector('#loading-page')) {
    const load = document.querySelector('#loading-page')
    let container = load.appendChild(document.createElement('div'))
    container.classList.add('loading-page__container')

    for (let n = 0; n < 5; n++) {
        let containerItem = container.appendChild(document.createElement('div'))
        containerItem.classList.add('loading-page__container-item')
    }
    setTimeout(loadingReset, 1500)
    function loadingReset() {
        load.remove()
    }
}
// --- если BaseHelpers.js не подключен в main.js раскомментируйте этот кусочек кода ----
//
// const html = document.documentElement
// window.addEventListener('load', () => {
//     setTimeout(() => {
//         html.classList.add('loaded')
//     }, 0);
// });
//
// ---------------------------------------------------------------------------------------
}
export default loadingPage