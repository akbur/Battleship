

/***** VARIABLES *****/

var _gridSize = 10;
var _numberOfShips = 5;

var current = {
	playerCell: getCell('player', 1, 1),
	compCell: getCell('computer', 1, 1),
	shipSize: 0,
	shipName: '',
	shipDirection: 'horizontal',
	numShipsPlaced: 0,
	targetStatus: 'targetingRandomCell',
	xCoord: 1, 
	yCoord: 1,
	gameOverAnnounced: false,
}

var lastMove = {
	cellHit: false,
	cellMiss: false,
	cellSunk: false,
	cellXCoord: 0,
	cellYCoord: 0,
	setCell: function(cell) {
		this.cell = cell;
	},
	getCell: function() {
		return this.cell;
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
	stage: 0,
	status: 'continueDirection',
	direction: '',
	getOppositeDirection: function() {
		return getOppositeDirection(this.direction);
	},
	setMove: function(move) {
		this.move = move;
		console.log('nextMove.setMove: ' + move);
	},
	getMove: function() {
		console.log('getting move');
		return this.move;
	},
	determineStage: function() {
		if (this.stage === 1) {
			if (nextMove.stage1Plan.length === 0) {
				this.stage = 2;
			}
		}
	},
	stage1Plan: [],

};

var initialHit = {
	cellXCoord: 0,
	cellYCoord: 0,
	recordCoords: function(x, y) {
		this.cellXCoord = x;
		this.cellYCoord = y;
		nextMove.stage = 0;
		console.log("INITIAL HIT: " + this.cellXCoord + ', ' + this.cellYCoord);
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
	removeShipPlacementDiv();
	playerTurn();
	//computerTurn will be called when playerTurn complete
}

/***************** SETUP *******************************/

function createGrid() {
	var gridDiv = document.querySelectorAll('.grid-container');
	for (var grid = 0; grid < gridDiv.length; grid++) {
		for (var i = _gridSize; i >= 1; i--) {
			for (var j = 1; j <= _gridSize; j++) {
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
	current.playerCell = getCell('player', x, y);
}

function getComputerCellFromEvent() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	current.compCell = getCell('computer', x, y);
}

function getCellClickHandler(user, addOrRemove) {
	var getCellFromEvent;
	if (user === 'computer') getCellFromEvent = getComputerCellFromEvent;
	if (user === 'player') getCellFromEvent = getPlayerCellFromEvent;
	
	forEachCell(user, function(cell){ 
		if (addOrRemove === 'add') {
			cell.addEventListener('click', getCellFromEvent);
		} else if (addOrRemove === 'remove') {
			cell.removeEventListener('click', getCellFromEvent);
		}
	});
}

function getAdjacentCell(user) {

	if (user === 'player') {
		var cell = current.playerCell;
	} else if (user === 'computer') {
		var cell = current.compCell;
	}
	
	var x = parseInt(cell.dataset.x);
	var y = parseInt(cell.dataset.y);
	
	if (current.shipDirection === 'vertical') {
		y += 1;
	} else if (current.shipDirection === 'horizontal') {
		x += 1;
	}

	var adjacentCell = getCell(user, x, y);

	return adjacentCell;
}

/********************     READY SHIP BUTTONS   *************************/

function addShipButtons() {
	var shipButtonDiv = document.getElementById('ship-buttons');
	for (var i = 0; i < _numberOfShips; i++) {
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
	customizeShipButton(0, 'Patrol', 2);
	customizeShipButton(1, 'Destroyer', 3);
	customizeShipButton(2, 'Submarine', 3);
	customizeShipButton(3, 'Battleship', 4);
	customizeShipButton(4, 'Carrier', 5);
}

function getShipButton() {
	var name = current.shipName;
	var shipButtons = document.getElementsByClassName('ship-button');
	for (var i = 0; i < shipButtons.length; i++) {
		if (shipButtons[i].dataset.name === name.toLowerCase()) {
			return shipButtons[i];
		}
	}
}

function removeShipButton() {
	var shipButton = getShipButton();
	shipButton.style.visibility='hidden'; 
}

function addRotateButton() {
	var rotateDiv = document.getElementById('rotate-button-div');
	var rotateButton = document.createElement('button');
	rotateButton.setAttribute('id', 'rotate-button');
	rotateButton.innerText = 'Rotate Ship';
	rotateDiv.appendChild(rotateButton);
	rotateButton.addEventListener('click', rotateShip);
}

function rotateShip() {
	if (current.shipDirection === 'vertical') {
		current.shipDirection = 'horizontal';
	} else if (current.shipDirection === 'horizontal') {
		current.shipDirection = 'vertical';
	}
}

function removeShipPlacementDiv() {
	var shipBlock = document.getElementById('ship-block');
	shipBlock.style.display = 'none';
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
	var coordLimit = {
		x: _gridSize,
		y: _gridSize,
	}

	do {
		preventShipOverlap(shipSize, coordLimit);
		generateCoordinates(coordLimit);
		empty = doesCellContainComputerShip(shipSize);
	} while (!empty);
	
	var cell = getCell('computer', current.xCoord, current.yCoord);
	return cell;
}

function preventShipOverlap(shipSize, coordLimit) {
	if (current.shipDirection === 'horizontal') {
		coordLimit.x = _gridSize - shipSize;
	} else if (current.shipDirection === 'vertical') {
		coordLimit.y = _gridSize - shipSize;
	}
}

function generateCoordinates(coordLimit) {
	current.xCoord = getRandomInt(1, coordLimit.x);
	current.yCoord = getRandomInt(1, coordLimit.y);
}

function doesCellContainComputerShip(shipSize){
	var numCellsEmpty = 0;
	if (current.shipDirection === 'horizontal') {
		for (var i = current.xCoord; i < shipSize + current.xCoord; i++) {
			var compCell = getCell('computer', i, current.yCoord);
			if (!cellContainsClass(compCell, 'compship')){
				numCellsEmpty++;
			}
		}
	} else if (current.shipDirection === 'vertical') {
		for (var i = current.yCoord; i < shipSize + current.yCoord; i++) {
			var compCell = getCell('computer', current.xCoord, i);
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
	current.compCell = getLegalComputerCell(shipSize);
	cellHasComputerShip(current.compCell);
	current.numShipsPlaced++;
	addShipNumberClass(current.compCell);
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell('computer');
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
		shipButtons[i].addEventListener('click', beginHoverEffect);
	}	

	//cell click handlers
	forEachCell('player', function(cell){
		cell.addEventListener('click', statusPlayerPlaceShips);
	});
}

function getShipFromClick() {
	current.shipName = this.dataset.name;
	current.shipSize = this.dataset.size;
}

function statusPlayerPlaceShips() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	if (shipPlacementLegal(x, y)) {
		current.numShipsPlaced++;
		playerPlaceShip();
		removeShipButton();
		endHoverEffect();
		testShipPlacementComplete(beginRounds);
	}
}

function playerPlaceShip() {
	cellHasPlayerShip(current.playerCell);
	addShipNumberClass(current.playerCell);
	var shipSize = current.shipSize;
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell('player');
	}
}

function addShipNumberClass(cell) {
	var shipNumberClass = ' ship_number_' + current.numShipsPlaced;
	cell.className += shipNumberClass;
}

function markAdjacentCell(user){
	var currentCell = getAdjacentCell(user);
	if (user === 'player') {
		current.playerCell = currentCell;
		cellHasPlayerShip(currentCell);
	} else if (user ==='computer') {
		current.compCell = currentCell;
		cellHasComputerShip(currentCell);
	}
	addShipNumberClass(currentCell);
}

function shipPlacementLegal(x, y) {
	if (withinBounds(x, y)) {
		if (!doesShipOverlap(x, y)) {
			return true;
		}
	}
	return false;;
}

function withinBounds(x, y) {
	if (current.shipDirection === 'horizontal') {
		if (x <= _gridSize - current.shipSize + 1) {
			return true;
		}
	} else if (current.shipDirection === 'vertical') {
		if (y <= _gridSize - current.shipSize + 1) {
			return true;
		}
	} else return false;
}

//or doesCellContainPlayerShip
function doesShipOverlap(x, y) {
	var numCellsEmpty = 0;
	
	//populate cells array with all ship cells
	var cell = [];
	cell[0] = getCell('player', x, y);
	if (current.shipDirection === 'horizontal') {
		for (var i = 1; i < current.shipSize; i++) {
			cell[i] = getAdjacentCell2('right', x, y);
			x++
		}
	} else if (current.shipDirection === 'vertical') {
		for (var i = 1; i < current.shipSize; i++) {
			cell[i] = getAdjacentCell2('up', x, y);
			y++
		}
	}

	//loop through ship cells and count if empty;
	for (var i = 0; i < cell.length; i++) {
		if (!cellContainsClass(cell[i], 'ship')){
			numCellsEmpty++;
		}
	}

	if (numCellsEmpty == current.shipSize) {
		return false; // ship does NOT overlap another ship
	} else return true;
}


function allPlayerShipsPlaced() {
	//(_numberOfShips*2) because counting computer ships and player ships
	return (current.numShipsPlaced === (_numberOfShips*2));
}

//for removing click handlers after ship placement status has ended
function removeShipPlacementClickHandlers() {
	//cell click handlers
	forEachCell('player', function(cell){
		cell.removeEventListener('click', statusPlayerPlaceShips);
	});

	//ship button click handlers
	var shipButtons = document.getElementsByClassName('ship-button');
	for (var i = 0; i < shipButtons.length; i++){
		shipButtons[i].removeEventListener('click', getShipFromClick);
	}	
}

/*** Player Ship Placement Hover Effect *****/

function beginHoverEffect() {
	//need to add in here if the placement is legal
	forEachCell('player', function(cell){
		cell.addEventListener('mouseover', shipPlacementHover);
		cell.addEventListener('mouseout', removeShipHover);
	});
}

function shipPlacementHover() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	if (shipPlacementLegal(x, y)) {
		var cell = [];
		cell[0] = getCell('player', x, y);
		cell[0].className += ' placeship';
		if (current.shipDirection === 'horizontal') {
			for (var i = 1; i < current.shipSize; i++) {
				cell[i] = getAdjacentCell2('right', x, y);
				cell[i].className += ' placeship';
				x++;
			}	
		} else if (current.shipDirection === 'vertical') {
			for (var i = 1; i < current.shipSize; i++) {
				cell[i] = getAdjacentCell2('up', x, y);
				cell[i].className += ' placeship';
				y++;
			}
		}
	}	
}

function removeShipHover() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	if (shipPlacementLegal(x, y)) {
		var cell = [];
		cell[0] = getCell('player', x, y);
		cell[0].classList.remove('placeship');
		if (current.shipDirection === 'horizontal') {
			for (var i = 1; i < current.shipSize; i++) {
				cell[i] = getAdjacentCell2('right', x, y);
				cell[i].classList.remove('placeship');
				x++;
			}	
		} else if (current.shipDirection === 'vertical') {
			for (var i = 1; i < current.shipSize; i++) {
				cell[i] = getAdjacentCell2('up', x, y);
				cell[i].classList.remove('placeship');
				y++;
			}
		}
	}
}

function endHoverEffect() {
	forEachCell('player', function(cell){
		cell.removeEventListener('mouseover', shipPlacementHover);
		cell.removeEventListener('mouseout', removeShipHover);
	});
}

/******************* PLAYER TURN *****************************/

function playerTurn() {
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
	isGameWon();
	computerTurn();
}

function markComputerCell() {
	var numCellsHit = 1;
	var shipNumberClass = getShipNumberClass(current.compCell);
	var shipSunk = isShipSunk(numCellsHit, shipNumberClass);
	
	if(!isGameWon()){	//if the game still continues
		if (cellContainsClass(current.compCell, 'compship')){ //if the computer cell contains ship
			if (shipSunk) {						//if hitting this cell should sink that ship
				markShipSunk(shipNumberClass);	//mark the entire ship as sunk
			} else {							//else if the hit shouldn't sink that ship
				markCellHit(current.compCell); 					//mark the cell as a hit
			}
		} else { 								//if the computer cell doesn't contain a ship
			markCellMiss(current.compCell);						//mark cell as a miss
		}
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
function getShipNumberClass(cell) {
	var shipNumberClass = '';
	for (var i = 1; i <= _numberOfShips * 2; i++) {
		shipNumberClass = ('ship_number_' + i);
		if (cellContainsClass(cell, shipNumberClass)){
			return shipNumberClass;
		}
	}
}

/**************  COMPUTER TURN *********************************/

function computerTurn() {
	computerTurnClickHanders();
	computerFire();
	isGameWon();
}

function computerTurnClickHanders() {
	getCellClickHandler('player', 'add');
}

function computerFire() {
	current.playerCell = determineTypeOfFire();
	console.log('currentPlayerCell: (" + current.playerCell.dataset.x + ", " + current.playerCell.dataset.y + ")');
	markPlayerCell();
	playerTurn();
}

function otherDamagedShip() {
	console.log('checking for other damaged ship');
	var shipCells = document.getElementsByClassName('ship');
	for (var i = 0; i < shipCells.length; i++) {
		var cell = shipCells[i];
		if (cellContainsClass(cell, 'hit')) {
			if (!cellContainsClass(cell, 'sunk')) {
				initialHit.recordCoords(cell.dataset.x, cell.dataset.y);
				lastMove.cellSunk = false;
				return true;
			}
		}
	}
	return false;
}

function determineTypeOfFire() {
	//if the ship computer has been targeting is sunk
	if (cellContainsClass(current.playerCell, 'sunk')) {

		//if there are other ships that have been hit and not sunk
		//computer continues hitting specific cells
		console.log('otherDamagedShip: ' + otherDamagedShip());
		if (otherDamagedShip()) current.targetStatus = 'targetingSpecificCell';
		
		//otherwise, change the status back to random
		else current.targetStatus = 'targetingRandomCell';
	}

	console.log('current.targetStatus: ' + current.targetStatus);
	//then determine type of fire based on status
	if (current.targetStatus === 'targetingRandomCell') {
		return targetPlayerCell('random');
	
	//marked as this after an initial hit on a ship
	} else if (current.targetStatus === 'targetingSpecificCell') {
		return targetPlayerCell('specific');
	}
}

function getRandomPlayerCellCoords() {
	current.xCoord = getRandomInt(1, _gridSize);
	current.yCoord = getRandomInt(1, _gridSize);
}

function targetPlayerCell(type) {
	var alreadyMarked;
	var cell;

	if (type === 'random') {
		do {
			getRandomPlayerCellCoords();
			cell = getCell('player', current.xCoord, current.yCoord);
			alreadyMarked = !isCellEmpty(cell);
		} while (alreadyMarked);

	} else if (type === 'specific') {
		getSpecificPlayerCoords();
		cell = getCell('player', current.xCoord, current.yCoord);
	}

	lastMove.cellXCoord = current.xCoord;
	lastMove.cellYCoord = current.yCoord;
	lastMove.setCell(cell);

	return cell;
}

function markPlayerCell() {
	var numCellsHit = 1;
	var status;
	var shipNumberClass = getShipNumberClass(current.playerCell);
	var shipSunk = isShipSunk(numCellsHit, shipNumberClass);
	var cell = current.playerCell;

	if (!isGameWon()) { //if the game still continues
		if (cellContainsClass(cell, 'ship')){
			if (shipSunk) {
				status = markShipSunk(shipNumberClass);
			} else {
				 if(firstHitOnShip(shipNumberClass)) {
				 	initialHit.recordCoords(cell.dataset.x, cell.dataset.y);
				 	current.targetStatus = 'targetingSpecificCell';
				 }
				status = markCellHit(current.playerCell);
			}
		} else {
			status = markCellMiss(current.playerCell);
		}
		lastMove.updateStatus(status);
	}
}

function getSpecificPlayerCoords() {
	if (lastMove.cellSunk) {
			console.log('that one sunk the ship');
			current.targetStatus = 'targetingRandomCell';
			this.stage = 0;
			determineTypeOfFire();
	} else {
		if (nextMove.stage === 0){
			createPlanStage1();
		} 
		if (nextMove.stage === 1){
			getNextMoveFromPlan();
		}
		if (nextMove.stage === 2) {
			createPlanStage2();
		}
		
		//set coords to make next move
		var move = nextMove.getMove();
		current.xCoord = move.dataset.x;
		current.yCoord = move.dataset.y;
		
		nextMove.determineStage();

		//DEBUG
			console.log("nextMove: (" + current.xCoord + ", " + current.yCoord + ")");
		//END DEBUG
	}
}

/*************** FOR COMPUTER 'SMARTER' MOVES *********************/

function getNextMoveFromPlan() {
	//set the next move to the first move on the plan
	//and remove it from the plan
	nextMove.setMove(nextMove.stage1Plan.shift());
	}

function createPlanStage1() {
	var initX = initialHit.cellXCoord;
	var initY = initialHit.cellYCoord;

	//get all empty move options from the initial hit
	var moveOptions = determineMoveOptions(initX, initY);
	printMoveOptions(moveOptions);  //DEBUG

	//continue adding options from the first set of move options, until one contains a ship
	do {
		//get move
		var currentMove = getMoveForPlan(initX, initY, moveOptions);
		//add move to movePlan
		nextMove.stage1Plan.push(currentMove);
		//test to see if the move hits
		var doesMoveHit = cellContainsClass(currentMove, 'ship');
		console.log('Does the move we added to the plan hit?: ' + doesMoveHit);
	} while (!doesMoveHit); //do the above while move doesn't hit

	nextMove.stage = 1;
}

function determineMoveOptions(x, y) {
	var moveOptions = [];
	var directions = ['left', 'right', 'up', 'down'];

	//loop through all possible directions
	for (var i = 0; i < directions.length; i++){
		//if the adjacent cell exists, get and assign it
		if (hasAdjacentCell(directions[i], x, y)) {
			var adjacentCell = getAdjacentCell2(directions[i], x, y);
			//if the cell is empty, push is to the moveOptions array
			if (isCellEmpty(adjacentCell)) {
				moveOptions.push(adjacentCell);
			}
		}
	}
	return moveOptions;
}

function getMoveForPlan(initX, initY, moveOptions) {
	//choose a random cell from the moveOptions
	var moveIndex = getRandomInt(0, moveOptions.length - 1);
	var move = moveOptions[moveIndex];
	//remove that option 
	moveOptions.splice(moveIndex, 1);
	//determine the direction the first move was in, for future moves
	var currentDirection = determineMoveDirection(move, initX, initY);
	nextMove.direction = currentDirection;

	console.log('chosen random cell from move options: ' + move.dataset.x + ", " + move.dataset.y);

	return move;
}

function createPlanStage2() {
	var currentMove;
	var currentDirection = nextMove.direction;		
	var oppositeDirection = nextMove.getOppositeDirection();

	console.log("beginning stage2, checking parameters:");
	console.log('before - lastMove: (' + lastMove.cellXCoord + ', ' + lastMove.cellYCoord+ '), currentDirection: ' + currentDirection);
	
	//get a new move using the last move as reference
	currentMove = getMoveStage2(lastMove.getCell());
	//set it as the next move to be made
	nextMove.setMove(currentMove);
	//after making the move, it becomes the last move for the next time the function is called
	
	console.log('after - currentMove: (' + currentMove.dataset.x + ', ' + currentMove.dataset.y + '), currentDirection: ' + currentDirection);
}

function getMoveStage2() {	//seems complete in what it does for now
	var initX = initialHit.cellXCoord;
	var initY = initialHit.cellYCoord;
	var currentMove, moveToMake;
	var currentDirection = nextMove.direction;
	var oppositeDirection = nextMove.getOppositeDirection();

	if (nextMove.status === 'continueDirection') {
		if (hasAdjacentCell(currentDirection, lastMove.cellXCoord, lastMove.cellYCoord)) {
			console.log("true, has adjacent cell");
			//start with a move in the direction we have been going
			console.log(lastMove.getCell());
			currentMove = getNextMoveSameDirection(lastMove.getCell(), currentDirection);
			console.log("getNextMoveSameDirection: (" + lastMove.cellXCoord + ', ' + lastMove.cellYCoord + ')'); 
			if (isCellEmpty(currentMove)) { 		//if cell isn't marked hit, miss, or sunk
				moveToMake = currentMove; 		
				if (!cellContainsClass(currentMove, 'ship')) { //if move is a miss
					console.log("missed");
					nextMove.status = 'changeDirection';
				}
			} else {	//if the cell IS marked either hit, miss, or sunk
				//go ahead and try the other direction from the initial hit
				//checking first to see if it has an adjacentCell
				if (hasAdjacentCell(oppositeDirection, initX, initY)) {
					currentMove = getAdjacentCell2(oppositeDirection, initX, initY);
					if (isCellEmpty(currentMove)) {	//if cell isn't marked hit, miss, or sunk
						moveToMake = currentMove; 	
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
			currentMove = getAdjacentCell2(oppositeDirection, initX, initY);
			if (isCellEmpty(currentMove)) {	//if cell isn't marked hit, miss, or sunk
				moveToMake = currentMove;		//make the move
				nextMove.direction = oppositeDirection; //change directions
				nextMove.status = 'continueDirection';
			}
		}
	}
	return moveToMake;
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
	var cell = getCell('player', x, y);
	return cell;
}

function determineMoveDirection(moveCell, initX, initY) {
	var direction;
	var newX = moveCell.dataset.x;
	var newY = moveCell.dataset.y;

	if (newX - initX === -1) {
		direction = 'left';
	} else if (newX - initX === 1) {
		direction = 'right';
	} else if (newY - initY === 1) {
		direction = 'up';
	} else if (newY - initY === -1) {
		direction = 'down';
	}
	return direction;
}

function getNextMoveSameDirection(move, direction) {
	var x = move.dataset.x;
	var y = move.dataset.y;
	var newMove = getAdjacentCell2(direction, x, y);
	
	console.log('getNextMoveSameDirection: ' + x + ', ' + y);
	console.log("and the last move is: (" + move.dataset.x + ', ' + move.dataset.y +')');
	console.log("and the next move is: (" + newMove.dataset.x + ', ' + newMove.dataset.y +')');
	
	return newMove;
}

function firstHitOnShip(shipNumberClass) {
	var shipCells = document.getElementsByClassName(shipNumberClass);
	for (var i = 0; i < shipCells.length; i++) {
		if (shipCells[i].classList.contains('hit')) {
			return false;
		}
	}
	return true;
}
/************** GAME OVER **************/

 function isGameWon() {
 	var playerWin;
 	if (areAllShipsSunk('player')) {
 		playerWin = false;
 		gameOverCleanup(playerWin);
 		return true;
 	} else if (areAllShipsSunk('computer')) {
 		playerWin = true;
 		gameOverCleanup(playerWin);
 		return true;
 	} else return false;
 }

 function areAllShipsSunk(user) {
 	var numShipCellsSunk = 0;
 	if (user === 'computer') {
 		var shipClass = 'compship';
 	} else if (user === 'player') {
 		var shipClass = 'ship';
 	}
 	//loop through every cell of either the computer or player
	forEachCell(user, function(cell){
		//look at every cell containing a ship
		if (cellContainsClass(cell, shipClass)) {
			if (cellContainsClass(cell, 'sunk')) {
				numShipCellsSunk++;
			}
		}
 	});
 	//the total number of ship cells per board is 17
 	if (numShipCellsSunk === 17) {
 		return true;
 	} else return false;
 }

function gameOverCleanup(playerWin) {
	if (!current.gameOverAnnounced) {
		if (playerWin) {
			var winnerMessage = 'Congratulations! You win!';
		} else if (!playerWin) {
			var winnerMessage = 'All your ships have been sunk! You lose. Better luck next time!';
		}
		
		//TRYING to turn off click handlers to make game be over
		//but board still visible, not working atm
		//may have to rethink
		getCellClickHandler('computer', 'remove');
		getCellClickHandler('player', 'remove');

		//create a message for the winner
		var winnerDiv = document.createElement('div');
		winnerDiv.setAttribute('id', 'win-block');
		var gameOverHeading = document.createElement('h3');
		var gameOverText = document.createTextNode('GAME OVER');
		var winnerPara = document.createElement('p');
		var winnerText = document.createTextNode(winnerMessage);
		gameOverHeading.appendChild(gameOverText);
		winnerDiv.appendChild(gameOverHeading);
		winnerPara.appendChild(winnerText);
		winnerDiv.appendChild(winnerPara);
		document.body.appendChild(winnerDiv);
	}
	current.gameOverAnnounced = true;
}
/***************   GENERAL HELPER FUNCTIONS      ***********************/

function forEachCell(user, callback){
	for (var x = 1; x <= _gridSize; x++){
		for (var y = 1; y <= _gridSize; y++){
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
function cellHasPlayerShip(cellToMark) {
	var status = 'ship';
	cellToMark.className += ' ship';
	return status;
}

//Adds compship class to current cell
function cellHasComputerShip(cellToMark) {
	var status = 'compship';
	cellToMark.className += ' compship';
	return status;
}

//Adds hit class to current cell
function markCellHit(cellToMark) {
	var status = 'hit';
	cellToMark.className += ' hit';
	return status;
}

//Adds miss class to current cell
function markCellMiss(cellToMark) {
	var status = 'miss';
	cellToMark.className += ' miss';
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

//DEBUG
function printMoveOptions(moveOptions) {
	for (var i = 0; i < moveOptions.length; i++) {
		console.log("moveOptions[" + i + "]: " + moveOptions[i].dataset.x + ", " + moveOptions[i].dataset.y);
	}
}



