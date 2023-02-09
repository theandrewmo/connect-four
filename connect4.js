/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

// const scores = document.getElementById('scores')
const p1score = document.getElementById('p1score')
const p2score = document.getElementById('p2score')
const versus = document.getElementById('versus')
const boardRows = document.getElementById('boardRows')
const boardCols = document.getElementById('boardCols')
const boardSize = document.getElementById('boardSize')
const sub = document.getElementById('formSubmit');
const board = document.getElementById('board')
const secret = document.getElementById('secret')


sub.addEventListener('click', submitter)
boardSize.addEventListener('click', changeSize)

// using global object to track total scores for session regardless of color of piece
const obj = {
    player1wins: 0,
    player2wins: 0,
    gameOn: false,
    rows: 6,
    cols: 7
}

class Player{
  constructor(color) {
    this.color = color
  }
}

class Game{
  constructor(width,height,...players) {
    this.width = width;
    this.height = height;
    this.players = [...players]
    this.currPlayer = this.players[0];
    this.board = [];
    this.makeBoard();
    this.makeHtmlBoard();
    this.gameOver = false;
    // sub.addEventListener('click', this.restartGame);
    // possible use to keep track of score for each instance
    // this.props = {
    //   player1wins: 0,
    //   player2wins: 0
    // }
    versus.innerHTML = `${this.players[0].color} versus ${this.players[1].color}`
  }

  // restartGame = (e) => {
  //   e.preventDefault();
    
  //   let spots = document.querySelectorAll('#board tr td')
  //   for (let item of spots) {
  //     if (item.firstChild) item.removeChild(item.firstChild);
  //   }
  //   this.board.forEach(el => {
  //     for (let i = 0; i<el.length; i++)
  //      el[i] = undefined;
  //   })
  //   this.gameOver = false;
  // }

  /** makeBoard: create in-JS board structure:*/

  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }))
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */

  makeHtmlBoard() {
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick);
  
    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }
  
    board.append(top);

      // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      board.append(row);
    }
  }
  /** findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }
  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    // piece.classList.add(this.currPlayer.color);
    piece.style.backgroundColor = this.currPlayer.color
    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  /** endGame: announce game end */
  endGame(msg) {
    this.gameOver = true;
    setTimeout(function(){alert(msg)},100)
  }

  /** handleClick: handle click of column top to play piece */
  
  handleClick = (evt) => {
    if(this.gameOver) return
    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);
    
    // check for win
    if (this.checkForWin()) {
      if(this.currPlayer == this.players[0]) {
        // this.props.player1wins += 1;
        obj.player1wins +=1;
      } 
      else {
        // this.props.player2wins +=1;
        obj.player2wins +=1;
      }
      p1score.innerHTML =  obj.player1wins;
      p2score.innerHTML =  obj.player2wins;
      if(obj.player1wins > 2 || obj.player2wins > 2){
        secret.classList.remove('secret')
      }
      return this.endGame(`${this.currPlayer.color} wins!`);
    }
    
    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }
      
    // switch players
    this.currPlayer = this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {
    const _win = (cells) => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer
      );
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
  
}

const isColor = (strColor) => {
  const s = new Option().style;
  s.color = strColor;
  return s.color == strColor.toLowerCase();
}

const p1 = document.getElementById('player1')
const p2 = document.getElementById('player2')
let player1 = null 
let player2 = null 

function submitter (e) {
  e.preventDefault();
  if(!obj.gameOn) {
    if (p1.value == '' || p2.value == '')  {
      alert('Please choose two different colors to start game')
      return
    }
    else if( !(isColor(p1.value)) || !(isColor(p2.value))  )  {
      alert('Invalid color detected. Please choose valid colors')
        if(!(isColor(p1.value))) {
          p1.value = ''
        }
        if(!(isColor(p2.value))) {
          p2.value = ''
        }
        return
    }
    else if(isColor(p1.value) && p1.value !== '' && isColor(p2.value) && p2.value !== '') {
      if(p1.value == p2.value) {
        alert('Colors can not be same')
        p1.value = ''
        p2.value = ''
        return
      }
      obj.gameOn = true;
      player1 = new Player(p1.value);
      player2 = new Player(p2.value);
      p1.value = ''
      p2.value = ''
      startNewGame()
      return
    }
  }
  else {
    if(p1.value == '' && p2.value == '') {
      startNewGame();
      return
    }
    else {
          if(p1.value !== '' && p1.value !== player1.color && p1.value !==player1.color && isColor(p1.value)) {
            player1.color = p1.value
            p1.value = ''
          }
          if(p2.value !== '' && p2.value !== player2.color && p2.value !==player1.color && isColor(p2.value)) {
            player2.color = p2.value
            p2.value = ''
          }
    }
    if(!(isColor(p1.value)) || !(isColor(p2.value))  )  {
      alert('Invalid color detected. Please choose valid colors')
        if(!(isColor(p1.value))) {
          p1.value = ''
        }
        if(!(isColor(p2.value))) {
          p2.value = ''
        }
        return
    }
    if(isColor(p1.value) && p1.value !== '' && isColor(p2.value) && p2.value !== '') {
      if(p1.value == p2.value) {
        alert('Colors can not be same')
        p1.value = ''
        p2.value = ''
        return
      }
     startNewGame();
    }
    startNewGame();
  }
  
  function startNewGame() {
      board.innerHTML = ''
      new Game(obj.rows,obj.cols,player1,player2)
  }
}

function changeSize(evt) {
    evt.preventDefault();
    if(boardRows.value >=4 && boardCols.value >=4 && player1 && player2) {
      board.innerHTML = ''
      obj.rows = boardRows.value;
      obj.cols = boardCols.value;
      new Game (obj.rows, obj.cols, player1, player2)
    }
    else {
      alert("Board rows and columns must be at least 4 units in length")
    }
  }


// new Game(6,7,p1,p2);

// const WIDTH = 7;
// const HEIGHT = 6;

// let currPlayer = 1; // active player: 1 or 2
// let board = []; // array of rows, each row is array of cells  (board[y][x])

// /** makeBoard: create in-JS board structure:
//  *   board = array of rows, each row is array of cells  (board[y][x])
//  */

// function makeBoard() {
//   for (let y = 0; y < HEIGHT; y++) {
//     board.push(Array.from({ length: WIDTH }));
//   }
// }

/** makeHtmlBoard: make HTML table and row of column tops. */

// function makeHtmlBoard() {
//   const board = document.getElementById('board');

//   // make column tops (clickable area for adding a piece to that column)
//   const top = document.createElement('tr');
//   top.setAttribute('id', 'column-top');
//   top.addEventListener('click', handleClick);

//   for (let x = 0; x < WIDTH; x++) {
//     const headCell = document.createElement('td');
//     headCell.setAttribute('id', x);
//     top.append(headCell);
//   }

//   board.append(top);

//   // make main part of board
//   for (let y = 0; y < HEIGHT; y++) {
//     const row = document.createElement('tr');

//     for (let x = 0; x < WIDTH; x++) {
//       const cell = document.createElement('td');
//       cell.setAttribute('id', `${y}-${x}`);
//       row.append(cell);
//     }

//     board.append(row);
//   }
// }

// /** findSpotForCol: given column x, return top empty y (null if filled) */

// function findSpotForCol(x) {
//   for (let y = HEIGHT - 1; y >= 0; y--) {
//     if (!board[y][x]) {
//       return y;
//     }
//   }
//   return null;
// }

// /** placeInTable: update DOM to place piece into HTML table of board */

// function placeInTable(y, x) {
//   const piece = document.createElement('div');
//   piece.classList.add('piece');
//   piece.classList.add(`p${currPlayer}`);
//   piece.style.top = -50 * (y + 2);

//   const spot = document.getElementById(`${y}-${x}`);
//   spot.append(piece);
// }

// /** endGame: announce game end */

// function endGame(msg) {
//   alert(msg);
// }

// /** handleClick: handle click of column top to play piece */

// function handleClick(evt) {
//   // get x from ID of clicked cell
//   const x = +evt.target.id;

//   // get next spot in column (if none, ignore click)
//   const y = findSpotForCol(x);
//   if (y === null) {
//     return;
//   }

//   // place piece in board and add to HTML table
//   board[y][x] = currPlayer;
//   placeInTable(y, x);
  
//   // check for win
//   if (checkForWin()) {
//     return endGame(`Player ${currPlayer} won!`);
//   }
  
//   // check for tie
//   if (board.every(row => row.every(cell => cell))) {
//     return endGame('Tie!');
//   }
    
//   // switch players
//   currPlayer = currPlayer === 1 ? 2 : 1;
// }

/** checkForWin: check board cell-by-cell for "does a win start here?" */

// function checkForWin() {
//   function _win(cells) {
//     // Check four cells to see if they're all color of current player
//     //  - cells: list of four (y, x) cells
//     //  - returns true if all are legal coordinates & all match currPlayer

//     return cells.every(
//       ([y, x]) =>
//         y >= 0 &&
//         y < HEIGHT &&
//         x >= 0 &&
//         x < WIDTH &&
//         board[y][x] === currPlayer
//     );
//   }

//   for (let y = 0; y < HEIGHT; y++) {
//     for (let x = 0; x < WIDTH; x++) {
//       // get "check list" of 4 cells (starting here) for each of the different
//       // ways to win
//       const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
//       const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
//       const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
//       const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

//       // find winner (only checking each win-possibility as needed)
//       if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
//         return true;
//       }
//     }
//   }
// }

// makeBoard();
// makeHtmlBoard();