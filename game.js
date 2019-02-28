/*jshint esversion: 6 */


function Box(x,y,color,size) {
  this.x = x;
  this.y = y;
  this.color = color;
  this.size =  size;
  this.prevStatus = 'off';
  this.curStatus = 'off';

  this.draw = function() {
    ctx.beginPath();
    ctx.rect(this.x,this.y,this.size,this.size);
    ctx.fillStyle = this.color;
    ctx.fill();
    // ctx.stroke();
  };
} // end box


function Game(updateDur) {
  this.timeGap = 0;
  this.lastUpdate = 0;
  this.updateDuration = updateDur; // milliseconds duration between update()
  this.paused = false;
  this.bg = new Image();
  this.lastKey = 0;
  this.pausedTxt = undefined;
  this.grid = undefined;
  this.boxSize = 10;
  this.gridWidth = 81;
  this.gridHeight = 60;
  this.curBoxC = 0;
  this.curBoxR = 0;
  this.mode = 'init';
  this.boxColorOn = 'RGB(127, 255, 212)';
  this.boxColorOff = 'RGBA(126, 126, 126, 1)';

  this.init = function() {
    this.bg.src = 'bg1.png';
    this.grid = [];
    for (let r = 0; r < this.gridHeight; r++) {
      let tmpRow = [];
      for (let c = 0; c < this.gridWidth; c++) {
        tmpRow.push( new Box((c*10)+(c+1),(r*10)+(r+1),this.boxColorOff,this.boxSize)); // +1 is for 1 pixel gap between boxes
      }
      this.grid.push(tmpRow);
    }
    this.lastUpdate = performance.now();
  };

  this.getOnList = function() {
    let list = [];
    for (let c = 0; c < this.gridWidth-1; c++) {
      for (let r = 0; r < this.gridHeight-1; r++) {
        if (this.grid[r][c].curStatus === 'on') {
          list.push( {"row":r, "col":c});
        }
      }
    }
    // console.log("{'row':"+r+", 'col':"+c+"}");
    for (let i = 0; i < list.length; i++) {
        console.log(list[i]);
    }
    return list;
  };

  this.paintBox = function() {
    let c = Math.floor( (State.mouseX-2) / (this.boxSize+1) ); // small offsets are for... 1.canvas border  2.the divider lines between boxes
    let r = Math.floor( (State.mouseY-2) / (this.boxSize+1) );
    // console.log('box clicked: Col='+c+"  Row="+r);
    this.grid[r][c].color = this.boxColorOn;
    this.grid[r][c].curStatus = 'on';
    this.grid[r][c].prevStatus = 'on';
  };
  this.eraseBox = function() {
    let c = Math.floor( (State.mouseX-2) / (this.boxSize+1) ); // small offsets are for... 1.canvas border  2.the divider lines between boxes
    let r = Math.floor( (State.mouseY-2) / (this.boxSize+1) );
    this.grid[r][c].color = this.boxColorOff;
    this.grid[r][c].curStatus = 'off';
    this.grid[r][c].prevStatus = 'off';
  };

  this.countAdjacentCellStatus = function(row,col) {
    let r = row;
    let c = col;
    let count = 0; // set to random for visual static getRandomIntInclusive(0,3)
    if ((r !== 0) && (c !== 0)) {  // up left
      if (this.grid[r-1][c-1].prevStatus === 'on') { count += 1; }
    }
    if (r !== 0) {  // up
      if (this.grid[r-1][c].prevStatus === 'on') { count += 1; }
    }
    if ((r !== 0) && (c < this.gridWidth-1)) {  // up right
      if (this.grid[r-1][c+1].prevStatus === 'on') { count += 1; }
    }
    if (c !== 0) { // left
      if (this.grid[r][c-1].prevStatus === 'on') { count += 1; }
    }
    if (c < this.gridWidth-1) { // right
      if (this.grid[r][c+1].prevStatus === 'on') { count += 1; }
    }
    if ((r < this.gridHeight-1) && (c < this.gridWidth-1)) { // down right
      if (this.grid[r+1][c+1].prevStatus === 'on') { count += 1; }
    }
    if (r < this.gridHeight-1) {  // down
      if (this.grid[r+1][c].prevStatus === 'on') { count += 1; }
    }
    if ((r < this.gridHeight-1) && (c !== 0)) { // down left
      if (this.grid[r+1][c-1].prevStatus === 'on') { count += 1; }
    }
    return count;
  };


  this.cellFate = function() {
    // Any cell with an ODD number of cells adjacent turns ON
    // Any cell with an EVEN number of cells adjacent turns OFF
    for (let c = 0; c < this.gridWidth-1; c++) {
      for (let r = 0; r < this.gridHeight-1; r++) {
        this.grid[r][c].prevStatus = this.grid[r][c].curStatus;
      }
    }
    for (let c = 0; c < this.gridWidth-1; c++) {
      for (let r = 0; r < this.gridHeight-1; r++) {
        let count = this.countAdjacentCellStatus(r,c);
        if ((count % 2) === 0) {
          if (this.grid[r][c].curStatus === 'on') {
            this.grid[r][c].curStatus = 'off';
          } else  {
            // off and nothing around so skip it
          }
        } else if ((count % 2) > 0) {
          this.grid[r][c].curStatus = 'on';
        } else {
          console.log('wut!');
        }


        // if (this.grid[r][c].prevStatus === 'on') { // die
        //   if (count < 2) {
        //     this.grid[r][c].curStatus = 'off';
        //   } else if ((count === 2) || (count === 3)) { // live
        //     this.grid[r][c].curStatus = 'on';
        //   } else if (count > 3) { // die
        //     this.grid[r][c].curStatus = 'off';
        //   } else {
        //     // nothin
        //   }
        // } else if ( (count === 3) && (this.grid[r][c].curStatus === 'off') ) { // live
        //   this.grid[r][c].curStatus = 'on';
        // } else  {
        //   // nothin
        // }

      } // for
    } // for
  };

  this.colorNextGen = function() {
    // console.log('colorNextGen run');
    for (let c = 0; c < this.gridWidth-1; c++) {
      for (let r = 0; r < this.gridHeight-1; r++) {
        if (this.grid[r][c].curStatus === "on") {
          this.grid[r][c].color = this.boxColorOn;
        } else if (this.grid[r][c].curStatus === "off") {
          this.grid[r][c].color = this.boxColorOff;
        } else {
          console.log('colorNextGen prob');
        }
      }
    }
  };

  this.nextGen = function() {
    this.cellFate(); // calculate life and death of each cell
    this.colorNextGen(); // update the colors of each cell
  }; // end sim

  this.pauseIt = function() {
    myGame.paused = true;
  };
  this.unpauseIt = function() {
    myGame.paused = false;
    // this prevents pac from updating many times after UNpausing
    this.lastUpdate = performance.now();
    this.timeGap = 0;
  };

  this.clearGrid = function() {
    console.log('clearGrid');
    for (let c = 0; c < this.gridWidth-1; c++) {
      for (let r = 0; r < this.gridHeight-1; r++) {
        this.grid[r][c].color = this.boxColorOff;
        this.grid[r][c].curStatus = 'off';
        this.grid[r][c].prevStatus = 'off';
      }
    }
  };

  this.drawBG = function() { // display background over canvas
    ctx.imageSmoothingEnabled = false;  // turns off AntiAliasing
    ctx.drawImage(this.bg,4,4,CANVAS.width-10,CANVAS.height-10);
  };

  this.draw = function() {
    for (let c = 0; c < this.gridWidth-1; c++) {
      for (let r = 0; r < this.gridHeight-1; r++) {
        this.grid[r][c].draw();
      }
    }
  }; // end draw

  this.update = function() {
      if (this.paused === false) { // performance based update: myGame.update() runs every myGame.updateDuration milliseconds
            this.timeGap = performance.now() - this.lastUpdate;

            if ( this.timeGap >= this.updateDuration ) { // this update is restricted to updateDuration
              let timesToUpdate = this.timeGap / this.updateDuration;
              for (let i=1; i < timesToUpdate; i++) { // update children objects
                if (this.mode === 'sim') {
                  this.nextGen();
                }
              }
              this.lastUpdate = performance.now();
            } // end if

            if (this.mode === "draw") { // run this every update cycle regardless of timing
              if (State.mouseLeftDown) {
                this.paintBox();
              } else if (State.mouseRightDown) {
                this.eraseBox();
              }
            } else {
              // mode is none
            }

      } else if (this.paused === true) {
        // PAUSED! do nothin
      } else {
        console.log('game pause issue');
      }

  }; // end update

} // end myGame
