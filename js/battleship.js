
var gridSize = 10;
var numberOfShips = 5;
var shipDirection = 'horizontal';
var currentShipName, currentShipSize, currentCell;

setupGame();
computerShipPlacement();
playerShipPlacement();


/***************** SETUP *******************************/

function setupGame() {
	createGrid();
	getCellClickHandler();
	addShipButtons();
	addRotateButton();
}

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

function getCellFromEvent() {
	var x = this.dataset.x;
	var y = this.dataset.y;
	currentCell = getPlayerCell(x, y);
}

function getCellClickHandler() {
	forEachCell(function(cell){
		cell.addEventListener("click", getCellFromEvent);
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

function playerShipPlacement() {
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
	if (shipPlacementLegal) {
		console.log("Ship has been placed!");
		playerPlaceShip();
		removeCellEventListeners();
		removeShipButton();
	}
}

function addCellEventListeners() {
	forEachCell(function(cell){
		cell.addEventListener("mouseover", mouseoverText);
		cell.addEventListener("click", statusPlayerPlaceShips);
	});
}
function removeCellEventListeners(){
	forEachCell(function(cell){
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
	console.log("mousing over!");
}

/***************** COMPUTER SHIP PLACEMENT***********************/
function computerShipPlacement() {
	//function calls here
	tempPlaceCompShips();
}

function tempPlaceCompShips() {
//TODO: need way for computer to place ships randomly & legally

	var cell1 = getComputerCell(1, 1);
	var cell2 = getComputerCell(3, 3);
	var cell3 = getComputerCell(5, 5);
	var cell4 = getComputerCell(5, 7);
	var cell5 = getComputerCell(2, 7);

	computerPlaceShip(cell1, 'patrol', 'N');
	computerPlaceShip(cell2, 'carrier', 'N');
	computerPlaceShip(cell3, 'submarine', 'N');
	computerPlaceShip(cell4, 'battleship', 'Y');
	computerPlaceShip(cell5, 'destroyer', 'N');
}

// to adjust as needed 
function computerPlaceShip(startCell, shipName, rotateYorN) {
	currentCell = startCell;
	cellHasComputerShip();
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

	if (rotateYorN === 'Y') {
		rotateShip();
	}
	
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell("computer");
	}
	console.log("COMP SHIP PLACED!");
}

//use getComputerCell(); - takes x & y, returns a cell 
//use class compship instead of ship - dont want it colored 



/***************    HELPER FUNCTIONS      ***********************/

function each(collection, callback){
	for (var i = 0; i < collection.length; i++) {
		callback(collection[i]);
	}
}

function forEachCell(callback){
	for (var x = 1; x <= gridSize; x++){
		for (var y = 1; y <= gridSize; y++){
			var cell = getPlayerCell(x,y);
			callback(cell);
		}
	}
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



