
var gridSize = 10;
var numShipsPlaced = 0;
var numberOfShips = 5;
var shipDirection = 'horizontal';
var currentShipName, currentShipSize, currentCell;
var xCoordLimit = gridSize;
var yCoordLimit = gridSize;
var xCoord, yCoord, areCellsEmpty;

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
	forEachPlayerCell(function(cell){
		cell.addEventListener("click", getPlayerCellFromEvent);
	});
}

function removeGetPlayerCellClickHandler() {
	forEachPlayerCell(function(cell){
		cell.removeEventListener("click", getPlayerCellFromEvent);
	});
}

function getComputerCellClickHandler() {
	forEachComputerCell(function(cell){
		cell.addEventListener("click", getComputerCellFromEvent);
	});
}

function removeGetComputerCellClickHandler() {
	forEachComputerCell(function(cell){
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
function addRotateButton() {
	var rotateDiv = document.getElementById('rotate-button-div');
	var rotateButton = document.createElement('button');
	rotateButton.setAttribute('id', 'rotate-button');
	rotateButton.innerText = "Rotate";
	rotateDiv.appendChild(rotateButton);
	rotateButton.addEventListener('click', rotateShip);
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

function rotateShip() {
	if (shipDirection === "vertical") {
		shipDirection = "horizontal";
	} else if (shipDirection === "horizontal") {
		shipDirection = "vertical";
	}
}

/******************* PLAYER PLACE SHIP *********************/

function PlayerShipPlacement() {
	getPlayerCellClickHandler();
	getShipClickHandler();
	shipClickHandler();
}

function markAdjacentCell(user){
	currentCell = getAdjacentCell(user);
	if (user === 'player') {
		cellHasPlayerShip();
	} else if (user ==='computer') {
		cellHasComputerShip();
	}
}

function playerPlaceShip() {
	cellHasPlayerShip();
	var shipSize = currentShipSize;
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell("player");
	}
}

function statusPlayerPlaceShips() {
	numShipsPlaced++;
	if (shipPlacementLegal) {
		playerPlaceShip();
		removeCellEventListeners();
		removeShipButton();
		testShipPlacementComplete(beginRounds);
	}
}

function addCellEventListeners() {
	forEachPlayerCell(function(cell){
		cell.addEventListener("mouseover", mouseoverText);
		cell.addEventListener("click", statusPlayerPlaceShips);
	});
}
function removeCellEventListeners(){
	forEachPlayerCell(function(cell){
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
function mouseoverText() {
	//Trade this later for hovering ship before placement
}

function allPlayerShipsPlaced() {
	if (numShipsPlaced === numberOfShips) {
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
		empty = areCellsEmpty(shipSize);
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

function areCellsEmpty(shipSize){
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
	forEachComputerCell(function(cell){
		cell.addEventListener('click', playerFire);
	});
}

//Marks a computer's cell depending on hit or miss
//Then, calls computerTurn();
function playerFire() {
	markComputerCell();
	computerTurn();
}

function markComputerCell() {
	//NEED TO MARK SHIP AS SUNK IF AS FINAL SQUARE IS HIT
	if (currentCell.classList.contains('compship')){
		cellHit();
	} else {
		cellMiss();
	}
}

/**************  COMPUTER TURN *********************************/

//TO=DO: IF COMPUTER HITS, NEEDS TO BE MORE LIKELY TO GUESS
//AN ADJACENT CELL

function computerTurn() {
	computerTurnClickHanders();
	computerFire();
}

function computerTurnClickHanders() {
	removeGetComputerCellClickHandler();
	getPlayerCellClickHandler();

}

function computerFire() {
	currentCell = getUnmarkedPlayerCell();
	markPlayerCell();
	playerTurn();
}

function getRandomPlayerCellCoords() {
	xCoord = getRandomInt(1, gridSize);
	yCoord = getRandomInt(1, gridSize);
}

function getUnmarkedPlayerCell() {
	var alreadyMarked;
	var cell;

	do {
		getRandomPlayerCellCoords();
		alreadyMarked = isCellMarked();
	} while (alreadyMarked);

	cell = getPlayerCell(xCoord, yCoord);
	return cell;
}

function isCellMarked() {
	var cellToCheck = getPlayerCell(xCoord, yCoord);
	if (cellToCheck.classList.contains('hit')) {
		return true;
	} else if (cellToCheck.classList.contains('miss')) {
		return true;
	} else if (cellToCheck.classList.contains('sank')) {
		return true;
	} else return false;
}

function markPlayerCell() {
	if (currentCell.classList.contains('ship')){
		cellHit();
	} else {
		cellMiss();
	}
}

/***************    HELPER FUNCTIONS      ***********************/

function each(collection, callback){
	for (var i = 0; i < collection.length; i++) {
		callback(collection[i]);
	}
}

//COMBINE THESE LATER : DRY

function forEachPlayerCell(callback){
	for (var x = 1; x <= gridSize; x++){
		for (var y = 1; y <= gridSize; y++){
			var cell = getPlayerCell(x,y);
			callback(cell);
		}
	}
}

function forEachComputerCell(callback){
	for (var x = 1; x <= gridSize; x++){
		for (var y = 1; y <= gridSize; y++){
			var cell = getComputerCell(x,y);
				callback(cell);
		}
	}
}

function getRandomInt(min, max) {
	return (Math.floor(Math.random() * (max - min + 1)) + min);
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




