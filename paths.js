// Fill the grid
class Queue {
    constructor(array) {
    this.array = []
    if (array) this.array = array;
    }
    getBuffer() {return this.array.slice()}
    isEmpty() {return this.array.length === 0}
    peek() {return this.array[0]}
    enqueue(value) {return this.array.push(value)}
    dequeue() { return this.array.shift(); } 
}

class GameProps {
    state = "idle";
    startBox;
    endBox;
    obstacles = [];
    gridSize = 120;
    maxObstacles = 10;
    grid = []
    cols = 8
    rows = 15
    path = new Queue([])
}

let gameProps = new GameProps();

const layout = document.getElementById('board-container');

function fillGrid(gridElement, rows, cols) {
    gameProps.grid = []
    for (let i = 0; i < rows; i++) {
        let row = []
        for (let j = 0; j < cols; j++) {
            const cell = {
                pos: [i,j],
                isObstacle: false,
                domElement: null
            }
            //Dom
            const box = document.createElement("span")
            box.className = `box row-${i} col-${j}`;
            box.onclick = (e) => retrieveBox(e, cell);
            gridElement.appendChild(box)

            //Links
            cell.domElement = box
            row.push(cell)
        }
        gameProps.grid.push(row)
    }
}

fillGrid(layout, gameProps.rows, gameProps.cols);

// Pick points 
function displayText(text) {
    const existentInstruction = document.getElementsByClassName('instruction')[0]
    let existentInstructionText = existentInstruction?.getElementsByClassName('instruction-text')[0]
    if (existentInstructionText?.innerHTML === text) return;
    if (existentInstructionText)   {   
        existentInstructionText.innerHTML = text;
        return;
    }
    const instruction = document.createElement('div');
    const instructionText = document.createElement('h1');
    instruction.appendChild(instructionText);
    instructionText.innerHTML = text;
    instruction.className = "instruction"
    instructionText.className = "instruction-text"
    document.getElementsByTagName('body')[0].appendChild(instruction)
}


function retrieveBox(e, cell) {
    if (!gameProps.startBox) {
        gameProps.startBox = cell
        cell.domElement.classList.add("start");
    }
    else if (!gameProps.endBox) {
        gameProps.endBox = cell
        cell.domElement.classList.add("exit");
    }
    else if (gameProps.obstacles.length < gameProps.maxObstacles) {
        gameProps.obstacles.push(cell)
        cell.isObstacle = true
        cell.domElement.classList.add("obstacle")
    }
}

// Search
function addVectors(a,b) {
    return [a[0]+b[0], a[1]+b[1]]
}

function findNeighbors(cell) {
    const moves = [[0,1],[0,-1], [1,0],[-1,0]]
    let neighborCoords = []
    moves.map((move) => neighborCoords.push(addVectors(cell.pos, move)))
    neighborCoords = neighborCoords.filter(neighbor => neighbor[0] >= 0 && neighbor[1] >= 0 && neighbor[0] < gameProps.rows && neighbor[1] < gameProps.cols)
    const neighbors = neighborCoords.map(coords => gameProps.grid[coords[0]][coords[1]]).filter(neighbor => !neighbor.isObstacle)
    return neighbors
}

function exploreMaze(startCell) {
    const queue = new Queue();
    const visited = new Set();

    queue.enqueue(startCell);
    visited.add(`${startCell.pos[0]},${startCell.pos[1]}`);

    while (!queue.isEmpty()) {
        const current = queue.dequeue();

        // Visually mark visited cells (optional)
        if (current !== gameProps.startBox && current !== gameProps.endBox) {
            current.domElement.classList.add("visited");
        }

        // Found the end
        if (current === gameProps.endBox) {
            displayText("Path Found!");
            gameProps.state = "endGame"
            return;
        }

        // Explore neighbors
        const neighbors = findNeighbors(current);
        for (let neighbor of neighbors) {
            const key = `${neighbor.pos[0]},${neighbor.pos[1]}`;
            if (!visited.has(key) && !neighbor.isObstacle) {
                queue.enqueue(neighbor);
                visited.add(key);
            }
        }

    }

    // If the loop ends with no result
    displayText("No Path Found");
    gameProps.state = "endGame"
}


function manageGame() {
    switch (gameProps.state) {
        case "idle":
            displayText("Pick a starting point")
            if (gameProps.startBox) gameProps.state = "awaitingEndBoxPick"
            break;
        case "awaitingEndBoxPick":
            displayText("Pick an ending point")
            if (gameProps.endBox) gameProps.state = "awaitingObstaclesPick"
            break;
        case "awaitingObstaclesPick":
            displayText(`Pick Obstacles (${gameProps.maxObstacles - gameProps.obstacles.length} left)`)
            if (gameProps.obstacles.length >= gameProps.maxObstacles) gameProps.state = "startGame"
            break;
        case "startGame":
            displayText("Finding path...")
            exploreMaze(gameProps.startBox)
            break;
        default:
            break;
    }
}

if(gameProps.state !== "endGame") {setInterval(manageGame, 16)}