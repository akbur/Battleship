
var gridSize = 10;
var numShipsPlaced = 0;
var numberOfShips = 5;
var shipDirection = 'horizontal';
var currentShipName, currentShipSize, currentCell;
var xCoordLimit = gridSize;
var yCoordLimit = gridSize;
var xCoord, yCoord;
var computerMoveStatus = "targetingRandomCell";
var tempMovePlan = [];
//other possible status = "targetingSpecificCell";

//maybe cellX&YCoords shouldn't be listed except inside
//the functions, but wont delete yet incase it messes up
//what i'm working on

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
	getXCoord: function() {
		return this.cellXCoord;
	},
	getYCoord: function() {
		return this.cellYCoord;
	},
	updateStatus: function(status) {
		if (status === 'hit') {
			this.cellHit = true;
			this.cellMiss = false;
			this.cellSunk = false;
		} else if (status === 'sunk') {
			this.cellHit = false;
			this.cellMiss = false;
			this.cellSunk = true;	
		} else if (status === 'miss') {
			this.cellHit = false;
			this.cellMiss = true;
			this.cellSunk = false;
		}
	},
};

var initialHit = {
	cellXCoord: 0,
	cellYCoord: 0,
	recordCoords: function() {
		this.cellXCoord = currentCell.dataset.x;
		this.cellYCoord = currentCell.dataset.y;
		console.log("initialHit: " + this.cellXCoord + ', ' + this.cellYCoord);
	},
	getXCoord: function() {
		return this.cellXCoord;
	},
	getYCoord: function() {
		return this.cellYCoord;
	},
};

setupGame();

function setupGame() {
	createGrid();
	addShipButtons();
	addRotateButton();
	shipPlacement();
}

function shipPlacement() {
	computerShipPlacement();
	PlayerShipPlacement();
}

function testShipPlacementComplete(callback) {
	var allShipsPlaced = allPlayerShipsPlaced();
	//if all ships have been placed
	if (allShipsPlaced) {
		//ADD FUNCTION HERE TO REMOVE HEADING & ROTATE BUTTON
		//callback will be to beginRounds
		callback();
	}
}

function beginRounds() {
	playerTurn();
	//computerTurn will be called when playerTurn complete
}

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

function getShipFromEvent() {
	currentShipName = this.dataset.name;
	currentShipSize = this.dataset.size;
}

function getShipClickHandlers() {
	var shipButtons = document.getElementsByClassName('ship-button');
	for (var i = 0; i < shipButtons.length; i++){
		shipButtons[i].addEventListener('click', getShipFromEvent);
		shipButtons[i].addEventListener("click", shipPlacementClickHandler);
	}
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

/******************* PLAYER PLACE SHIP *********************/

//TODO: CREATE A BUTTON FOR AUTOMATICALLY PLACING PLAYER SHIPS

function PlayerShipPlacement() {
	getCellClickHandler('player', 'add');
	getShipClickHandlers();
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

function addShipNumberClass() {
	var shipNumberClass = " ship_number_" + numShipsPlaced;
	currentCell.className += shipNumberClass;
}

function playerPlaceShip() {
	cellHasPlayerShip();
	addShipNumberClass();
	var shipSize = currentShipSize;
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell("player");
	}
}

function statusPlayerPlaceShips() {
//	if (shipPlacementLegal) {
		numShipsPlaced++;
		playerPlaceShip();
		removeShipButton();
		testShipPlacementComplete(beginRounds);
//	}
}

function shipPlacementClickHandler() {
	forEachCell('player', function(cell){
		cell.addEventListener("mouseover", mouseoverText);
		cell.addEventListener("click", statusPlayerPlaceShips);
	});
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

//TEMPORARY
//NEED TO ADD HOVER STILL SO PLAYER CAN SEE
//WHERE THEY ARE ABOUT TO PLACE SHIP
function mouseoverText() {
	//Trade this later for hovering ship before placement
}

function allPlayerShipsPlaced() {
	return (numShipsPlaced === (numberOfShips*2));
}

/***************** COMPUTER SHIP PLACEMENT***********************/

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

//TODO: SEPERATE INTO 3+ SEPERATE FUNCTIONS V 
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
	
	if (cellContainsClass(currentCell, 'compship')){
		if (shipSunk) {
			markShipSunk(shipNumberClass);
		} else {
			markCellHit();
		}
	} else {
		markCellMiss();
	}
}

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

//now that i think of it, function below may be 
//unnecessary - check
function computerTurnClickHanders() {
	getCellClickHandler('computer','remove');
	getCellClickHandler('player', 'add');
}

function computerFire() {
	console.log("computer firing."); //all good here
	currentCell	= determineTypeOfFire();
	console.log("current cell:" + currentCell); //this one is returning a cell correctly

	markPlayerCell();
	playerTurn();
}

function determineTypeOfFire() {
	console.log("determining type of fire");
	//if the ship computer has been targeting is sunk
	//change the status back to random
	if (cellContainsClass(currentCell, 'sunk')) {
		computerMoveStatus = "targetingRandomCell";
	}
	//then determine type of fire based on status
	if (computerMoveStatus === "targetingRandomCell") {
		return targetPlayerCell("random");
	
	//marked as this after an initial hit on a ship
	} else if (computerMoveStatus === "targetingSpecificCell") {
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
		getSpecificPlayerCoords(tempMovePlan);
		cell = getCell('player', xCoord, yCoord);
	}

	lastMove.updateCoords(xCoord, yCoord);
	return cell;
}

function markPlayerCell() {
	var numCellsHit = 1;
	var shipNumberClass = getShipNumberClass();
	var shipSunk = isShipSunk(numCellsHit, shipNumberClass);
	
	if (cellContainsClass(currentCell, 'ship')){
		if (shipSunk) {
			markShipSunk(shipNumberClass);
			lastMove.updateStatus("sunk");
		} else {
			 if(firstHitOnShip(shipNumberClass)) {
			 	initialHit.recordCoords();
			 	computerMoveStatus = "targetingSpecificCell";
			 	tempMovePlan = createMovePlan();
			 }
			markCellHit();
			lastMove.updateStatus("hit");
		}
	} else {
		markCellMiss();
		lastMove.updateStatus("miss");
	}
}

/*************** FOR COMPUTER 'SMARTER' MOVES *********************/


function getSpecificPlayerCoords(movePlan) {
	var movePlan = movePlan;
	currentMove = movePlan.shift();
	xCoord = currentMove.dataset.x;
	yCoord = currentMove.dataset.y;
}

function createMovePlan() {
	var movePlan = [];
	var currentDirection;
	var oppositeDirection;
	var initX = initialHit.getXCoord();
	var initY = initialHit.getYCoord();

	//get all empty move options from the initial hit
	var moveOptions = determineMoveOptions(initX, initY);
	printMoveOptions(moveOptions);

	//for DEBUG
	function printMovePlan(movePlan) {
		for (var i = 0; i < movePlan.length; i++) {
			console.log("movePlan[" + i + "]: " + movePlan[i].dataset.x + ", " + movePlan[i].dataset.y);
		}
	}

	function printMoveOptions(moveOptions) {
		for (var i = 0; i < moveOptions.length; i++) {
			console.log("moveOptions[" + i + "]: " + moveOptions[i].dataset.x + ", " + moveOptions[i].dataset.y);
		}
	}

	function getMoveStage1(initX, initY, moveOptions) {
		//choose a random cell from the moveOptions
		var moveIndex = getRandomInt(0, moveOptions.length - 1);
		var move = moveOptions[moveIndex];
		console.log("chosen random cell from move options: " + move.dataset.x + ", " + move.dataset.y);

		//add the chosen first move to the plan
		movePlan.push(move);
		printMovePlan(movePlan);

		//remove that option 
		moveOptions.splice(moveIndex, 1);
		printMoveOptions(moveOptions);
		
		//determine the direction the first move was in, for future moves
		currentDirection = determineMoveDirection(move, initX, initY);
		console.log("current direction: " + currentDirection);
		oppositeDirection = getOppositeDirection(currentDirection);

		return move;
	}

	function getMoveStage2(initX, initY, currentMove, currentDirection) {
		var move = currentMove;
		console.log("beginning stage2, checking parameters:");
		console.log(initX +', ' + initY +', ' + currentMove +', ' + currentDirection);

		//if the cell has an adjacent cell
		if (hasAdjacentCell(currentDirection, currentMove.dataset.x, currentMove.dataset.y)) {
			console.log("true, has adjacent cell");
			//start with a move in the direction we have been going
			move = getNextMoveSameDirection(move, currentDirection);
			console.log(move); 
			//if cell is empty
			if (isCellEmpty(move)) {
				//add that move to the plan
				currentMove = move;
				movePlan.push(move);
				printMovePlan(movePlan);
				//if miss
				if (!cellContainsClass(move, 'ship')) {
					console.log("missed");
					//go back to the initial hit, and try the other direction
					//first checking if it has an adjacentCell
					if (hasAdjacentCell(oppositeDirection, initX, initY)) {
						move = getMoveFromInitialHit(initX, initY, oppositeDirection);
						//if that cell is empty
						if (isCellEmpty(move)) {
							//add that move to the plan
							currentMove = move;
							movePlan.push(move);
							printMovePlan(movePlan);
							//since we'll be switching directions from here, 
							//the currentDirection will change
							currentDirection = oppositeDirection;
						}
					}
				}
			//if the cell we started with isn't empty
			} else {
				//go ahead and try the other direction from the initial hit
				//checking first to see if it has an adjacentCell
				if (hasAdjacentCell(currentDirection, currentMove.dataset.x, currentMove.dataset.y)) {
					move = getMoveFromInitialHit(initX, initY, oppositeDirection);
					//if that cell is empty
					if (isCellEmpty(move)) {
						//add that move to the plan
						currentMove = move;
						movePlan.push(move);
						printMovePlan(movePlan);
						//and again in this case, change the currentDirection
						currentDirection = oppositeDirection;
					}
				}	
			}	
		}
		return currentMove;
	}
			
		//continue hitting options from the first set of move options, until one contains a ship
		do {
			console.log(initX + ', ' + initY); //the coordinates from here are correct
			var currentMove = getMoveStage1(initX, initY, moveOptions);
			var doesMoveHit = cellContainsClass(currentMove, 'ship');
			console.log("does move hit? " + doesMoveHit);
		} while (!doesMoveHit);

		//after 2 side-by-side hits, get next move based on direction of ship
		do {
			currentMove = getMoveStage2(currentMove.dataset.x, currentMove.dataset.y, currentMove, currentDirection);
	 	//9 is an arbitrary number that should be enough, for now.
		 } while ( movePlan.length < 9)
			return movePlan;


}

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

function getNextMoveSameDirection(currentMove, direction) {
				var x = currentMove.dataset.x;
				var y = currentMove.dataset.y;
				console.log("getNextMoveSameDirection: " + x + ', ' + y);
				console.log("and the currentMove is: " + currentMove);
				var move = getAdjacentCell2(direction, x, y);
				console.log("and the move is: " + move);
				return move;
}

//goes back to the initially hit cell and gets a cell beside it, in the specified direction
function getMoveFromInitialHit(initX, initY, direction) {
				var move = getAdjacentCell2(direction, initX, initY);
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

/***************    HELPER FUNCTIONS      ***********************/

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

//Adds computer ship class to current cell
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

function markShipSunk(shipNumberClass) {
	var status = 'sunk';
	var sameShip = document.getElementsByClassName(shipNumberClass);
	for (var i = 0; i < sameShip.length; i++) {
		sameShip[i].className += ' sunk';
	}
	return status;
}
