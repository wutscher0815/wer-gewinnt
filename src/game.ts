import { grid, Grid, rows, cols, GridItem } from "./grid";
import { setTimeout } from "timers";

const fallAnimationTime = 50;

export class WerGewinnt {
    grid: Grid = grid;
    cursor = 0;
    players = ['#F00', '#0F0'];
    currentPlayer = 0;
    moveCount = 0;
    playable: boolean;

    constructor() {
        this.init()
    }

    public init() {
        grid.reset();
        this.playable = true;
        this.currentPlayer = 0;
        this.cursor = 0;
        this.moveCount = 0;
        this.setCursor();
        grid.update();

    }

    private win() {
        let indices = Array.from({ length: rows * cols }).map((_, i) => ({ i, r: Math.random() })).sort((a, b) => a.r > b.r && 1 || a.r == b.r && 0 || -1).map(e => e.i);
        indices.forEach((i, j) => setTimeout(() => grid.set(Math.floor(i / rows), i % cols, this.players[this.currentPlayer]), 1500 / (rows * cols)))

        grid.update();
        setTimeout(() => { this.init() }, 3000)

    }

    private changePlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        this.setCursor();
    }


    private setCursor() {
        this.removeCursor();
        console.log('cursor:' + this.cursor)
        grid.set(0, this.cursor, this.players[this.currentPlayer]);
        this.playable = true;
    }

    private removeCursor() {
        grid.rows[0].forEach((_, i) => grid.set(0, i, null));
        this.playable = false;
    }

    public left() {
        if (!(this.playable)) {
            return;
        }
        this.cursor = --this.cursor >= 0 && this.cursor || 0;
        this.setCursor();
        grid.update();
    }

    public right() {
        if (!(this.playable)) {
            return;
        }
        this.cursor = ++this.cursor < cols && this.cursor || cols - 1;
        this.setCursor();
        grid.update();
    }

    private drop(): number {
        let col = grid.cols[this.cursor];
        console.log(col.map(c => c.color));
        let lastIndex = 0;

        if (col[1].color) {
            return 0;
        }

        for (let i = 1; i < rows; i++) {
            lastIndex = i;
            if (col[i].color) {
                return i;
            }
            setTimeout(() => {
                grid.move(i - 1, this.cursor, i, this.cursor)
                grid.update();
            }, fallAnimationTime * i);
        }
        return lastIndex;
    }

    private check(series: GridItem[][]): GridItem[] {


        for (let items of series) {
            let winnigItems: GridItem[] = []
            let lastColor = null;
            for (let i = 0; i < items.length; i++) {
                if (items[i].color) {
                    if (lastColor && items[i].color === lastColor) {
                        winnigItems.push(items[i]);
                        console.log('winning.length:' + winnigItems.length);
                        if (winnigItems.length == 4) {
                            console.log(winnigItems);
                            return winnigItems;
                        }
                    } else {
                        // console.log('new Array')
                        winnigItems = [items[i]]
                    }
                } else {
                    winnigItems = [];
                }
                lastColor = items[i].color;
            }
        }

        return null;
    }

    action() {
        if (!(this.playable)) {
            return;
        }
        this.moveCount++;

        this.playable = false;

        let lastIndex = this.drop();
        console.log(lastIndex);

        //after Animation is done change player or end game
        setTimeout(() => {

            let winning = this.check(grid.rows) || this.check(grid.cols) || this.check(grid.diagonalsDown) || this.check(grid.diagonalsDown);
            if (winning) {
                let time = grid.blink(winning);
                console.log('winning timeout:' + time)
                setTimeout(() => this.win(), time);
            }
            else {
                if (lastIndex) {
                    this.changePlayer();
                    this.playable = true;
                }
            };
            grid.update();
        }, (lastIndex + 1) * fallAnimationTime);

    }



}

export let game = new WerGewinnt();