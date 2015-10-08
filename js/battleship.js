setupGame();


function setupGame() {
	createGrid();
//	playerTurn();
}


//NEED TO CHANGE HOVER DEPENDING ON WHAT ACTION
//MEANING TRYING TO PLACE SHIP, TRYING TO HIT

function createGrid() {
	var gridSize = 10;
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

//remember to change function to get either human or enemy
//currently works just for the top grid
//also possibly add mouse event?
function getCell(x , y) {
	var cells = document.getElementsByClassName('grid-cell');
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].dataset.x == x && cells[i].dataset.y == y) {
			return cells[i];
		}
	}
};

function getAdjacentCell(cell, direction) {
	var x = parseInt(cell.dataset.x);
	var y = parseInt(cell.dataset.y);
	var direction = direction;
	
	if (direction = "up") {
		y += 1;
	} else if (direction = "down") {
		y -= 1;
	} else if (direction = "right") {
		x += 1;
	} else if (direction = "left") {
		x -= 1;
	}

	return getCell(x, y);
}

function cellHasShip(cell) {
	cell.className += " ship";
}

function resetBoard() {}


function cellHit(cell) {
	cell.className += " hit";

}

function cellMiss(cell) {

	cell.className += " miss";

}

//ROTATION ISN"T WORKING 
function playerPlaceShip(cell, shipSize, flipped) {
	var shipSize = shipSize, cell = cell, flipped = flipped;
	cellHasShip(cell);
	for (var i = 1; i < shipSize; i++) {
			cell = getAdjacentCell(cell, "right");
			cellHasShip(cell);
	}
}


//----------TEMPORARY-------------------------------

//Need to write a function for looping through every cell
//and doing something to it.


function playerPlaceShips() {

	var shipCell1 = getCell(5,4);
	playerPlaceShip(shipCell1, 2, "h");
	var shipCell2 = getCell (1, 2);
	playerPlaceShip(shipCell2, 3, 'h');




}
playerPlaceShips();

