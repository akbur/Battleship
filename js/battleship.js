
/***** VARIABLES *****/

var gridSize = 10;
var numShipsPlaced = 0;
var numberOfShips = 5;
var shipDirection = 'horizontal';
var currentShipName, currentShipSize, currentCell;
var xCoordLimit = gridSize;
var yCoordLimit = gridSize;
var xCoord, yCoord;

var lastMove = {
	cellHit: false,
	cellMiss: false,
	cellSunk: false,
	cellXCoord: 0,
	cellYCoord: 0,
	updateCoords: function(x, y){
		this.cellXCoord = x;
		this.cellYCoord = y;
		console.log("lastMove: " + this.cellXCoord + ', ' + this.cellYCoord);
	},
	updateStatus: function(status) {
		if (status === 'hit') {
			this.cellHit = true;
			this.cellMiss = false;
			this.cellSunk = false;
		} else if (status === 'sunk') {
			this.cellSunk = true;
			this.cellHit = false;
			this.cellMiss = false;
		} else if (status === 'miss') {
			this.cellMiss = true;
			this.cellHit = false;
			this.cellSunk = false;
		}
	},
};

var nextMove = {
	stage: 1,
	status: 'continueDirection',
	direction: "",
	getOppositeDirection: function() {;
		return getOppositeDirection(this.direction);
	},
	setMove: function(move){
		this.move = move;
	},
	getMove: function() {
		return this.move;
	}
}

var initialHit = {
	cellXCoord: 0,
	cellYCoord: 0,
	recordCoords: function() {
		this.cellXCoord = currentCell.dataset.x;
		this.cellYCoord = currentCell.dataset.y;
		console.log("initialHit: " + this.cellXCoord + ', ' + this.cellYCoord);
	},
};

/**** GAMEPLAY *****/

setupGame();

function setupGame() {
	createGrid();
	addShipButtons();
	addRotateButton();
	shipPlacement();
}

function shipPlacement() {
	computerShipPlacement();
	playerShipPlacement();
}

function testShipPlacementComplete(callback) {
	var allShipsPlaced = allPlayerShipsPlaced();
	//if all ships have been placed
	if (allShipsPlaced) {
		//callback will be to beginRounds
		callback();
	}
}

function beginRounds() {
	removeShipPlacementClickHandlers();
	//ADD FUNCTION HERE TO REMOVE HEADING & ROTATE BUTTON
	playerTurn();
	//computerTurn will be called when playerTurn complete
}

//add some cleanup here

/***************** SETUP *******************************/

function createGrid() {
	var gridDiv = document.querySelectorAll('.grid-container');
	for (var grid = 0; grid < gridDiv.length; grid++) {
		for (var i = gridSize; i >= 1; i--) {
			for (var j = 1; j <= gridSize; j++) {
				var cell = document.createElement('div');
				cell.setAttribute('class', 'grid-cell');
				cell.setAttribute('data-x', j);
				cell.setAttribute('data-y', i);
				gridDiv[grid].appendChild(cell);
      		}
		}
	}
}

/******************      GET CELLS         *****************/

function getCell(user, x, y) {
	var index;
	if (user === 'player') index = 0;
	else if (user === 'computer') index = 1;
	var ComputerGridDiv = document.getElementsByClassName('grid-container')[index];
	var cells = ComputerGridDiv.children;
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].dataset.x == x && cells[i].dataset.y == y) {
			return cells[i];
		}
	}
}

function getPlayerCellFromEvent() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	currentCell = getCell('player', x, y);
	console.log("currentCell = playercell: (" + currentCell.dataset.x + ", " + currentCell.dataset.y + ")");
}

function getComputerCellFromEvent() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	currentCell = getCell('computer', x, y);
	console.log("currentCell = computercell: (" + currentCell.dataset.x + ", " + currentCell.dataset.y + ")");
}

function getCellClickHandler(user, addOrRemove) {
	var getCellFromEvent;
	if (user === 'computer') getCellFromEvent = getComputerCellFromEvent;
	if (user === 'player') getCellFromEvent = getPlayerCellFromEvent;
	
	forEachCell(user, function(cell){ 
		if (addOrRemove === 'add') {
			cell.addEventListener("click", getCellFromEvent);
		} else if (addOrRemove === 'remove') {
			cell.removeEventListener("click", getCellFromEvent);
		}
	});
}

function getAdjacentCell(user) {
	var cell = currentCell;
	var x = parseInt(cell.dataset.x);
	var y = parseInt(cell.dataset.y);
	
	if (shipDirection === "vertical") {
		y += 1;
	} else if (shipDirection === "horizontal") {
		x += 1;
	}

	var adjacentCell = getCell(user, x, y);

	return adjacentCell;
}

/********************     READY SHIP BUTTONS   *************************/

function addShipButtons() {
	var shipButtonDiv = document.getElementById('ship-buttons');
	for (var i = 0; i < numberOfShips; i++) {
		var shipButton = document.createElement('button');
		shipButton.setAttribute('class', 'ship-button');
		shipButtonDiv.appendChild(shipButton);
	}
	setShipButtons();
}

function customizeShipButton(index, name, size){
	var shipButtons = document.getElementsByClassName('ship-button');
	shipButtons[index].innerText = name;
	shipButtons[index].setAttribute('data-size', size);
	shipButtons[index].setAttribute('data-name', name.toLowerCase());
}

function setShipButtons() {
	customizeShipButton(0, "Patrol", 2);
	customizeShipButton(1, "Destroyer", 3);
	customizeShipButton(2, "Submarine", 3);
	customizeShipButton(3, "Battleship", 4);
	customizeShipButton(4, "Carrier", 5);
}

function getShipButton() {
	var name = currentShipName;
	var shipButtons = document.getElementsByClassName('ship-button');
	for (var i = 0; i < shipButtons.length; i++) {
		if (shipButtons[i].dataset.name === name.toLowerCase()) {
			return shipButtons[i];
		}
	}
}

function removeShipButton() {
	var buttonToHide = getShipButton();
	buttonToHide.style.visibility='hidden'; 
}

function addRotateButton() {
	var rotateDiv = document.getElementById('rotate-button-div');
	var rotateButton = document.createElement('button');
	rotateButton.setAttribute('id', 'rotate-button');
	rotateButton.innerText = "Rotate";
	rotateDiv.appendChild(rotateButton);
	rotateButton.addEventListener('click', rotateShip);
}

function rotateShip() {
	if (shipDirection === "vertical") {
		shipDirection = "horizontal";
	} else if (shipDirection === "horizontal") {
		shipDirection = "vertical";
	}
}

/***************** COMPUTER SHIP PLACEMENT***********************/
//comp ship placement happens immediately upon page load

function computerShipPlacement() {
	computerPlaceShip('patrol');
	computerPlaceShip('carrier');
	computerPlaceShip('submarine');
	computerPlaceShip('battleship');
	computerPlaceShip('destroyer');
}

function getLegalComputerCell(shipSize) {
	var empty;

	do {
		preventShipOverlap(shipSize);
		generateCoordinates();
		empty = doesCellContainComputerShip(shipSize);
	} while (!empty);
	
	var cell = getCell('computer', xCoord, yCoord);
	return cell;
}

function preventShipOverlap(shipSize) {
	if (shipDirection === 'horizontal') {
		xCoordLimit = gridSize - shipSize;
	} else if (shipDirection === 'vertical') {
		yCoordLimit = gridSize - shipSize;
	}
}

function generateCoordinates() {
	xCoord = getRandomInt(1, xCoordLimit);
	yCoord = getRandomInt(1, yCoordLimit);
}

function doesCellContainComputerShip(shipSize){
	var numCellsEmpty = 0;
	if (shipDirection === 'horizontal') {
		for (var i = xCoord; i < shipSize + xCoord; i++) {
			var compCell = getCell('computer', i, yCoord);
			if (!cellContainsClass(compCell, 'compship')){
				numCellsEmpty++;
			}
		}
	} else if (shipDirection === 'vertical') {
		for (var i = yCoord; i < shipSize + yCoord; i++) {
			var compCell = getCell('computer', xCoord, i);
			if (!cellContainsClass(compCell, 'compship')){
				numCellsEmpty++;
			}
		}
	}
	return (numCellsEmpty === shipSize);
}

function randomizeRotation() {
	var selection = getRandomInt(1,2);
	if (selection === 1) {
		return true;
	} else if (selection === 2) {
		return false;
	}
}

function computerPlaceShip(shipName) {
	//Randomize Ship Rotation
	if (randomizeRotation()){
		rotateShip();
	}

	//Determine shipSize based on type of ship
	var shipSize = getShipSize(shipName);
	

	//Place ship in a legal space
	currentCell = getLegalComputerCell(shipSize);
	cellHasComputerShip();
	numShipsPlaced++;
	addShipNumberClass();
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell("computer");
	}
}

function getShipSize(shipName) {
	var shipSize;
	if (shipName === 'patrol') {
		shipSize = 2;
	} else if (shipName === 'submarine' || shipName === 'destroyer') {
		shipSize = 3;
	} else if (shipName === 'battleship') {
		shipSize = 4;
	} else if (shipName === 'carrier') {
		shipSize = 5;
	}
	return shipSize;
}

/******************* PLAYER PLACE SHIP *********************/

function playerShipPlacement() {
	getCellClickHandler('player', 'add');
	addShipPlacementClickHandlers();
}

function addShipPlacementClickHandlers() {
	//ship button click handlers
	var shipButtons = document.getElementsByClassName('ship-button');
	for (var i = 0; i < shipButtons.length; i++){
		shipButtons[i].addEventListener('click', getShipFromClick);
	}	

	//cell click handlers
	forEachCell('player', function(cell){
		cell.addEventListener("click", statusPlayerPlaceShips);
	});
}

function getShipFromClick() {
	currentShipName = this.dataset.name;
	currentShipSize = this.dataset.size;
}

function statusPlayerPlaceShips() {
//	if (shipPlacementLegal) {
		numShipsPlaced++;
		playerPlaceShip();
		removeShipButton();
		testShipPlacementComplete(beginRounds);
//	}
}

function playerPlaceShip() {
	cellHasPlayerShip();
	addShipNumberClass();
	var shipSize = currentShipSize;
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell("player");
	}
}

function addShipNumberClass() {
	var shipNumberClass = " ship_number_" + numShipsPlaced;
	currentCell.className += shipNumberClass;
}

function markAdjacentCell(user){
	currentCell = getAdjacentCell(user);
	addShipNumberClass();
	if (user === 'player') {
		cellHasPlayerShip();
	} else if (user ==='computer') {
		cellHasComputerShip();
	}
}

//THIS ISN'T WORKING STILL
//ALSO CHECK IF SHIP IS ALREADY THERE >>> 
function shipPlacementLegal() {
	
	if (shipDirection === 'horizontal') {
		if (this.dataset.x <= gridSize - this.dataset.size) {
			return true;
		}
	} else if (shipDirection === 'vertical') {
		if (this.dataset.y <= gridSize - this.dataset.size) {
			return true;
		}
	} else return false;
}


function allPlayerShipsPlaced() {
	//(numberOfShips*2) because counting computer ships and player ships
	return (numShipsPlaced === (numberOfShips*2));
}

//for removing click handlers after ship placement status has ended
function removeShipPlacementClickHandlers() {
	//cell click handlers
	forEachCell('player', function(cell){
		cell.removeEventListener("click", statusPlayerPlaceShips);
	});

	//ship button click handlers
	var shipButtons = document.getElementsByClassName('ship-button');
	for (var i = 0; i < shipButtons.length; i++){
		shipButtons[i].removeEventListener('click', getShipFromClick);
	}	
}

/******************* PLAYER TURN *****************************/

function playerTurn() {
	console.log("Player's Turn!");
	playerTurnClickHandlers();
}

function playerTurnClickHandlers() {
	getCellClickHandler('player', 'remove');
	getCellClickHandler('computer', 'add');
	playerFireClickHandler();
}

function playerFireClickHandler() {
	forEachCell('computer', function(cell){
		cell.addEventListener('click', playerFire);
	});
}

function playerFire() {
	markComputerCell();
	console.log('player firing');
	computerTurn();
}

function markComputerCell() {
	var numCellsHit = 1;
	var shipNumberClass = getShipNumberClass();
	var shipSunk = isShipSunk(numCellsHit, shipNumberClass);
	
	if (cellContainsClass(currentCell, 'compship')){ //if the computer cell contains ship
		if (shipSunk) {						//if hitting this cell should sink that ship
			markShipSunk(shipNumberClass);	//mark the entire ship as sunk
		} else {							//else if the hit shouldn't sink that ship
			markCellHit(); 					//mark the cell as a hit
		}
	} else { 								//if the computer cell doesn't contain a ship
		markCellMiss();						//mark cell as a miss
	}
}

//checks to see if all of the cells a particular ship have been hit
function isShipSunk(numCellsHit, shipNumberClass) {
	var sameShip = document.getElementsByClassName(shipNumberClass);
	var shipSize = sameShip.length;
	for (var i = 0; i < sameShip.length; i++) {
		if (cellContainsClass(sameShip[i], 'hit')){
			numCellsHit++;
			if (numCellsHit === shipSize) {
					return true;
			}
		}
	}
	return false;
}

//returns the ship number of the current ship cell
function getShipNumberClass() {
	var cell = currentCell;
	var shipNumberClass = '';
	for (var i = 1; i <= numberOfShips * 2; i++) {
		shipNumberClass = ("ship_number_" + i);
		if (cellContainsClass(cell, shipNumberClass)){
			return shipNumberClass;
		}
	}
}

/**************  COMPUTER TURN *********************************/

function computerTurn() {
	computerTurnClickHanders();
	console.log("Computer's turn!");
	computerFire();
}

function computerTurnClickHanders() {
	getCellClickHandler('player', 'add');
}

function computerFire() {
	console.log("computer firing.");
	currentCell	= determineTypeOfFire();
	console.log("currentCell: (" + currentCell.dataset.x + ", " + currentCell.dataset.y + ")");
	markPlayerCell();
	playerTurn();
}

function determineTypeOfFire() {
	console.log("determining type of fire");
	//if the ship computer has been targeting is sunk
	//change the status back to random
	if (cellContainsClass(currentCell, 'sunk')) {
		compMove.status = "targetingRandomCell";
	}
	//then determine type of fire based on status
	if (compMove.status === "targetingRandomCell") {
		return targetPlayerCell("random");
	
	//marked as this after an initial hit on a ship
	} else if (compMove.status === "targetingSpecificCell") {
		return targetPlayerCell("specific");
	}
}

function getRandomPlayerCellCoords() {
	xCoord = getRandomInt(1, gridSize);
	yCoord = getRandomInt(1, gridSize);
}

function targetPlayerCell(type) {
	var alreadyMarked;
	var cell;

	if (type === "random") {
		do {
			getRandomPlayerCellCoords();
			cell = getCell('player', xCoord, yCoord);
			alreadyMarked = !isCellEmpty(cell);
		} while (alreadyMarked);
	
	} else if (type === 'specific') {
		getSpecificPlayerCoords();
		cell = getCell('player', xCoord, yCoord);
	}

	lastMove.updateCoords(xCoord, yCoord);
	return cell;
}

function markPlayerCell() {
	var numCellsHit = 1;
	var status;
	var shipNumberClass = getShipNumberClass();
	var shipSunk = isShipSunk(numCellsHit, shipNumberClass);
	
	if (cellContainsClass(currentCell, 'ship')){
		if (shipSunk) {
			status = markShipSunk(shipNumberClass);
		} else {
			 if(firstHitOnShip(shipNumberClass)) {
			 	initialHit.recordCoords();
			 	compMove.status = "targetingSpecificCell";
			 	compMove.updatePlan();
			 }
			status = markCellHit();
		}
	} else {
		status = markCellMiss();
	}
	lastMove.updateStatus(status);
}

function getSpecificPlayerCoords() {
	var move = compMove.plan.shift();
	xCoord = move.dataset.x;
	yCoord = move.dataset.y;
}

/*************** FOR COMPUTER 'SMARTER' MOVES *********************/

compMove = {
	plan: [],
	status: "targetingRandomCell",

	updatePlan: function () {
		var lastMove = planStage1();
		planStage2(lastMove);
	},
	//DEBUG
	printPlan: function() {
		for (var i = 0; i < this.plan.length; i++) {
			console.log("movePlan[" + i + "]: " + this.plan[i].dataset.x + ", " + this.plan[i].dataset.y);
		}
	},
};

	//DEBUG
	function printMoveOptions(moveOptions) {
		for (var i = 0; i < moveOptions.length; i++) {
			console.log("moveOptions[" + i + "]: " + moveOptions[i].dataset.x + ", " + moveOptions[i].dataset.y);
		}
	}

/***** ***** ***** 	Begin Stage 1 	***** ***** *****/

function planStage1() {
	var initX = initialHit.cellXCoord;
	var initY = initialHit.cellYCoord;

	//get all empty move options from the initial hit
	var moveOptions = determineMoveOptions(initX, initY);
	printMoveOptions(moveOptions);  //DEBUG

	//continue hitting options from the first set of move options, until one contains a ship
	do {
		//get move
		var currentMove = getMoveStage1(initX, initY, moveOptions);
		//add move to movePlan
		compMove.plan.push(currentMove);
		//test to see if the move hits
		var doesMoveHit = cellContainsClass(currentMove, 'ship');

		//DEBUG
		printMoveOptions(moveOptions);
		compMove.printPlan();
		console.log("does move hit? " + doesMoveHit);
		//END DEBUG

	} while (!doesMoveHit); //do the above while move doesn't hit

	return currentMove;
}

function determineMoveOptions(x, y) {
	var moveOptions = [];
	var directions = ['left', 'right', 'up', 'down'];

	//loop through all possible directions
	for (var i = 0; i < directions.length; i++){
		//if the adjacent cell exists, get and assign it
		if (hasAdjacentCell(directions[i], x, y)) {
			console.log("has adjacent cell " + directions[i]);
			var adjacentCell = getAdjacentCell2(directions[i], x, y);
			//if the cell is empty, push is to the moveOptions array
			if (isCellEmpty(adjacentCell)) {
				moveOptions.push(adjacentCell);
			}
		}
	}
	return moveOptions;
}

function getMoveStage1(initX, initY, moveOptions) {
	//choose a random cell from the moveOptions
	var moveIndex = getRandomInt(0, moveOptions.length - 1);
	var move = moveOptions[moveIndex];
	//remove that option 
	moveOptions.splice(moveIndex, 1);
	//determine the direction the first move was in, for future moves
	var currentDirection = determineMoveDirection(move, initX, initY);
	nextMove.direction = currentDirection;
	
	//DEBUG
	console.log("chosen random cell from move options: " + move.dataset.x + ", " + move.dataset.y);
	console.log("current direction: " + currentDirection);
	//END DEBUG

	return move;
}

/*****  ***** ***** Begin Stage 2: Everything after 2 consecutive cells are hit *****/


function planStage2(currentMove) {
	var initX = initialHit.cellXCoord;
	var initY = initialHit.cellYCoord;
	var currentDirection = nextMove.direction;
	var oppositeDirection = nextMove.getOppositeDirection();

	console.log("beginning stage2, checking parameters:");
	console.log('initial coords: '+ initX +', ' + initY +', currentMove: (' + currentMove.dataset.x + ', ' + currentMove.dataset.y + '), currentDirection: ' + currentDirection);
	do {
		currentMove = getMoveStage2(currentMove.dataset.x, currentMove.dataset.y, currentMove);
		compMove.plan.push(currentMove);
		compMove.printPlan(); //DEBUG
	 } while ( compMove.plan.length < 7) // an arbitrary number, to use for now
}

function getMoveStage2(x, y, currentMove) {
	var initX = initialHit.cellXCoord;
	var initY = initialHit.cellYCoord;
	var move = currentMove;
	var currentDirection = nextMove.direction;
	var oppositeDirection = nextMove.getOppositeDirection();

	if (nextMove.status === 'continueDirection') {
		if (hasAdjacentCell(currentDirection, move.dataset.x, move.dataset.y)) {
			console.log("true, has adjacent cell");
			//start with a move in the direction we have been going
			move = getNextMoveSameDirection(move, currentDirection);
			console.log("getNextMoveSameDirection: (" + move.dataset.x + ', ' + move.dataset.y + ')'); 
			if (isCellEmpty(move)) { 		//if cell isn't marked hit, miss, or sunk
				currentMove = move; 		//make the move
				if (!cellContainsClass(move, 'ship')) { //if move is a miss
					console.log("missed");
					nextMove.status = 'changeDirection';
				}
			} else {	//if the cell IS marked either hit, miss, or sunk
				//go ahead and try the other direction from the initial hit
				//checking first to see if it has an adjacentCell
				if (hasAdjacentCell(oppositeDirection, initX, initY)) {
					move = getAdjacentCell2(oppositeDirection, initX, initY);
					if (isCellEmpty(move)) {	//if cell isn't marked hit, miss, or sunk
						currentMove = move; 	//make the move
						nextMove.direction = oppositeDirection;
						nextMove.status = 'continueDirection';
					}
				}
			}
		}
	} else if (nextMove.status === 'changeDirection') {
		//go back to the initial hit, and try the other direction
		//first checking if it has an adjacentCell
		if (hasAdjacentCell(oppositeDirection, initX, initY)) {
			move = getAdjacentCell2(oppositeDirection, initX, initY);
			if (isCellEmpty(move)) {	//if cell isn't marked hit, miss, or sunk
				currentMove = move;		//make the move
				nextMove.direction = oppositeDirection; //change directions
				nextMove.status = 'continueDirection';
			}
		}
	}
	return currentMove;
}
			
// ***** ***** Stage 2 HELPERS ***** ***** // 

function hasAdjacentCell(direction, x, y) {
	if (direction === 'left' && x == 1) {
		return false;
	}
	if (direction === 'right' && x == 10) {
		return false;
	}
	if (direction === 'up' && y == 10) {
		return false;
	}
	if (direction === 'down' && y == 1) {
		return false;
	} 
	return true;
}

function getAdjacentCell2(direction, x, y) {
	x = parseInt(x);
	y = parseInt(y);
	if (direction === 'left') {
		x -= 1;
	} else if (direction === 'right') {
		x += 1;
	} else if (direction === 'up') {
		y += 1;
	} else if (direction === 'down') {
		y -= 1;
	}
	console.log("getting adjacent cell @ (" + x + ", " + y +")");	
	var cell = getCell('player', x, y);
	return cell;
}

function determineMoveDirection(moveCell, initX, initY) {
	var direction;
	var newX = moveCell.dataset.x;
	var newY = moveCell.dataset.y;

	if (newX - initX === -1) {
		direction = "left";
	} else if (newX - initX === 1) {
		direction = "right";
	} else if (newY - initY === 1) {
		direction = "up";
	} else if (newY - initY === -1) {
		direction = "down";
	}
	return direction;
}

//possibly not necessary
function getNextMoveSameDirection(currentMove, direction) {
	var x = currentMove.dataset.x;
	var y = currentMove.dataset.y;
	var move = getAdjacentCell2(direction, x, y);
	
	console.log("getNextMoveSameDirection: " + x + ', ' + y);
	console.log("and the currentMove is: (" + currentMove.dataset.x + ', ' + currentMove.dataset.y +')');
	console.log("and the move is: (" + move.dataset.x + ', ' + move.dataset.y +')');
	
	return move;
}

function firstHitOnShip(shipNumberClass) {
	var shipCells = document.getElementsByClassName(shipNumberClass);
	for (var i = 0; i < shipCells.length; i++) {
		if (shipCells[i].classList.contains("hit")) {
			return false;
		}
	}
	return true;
}

/***************   GENERAL HELPER FUNCTIONS      ***********************/

function forEachCell(user, callback){
	for (var x = 1; x <= gridSize; x++){
		for (var y = 1; y <= gridSize; y++){
				var cell = getCell(user, x, y);
				callback(cell);
		}
	}
}

function cellContainsClass(cell, className) {
	return (cell.classList.contains(className));
}

function isCellEmpty(cell) {
	if ((cell.classList.contains('hit')) || 
	 	(cell.classList.contains('miss')) ||
	 	(cell.classList.contains('sunk'))) {
		return false;
	} else return true;
}

function getRandomInt(min, max) {
	return (Math.floor(Math.random() * (max - min + 1)) + min);
}

function getOppositeDirection(direction) {
	var oppositeDirection;
	if (direction === 'left') oppositeDirection = 'right';
	if (direction === 'right') oppositeDirection = 'left';
	if (direction === 'up') oppositeDirection = 'down';
	if (direction === 'down') oppositeDirection = 'up';
	return oppositeDirection;
}

/****************** MARK CELLS **********************************/

//Adds ship class to current cell
function cellHasPlayerShip() {
	var status = 'ship';
	var cellToMark = currentCell;
	cellToMark.className += " ship";
	return status;
}

//Adds compship class to current cell
function cellHasComputerShip() {
	var status = 'compship';
	var cellToMark = currentCell;
	cellToMark.className += " compship";
	return status;
}

//Adds hit class to current cell
function markCellHit() {
	var status = 'hit';
	var cellToMark = currentCell;
	cellToMark.className += " hit";
	return status;
}

//Adds miss class to current cell
function markCellMiss() {
	var status = 'miss';
	var cellToMark = currentCell;
	cellToMark.className += " miss";
	return status;
}

//Adds sunk class to each cell of the current ship
function markShipSunk(shipNumberClass) {
	var status = 'sunk';
	var sameShip = document.getElementsByClassName(shipNumberClass);
	for (var i = 0; i < sameShip.length; i++) {
		sameShip[i].className += ' sunk';
	}
	return status;
}
