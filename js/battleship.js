
var gridSize = 10;
var numberOfShips = 5;
var shipDirection = 'horizontal';
var currentShipName, currentShipSize, currentCell;

setupGame();
playerShipPlacement();
computerShipPlacement();

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
};

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

function getAdjacentCell() {
	var cell = currentCell;
	var x = parseInt(cell.dataset.x);
	var y = parseInt(cell.dataset.y);
	
	if (shipDirection === "vertical") {
		y += 1;
	} else if (shipDirection === "horizontal") {
		x += 1;
	}

	var adjacentCell = getPlayerCell(x, y);
	return adjacentCell;
}

/********************     SHIP PLACEMENT    *************************/

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
		console.log(shipButtons[i]);
		shipButtons[i].addEventListener("click", function() {
			addCellEventListeners();
		});
	}
}

function playerShipPlacement() {
	getShipClickHandler();
	shipClickHandler();
}

function rotateShip() {
	if (shipDirection === "vertical") {
		shipDirection = "horizontal";
	} else if (shipDirection === "horizontal") {
		shipDirection = "vertical";
	}
}

function markAdjacentCell(){
	currentCell = getAdjacentCell();
	cellHasShip();
}

function playerPlaceShip() {
	cellHasShip();
	var shipSize = currentShipSize;
	for (var i = 1; i < shipSize; i++) {
		markAdjacentCell();
	}
}

function addCellEventListeners() {
	forEachCell(function(cell){
		cell.addEventListener("mouseover", mouseoverText);
		cell.addEventListener("click", statusPlaceShips);
	});
}
function removeCellEventListeners(){
	forEachCell(function(cell){
		cell.removeEventListener("mouseover", mouseoverText);
		cell.removeEventListener("click", statusPlaceShips);
	});
}

function statusPlaceShips() {
	if (shipPlacementLegal) {
		console.log("Ship has been placed!");
		playerPlaceShip();
		removeCellEventListeners();
		removeShipButton();
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

//TEMPORARY
function mouseoverText() {
	//Trade this later for hovering ship before placement
	console.log("mousing over!");
}

/***************** COMPUTER SHIP PLACEMENT***********************/
function computerShipPlacement() {
	//ADD THE FUNCTION CALLS HERE
}
//use class computer-ship instead of ship - dont want it colored 



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
function cellHasShip() {
	var cellToMark = currentCell;
	cellToMark.className += " ship";
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



