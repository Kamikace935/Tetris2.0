// @see https://tetris.fandom.com/wiki/Tetris_Guideline

// Recoge el parámetro recibido con el get en la URL
//@see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
const searchParams = new URLSearchParams(window.location.search);
const difficulty = parseInt(searchParams.get("difficulty") || 0,10);

const playground = document.getElementById('playground');

// Tamaño del tablero
const size = 40;
const width = 7;
const height = 18;
// Contiene los parametros de las diferentes dificultades
// const difficulties = [
//     [35, 15, 8],
//     [120, 90, 60],
//     ["easy", "medium", "hard"]
// ]

let drop = 0;
let rAF;
let score = 0;
let frames = 35; // Mantiene un seguimiento de los frames de animación para poder cancelarlo
//let time = difficulties[1][difficulty];
// document.body.className = difficulties[2][difficulty];
let gameOver = false;

const canvasTimer = document.getElementById("timer");
const canvasScore = document.getElementById("score");
// @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
const contextTimer = canvasTimer.getContext('2d');
const contextScore = canvasScore.getContext('2d');

const colors = {
    0: null,
    1: 'cyan',
    2: 'yellow',
    3: 'purple',
    4: 'green',
    5: 'red',
    6: 'blue',
    7: 'orange'
};

tetrominoes = [
    [
        [1,2],
        [1,3],
        [1,4],
        [1,5]
    ],

    [
        [0,3],
        [0,4],
        [1,3],
        [1,4]
    ],

    [
      [0,3],
      [1,2],
      [1,3],
      [1,4]
    ],

    [
        [0,2],
        [0,3],
        [1,2],
        [1,1],
    ],

    [
        [0,2],
        [0,3],
        [1,3],
        [1,4]
    ],

    [
      [0,4],
      [1,4],
      [1,3],
      [1,2]
    ],

    [
      [0,2],
      [1,2],
      [1,3],
      [1,4]
    ]
];

let tetromino = {
    coordinates: [],
    type: 0
};

box = {
    coordinates: [],
    type: 0
}

let playfield = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
];

//Crea el siguiente tetromino
getTetromino();

// Finaliza el juego
function showGameOver() {
    //@see https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
    cancelAnimationFrame(rAF);
    //@see https://developer.mozilla.org/en-US/docs/Web/API/clearInterval
    // clearInterval(timer);
    gameOver = true;

    alert("GAME OVER\n Pulsa enter para guardar tu puntuación y volver a la pagina de inicio");
    // Añadir eventListener en el documento para que guarde el resultado con un intro
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            // let ranking = JSON.parse(localStorage.getItem('Ranking')) || [];
            // ranking.push(getScore());
            // localStorage.setItem('Ranking', JSON.stringify(ranking));
            // window.location.href = "Marian_Vasco_index.html";
            alert(getScore());
        }
    })
}

// Recoge toda la información de la partida del jugador y la devuelve como un objeto
function getScore() {
    let nick = prompt("Introduce tu nick")
    if (nick === "") {
        nick = "Unknonw";
    }
    return nick;
    // return {
    //     nick: nick,
    //     score: score,
    //     time: formatTime(time),
    //     difficulty: difficulty
    // }
}

function drawTetromino(coordinates, type) {
    coordinates.forEach(axis => playfield[axis[0]][axis[1]] = type)
}

function randomSelection() {
    return Math.floor((Math.random() * 7))
}

function getTetromino() {
    let random;

    if(box.coordinates.length === 0){
        random = randomSelection()
        box.coordinates = buildCoordinates(tetrominoes[random])
        box.type = random + 1;
    }

    tetromino.coordinates = buildCoordinates(box.coordinates)
    tetromino.type = box.type

    for (let i = 0; i < tetromino.coordinates.length; i++) {
        let coordinates = tetromino.coordinates[i];
        playfield[coordinates[0]][coordinates[1]] = colors[tetromino.type];
    }

    random = randomSelection()
    box.coordinates = buildCoordinates(tetrominoes[random])
    box.type = random + 1;
}

function buildCoordinates(coordinates) {
    let dummy = [
        [0,0],
        [0,0],
        [0,0],
        [0,0]
    ]

    for (let i = 0; i < coordinates.length; i++) {
        dummy[i][0] = coordinates[i][0];
        dummy[i][1] = coordinates[i][1];
    }

    return dummy
}

function checkLateralMove(dummy, tetromino) {
    dummy = dummy.filter(value => {
        for (let i = 0; i < tetromino.length; i++) {
            if(value[0] === tetromino[i][0] && value[1] === tetromino[i][1]) {
                return false
            }
        }
        return true
    })

    for (let i = 0; i < dummy.length; i++) {
        if(playfield[dummy[i][0]][dummy[i][1]] !== 0){
            return false
        }
    }
    return true
}

function checkDownMove(dummy, tetromino) {
    dummy = dummy.filter(value => {
        for (let i = 0; i < tetromino.length; i++) {
            if(value[0] === tetromino[i][0] && value[1] === tetromino[i][1]) {
                return false
            }
        }
        return true
    })

    for (let i = 0; i < dummy.length; i++) {
        if(dummy[i][0] === 18) {
            getTetromino()
            return false
        }else if(playfield[dummy[i][0]][dummy[i][1]] !== 0) {
            if(dummy[i][0] === 2) {
                showGameOver()
            }

            getTetromino()
            return false
        }
    }
    return true
}

function lateralMove(side) {
    let dummy = buildCoordinates(tetromino.coordinates)

    for (let i = 0; i < dummy.length; i++) {
        dummy[i][1] = side + dummy[i][1]
    }

    if(checkLateralMove(dummy, tetromino.coordinates)){
        drawTetromino(tetromino.coordinates, 0)
        drawTetromino(dummy, tetromino.type)
        tetromino.coordinates = buildCoordinates(dummy)
    }
}

function moveDown() {
    let dummy = buildCoordinates(tetromino.coordinates)

    for (let i = 0; i < dummy.length; i++) {
        dummy[i][0]++
    }

    if(checkDownMove(dummy, tetromino.coordinates)){
        drawTetromino(tetromino.coordinates, 0)
        drawTetromino(dummy, tetromino.type)
        tetromino.coordinates = buildCoordinates(dummy)
    }
}

function checkPlayfield() {
    let count = 0
    let lastPositon = 0

    for (let row = 0; row < playfield.length; row++) {
        if(-1 === playfield[row].indexOf(0)) {
            lastPositon = row
            count++
        }
    }

    if(count > 0) {
        playfield.splice(lastPositon-count,count)
        console.log(lastPositon)
        console.log(count)
        for (let i = 0; i < count; i++) {
            playfield.unshift(createEmptyRow());
        }

        //increaseMarkerAndTime(count);
    }
}

//@see https://tetris.fandom.com/wiki/Scoring
// Aumenta los puntos y el tiempo restante por las líneas eliminadas
function increaseMarkerAndTime(lines) {
    const points = [40,100,300,1200];
    const extraTime = [10,15,20,30];

    if (lines > 0) {
        score += (points[lines-1] * (difficulty + 1));
        time += extraTime[lines-1];
    }

    contextScore.clearRect(0,0,canvasScore.width,canvasScore.height);
    contextScore.globalAlpha = 1;
    contextScore.fillStyle = 'white';
    contextScore.font = '25px monospace';
    contextScore.textAlign = 'center';
    contextScore.textBaseline = 'middle';
    contextScore.fillText(score, canvasScore.width / 2, canvasScore.height / 2);
}

function createEmptyRow() {
    return Array(width).fill(0);
}

function clean() {
    playground.innerHTML = '';
}

function renderBlock(posY, posX, colorIndex) {
    const color = colors[colorIndex];
    if (color == null) {
        return;
    }

    const div = document.createElement('div');
    div.style.backgroundColor = color;
    div.style.height = `${size}px`;
    div.style.width = `${size}px`;
    div.style.position = 'absolute';
    div.style.top = `${posY * size}px`;
    div.style.left = `${posX * size}px`;

    playground.appendChild(div);
}

function renderRow(posY, row) {
    for (let i = 0; i < width; i++) {
        renderBlock(posY, i, row[i]);
    }
}

function renderMatrix() {
    clean();
    checkPlayfield();
    drawTetromino(tetromino.coordinates,tetromino.type);

    for (let i = 0; i < height; i++) {
        const row = playfield[i];
        if (row != null) {
            renderRow(i, row);
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (gameOver) return;

    //Teclas direccionales izquierda y derecha (movimiento)
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if(e.key === "ArrowLeft") {
            lateralMove(-1);
        } else {
            lateralMove(1);
        }
    }

    // Tecla direccional arriba (rotar figura)
    // if (e.key === "ArrowUp") {
    //     const matrix = rotate(tetromino.matrix);
    //     if (isValidMove(matrix, tetromino.row, tetromino.col)) {
    //         tetromino.matrix = matrix;
    //     }
    // }

    // Tecla direccional abajo (acelerar caída)
    if(e.key === "ArrowDown") {
        moveDown();
    }
});

// bucle de juego
function start() {
    rAF = requestAnimationFrame(start);
    renderMatrix();

    if (++drop > frames) {
        moveDown();
        drop = 0;
    }
}

// Da formato al temporizador
function formatTime(seconds) {
    // Calcula las horas, los minutos y los segundos restantes de los segundos dados
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 36000) / 60);
    let remainingSeconds = seconds % 60;

    //@see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
    // Otorga formato a los digitos para que siempre se vean en dos digitos
    let formattedHours = hours.toString().padStart(2, '0');
    let formattedMinutes = minutes.toString().padStart(2, '0');
    let formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

//Crea la cuenta atras
function countDown() {
    time --;
    let timer = formatTime(time);

    contextTimer.clearRect(0,0,canvasTimer.width,canvasTimer.height);
    contextTimer.globalAlpha = 1;
    contextTimer.fillStyle = 'white';
    contextTimer.font = '25px monospace';
    contextTimer.textAlign = 'center';
    contextTimer.textBaseline = 'middle';
    contextTimer.fillText(timer, canvasTimer.width / 2, canvasTimer.height / 2);

    if (time === 0) {
        showGameOver()
    }
}

//@see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
// Inicia el Juego
rAF = requestAnimationFrame(start);

//@see https://developer.mozilla.org/en-US/docs/Web/API/setInterval#examples
//Inicia el temporizador
//const timer = setInterval(countDown, 1000);

// Inicia el contador de puntos
//increaseMarkerAndTime(0);