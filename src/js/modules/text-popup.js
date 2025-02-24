function textPopup(){
    const popupHtml = `
    <div id="popup" class="popup">    
    <div class="popup-picture"></div>   
    <div class="popup-message"></div>  
    <div class="popup-buttons"></div>
    </div>
    `;
    const body = document.querySelector('body');
    body.insertAdjacentHTML('beforeend', popupHtml)
}
export default textPopup;