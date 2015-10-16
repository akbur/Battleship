
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
//Need to combine a lot of these to make more DRY, but don't want
//to mess anything up and stop it from working right now.

function getPlayerCell(x , y) {
	var cells = document.getElementsByClassName('grid-cell');
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].dataset.x == x && cells[i].dataset.y == y) {
			return cells[i];
		}
	}
}

function getComputerCell(x, y) {
	var ComputerGridDiv = document.getElementsByClassName('grid-container')[1];
	var cells = ComputerGridDiv.children;
	for (var i = 0; i <= cells.length; i++) {
		if (cells[i].dataset.x == x && cells[i].dataset.y == y) {
			return cells[i];
		}
	}
}

function getPlayerCellFromEvent() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	currentCell = getPlayerCell(x, y);
}

function getComputerCellFromEvent() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	currentCell = getComputerCell(x, y);
}

function getPlayerCellClickHandler() {
	forEachCell('player', function(cell){
		cell.addEventListener("click", getPlayerCellFromEvent);
	});
}

function removeGetPlayerCellClickHandler() {
	forEachCell('player', function(cell){
		cell.removeEventListener("click", getPlayerCellFromEvent);
	});
}

function getComputerCellClickHandler() {
	forEachCell('computer', function(cell){
		cell.addEventListener("click", getComputerCellFromEvent);
	});
}

function removeGetComputerCellClickHandler() {
	forEachCell('computer', function(cell){
		cell.addEventListener("click", getComputerCellFromEvent);
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

	if (user === "player") {
		var adjacentCell = getPlayerCell(x, y);
	} else if (user === "computer") {
		var adjacentCell = getComputerCell(x, y);
	}
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

function getShipClickHandler() {
	var shipButtons = document.getElementsByClassName('ship-button');
	for (var i = 0; i < shipButtons.length; i++){
		shipButtons[i].addEventListener('click', getShipFromEvent);
	}
}

function shipClickHandler() {
	var shipButtons = document.getElementsByClassName('ship-button');
	for (var i = 0; i < shipButtons.length; i++){
		shipButtons[i].addEventListener("click", function() {
			addCellEventListeners();
		});
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
	getPlayerCellClickHandler();
	getShipClickHandler();
	shipClickHandler();
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
	if (shipPlacementLegal) {
		numShipsPlaced++;
		playerPlaceShip();
		removeCellEventListeners();
		removeShipButton();
		testShipPlacementComplete(beginRounds);
	}
}

function addCellEventListeners() {
	forEachCell('player', function(cell){
		cell.addEventListener("mouseover", mouseoverText);
		cell.addEventListener("click", statusPlayerPlaceShips);
	});
}
function removeCellEventListeners(){
	forEachCell('player', function(cell){
		cell.removeEventListener("mouseover", mouseoverText);
		cell.removeEventListener("click", statusPlayerPlaceShips);
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
	if (numShipsPlaced === (numberOfShips*2)) {
		return true;
	} else {
		return false;
	}
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
	
	var cell = getComputerCell(xCoord, yCoord);
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
			var compCell = getComputerCell(i, yCoord);
			if (!(compCell.classList.contains('compship'))) {
				numCellsEmpty++;
			}
		}
	} else if (shipDirection === 'vertical') {
		for (var i = yCoord; i < shipSize + yCoord; i++) {
			var compCell = getComputerCell(xCoord, i);
			if (!(compCell.classList.contains('compship'))) {
				numCellsEmpty++;
			}
		}
	}
	if (numCellsEmpty === shipSize) {
		return true;
	} else {
		return false;
	}
}

function computerDecideRotate() {
	var selection = getRandomInt(1,2);
	if (selection === 1) {
		return 'Y';
	} else if (selection === 2) {
		return 'N';
	}
}

//TODO: SEPERATE INTO 3+ SEPERATE FUNCTIONS V 
function computerPlaceShip(shipName) {
	//Randomized Ship Rotation
	rotateYorN = computerDecideRotate();
	if (rotateYorN === 'Y') {
		rotateShip();
	}

	//Determine shipSize based on type of ship
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

	//Place ship in a legal space
	currentCell = getLegalComputerCell(shipSize);
	cellHasComputerShip();
	numShipsPlaced++;
	addShipNumberClass();
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell("computer");
	}
}

/******************* PLAYER TURN *****************************/

function playerTurn() {
	console.log("Player's Turn!");
	playerTurnCLickHandlers();
}

function playerTurnCLickHandlers() {
	removeGetPlayerCellClickHandler();
	getComputerCellClickHandler();
	playerFireClickHandler();
}

function playerFireClickHandler() {
	forEachCell('computer', function(cell){
		cell.addEventListener('click', playerFire);
	});
}

function playerFire() {
	markComputerCell();
	computerTurn();
}

function markComputerCell() {
	var numCellsHit = 1;
	var shipNumberClass = getShipNumberClass();
	var shipSunk = isShipSunk(numCellsHit, shipNumberClass);
	
	if (currentCell.classList.contains('compship')){
		if (shipSunk) {
			sinkShip(shipNumberClass);
		} else {
			cellHit();
		}
	} else {
		cellMiss();
	}
}

function isShipSunk(numCellsHit, shipNumberClass) {
	var sameShip = document.getElementsByClassName(shipNumberClass);
	var shipSize = sameShip.length;
	for (var i = 0; i < sameShip.length; i++) {
		if (sameShip[i].classList.contains('hit')) {
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
		if (cell.classList.contains(shipNumberClass)) {
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
	removeGetComputerCellClickHandler();
	getPlayerCellClickHandler();
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
	if (isShipSunk2()) {
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
			alreadyMarked = isPlayerCellMarked(xCoord, yCoord);
		} while (alreadyMarked);
	
	} else if (type === 'specific') {
		getSpecificPlayerCoords(tempMovePlan);
	}

	cell = getPlayerCell(xCoord, yCoord);
	lastMove.updateCoords(xCoord, yCoord);
	return cell;
}

function isPlayerCellMarked(x, y) {
	var cellToCheck = getPlayerCell(x, y);
	if (cellToCheck.classList.contains('hit')) {
		return true;
	} else if (cellToCheck.classList.contains('miss')) {
		return true;
	} else if (cellToCheck.classList.contains('sunk')) {
		return true;
	} else return false;
}

function markPlayerCell() {
	var numCellsHit = 1;
	var shipNumberClass = getShipNumberClass();
	var shipSunk = isShipSunk(numCellsHit, shipNumberClass);
	
	if (currentCell.classList.contains('ship')){
		if (shipSunk) {
			sinkShip(shipNumberClass);
			lastMove.updateStatus("sunk");
		} else {
			 if(firstHitOnShip(shipNumberClass)) {
			 	initialHit.recordCoords();
			 	computerMoveStatus = "targetingSpecificCell";
			 	tempMovePlan = createMovePlan();
			 }
			cellHit();
			lastMove.updateStatus("hit");
		}
	} else {
		cellMiss();
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
				if (!doesCellContainPlayerShip(move)) {
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
			var doesMoveHit = doesCellContainPlayerShip(currentMove);
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
	var cell = getPlayerCell(x, y);
	return cell;
}

function determineMoveOptions(x, y) {
	var moveOptions = [];

	//if the adjacent cell exists, get and assign it
	//then if the cell is empty, push is to the moveOptions array
	if (hasAdjacentCell("left", x, y)) {
		console.log("has adj cell left");
		var adjacentCellLeft = getAdjacentCell2("left", x, y);
		if (isCellEmpty(adjacentCellLeft)) {
			moveOptions.push(adjacentCellLeft);	
		} 
	}
	if (hasAdjacentCell("right", x, y)) {
		console.log("has adj cell right");
		var adjacentCellRight = getAdjacentCell2("right", x, y);
		if (isCellEmpty(adjacentCellRight)) {
			moveOptions.push(adjacentCellRight);
		}
	}
	if (hasAdjacentCell("up", x, y)) {
		console.log("has adj cell up");
		var adjacentCellUp = getAdjacentCell2("up", x, y);
		if (isCellEmpty(adjacentCellUp)) {
			moveOptions.push(adjacentCellUp);	
		} 
	}
	if (hasAdjacentCell("down", x, y)) {
		console.log("has adj cell down");
		var adjacentCellDown = getAdjacentCell2("down", x, y);
		if (isCellEmpty(adjacentCellDown)) {
			moveOptions.push(adjacentCellDown);	
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

//could use next 2 functions to change markPlayerTarget() -- repeated code
function doesCellContainPlayerShip(cell) {
	if (cell.classList.contains("ship")) {
		return true;
	} else {
		return false;
	}
}

function isCellEmpty(cell) {
	if ((cell.classList.contains('hit')) || 
	 	(cell.classList.contains('miss')) ||
	 	(cell.classList.contains('sunk'))) {
		return false;
	} else return true;
}

function isShipSunk2() {
	if (currentCell.classList.contains('sunk')) {
		return true;
	} else {
		return false;
	}
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
			if (user === 'player') {
				var cell = getPlayerCell(x,y);
			} else if (user === 'computer') {
				var cell = getComputerCell(x,y);
			}
			callback(cell);
		}
	}
}

function getRandomInt(min, max) {
	return (Math.floor(Math.random() * (max - min + 1)) + min);
}

function getOppositeDirection(direction) {
	var oppositeDirection;
	if (direction === 'left') {
		oppositeDirection = 'right';
	} else if (direction === 'right') {
		oppositeDirection = 'left';
	} else if (direction === 'up') {
		oppositeDirection = 'down';
	} else if (direction === 'down') {
		oppositeDirection = 'up';
	}
	return oppositeDirection;
}

/****************** MARK CELLS **********************************/

//Adds ship class to current cell
function cellHasPlayerShip() {
	var cellToMark = currentCell;
	cellToMark.className += " ship";
}

//Adds computer ship class to current cell
function cellHasComputerShip() {
	var cellToMark = currentCell;
	cellToMark.className += " compship";
}

//Adds hit class to current cell
function cellHit() {
	var cellToMark = currentCell;
	cellToMark.className += " hit";
}

//Adds miss class to current cell
function cellMiss() {
	var cellToMark = currentCell;
	cellToMark.className += " miss";
}

function sinkShip(shipNumberClass) {
	var sameShip = document.getElementsByClassName(shipNumberClass);
	for (var i = 0; i < sameShip.length; i++) {
		sameShip[i].className += ' sunk';
	}
}
