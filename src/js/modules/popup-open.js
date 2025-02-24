function popupOpen(status, score, level) {
  // #popup #popupClose - для кликов, 
  // .popup--show - для отображения
  // .popup-title .popup-content - для вставки HTML

  let overlay = document.querySelector('.service-overlay')
  let popWindow = document.querySelector('#popup')
  let popContent = popWindow.querySelector('.popup-picture')
  let buttonsContent = popWindow.querySelector('.popup-buttons')
  let messageContent = popWindow.querySelector('.popup-message')

  popupFunc(status)
  function popupFunc(status) {
    var contentHtml
    var buttonsHtml
    var messageHtml
    if (popWindow) {
      if (status === 'start') {
        buttonsHtml = `<button class="popupBtn" id="levelup">Сложность</button>
                       <button class="popupBtn" id="start">Начать</button>
        `;
      }
      if (status === 'again') {
        contentHtml = ` 
                    <div class="container">                    
                       <div class="row">
                          <div class="col-6">
                           <div class="popup-center ml3">
                             <div class="score-icon"></div>
                             <div class="score-count">${score}</div>
                           </div>
                          </div>
                          <div class="col-6">
                            <div class="popup-center">
                             <div class="level-icon"></div>
                             <div class="level-count">${level}</div>
                            </div>
                          </div>
                        </div>     
                    </div>                                    
                      `;
        buttonsHtml = `<button class="popupBtn" id="back">Меню</button>
                       <button class="popupBtn" id="again">Заново</button>
        `;
        messageHtml = `<h3>Вы проиграли !</h3>`;
      }

      if (status === 'level') {
        contentHtml = `     <ul class="level-menu">                                                            
                             <li id="easy">Легко</li>
                              <li id="middle">Средне</li>                              
                               <li id="hard">Сложно</li>
                            </ul>   `;
        buttonsHtml = `<button class="popupBtn" id="back">Меню</button>
                         <button class="popupBtn" id="add-level">Применить</button>
          `;
        messageHtml = `<h3>Выберите сложность игры!</h3>`;
      }
      openPopup(status, contentHtml, buttonsHtml, messageHtml)

      function openPopup(status, content, buttons, message) {
        // -------------------- Если проиграл -----------------------
        if (status == 'again') {
          messageContent.style.display = 'block'
          popContent.classList.remove('start-picture')
          popContent.classList.add('lost-picture')
          if (popContent) popContent.innerHTML = content;
          if (buttonsContent) buttonsContent.innerHTML = buttons;
          if (messageContent) messageContent.innerHTML = message;
          let game = document.querySelector('.game-box')
          game.classList.add('opacity-hidden')
          popWindow.classList.add('popup--show')
          overlay.style.left = 0;
          overlay.style.background = 'rgb(0,0,0,0.3)';

          // -------------------- Если начало игры -----------------------
        } else if (status == 'start') {
          if (popContent) popContent.innerHTML = '';
          popContent.classList.remove('level-picture')
          popContent.classList.remove('lost-picture')
          popContent.classList.add('start-picture')
          messageContent.style.display = 'none'
          if (buttonsContent) buttonsContent.innerHTML = buttons;
          let game = document.querySelector('.game-box')
          game.classList.add('opacity-hidden')
          popWindow.classList.add('popup--show')
          overlay.style.left = 0;
          overlay.style.background = 'rgb(0,0,0,0.3)';


          // -------------------- Если выбор сложности -----------------------
        } else if (status == 'level') {
          popContent.classList.remove('start-picture')
          popContent.classList.add('level-picture')
          if (popContent) popContent.innerHTML = content;
          if (buttonsContent) buttonsContent.innerHTML = buttons;
          let game = document.querySelector('.game-box')
          game.classList.add('opacity-hidden')
          popWindow.classList.add('popup--show')
          overlay.style.left = 0;
          overlay.style.background = 'rgb(0,0,0,0.3)';

          //----- select process ----
          let btns = popContent.querySelectorAll('li')
          removeSelected()
          if (level === 1) btns[0].classList.add('selected')
          if (level === 2) btns[1].classList.add('selected')
          if (level === 3) btns[2].classList.add('selected')
          btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              let curBtn = e.target
              removeSelected()
              if(curBtn.getAttribute('id') === 'easy'){level=1}
              if(curBtn.getAttribute('id') === 'middle'){level=2}
              if(curBtn.getAttribute('id') === 'hard'){level=3}
                curBtn.classList.add('selected')       
                
            })            
          })
          function removeSelected() {
            btns.forEach(btn => {
              btn.className = ''
            })
          }
        }
      }

    } else {
      console.log('Ошибка, модального окна не существует ! ');
      return;
    }

  }

}
export default popupOpen