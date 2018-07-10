import { runInDebugContext } from "vm";
import { setTimeout } from "timers";

export const [rows, cols] = [7, 7]

export class Grid {
    private data: string[][] = Array.from({ length: rows }).map(() => Array.from({ length: cols }).map(e => null));
    private updateFunction: Function = () => '';
    constructor() {

    }

    set(i: number, j: number, color: string): string {
        if (color && color.match(/#[0-9|A-F][0-9|A-F][0-9|A-F]([0-9|A-F][0-9|A-F][0-9|A-F])?/i) && (color.length === 7 || color.length === 4)) {
            this.data[i][j] = color;
            return color;
        } else {
            if (color) {
                throw new Error('invalid color hex string');
            }
            const old = this.data[i][j]
            this.data[i][j] = null;
            return old;
        }
    }

    get rows(): GridItem[][] {
        return this.data.map((row, i) => row.map((color, j) => ({ color, i, j })));
    }
    get cols(): GridItem[][] {
        let colsArray: GridItem[][] = [];
        for (let i = 0; i < cols; i++) {
            colsArray.push([]);
        }

        this.data.forEach((row, j) => row.forEach((color, i) => colsArray[i][j] = { color, i: j, j: i }));

        return colsArray;
    }
    get diagonalsUp(): GridItem[][] {
        let [firstX, firstY] = [rows - 1, cols - 1];
        let diagonals: GridItem[][] = [];

        while (firstY || firstX) {
            let [x, y] = [firstX, firstY];
            let diagonal = []
            while (x >= 0 && y < rows) {
                console.log(x + ' ' + y);
                diagonal.push({ color: this.data[x][y], i: x, j: y });
                x--;
                y++;
            }
            diagonals.push(diagonal);


            if (firstY > 0) {
                firstY--;
            } else {
                firstX--;
                console.log(firstX)
            }
        }
        return diagonals;
    }

    get diagonalsDown(): GridItem[][] {
        let [firstX, firstY] = [0, rows - 1];
        let diagonals: GridItem[][] = [];

        while (firstY > 0 || firstX < cols) {
            let [x, y] = [firstX, firstY];
            let diagonal = [];
            while (x < cols && y < rows) {
                diagonal.push({ color: this.data[x][y], i: x, j: y });
                x++
                y++;
            }

            diagonals.push(diagonal);
            if (firstY > 0) {
                firstY = firstY - 1;
            } else {
                firstX = firstX + 1;
            }
        }

        return diagonals;
    }

    public blink(items: GridItem[], times: number = 3, duration: number = 200): number {
        let count = times;

        while (count--) {
            setTimeout(() => items.map(item => {
                let color = this.set(item.i, item.j, null);
                this.update();
                setTimeout(() => {
                    this.set(item.i, item.j, color);
                    this.update();
                }, duration);
            }), 2 * count * duration);

            /*
                        let promises = items.map(item => new Promise((resolve) => {
                            setTimeout(() => items.map(item => {
                                let color = this.set(item.i, item.j, null);
                                resolve(color);
                            }), 2 * count * duration);
                        }));
            
                        Promise.all(promises).then((colors: string[]) => {
                            console.log(colors);
                            this.update();
                            return Promise.all(items.map((item, index) => new Promise(resolve => {
                                setTimeout(() => {
                                    this.set(item.i, item.j, colors[index])
                                }, duration);
                            })));
                        }).then(() => this.update());*/


        }
        return 2 * times * duration;
    }

    get(i: number, j: number): string {
        return this.data[i][j];
    }

    move(i: number, j: number, k: number, l: number) {
        const color = this.data[i][j];
        this.set(i, j, null);
        this.set(k, l, color);
    }

    reset() {
        this.data = Array.from({ length: rows }).map(() => Array.from({ length: cols }).map(e => null));
    }

    registerUpdate(callback: Function) {
        this.updateFunction = callback;
    }

    update() {
        this.updateFunction();
    }

    toJSON() {
        return JSON.stringify(this.data);
    }
}

export class GridItem {
    color: string;
    i: number;
    j: number;
}

export let grid = new Grid();
