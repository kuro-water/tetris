import { EMPTY_ROW, INIT_FIELD } from "./constant";

/**
 * field配列は[y][x]であることに注意
 * 事故防止のため原則メソッドからアクセスすること
 */
export class Field {
    field: number[][];

    constructor() {
        this.field = [];
        for (let i = 0; i < INIT_FIELD.length; i++) {
            this.field[i] = [...INIT_FIELD[i]];
        }
    }

    /**
     * debug
     */
    printField() {
        this.field.forEach((row) => {
            row.forEach((block) => process.stdout.write(block ? "\x1b[34m1\x1b[0m" : "0"));
            process.stdout.write("\n");
        });
    }

    /**
     * 指定した座標の真偽値を返す
     * @returns {boolean} true:すでに存在する
     */
    isFilled(pos: position): boolean {
        // console.log("checking at (%d,%d)", x, y)
        if (pos.x < 0 || 11 < pos.x || pos.y < 0 || this.field.length < pos.y) return true;
        return !!this.field[pos.y][pos.x]; //number to boolean
    }

    setBlock(pos: position) {
        this.field[pos.y][pos.x] = 1;
    }

    removeBlock(pos: position) {
        this.field[pos.y][pos.x] = 0;
    }

    isPerfectClear(): boolean {
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                if (this.field[i][j] !== INIT_FIELD[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 一列埋まっているラインがあれば消去し、下詰めする
     * @returns 消去したライン数
     */
    clearLines(): number {
        let clearedLineCount = 0;
        // 一番下の行は消さない
        for (let y = 0; y < this.field.length - 1; y++) {
            // 一列埋まっているかチェック
            if (this.field[y].findIndex((block) => block === 0) !== -1) {
                continue;
            }
            console.log("clear:" + y);
            // 一列消去
            this.field.splice(y, 1);
            this.field.unshift([...EMPTY_ROW]);
            clearedLineCount++;
        }
        return clearedLineCount;
    }
}

module.exports = Field;
