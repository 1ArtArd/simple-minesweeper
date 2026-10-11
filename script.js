
const board = document.getElementById("board")
const status = document.getElementById("status")
const counter = document.getElementById("counter")

const difficulty = document.getElementById("difficulty")
const rowsInput = document.getElementById("rowsInput")
const columnsInput = document.getElementById("columnsInput")
const minesInput = document.getElementById("minesInput")
const startButton = document.getElementById("startButton")

let rows = 8
let columns = 10
let bombs = 10
let remaining = 10
let revealed = 0
let firstMove = true
let gameOver = false

let boardData = []
let picture = []
let tiles = []

const presets = {
    easy: { rows: 8, columns: 10, bombs: 8 },
    medium: { rows: 12, columns: 15, bombs: 30 },
    hard: { rows: 16, columns: 20, bombs: 60 }
}

function updateCounter() {
    counter.textContent = "Мин осталось: " + remaining
}

function isInside(row, column) {
    return row >= 0 && row < rows &&
           column >= 0 && column < columns
}

function check(row, column) {
    if (isInside(row, column)) {
        return boardData[row][column]
    }
}

function setBombs(safeRow, safeColumn) {
    let placed = 0

    while (placed < bombs) {
        const index = Math.floor(Math.random() * rows * columns)
        const r = Math.floor(index / columns)
        const c = index % columns

        if (boardData[r][c] !== "bomb" &&
            (r !== safeRow || c !== safeColumn)) {
            boardData[r][c] = "bomb"
            placed++
        }
    }
}

function bombsStat() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (boardData[r][c] === "bomb") continue

            let count = 0

            for (let i = r - 1; i <= r + 1; i++) {
                for (let j = c - 1; j <= c + 1; j++) {
                    if (check(i, j) === "bomb") {
                        count++
                    }
                }
            }

            boardData[r][c] = count
        }
    }
}

function reveal(row, column) {
    if (!isInside(row, column) || gameOver) return

    const oldState = picture[row][column]

    if (oldState !== "hidden" && oldState !== "question") {
        return
    }

    if (boardData[row][column] === "bomb") {
        lose()
        return
    }

    revealed++
    picture[row][column] = boardData[row][column]
    tiles[row][column].src = "img/" + boardData[row][column] + ".png"

    if (boardData[row][column] === 0) {
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = column - 1; j <= column + 1; j++) {
                if (isInside(i, j) &&
                    boardData[i][j] !== "bomb" &&
                    picture[i][j] === "hidden") {
                    reveal(i, j)
                }
            }
        }
    }

    if (revealed === rows * columns - bombs) {
        gameOver = true
        status.textContent = "ПОБЕДА!"
    }
}

function lose() {
    gameOver = true
    status.textContent = "ИГРА ОКОНЧЕНА"

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (boardData[r][c] === "bomb") {
                tiles[r][c].src = "img/mine.png"
            } else if (picture[r][c] === "flag") {
                tiles[r][c].src = "img/misplaced.png"
            }
        }
    }
}

function clickTile(event) {
    if (gameOver) return

    const tile = event.currentTarget
    const r = Number(tile.dataset.row)
    const c = Number(tile.dataset.column)

    if (picture[r][c] !== "hidden" &&
        picture[r][c] !== "question" &&
        picture[r][c] !== "flag") {
        return
    }

    if (firstMove) {
        setBombs(r, c)
        bombsStat()
        firstMove = false
    }

    if (boardData[r][c] === "bomb") {
        lose()
    } else {
        reveal(r, c)
    }
}

function flagTile(event) {
    event.preventDefault()

    if (gameOver) return

    const tile = event.currentTarget
    const r = Number(tile.dataset.row)
    const c = Number(tile.dataset.column)

    if (picture[r][c] === "hidden") {
        picture[r][c] = "flag"
        tile.src = "img/flag.png"
        remaining--
    } else if (picture[r][c] === "flag") {
        picture[r][c] = "question"
        tile.src = "img/question.png"
        remaining++
    } else if (picture[r][c] === "question") {
        picture[r][c] = "hidden"
        tile.src = "img/hidden.png"
    }

    updateCounter()
}

function createBoard() {
    board.innerHTML = ""
    board.style.setProperty("--columns", columns)

    boardData = []
    picture = []
    tiles = []

    revealed = 0
    remaining = bombs
    firstMove = true
    gameOver = false

    status.textContent = "Удачи!"

    for (let r = 0; r < rows; r++) {
        boardData[r] = []
        picture[r] = []
        tiles[r] = []

        for (let c = 0; c < columns; c++) {
            boardData[r][c] = ""
            picture[r][c] = "hidden"

            const tile = document.createElement("img")
            tile.src = "img/hidden.png"
            tile.alt = "Закрытая клетка"
            tile.dataset.row = r
            tile.dataset.column = c
            tile.draggable = false

            tile.addEventListener("click", clickTile)
            tile.addEventListener("contextmenu", flagTile)

            tiles[r][c] = tile
            board.appendChild(tile)
        }
    }

    updateCounter()
}

function startGame() {
    rows = Number(rowsInput.value)
    columns = Number(columnsInput.value)
    bombs = Number(minesInput.value)

    if (!Number.isInteger(rows) || !Number.isInteger(columns) ||
        !Number.isInteger(bombs) ||
        rows < 4 || rows > 30 ||
        columns < 4 || columns > 30 ||
        bombs < 1 || bombs >= rows * columns) {
        status.textContent = "Проверь размеры поля и число мин"
        return
    }

    createBoard()
}

difficulty.addEventListener("change", () => {
    const preset = presets[difficulty.value]

    if (preset) {
        rowsInput.value = preset.rows
        columnsInput.value = preset.columns
        minesInput.value = preset.bombs
    }
})

for (const input of [rowsInput, columnsInput, minesInput]) {
    input.addEventListener("input", () => {
        difficulty.value = "custom"
    })
}

startButton.addEventListener("click", startGame)

createBoard()