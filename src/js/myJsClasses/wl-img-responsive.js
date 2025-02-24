// -------------------------------------------- for main.js -----------------------------------------------------
//
// import {ImgResponsive} from './myJsClasses/wl-img-responsive.js'
//
// new ImgResponsive({
//   delay: 200,
// }).init();
//
// ------------------------------------------ SCSS --------------------------------------------------------------
//
// [attitude-img]{
// 	width: 100%;	
// 	height: auto;
// 	object-fit: cover;
// }
//
// ----------------------------------------------HTML ------------------------------------------------------------
// аттрибут [attitude-img="0.4"] где 0.4 - отношение высоты изображения к его длине
// всё это нужно для адаптивности изображений любого размера в нужный по ширине и высоте, без медизапросов
//
// <img attitude-img="0.4" src="../../images/image-1" alt="image 1"></img>
//
//--------------------------------------------------------------------------------------------------------------

export class ImgResponsive {
    constructor(options) {
        this.delay = options.delay ? options.delay : 100  ;
        this.listener();     
    }
    listener() {
        let timeout
        let imgs = document.querySelectorAll('[attitude-img]')
        let pause = this.delay
        resize()
        window.addEventListener('resize', resize)
        
        function resize() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {                   
                imgs.forEach(image =>{
                    let attitude = image.getAttribute('attitude-img')
                    let imgWidth = image.offsetWidth                  
                    image.height = imgWidth * attitude 
                })           
            }, pause)
        }
    }
    
}