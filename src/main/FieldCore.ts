import { EMPTY_ROW, INIT_FIELD } from "./constant";
import { success, error, warning, task, debug, info } from "./messageUtil";

// hello, from IntelliJ IDEA
/**
 * field配列は[y][x]であることに注意
 * 事故防止のため原則メソッドからアクセスすること
 */
export class FieldCore {
    field: field;

    constructor() {
        this.field = INIT_FIELD.map((row) => [...row]) as field;
    }

    /**
     * debug
     */
    printField() {
        for (let i = 20; i < this.field.length; i++) {
            this.field[i].forEach((block) =>
                process.stdout.write(block ? "\x1b[34m1\x1b[0m" : "0")
            );
            process.stdout.write("\n");
        }
    }

    /**
     * 指定した座標の真偽値を返す
     * @returns {boolean} true:すでに存在する
     */
    isFilled(pos: position): boolean {
        // debug("checking at (%d,%d)", x, y)
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

    clone(): FieldCore {
        const newField = new FieldCore();
        newField.field = this.field.map((row) => [...row]) as field;
        return newField;
    }
}
