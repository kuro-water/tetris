import { EMPTY_ROW, FULL_ROW, INIT_FIELD } from "./constant";
import { info } from "./messageUtil";

/**
 * field配列は[y][x]であることに注意
 * 事故防止のため原則メソッドからアクセスすること
 */
export class FieldCore {
    public field: Field;

    constructor() {
        this.field = INIT_FIELD.map((row) => [...row]) as Field;
    }

    public clone(): FieldCore {
        const newField = new FieldCore();
        newField.field = this.field.map((row) => [...row]) as Field;
        return newField;
    }

    /**
     * debug
     */
    public printField() {
        for (let i = 20; i < this.field.length; i++) {
            this.field[i].forEach((block) =>
                process.stdout.write(block ? "\x1b[34m1\x1b[0m" : "0")
            );
            process.stdout.write("\n");
        }
    }

    public setBlock(pos: Position) {
        this.field[pos.y][pos.x] = 1;
    }

    public removeBlock(pos: Position) {
        this.field[pos.y][pos.x] = 0;
    }

    /**
     * 指定した座標の真偽値を返す
     * @returns {boolean} true:すでに存在する
     */
    public isFilled(pos: Position): boolean {
        // debug("checking at (%d,%d)", x, y)
        if (pos.x < 0 || 11 < pos.x || pos.y < 0 || this.field.length < pos.y) return true;
        return !!this.field[pos.y][pos.x]; //number to boolean
    }

    public isPerfectClear(): boolean {
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
    public clearLines(): number {
        let clearedLineCount = 0;
        for (let y = this.field.length - 2; 0 < y; y--) {
            // 一列埋まっているかチェック
            if (this.field[y].findIndex((block) => block === 0) !== -1) {
                continue;
            }
            info("clear:" + y);
            // 一行下に詰める
            for (let i = y; 0 < i; i--) {
                this.field[i] = [...this.field[i - 1]];
            }
            // 一番上を空にする
            this.field[0] = [...EMPTY_ROW];
            // 一行詰めたのでyを戻す
            y++;

            clearedLineCount++;
        }
        return clearedLineCount;
    }

    public addCheese(num: number) {
        for (let i = 0; i < num; i++) {
            // フィールドの一番上を消去
            this.field.shift();
            // 床を消し、チーズを追加してから床を戻す
            this.field.pop();
            this.field.push(this.getCheeseRow());
            this.field.push([...FULL_ROW]);
        }
    }

    private getCheeseRow(): Row {
        const row: Row = [...FULL_ROW];
        row[Math.floor(Math.random() * 10) + 1] = 0;
        return row;
    }
}
