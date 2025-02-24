// ----------------------------------------------------- Базовые скрипты --------------------------------------------------------
import { BaseHelpers } from './helpers/base-helpers';
BaseHelpers.addLoadedClass();
BaseHelpers.checkWebpSupport();
BaseHelpers.calcScrollbarWidth();
BaseHelpers.addTouchClass();
BaseHelpers.headerFixed();


let cellsNumber = 8
let killerCounter = 0

let gameModule
let current

var game = document.querySelector('.game');
var gameBoard = document.querySelector('.game-board');
let gameLock = document.querySelector('.game-lock')

let darkTable = document.querySelector('.table-dark')
let lightTable = document.querySelector('.table-light')
let darkTableUl = document.querySelector('.table-dark ul')
let lightTableUl = document.querySelector('.table-light ul')

let winSound = document.querySelector('#win')
let clickSound = document.querySelector('#click')

// -------------------------------------------- Отрисовка игровой доски -----------------------------------------------------------

game.style.height = gameBoard.offsetWidth + 'px'
gameBoard.style.height = gameBoard.offsetWidth + 'px'

window.addEventListener('resize', () => {
    setTimeout(() => {
        game.style.height = gameBoard.offsetWidth + 'px'
        gameBoard.style.height = gameBoard.offsetWidth + 'px'
    }, 200)
})

createFieldCells()
let allCells = gameBoard.querySelectorAll('.cell.dark')

function createFieldCells() {
    for (let row = 0; row < cellsNumber; row++) {
        for (let col = 0; col < cellsNumber; col++) {
            let newCell = document.createElement('div');
            if (even(col + row)) {
                newCell.classList.add('cell');
                newCell.classList.add('light');
                newCell.style.top = 12.5 * row + '%';
                newCell.style.left = 12.5 * col + '%';
            } else {
                newCell.classList.add('cell');
                newCell.classList.add('dark');
                newCell.style.top = 12.5 * row + '%';
                newCell.style.left = 12.5 * col + '%';
                newCell.dataset.y = row;
                newCell.dataset.x = col;
            }
            gameBoard.append(newCell);
        }
    }
};
function even(n) {
    return n % 2 == 0;
}

// ------------------------------------------------------ Place checkers ---------------------------------------------------------------------
let checkersArray = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
]
// let checkersArray = [
//     [0, 22, 0, 0, 0, 2, 0, 2],
//     [0, 0, 0, 0, 0, 0, 1, 0],
//     [0, 22, 0, 2, 0, 0, 0, 0],
//     [0, 0, 11, 0, 1, 0, 0, 0],
//     [0, 11, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 2, 0, 0],
//     [0, 0, 2, 0, 0, 0, 0, 0],
// ]

function createCheckers() {
    let chekerHtml = ""
    for (let row = 0; row < checkersArray.length; row++) {
        for (let col = 0; col < checkersArray[row].length; col++) {
            if (checkersArray[row][col] === 1) { chekerHtml += `<div class="checker light" data-x='${col}' data-y='${row}' style='top:${row * 12.5}%;left:${col * 12.5}%'></div>` }
            if (checkersArray[row][col] === 2) { chekerHtml += `<div class="checker dark" data-x='${col}' data-y='${row}' style='top:${row * 12.5}%;left:${col * 12.5}%'></div>` }
            if (checkersArray[row][col] === 11) { chekerHtml += `<div class="checker light queen" data-x='${col}' data-y='${row}' style='top:${row * 12.5}%;left:${col * 12.5}%'></div>` }
            if (checkersArray[row][col] === 22) { chekerHtml += `<div class="checker dark queen" data-x='${col}' data-y='${row}' style='top:${row * 12.5}%;left:${col * 12.5}%'></div>` }
        }
    }
    gameBoard.insertAdjacentHTML('beforeend', chekerHtml)

}
createCheckers()

// ------------------------------------------------------------- game listener -----------------------------------------------------------------
let lightCheckers = gameBoard.querySelectorAll('.checker.light')
let darkCheckers = gameBoard.querySelectorAll('.checker.dark')

let mustTargetsArrayXY
let mustStrikeArrayXY
let mustTargetsArrayEl
let mustStrikeArrayEl

let killedCheckerXY = {}

let currentCheker
let targetCell
let quene = 'light'
let side

let firstGame = true

menu()
// --- Выбирае6м шашку для хода в зависимости от очереди --- 
function sideStart() {
    // --- Обячный режим на два игрока
    if (gameModule == 'player') {

        sideNeon()

        let enemy, curr
        quene == 'light' ? enemy = darkCheckers : enemy = lightCheckers
        quene == 'light' ? curr = lightCheckers : curr = darkCheckers

        // -- обнуляем все лишние прослушиватели, и на случяай если шашка в процессе БЪЕТ-- 
        enemy.forEach(e => {
            e.removeEventListener('click', selectChecker)
            e.removeEventListener('click', killChecker)
        })
        if (killerCounter > 0) {
            curr.forEach(c => {
                c.removeEventListener('click', selectChecker)
                c.removeEventListener('click', killChecker)
            })
        }

        // -- если нет обязательных вариантов когда нужно бить -- 
        if (!canStrikeEnemysGlobal()) {
            let ready = concatedReadyCheckersArray();
            if (ready.length !== 0) {
                ready.forEach(r => {
                    r.el.addEventListener('click', selectChecker, false)
                });
            } else {
                let winSide
                quene == 'light' ? winSide = 'ЧЁРНЫЕ' : winSide = 'БЕЛЫЕ'
                warningMessage(`${winSide} ВЫИГРАЛИ`, 1500); setTimeout(() => { menu() }, 1500)
            }

            // -- если бить обязательноо !!! -- 
        } else {
            mustStrike()
            mustStrikeArrayEl.forEach(ch => {
                ch.addEventListener('click', killChecker, false)
            })


        }
    }
    // --- режим компьютер - человек
    if (gameModule == 'computer') {
        // --- ходит человек ---
        if (quene == 'light') {
            sideNeon()
            if (!canStrikeEnemysGlobal()) {
                let ready = concatedReadyCheckersArray();
                if (ready.length !== 0) {
                    ready.forEach(r => {
                        r.el.addEventListener('click', selectChecker, false)
                    });
                } else {
                    warningMessage('ЧЁРНЫЕ ВЫИГРАЛИ', 1500); setTimeout(() => { menu() }, 1500)
                }
            } else {
                mustStrike()
                mustStrikeArrayEl.forEach(ch => {
                    ch.addEventListener('click', killChecker, false)
                })
            }
            // --- ходит компьютер --- !!!!!!!!!!!!!!!!!!!!1!!!!!!!!!! ВЫБОР ШАШКИ ДЛЯ ХОДА КОМПЬЮТЕРА !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        } else if (quene == 'dark') {
            sideNeon()
            if (!canStrikeEnemysGlobal()) {
                setTimeout(() => {
                    current = randomCheckerCPU().currentCPU
                    if (current) {
                        current.el.addEventListener('click', selectChecker, false)
                        current.el.click()
                    } else {
                        warningMessage('БЕЛЫЕ ВЫИГРАЛИ', 1500); setTimeout(() => { menu() }, 1500)
                    }
                }, 500)
            } else {
                setTimeout(() => {
                    mustStrike()
                    let randomMustIndex = getRandomInt(0, mustStrikeArrayEl.length - 1)
                    mustStrikeArrayEl[randomMustIndex].addEventListener('click', killChecker, false)
                    mustStrikeArrayEl[randomMustIndex].click()
                }, 500)
            }
        }
        /// -------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }
}

// --- Убиваем шашку которые должны бить ---
function killChecker(e) {
    currentCheker = e.target
    updateStrikeTargets()
    currentCheker.classList.add('active')
    currentCheker && selectTargetKillCell()
    e.stopPropagation()
}

// --- Убираем все прослушиватели для текущего игрока --- 
function sideEnd() {
    quene == 'light' ? side = lightCheckers : side = darkCheckers
    side.forEach(ch => {
        ch.removeEventListener('click', selectChecker, false)
        ch.classList.remove('active')
    })
    mustStrikeArrayEl && mustStrikeArrayEl.forEach(ch => {
        ch.removeEventListener('click', killChecker)
    })
    mustTargetsArrayEl && mustTargetsArrayEl.forEach(cell => {
        cell.removeEventListener('click', killValidation)
    })
    allCells.forEach(cell => {
        cell.removeEventListener('click', validation)
    })
}

// --- Выбираем шашку которой будем ходить --- 
function selectChecker(e) {
    currentCheker = e.target
    currentCheker && updateSelected()
    currentCheker && selectTargetCell()
    e.stopPropagation()
}

// --- Выбираем клетку куда бить --- 
function selectTargetKillCell() {
    // -- обычный режим два игрока    
    if (gameModule == 'player') {
        emptyCells().forEach(cell => {
            cell.removeEventListener('click', killValidation)
        })
        mustTargetsArrayEl.forEach(cell => {
            cell.addEventListener('click', killValidation, false)
        })

        // --  режим с компьютером
    } else if (gameModule == 'computer') {
        // --- человек ходит ---
        if (quene == 'light') {
            emptyCells().forEach(cell => {
                cell.removeEventListener('click', killValidation)
            })
            mustTargetsArrayEl.forEach(cell => {
                cell.addEventListener('click', killValidation, false)
            })

            // --- компьютер ходит --- !!!!!!!!!!!!!!!!!!!!!!!! ВЫБОР КЛЕТКИ КУДА БИТЬ КОМПЬЮТЕРУ !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!            
        } else if (quene == 'dark') {
            emptyCells().forEach(cell => {
                cell.removeEventListener('click', killValidation)
            })
            setTimeout(() => {
                let randomKillIndex = getRandomInt(0, mustStrikeArrayEl.length - 1)
                mustTargetsArrayEl[randomKillIndex].addEventListener('click', killValidation, false)
                mustTargetsArrayEl[randomKillIndex].click()
            }, 500)
        }

        /// -------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }
}

// --- Выбираем клетку куда нам походить --- 
function selectTargetCell() {
    // -- обычный режим два игрока
    if (gameModule == 'player') {
        emptyCells().forEach(cell => {
            cell.removeEventListener('click', validation)
        })
        emptyCells().forEach(cell => {
            cell.addEventListener('click', validation, false)
        })
        // --  режим с компьютером
    } else if (gameModule == 'computer') {
        // --- человек ходит ---
        if (quene == 'light') {
            emptyCells().forEach(cell => {
                cell.removeEventListener('click', validation)
            })
            emptyCells().forEach(cell => {
                cell.addEventListener('click', validation, false)
            })

            // --- компьютер ходит ---!!!!!!!!!!!!!!!!! ВЫБОР КЛЕТКИ КУДА ПРОСТО ПОХОДИТЬ КОМПЬЮТЕРУ !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        } else if (quene == 'dark') {
            emptyCells().forEach(cell => {
                cell.removeEventListener('click', validation)
            })
            setTimeout(() => {
                let randomTargetIndex = getRandomInt(0, current.targets.length - 1)
                current.targets[randomTargetIndex].addEventListener('click', validation, false)
                current.targets[randomTargetIndex].click()
            }, 500)
        }
        /// -------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    }
}


// --- Валидация когда бъеш шашку ---
function killValidation(e) {
    targetCell = e.target
    clickSound.play()
    removeKilledCheker()
    changeChekerPosition()
    if (!canKillThis(true, null)) {
        sideEnd()
        removeSelected(true)
        killerCounter = 0
        nextPass()
    } else if (canKillThis(true, null)) {
        sideEnd()
        removeSelected(true)
        killerCounter++
        sideStart()
        currentCheker.click()
    }
    e.stopPropagation()
}

// --- Валидация хода ---
function validation(e) {
    targetCell = e.target
    clickSound.play()
    if (checkOne()) {
        changeChekerPosition()
        nextPass()
    }
    e.stopPropagation()
}


// --- Перемещаем шашку и переписуем массив ---  
function changeChekerPosition() {
    if (currentCheker) {
        let schX = Number(currentCheker.dataset.x)
        let schY = Number(currentCheker.dataset.y)
        let schQueenBool = currentCheker.classList.contains('queen')
        let sceX = Number(targetCell.dataset.x)
        let sceY = Number(targetCell.dataset.y)

        // --- Устанавливаем атрибуты и координаты ---        
        currentCheker.style.top = sceY * 12.5 + '%'
        currentCheker.style.left = sceX * 12.5 + '%'
        currentCheker.dataset.x = sceX
        currentCheker.dataset.y = sceY

        // --- Обновляем массив ---    
        let arrNumber
        if (schQueenBool) { quene == 'light' ? arrNumber = 11 : arrNumber = 22 } else { quene == 'light' ? arrNumber = 1 : arrNumber = 2 }
        checkersArray[sceY][sceX] = arrNumber;
        checkersArray[schY][schX] = 0;
        checkByQueen()

        lightCheckers = gameBoard.querySelectorAll('.checker.light')
        darkCheckers = gameBoard.querySelectorAll('.checker.dark')
    } else { return }
}

// --- Передаем ход другому игроку ---
function nextPass() {
    if (quene == 'light') {
        sideEnd()
        quene = 'dark'
        sideStart()
    } else if (quene == 'dark') {
        sideEnd()
        quene = 'light'
        sideStart()
    }
}

// --- Порлучаем список пустых игровых клеток ---  
function emptyCells() {
    let emptyCellsArray = []
    allCells.forEach(c => {
        let cx = Number(c.dataset.x)
        let cy = Number(c.dataset.y)
        if (checkersArray[cy][cx] == 0) { emptyCellsArray.push(c) }
    })
    return emptyCellsArray
}

// --- Создание масива шашек (элементов) и подсветка шашек которые должны бить --- 
function mustStrike() {
    mustStrikeArrayEl = []
    mustTargetsArrayEl = []
    let side
    quene == 'light' ? side = lightCheckers : side = darkCheckers
    side.forEach(c => {
        let cx = Number(c.dataset.x)
        let cy = Number(c.dataset.y)
        mustStrikeArrayXY.forEach(mar => {
            if (mar.x == cx && mar.y == cy) { mustStrikeArrayEl.push(c); c.classList.add('must') }
        })
    })
    emptyCells().forEach(ec => {
        let ex = Number(ec.dataset.x)
        let ey = Number(ec.dataset.y)
        mustTargetsArrayXY.forEach(mta => {
            if (mta.x == ex && mta.y == ey) { mustTargetsArrayEl.push(ec); ec.classList.add('target') }
        })
    })
}

// --- Неоновая подсветка шашек для стороны которая ходит ---
function sideNeon() {
    let neonPassive, neonTableActive, neonTablePassive
    if (quene == 'light') {
        neonPassive = darkCheckers
        neonTableActive = lightTable
        neonTablePassive = darkTable
    } else {
        neonPassive = lightCheckers
        neonTableActive = darkTable
        neonTablePassive = lightTable
    }

    let neonActive = concatedReadyCheckersArray();
    if (neonActive.length !== 0) {
        neonActive.forEach(n => {
            n.el.classList.add('neon')
        });
    }

    neonPassive.forEach(c => {
        c.classList.remove('neon')
    })

    neonTableActive.classList.add('active')
    neonTablePassive.classList.remove('active')
}

// -- Обновления выделения выбраноой шашки ---
function updateSelected() {
    let clears
    quene == 'light' ? clears = lightCheckers : clears = darkCheckers
    clears.forEach(c => {
        c.classList.remove('active')
    })
    currentCheker.classList.add('active')
}

// -- удаляем все выделения шашек и клеток ---
function removeSelected(mustRemove) {
    let clears
    quene == 'light' ? clears = lightCheckers : clears = darkCheckers
    clears.forEach(c => {
        c.classList.remove('active')
        mustRemove ? c.classList.remove('must') : ''
    })
    allCells.forEach(c => {
        c.classList.remove('target')
    })
}


// --- Выпадающее предупреждение что шашка не выбрана ---
function warningMessage(content, delay) {
    let element = document.createElement('div')
    let body = document.querySelector('body')
    body.append(element)
    element.innerHTML = content;
    element.className = "warning";
    element.classList.add('active')

    setTimeout(() => {
        element.classList.remove('active')
    }, delay)
    setTimeout(() => {
        element.remove()
    }, delay + 1000)
}

// -----------------Меню перед игрой -----------------

function menu() {
    let menu = document.createElement('div')
    let body = document.querySelector('body')
    body.append(menu)
    let content = `<button id='player'>Играть с товарищем</button><button id='computer'>Играть с компьютером</button>`
    menu.innerHTML = content;
    menu.className = "menu";
    gameLock.classList.add('lock')
    let playerBtn = document.querySelector('#player')
    let computerBtn = document.querySelector('#computer')

    playerBtn.addEventListener('click', startPlayerGame, { once: true })
    computerBtn.addEventListener('click', startComputerGame, { once: true })

    function startPlayerGame(e) {
        gameModule = 'player'
        gameLock.classList.remove('lock')
        menu.remove()
        if (firstGame) { sideStart() } else { gameAgain() }
        firstGame = false
        winSound.play()
        e.stopPropagation()
    }
    function startComputerGame(e) {
        gameModule = 'computer'
        gameLock.classList.remove('lock')
        menu.remove()
        if (firstGame) { sideStart() } else { gameAgain() }
        firstGame = false
        winSound.play()
        e.stopPropagation()
    }
}



// --------------------- Заново --------------------------------

function gameAgain() {
    setTimeout(() => {
        checkersArray = []
        checkersArray = [
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
        ]
        removeAllCheckers()
        createCheckers()
        lightCheckers = gameBoard.querySelectorAll('.checker.light')
        darkCheckers = gameBoard.querySelectorAll('.checker.dark')
        allCells = gameBoard.querySelectorAll('.cell.dark')

        darkTableUl.innerHTML = ''
        lightTableUl.innerHTML = ''

        sideStart()
    }, 2000)

}

// ---------- Очищаем поле от всех шашек ---------
function removeAllCheckers() {
    darkCheckers.forEach(dc => {
        dc.remove()
    })
    lightCheckers.forEach(lc => {
        lc.remove()
    })
}

// ---------------------------- Случайное число -------------------------------
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------- Выбор случайной шашки для хода из массива (CPU AI)------------------------------
let randomCheckerCPU = () => {

    let arr = concatedReadyCheckersArray() // -- получаем массив доступных для хода шашек 
    let currentCPU
    if (arr.length) {
        var random = getRandomInt(0, arr.length - 1)
        currentCPU = arr[random]
    }
    return {
        arr,
        currentCPU
    }
}

// ---------------------- Получаем массив объектов с доступными простыми шашками для хода и доступными клетками - мишенями ----------------------
function getReadySimplyCheckersArray() {
    darkCheckers = document.querySelectorAll('.checker.dark')
    lightCheckers = document.querySelectorAll('.checker.light')
    let scaningCheckers
    if (quene == 'dark') {
        scaningCheckers = darkCheckers
    } else {
        scaningCheckers = lightCheckers
    }
    let ready = []
    //----------------- Создаем массив с доступными для хода простыми шашками 
    scaningCheckers.forEach(sc => {
        let x = Number(sc.dataset.x)
        let y = Number(sc.dataset.y)
        if (!sc.classList.contains('queen')) {
            if (quene == 'dark' && y <= 6 && x <= 6 && checkersArray[y + 1][x + 1] == 0 && ready[ready.length - 1] != sc) { ready.push(sc) }
            if (quene == 'dark' && y <= 6 && x >= 1 && checkersArray[y + 1][x - 1] == 0 && ready[ready.length - 1] != sc) { ready.push(sc) }

            if (quene == 'light' && y >= 1 && x <= 6 && checkersArray[y - 1][x + 1] == 0 && ready[ready.length - 1] != sc) { ready.push(sc) }
            if (quene == 'light' && y >= 1 && x >= 1 && checkersArray[y - 1][x - 1] == 0 && ready[ready.length - 1] != sc) { ready.push(sc) }
        }
    })
    //----------------- Добавляем к этому массиву набор доступных ходв для каждой шашки ------------
    let readyCheckers = ready.map(rc => rc = { el: rc })

    readyCheckers.forEach(rc => {
        let x = Number(rc.el.dataset.x)
        let y = Number(rc.el.dataset.y)
        rc.cells = []
        if (quene == 'dark' && y <= 6 && x >= 1 && checkersArray[y + 1][x - 1] == 0) { rc.cells.push({ y: y + 1, x: x - 1 }) }
        if (quene == 'dark' && y <= 6 && x <= 6 && checkersArray[y + 1][x + 1] == 0) { rc.cells.push({ y: y + 1, x: x + 1 }) }

        if (quene == 'light' && y >= 1 && x >= 1 && checkersArray[y - 1][x - 1] == 0) { rc.cells.push({ y: y + 1, x: x - 1 }) }
        if (quene == 'light' && y >= 1 && x <= 6 && checkersArray[y - 1][x + 1] == 0) { rc.cells.push({ y: y + 1, x: x + 1 }) }
    })

    let eCells = emptyCells()
    readyCheckers.forEach(r => {
        r.targets = []
        r.cells.forEach(c => {
            eCells.forEach(e => {
                if (Number(e.dataset.x) == c.x && Number(e.dataset.y) == c.y) {
                    r.targets.push(e)
                }
            })
        })
    })
    // console.log('Массив доступных простых шашек для хода', quene, ' : ', readyCheckers);
    return readyCheckers
}


// ----------- Получаем массив объектов с доступными !!!! ДАМКАМИ !!! для хода и доступными клетками для них - мишенями ----------------------
function getReadyQueenCheckersArray() {
    darkCheckers = document.querySelectorAll('.checker.dark')
    lightCheckers = document.querySelectorAll('.checker.light')
    let scaningCheckers
    if (quene == 'dark') {
        scaningCheckers = darkCheckers
    } else {
        scaningCheckers = lightCheckers
    }
    let ready = []
    //----------------- Создаем массив с доступными для хода простыми шашками 
    scaningCheckers.forEach(sc => {
        let x = Number(sc.dataset.x)
        let y = Number(sc.dataset.y)
        if (sc.classList.contains('queen')) {
            if (y <= 6 && x >= 1 && checkersArray[y + 1][x - 1] == 0 && ready[ready.length - 1] != sc) { ready.push(sc) }
            if (y <= 6 && x <= 6 && checkersArray[y + 1][x + 1] == 0 && ready[ready.length - 1] != sc) { ready.push(sc) }
            if (y >= 1 && x <= 6 && checkersArray[y - 1][x + 1] == 0 && ready[ready.length - 1] != sc) { ready.push(sc) }
            if (y >= 1 && x >= 1 && checkersArray[y - 1][x - 1] == 0 && ready[ready.length - 1] != sc) { ready.push(sc) }
        }
    })
    //----------------- Добавляем к этому массиву набор доступных ходв для каждой шашки ------------
    let readyQueens = ready.map(rc => rc = { el: rc })

    readyQueens.forEach(rc => {
        let x = Number(rc.el.dataset.x)
        let y = Number(rc.el.dataset.y)
        rc.cells = []

        // -- на 1 клетка --
        if (y <= 6 && x <= 6 && checkersArray[y + 1][x + 1] == 0) { rc.cells.push({ y: y + 1, x: x + 1 }) }
        if (y <= 6 && x >= 1 && checkersArray[y + 1][x - 1] == 0) { rc.cells.push({ y: y + 1, x: x - 1 }) }
        if (y >= 1 && x <= 6 && checkersArray[y - 1][x + 1] == 0) { rc.cells.push({ y: y - 1, x: x + 1 }) }
        if (y >= 1 && x >= 1 && checkersArray[y - 1][x - 1] == 0) { rc.cells.push({ y: y - 1, x: x - 1 }) }

        // -- на 2 клетка --        
        if (y <= 5 && x >= 1 && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0) { rc.cells.push({ y: y + 2, x: x + 2 }) }
        if (y <= 5 && x <= 5 && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0) { rc.cells.push({ y: y + 2, x: x - 2 }) }
        if (y >= 2 && x <= 5 && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0) { rc.cells.push({ y: y - 2, x: x + 2 }) }
        if (y >= 2 && x >= 2 && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0) { rc.cells.push({ y: y - 2, x: x - 2 }) }

        // -- на 3 клетка --
        if (y <= 4 && x <= 4 && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0) { rc.cells.push({ y: y + 3, x: x + 3 }) }
        if (y <= 4 && x >= 3 && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0) { rc.cells.push({ y: y + 3, x: x - 3 }) }
        if (y >= 3 && x <= 4 && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0) { rc.cells.push({ y: y - 3, x: x + 3 }) }
        if (y >= 3 && x >= 3 && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0) { rc.cells.push({ y: y - 3, x: x - 3 }) }

        // -- на 4 клетка --
        if (y <= 3 && x <= 3 && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { rc.cells.push({ y: y + 4, x: x + 4 }) }
        if (y <= 3 && x >= 4 && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { rc.cells.push({ y: y + 4, x: x - 4 }) }
        if (y >= 4 && x <= 3 && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { rc.cells.push({ y: y - 4, x: x + 4 }) }
        if (y >= 4 && x >= 4 && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { rc.cells.push({ y: y - 4, x: x - 4 }) }

        // -- на 5 клетка --
        if (y <= 2 && x <= 2 && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { rc.cells.push({ y: y + 5, x: x + 5 }) }
        if (y <= 2 && x >= 5 && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { rc.cells.push({ y: y + 5, x: x - 5 }) }
        if (y >= 5 && x <= 2 && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { rc.cells.push({ y: y - 5, x: x + 5 }) }
        if (y >= 5 && x >= 5 && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { rc.cells.push({ y: y - 5, x: x - 5 }) }

        // -- на 6 клетка --
        if (y <= 1 && x <= 1 && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { rc.cells.push({ y: y + 6, x: x + 6 }) }
        if (y <= 1 && x >= 6 && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { rc.cells.push({ y: y + 6, x: x - 6 }) }
        if (y >= 6 && x <= 1 && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { rc.cells.push({ y: y - 6, x: x + 6 }) }
        if (y >= 6 && x >= 6 && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { rc.cells.push({ y: y - 6, x: x - 6 }) }

        // -- на 7 клетка --        
        if (y == 0 && x == 7 && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { rc.cells.push({ y: y + 7, x: x - 7 }) }
        if (y == 7 && x == 0 && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { rc.cells.push({ y: y - 7, x: x + 7 }) }

    })

    let eCells = emptyCells()
    readyQueens.forEach(r => {
        r.targets = []
        r.cells.forEach(c => {
            eCells.forEach(e => {
                if (Number(e.dataset.x) == c.x && Number(e.dataset.y) == c.y) {
                    r.targets.push(e)
                }
            })
        })
    })
    // console.log('Массив доступных дамок для хода', quene, ' : ', readyQueens);
    return readyQueens
}

// --- соеденяем два массива (1 - доступные просты шашки и 2 - доступные дамки) ---
function concatedReadyCheckersArray() {
    return getReadySimplyCheckersArray().concat(getReadyQueenCheckersArray())
}


// --- Если дошел до противоположной стороны то становишься дамкой ---
function checkByQueen() {
    if (quene == 'light' && !currentCheker.classList.contains('queen') && Number(currentCheker.dataset.y) == 0) { currentCheker.classList.add('queen'); checkersArray[Number(currentCheker.dataset.y)][Number(currentCheker.dataset.x)] = 11 }
    if (quene == 'dark' && !currentCheker.classList.contains('queen') && Number(currentCheker.dataset.y) == 7) { currentCheker.classList.add('queen'); checkersArray[Number(currentCheker.dataset.y)][Number(currentCheker.dataset.x)] = 22 }
}

// --- Проверка на простой одиночный ход ---
function checkOne() {
    let advance
    let bool = false

    let tx = Number(targetCell.dataset.x)
    let ty = Number(targetCell.dataset.y)
    let cx = Number(currentCheker.dataset.x)
    let cy = Number(currentCheker.dataset.y)
    quene == 'light' ? advance = -1 : advance = 1
    // --- Проверка на одиночный ход для простой шашки ---
    if (!currentCheker.classList.contains('queen')) {
        if (checkersArray[ty][tx] == 0 && cy + advance == ty && cx + 1 == tx) { bool = true }
        if (checkersArray[ty][tx] == 0 && cy + advance == ty && cx - 1 == tx) { bool = true }
    }

    // --- Проверка на одиночный ход для дамки ---
    if (currentCheker.classList.contains('queen')) {
        // -- на 1 клетка --
        if (cy <= 6 && cx <= 6 && checkersArray[ty][tx] == 0 && cy + 1 == ty && cx + 1 == tx) { bool = true }
        if (cy <= 6 && cx >= 1 && checkersArray[ty][tx] == 0 && cy + 1 == ty && cx - 1 == tx) { bool = true }
        if (cy >= 1 && cx <= 6 && checkersArray[ty][tx] == 0 && cy - 1 == ty && cx + 1 == tx) { bool = true }
        if (cy >= 1 && cx >= 1 && checkersArray[ty][tx] == 0 && cy - 1 == ty && cx - 1 == tx) { bool = true }

        // -- на 2 клетка --
        if (cy <= 5 && cx <= 5 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx + 1] == 0 && cy + 2 == ty && cx + 2 == tx) { bool = true }
        if (cy <= 5 && cx >= 2 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx - 1] == 0 && cy + 2 == ty && cx - 2 == tx) { bool = true }
        if (cy >= 2 && cx <= 5 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx + 1] == 0 && cy - 2 == ty && cx + 2 == tx) { bool = true }
        if (cy >= 2 && cx >= 2 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx - 1] == 0 && cy - 2 == ty && cx - 2 == tx) { bool = true }

        // -- на 3 клетка --
        if (cy <= 4 && cx <= 4 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx + 1] == 0 && checkersArray[cy + 2][cx + 2] == 0 && cy + 3 == ty && cx + 3 == tx) { bool = true }
        if (cy <= 4 && cx >= 3 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx - 1] == 0 && checkersArray[cy + 2][cx - 2] == 0 && cy + 3 == ty && cx - 3 == tx) { bool = true }
        if (cy >= 3 && cx <= 4 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx + 1] == 0 && checkersArray[cy - 2][cx + 2] == 0 && cy - 3 == ty && cx + 3 == tx) { bool = true }
        if (cy >= 3 && cx >= 3 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx - 1] == 0 && checkersArray[cy - 2][cx - 2] == 0 && cy - 3 == ty && cx - 3 == tx) { bool = true }

        // -- на 4 клетка --
        if (cy <= 3 && cx <= 3 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx + 1] == 0 && checkersArray[cy + 2][cx + 2] == 0 && checkersArray[cy + 3][cx + 3] == 0 && cy + 4 == ty && cx + 4 == tx) { bool = true }
        if (cy <= 3 && cx >= 4 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx - 1] == 0 && checkersArray[cy + 2][cx - 2] == 0 && checkersArray[cy + 3][cx - 3] == 0 && cy + 4 == ty && cx - 4 == tx) { bool = true }
        if (cy >= 4 && cx <= 3 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx + 1] == 0 && checkersArray[cy - 2][cx + 2] == 0 && checkersArray[cy - 3][cx + 3] == 0 && cy - 4 == ty && cx + 4 == tx) { bool = true }
        if (cy >= 4 && cx >= 4 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx - 1] == 0 && checkersArray[cy - 2][cx - 2] == 0 && checkersArray[cy - 3][cx - 3] == 0 && cy - 4 == ty && cx - 4 == tx) { bool = true }

        // -- на 5 клетка --
        if (cy <= 2 && cx <= 2 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx + 1] == 0 && checkersArray[cy + 2][cx + 2] == 0 && checkersArray[cy + 3][cx + 3] == 0 && checkersArray[cy + 4][cx + 4] == 0 && cy + 5 == ty && cx + 5 == tx) { bool = true }
        if (cy <= 2 && cx >= 5 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx - 1] == 0 && checkersArray[cy + 2][cx - 2] == 0 && checkersArray[cy + 3][cx - 3] == 0 && checkersArray[cy + 4][cx - 4] == 0 && cy + 5 == ty && cx - 5 == tx) { bool = true }
        if (cy >= 5 && cx <= 2 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx + 1] == 0 && checkersArray[cy - 2][cx + 2] == 0 && checkersArray[cy - 3][cx + 3] == 0 && checkersArray[cy - 4][cx + 4] == 0 && cy - 5 == ty && cx + 5 == tx) { bool = true }
        if (cy >= 5 && cx >= 5 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx - 1] == 0 && checkersArray[cy - 2][cx - 2] == 0 && checkersArray[cy - 3][cx - 3] == 0 && checkersArray[cy - 4][cx - 4] == 0 && cy - 5 == ty && cx - 5 == tx) { bool = true }

        // -- на 6 клетка --
        if (cy <= 1 && cx <= 1 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx + 1] == 0 && checkersArray[cy + 2][cx + 2] == 0 && checkersArray[cy + 3][cx + 3] == 0 && checkersArray[cy + 4][cx + 4] == 0 && checkersArray[cy + 5][cx + 5] == 0 && cy + 6 == ty && cx + 6 == tx) { bool = true }
        if (cy <= 1 && cx >= 6 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx - 1] == 0 && checkersArray[cy + 2][cx - 2] == 0 && checkersArray[cy + 3][cx - 3] == 0 && checkersArray[cy + 4][cx - 4] == 0 && checkersArray[cy + 5][cx - 5] == 0 && cy + 6 == ty && cx - 6 == tx) { bool = true }
        if (cy >= 6 && cx <= 1 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx + 1] == 0 && checkersArray[cy - 2][cx + 2] == 0 && checkersArray[cy - 3][cx + 3] == 0 && checkersArray[cy - 4][cx + 4] == 0 && checkersArray[cy - 5][cx + 5] == 0 && cy - 6 == ty && cx + 6 == tx) { bool = true }
        if (cy >= 6 && cx >= 6 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx - 1] == 0 && checkersArray[cy - 2][cx - 2] == 0 && checkersArray[cy - 3][cx - 3] == 0 && checkersArray[cy - 4][cx - 4] == 0 && checkersArray[cy - 5][cx - 5] == 0 && cy - 6 == ty && cx - 6 == tx) { bool = true }

        // -- на 7 клетка --        
        if (cy == 0 && cx == 7 && checkersArray[ty][tx] == 0 && checkersArray[cy + 1][cx - 1] == 0 && checkersArray[cy + 2][cx - 2] == 0 && checkersArray[cy + 3][cx - 3] == 0 && checkersArray[cy + 4][cx - 4] == 0 && checkersArray[cy + 5][cx - 5] == 0 && checkersArray[cy + 6][cx - 6] == 0 && cy + 7 == ty && cx - 7 == tx) { bool = true }
        if (cy == 7 && cx == 0 && checkersArray[ty][tx] == 0 && checkersArray[cy - 1][cx + 1] == 0 && checkersArray[cy - 2][cx + 2] == 0 && checkersArray[cy - 3][cx + 3] == 0 && checkersArray[cy - 4][cx + 4] == 0 && checkersArray[cy - 5][cx + 5] == 0 && checkersArray[cy - 6][cx + 6] == 0 && cy - 7 == ty && cx + 7 == tx) { bool = true }

    }
    return bool
}
// --- обновление возможных варниантов удара для одной шашки после ее выделения ---
function updateStrikeTargets() {
    let bool
    let queneSimply, queneQueen
    let enemySimply, enemyQueen
    mustStrikeArrayXY = []
    mustTargetsArrayXY = []
    if (quene == 'light') {
        queneSimply = 1;
        queneQueen = 11;
        enemySimply = 2;
        enemyQueen = 22;
    } else {
        queneSimply = 2;
        queneQueen = 22;
        enemySimply = 1
        enemyQueen = 11;
    }
    let y = Number(currentCheker.dataset.y)
    let x = Number(currentCheker.dataset.x)
    // --------------------------------------------------------------------------------------------------------------------------------
    // -- проверка (CET - 3 клетки)
    if (y <= 5 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 2, x: x - 2 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 5 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 2, x: x + 2 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 2 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 2, x: x + 2 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 2 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 2, x: x - 2 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (CE0T - 4 клетки)
    if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (CE00T - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (CE000T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (CE0000T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (CE00000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C0ET - 4 клетки)
    if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C0E0T - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C0E00T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C0E000T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C0E0000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C00ET - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C00E0T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C00E00T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C00E000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C000ET - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C000E0T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C000E00T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C0000ET - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x + 5] == enemySimply || checkersArray[y + 5][x + 5] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x - 5] == enemySimply || checkersArray[y - 5][x - 5] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

    // -- проверка (C0000E0T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C00000ET - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 6][x - 6] == enemySimply || checkersArray[y + 6][x - 6] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 6][x + 6] == enemySimply || checkersArray[y - 6][x + 6] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

    removeSelected(false)
    mustStrike()
}

// --- Проверка может ли ударить какая нибудь шашка - шашку противника --- 
function canStrikeEnemysGlobal() {
    let bool = false
    let queneSimply, queneQueen
    let enemySimply, enemyQueen
    mustStrikeArrayXY = []
    mustTargetsArrayXY = []
    if (quene == 'light') {
        queneSimply = 1;
        queneQueen = 11;
        enemySimply = 2;
        enemyQueen = 22;
    } else {
        queneSimply = 2;
        queneQueen = 22;
        enemySimply = 1
        enemyQueen = 11;
    }
    if (killerCounter < 1) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                // --------------------------------------------------------------------------------------------------------------------------------
                // -- проверка (CET - 3 клетки)
                if (y <= 5 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 2, x: x - 2 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 5 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 2, x: x + 2 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 2 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 2, x: x + 2 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 2 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 2, x: x - 2 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (CE0T - 4 клетки)
                if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (CE00T - 5 клетки)
                if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (CE000T - 6 клетки)
                if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (CE0000T - 7 клетки)
                if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (CE00000T - 8 клетки)
                if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
                if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

                // --------------------------------------------------------------------------------------------------------------------------------

                // -- проверка (C0ET - 4 клетки)
                if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C0E0T - 5 клетки)
                if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C0E00T - 6 клетки)
                if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C0E000T - 7 клетки)
                if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C0E0000T - 8 клетки)
                if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
                if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

                // --------------------------------------------------------------------------------------------------------------------------------

                // -- проверка (C00ET - 5 клетки)
                if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C00E0T - 6 клетки)
                if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C00E00T - 7 клетки)
                if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C00E000T - 8 клетки)
                if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
                if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

                // --------------------------------------------------------------------------------------------------------------------------------

                // -- проверка (C000ET - 6 клетки)
                if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C000E0T - 7 клетки)
                if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C000E00T - 8 клетки)
                if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
                if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

                // --------------------------------------------------------------------------------------------------------------------------------

                // -- проверка (C0000ET - 7 клетки)
                if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
                if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x + 5] == enemySimply || checkersArray[y + 5][x + 5] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
                if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x - 5] == enemySimply || checkersArray[y - 5][x - 5] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

                // -- проверка (C0000E0T - 8 клетки)
                if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
                if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

                // --------------------------------------------------------------------------------------------------------------------------------

                // -- проверка (C00000ET - 8 клетки)
                if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 6][x - 6] == enemySimply || checkersArray[y + 6][x - 6] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
                if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 6][x + 6] == enemySimply || checkersArray[y - 6][x + 6] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }
            }
        }

    } else if (killerCounter > 0) {

        let y = Number(currentCheker.dataset.y)
        let x = Number(currentCheker.dataset.x)
        // --------------------------------------------------------------------------------------------------------------------------------
        // -- проверка (CET - 3 клетки)
        if (y <= 5 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 2, x: x - 2 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 5 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 2, x: x + 2 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 2 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 2, x: x + 2 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 2 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 2, x: x - 2 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (CE0T - 4 клетки)
        if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (CE00T - 5 клетки)
        if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (CE000T - 6 клетки)
        if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (CE0000T - 7 клетки)
        if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (CE00000T - 8 клетки)
        if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
        if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

        // --------------------------------------------------------------------------------------------------------------------------------

        // -- проверка (C0ET - 4 клетки)
        if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x + 3 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 3, x: x - 3 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C0E0T - 5 клетки)
        if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C0E00T - 6 клетки)
        if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C0E000T - 7 клетки)
        if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C0E0000T - 8 клетки)
        if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
        if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

        // --------------------------------------------------------------------------------------------------------------------------------

        // -- проверка (C00ET - 5 клетки)
        if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x + 4 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 4, x: x - 4 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C00E0T - 6 клетки)
        if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C00E00T - 7 клетки)
        if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C00E000T - 8 клетки)
        if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
        if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

        // --------------------------------------------------------------------------------------------------------------------------------

        // -- проверка (C000ET - 6 клетки)
        if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x + 5 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 5, x: x - 5 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C000E0T - 7 клетки)
        if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C000E00T - 8 клетки)
        if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
        if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

        // --------------------------------------------------------------------------------------------------------------------------------

        // -- проверка (C0000ET - 7 клетки)
        if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }
        if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x + 5] == enemySimply || checkersArray[y + 5][x + 5] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x + 6 }); mustStrikeArrayXYPush(y, x) }
        if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x - 5] == enemySimply || checkersArray[y - 5][x - 5] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 6, x: x - 6 }); mustStrikeArrayXYPush(y, x) }

        // -- проверка (C0000E0T - 8 клетки)
        if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
        if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

        // --------------------------------------------------------------------------------------------------------------------------------

        // -- проверка (C00000ET - 8 клетки)
        if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 6][x - 6] == enemySimply || checkersArray[y + 6][x - 6] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y + 7, x: x - 7 }); mustStrikeArrayXYPush(y, x) }
        if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 6][x + 6] == enemySimply || checkersArray[y - 6][x + 6] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true; mustTargetsArrayXY.push({ y: y - 7, x: x + 7 }); mustStrikeArrayXYPush(y, x) }

    }
    return bool
}

// --- Пашим только целевые шашки, отсекая все которые повторяються ---
function mustStrikeArrayXYPush(y, x) {
    if (!mustStrikeArrayXY.length) { mustStrikeArrayXY.push({ y: y, x: x }) } else {
        if (mustStrikeArrayXY[mustStrikeArrayXY.length - 1].x == x && mustStrikeArrayXY[mustStrikeArrayXY.length - 1].y == y) {
            return
        } else {
            mustStrikeArrayXY.push({ y: y, x: x })
        }
    }
}


// --- Если есть убитая шашка - убираем ее с поля и массива --- 
function removeKilledCheker() {

    killedCheckerXY = {}
    let queneSimply, queneQueen
    let enemySimply, enemyQueen

    if (quene == 'light') {
        queneSimply = 1;
        queneQueen = 11;
        enemySimply = 2;
        enemyQueen = 22;
    } else {
        queneSimply = 2;
        queneQueen = 22;
        enemySimply = 1
        enemyQueen = 11;
    }

    let x = Number(currentCheker.dataset.x)
    let y = Number(currentCheker.dataset.y)

    let tx = Number(targetCell.dataset.x)
    let ty = Number(targetCell.dataset.y)


    // -- ищем --    
    // --------------------------------------------------------------------------------------------------------------------------------
    // -- проверка (CET - 3 клетки)
    if (y <= 5 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && ty == y + 2 && tx == x - 2) { killedCheckerXY = { y: y + 1, x: x - 1 } }
    if (y <= 5 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && ty == y + 2 && tx == x + 2) { killedCheckerXY = { y: y + 1, x: x + 1 } }
    if (y >= 2 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && ty == y - 2 && tx == x + 2) { killedCheckerXY = { y: y - 1, x: x + 1 } }
    if (y >= 2 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && ty == y - 2 && tx == x - 2) { killedCheckerXY = { y: y - 1, x: x - 1 } }

    // -- проверка (CE0T - 4 клетки)
    if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && ty == y + 3 && tx == x - 3) { killedCheckerXY = { y: y + 1, x: x - 1 } }
    if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && ty == y + 3 && tx == x + 3) { killedCheckerXY = { y: y + 1, x: x + 1 } }
    if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && ty == y - 3 && tx == x + 3) { killedCheckerXY = { y: y - 1, x: x + 1 } }
    if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && ty == y - 3 && tx == x - 3) { killedCheckerXY = { y: y - 1, x: x - 1 } }

    // -- проверка (CE00T - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && ty == y + 4 && tx == x - 4) { killedCheckerXY = { y: y + 1, x: x - 1 } }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && ty == y + 4 && tx == x + 4) { killedCheckerXY = { y: y + 1, x: x + 1 } }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && ty == y - 4 && tx == x + 4) { killedCheckerXY = { y: y - 1, x: x + 1 } }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && ty == y - 4 && tx == x - 4) { killedCheckerXY = { y: y - 1, x: x - 1 } }

    // -- проверка (CE000T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && ty == y + 5 && tx == x - 5) { killedCheckerXY = { y: y + 1, x: x - 1 } }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && ty == y + 5 && tx == x + 5) { killedCheckerXY = { y: y + 1, x: x + 1 } }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && ty == y - 5 && tx == x + 5) { killedCheckerXY = { y: y - 1, x: x + 1 } }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && ty == y - 5 && tx == x - 5) { killedCheckerXY = { y: y - 1, x: x - 1 } }

    // -- проверка (CE0000T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && ty == y + 6 && tx == x - 6) { killedCheckerXY = { y: y + 1, x: x - 1 } }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0 && ty == y + 6 && tx == x + 6) { killedCheckerXY = { y: y + 1, x: x + 1 } }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && ty == y - 6 && tx == x + 6) { killedCheckerXY = { y: y - 1, x: x + 1 } }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0 && ty == y - 6 && tx == x - 6) { killedCheckerXY = { y: y - 1, x: x - 1 } }

    // -- проверка (CE00000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0 && ty == y + 7 && tx == x - 7) { killedCheckerXY = { y: y + 1, x: x - 1 } }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0 && ty == y - 7 && tx == x + 7) { killedCheckerXY = { y: y - 1, x: x + 1 } }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C0ET - 4 клетки)
    if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && ty == y + 3 && tx == x - 3) { killedCheckerXY = { y: y + 2, x: x - 2 } }
    if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && ty == y + 3 && tx == x + 3) { killedCheckerXY = { y: y + 2, x: x + 2 } }
    if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && ty == y - 3 && tx == x + 3) { killedCheckerXY = { y: y - 2, x: x + 2 } }
    if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && ty == y - 3 && tx == x - 3) { killedCheckerXY = { y: y - 2, x: x - 2 } }

    // -- проверка (C0E0T - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && ty == y + 4 && tx == x - 4) { killedCheckerXY = { y: y + 2, x: x - 2 } }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && ty == y + 4 && tx == x + 4) { killedCheckerXY = { y: y + 2, x: x + 2 } }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && ty == y - 4 && tx == x + 4) { killedCheckerXY = { y: y - 2, x: x + 2 } }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && ty == y - 4 && tx == x - 4) { killedCheckerXY = { y: y - 2, x: x - 2 } }

    // -- проверка (C0E00T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && ty == y + 5 && tx == x - 5) { killedCheckerXY = { y: y + 2, x: x - 2 } }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && ty == y + 5 && tx == x + 5) { killedCheckerXY = { y: y + 2, x: x + 2 } }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && ty == y - 5 && tx == x + 5) { killedCheckerXY = { y: y - 2, x: x + 2 } }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && ty == y - 5 && tx == x - 5) { killedCheckerXY = { y: y - 2, x: x - 2 } }

    // -- проверка (C0E000T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && ty == y + 6 && tx == x - 6) { killedCheckerXY = { y: y + 2, x: x - 2 } }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0 && ty == y + 6 && tx == x + 6) { killedCheckerXY = { y: y + 2, x: x + 2 } }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && ty == y - 6 && tx == x + 6) { killedCheckerXY = { y: y - 2, x: x + 2 } }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0 && ty == y - 6 && tx == x - 6) { killedCheckerXY = { y: y - 2, x: x - 2 } }

    // -- проверка (C0E0000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0 && ty == y + 7 && tx == x - 7) { killedCheckerXY = { y: y + 2, x: x - 2 } }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0 && ty == y - 7 && tx == x + 7) { killedCheckerXY = { y: y - 2, x: x + 2 } }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C00ET - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && ty == y + 4 && tx == x - 4) { killedCheckerXY = { y: y + 3, x: x - 3 } }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && ty == y + 4 && tx == x + 4) { killedCheckerXY = { y: y + 3, x: x + 3 } }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && ty == y - 4 && tx == x + 4) { killedCheckerXY = { y: y - 3, x: x + 3 } }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && ty == y - 4 && tx == x - 4) { killedCheckerXY = { y: y - 3, x: x - 3 } }

    // -- проверка (C00E0T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && ty == y + 5 && tx == x - 5) { killedCheckerXY = { y: y + 3, x: x - 3 } }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && ty == y + 5 && tx == x + 5) { killedCheckerXY = { y: y + 3, x: x + 3 } }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && ty == y - 5 && tx == x + 5) { killedCheckerXY = { y: y - 3, x: x + 3 } }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && ty == y - 5 && tx == x - 5) { killedCheckerXY = { y: y - 3, x: x - 3 } }

    // -- проверка (C00E00T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && ty == y + 6 && tx == x - 6) { killedCheckerXY = { y: y + 3, x: x - 3 } }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0 && ty == y + 6 && tx == x + 6) { killedCheckerXY = { y: y + 3, x: x + 3 } }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && ty == y - 6 && tx == x + 6) { killedCheckerXY = { y: y - 3, x: x + 3 } }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0 && ty == y - 6 && tx == x - 6) { killedCheckerXY = { y: y - 3, x: x - 3 } }

    // -- проверка (C00E000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0 && ty == y + 7 && tx == x - 7) { killedCheckerXY = { y: y + 3, x: x - 3 } }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0 && ty == y - 7 && tx == x + 7) { killedCheckerXY = { y: y - 3, x: x + 3 } }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C000ET - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && ty == y + 5 && tx == x - 5) { killedCheckerXY = { y: y + 4, x: x - 4 } }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0 && ty == y + 5 && tx == x + 5) { killedCheckerXY = { y: y + 4, x: x + 4 } }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && ty == y - 5 && tx == x + 5) { killedCheckerXY = { y: y - 4, x: x + 4 } }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0 && ty == y - 5 && tx == x - 5) { killedCheckerXY = { y: y - 4, x: x - 4 } }

    // -- проверка (C000E0T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && ty == y + 6 && tx == x - 6) { killedCheckerXY = { y: y + 4, x: x - 4 } }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0 && ty == y + 6 && tx == x + 6) { killedCheckerXY = { y: y + 4, x: x + 4 } }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && ty == y - 6 && tx == x + 6) { killedCheckerXY = { y: y - 4, x: x + 4 } }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0 && ty == y - 6 && tx == x - 6) { killedCheckerXY = { y: y - 4, x: x - 4 } }

    // -- проверка (C000E00T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0 && ty == y + 7 && tx == x - 7) { killedCheckerXY = { y: y + 4, x: x - 4 } }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0 && ty == y - 7 && tx == x + 7) { killedCheckerXY = { y: y - 4, x: x + 4 } }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C0000ET - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0 && ty == y + 6 && tx == x - 6) { killedCheckerXY = { y: y + 5, x: x - 5 } }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x + 5] == enemySimply || checkersArray[y + 5][x + 5] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 6][x + 6] == 0 && ty == y + 6 && tx == x + 6) { killedCheckerXY = { y: y + 5, x: x + 5 } }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0 && ty == y - 6 && tx == x + 6) { killedCheckerXY = { y: y - 5, x: x + 5 } }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x - 5] == enemySimply || checkersArray[y - 5][x - 5] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 6][x - 6] == 0 && ty == y - 6 && tx == x - 6) { killedCheckerXY = { y: y - 5, x: x - 5 } }

    // -- проверка (C0000E0T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0 && ty == y + 7 && tx == x - 7) { killedCheckerXY = { y: y + 5, x: x - 5 } }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0 && ty == y - 7 && tx == x + 7) { killedCheckerXY = { y: y - 5, x: x + 5 } }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C00000ET - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 6][x - 6] == enemySimply || checkersArray[y + 6][x - 6] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 7][x - 7] == 0 && ty == y + 7 && tx == x - 7) { killedCheckerXY = { y: y + 6, x: x - 6 } }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 6][x + 6] == enemySimply || checkersArray[y - 6][x + 6] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 7][x + 7] == 0 && ty == y - 7 && tx == x + 7) { killedCheckerXY = { y: y - 6, x: x + 6 } }

    // -- удаляем -- 
    let enemy, pasteTable, enemyClass
    let queenBool = false

    if (quene == 'light') {
        enemy = darkCheckers
        pasteTable = lightTableUl
        enemyClass = 'dark'
    } else {
        enemy = lightCheckers
        pasteTable = darkTableUl
        enemyClass = 'light'
    }
    enemy.forEach(ch => {
        let ex = Number(ch.dataset.x)
        let ey = Number(ch.dataset.y)
        if (ey == killedCheckerXY.y && ex == killedCheckerXY.x) {
            if (ch.classList.contains('queen')) { queenBool = true }
            ch.remove()
            checkersArray[killedCheckerXY.y][killedCheckerXY.x] = 0
        }
    })

    let newLi = document.createElement('li')
    newLi.className = enemyClass
    if (queenBool) { newLi.classList.add('queen') }
    pasteTable.append(newLi)

    console.log('Координаты убиваемой шашки', killedCheckerXY);
    killedCheckerXY = {}
}

// --- Проверяем может ли данная шашка бить кого-то --- 
function canKillThis() {
    let bool = false
    let queneSimply, queneQueen
    let enemySimply, enemyQueen

    if (quene == 'light') {
        queneSimply = 1;
        queneQueen = 11;
        enemySimply = 2;
        enemyQueen = 22;
    } else {
        queneSimply = 2;
        queneQueen = 22;
        enemySimply = 1
        enemyQueen = 11;
    }

    let x = Number(currentCheker.dataset.x)
    let y = Number(currentCheker.dataset.y)


    // --- Проверка на возможномсть ударить простой пешки или дамки --   
    // --------------------------------------------------------------------------------------------------------------------------------
    // -- проверка (CET - 3 клетки)
    if (y <= 5 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0) { bool = true }
    if (y <= 5 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0) { bool = true }
    if (y >= 2 && x <= 5 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0) { bool = true }
    if (y >= 2 && x >= 2 && (checkersArray[y][x] == queneSimply || checkersArray[y][x] == queneQueen) && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0) { bool = true }

    // -- проверка (CE0T - 4 клетки)
    if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0) { bool = true }
    if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0) { bool = true }
    if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0) { bool = true }
    if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0) { bool = true }

    // -- проверка (CE00T - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true }

    // -- проверка (CE000T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true }

    // -- проверка (CE0000T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x + 1] == enemySimply || checkersArray[y + 1][x + 1] == enemyQueen) && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x - 1] == enemySimply || checkersArray[y - 1][x - 1] == enemyQueen) && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true }

    // -- проверка (CE00000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 1][x - 1] == enemySimply || checkersArray[y + 1][x - 1] == enemyQueen) && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 1][x + 1] == enemySimply || checkersArray[y - 1][x + 1] == enemyQueen) && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C0ET - 4 клетки)
    if (y <= 4 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0) { bool = true }
    if (y <= 4 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0) { bool = true }
    if (y >= 3 && x <= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0) { bool = true }
    if (y >= 3 && x >= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0) { bool = true }

    // -- проверка (C0E0T - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true }

    // -- проверка (C0E00T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true }

    // -- проверка (C0E000T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x + 2] == enemySimply || checkersArray[y + 2][x + 2] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x - 2] == enemySimply || checkersArray[y - 2][x - 2] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true }

    // -- проверка (C0E0000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 2][x - 2] == enemySimply || checkersArray[y + 2][x - 2] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 2][x + 2] == enemySimply || checkersArray[y - 2][x + 2] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C00ET - 5 клетки)
    if (y <= 3 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0) { bool = true }
    if (y <= 3 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0) { bool = true }
    if (y >= 4 && x <= 3 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0) { bool = true }
    if (y >= 4 && x >= 4 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0) { bool = true }

    // -- проверка (C00E0T - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true }

    // -- проверка (C00E00T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x + 3] == enemySimply || checkersArray[y + 3][x + 3] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x - 3] == enemySimply || checkersArray[y - 3][x - 3] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true }

    // -- проверка (C00E000T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 3][x - 3] == enemySimply || checkersArray[y + 3][x - 3] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 3][x + 3] == enemySimply || checkersArray[y - 3][x + 3] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C000ET - 6 клетки)
    if (y <= 2 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0) { bool = true }
    if (y <= 2 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0) { bool = true }
    if (y >= 5 && x <= 2 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0) { bool = true }
    if (y >= 5 && x >= 5 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0) { bool = true }

    // -- проверка (C000E0T - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x + 4] == enemySimply || checkersArray[y + 4][x + 4] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 5][x + 5] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x - 4] == enemySimply || checkersArray[y - 4][x - 4] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 5][x - 5] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true }

    // -- проверка (C000E00T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 4][x - 4] == enemySimply || checkersArray[y + 4][x - 4] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 4][x + 4] == enemySimply || checkersArray[y - 4][x + 4] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C0000ET - 7 клетки)
    if (y <= 1 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0) { bool = true }
    if (y <= 1 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x + 5] == enemySimply || checkersArray[y + 5][x + 5] == enemyQueen) && checkersArray[y + 1][x + 1] == 0 && checkersArray[y + 2][x + 2] == 0 && checkersArray[y + 3][x + 3] == 0 && checkersArray[y + 4][x + 4] == 0 && checkersArray[y + 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x <= 1 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0) { bool = true }
    if (y >= 6 && x >= 6 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x - 5] == enemySimply || checkersArray[y - 5][x - 5] == enemyQueen) && checkersArray[y - 1][x - 1] == 0 && checkersArray[y - 2][x - 2] == 0 && checkersArray[y - 3][x - 3] == 0 && checkersArray[y - 4][x - 4] == 0 && checkersArray[y - 6][x - 6] == 0) { bool = true }

    // -- проверка (C0000E0T - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 5][x - 5] == enemySimply || checkersArray[y + 5][x - 5] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 6][x - 6] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 5][x + 5] == enemySimply || checkersArray[y - 5][x + 5] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 6][x + 6] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true }

    // --------------------------------------------------------------------------------------------------------------------------------

    // -- проверка (C00000ET - 8 клетки)
    if (y == 0 && x == 7 && checkersArray[y][x] == queneQueen && (checkersArray[y + 6][x - 6] == enemySimply || checkersArray[y + 6][x - 6] == enemyQueen) && checkersArray[y + 1][x - 1] == 0 && checkersArray[y + 2][x - 2] == 0 && checkersArray[y + 3][x - 3] == 0 && checkersArray[y + 4][x - 4] == 0 && checkersArray[y + 5][x - 5] == 0 && checkersArray[y + 7][x - 7] == 0) { bool = true }
    if (y == 7 && x == 0 && checkersArray[y][x] == queneQueen && (checkersArray[y - 6][x + 6] == enemySimply || checkersArray[y - 6][x + 6] == enemyQueen) && checkersArray[y - 1][x + 1] == 0 && checkersArray[y - 2][x + 2] == 0 && checkersArray[y - 3][x + 3] == 0 && checkersArray[y - 4][x + 4] == 0 && checkersArray[y - 5][x + 5] == 0 && checkersArray[y - 7][x + 7] == 0) { bool = true }

    return bool
}

