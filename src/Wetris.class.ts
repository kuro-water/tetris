import {
    CONFIG_PATH,
    I_MINO,
    T_MINO,
    O_MINO,
    L_MINO,
    J_MINO,
    S_MINO,
    Z_MINO,
    EMPTY_ROW,
    FULL_ROW,
    INIT_FIELD,
    DRAW_FIELD_TOP,
    DRAW_FIELD_HEIGHT,
    DRAW_FIELD_WITDH,
    DRAW_FIELD_LEFT,
    MINO_POS,
    MINO_COLORS,
    GHOST_COLORS,
    SRS_TLJSZ,
    SRS_I,
    DAS,
    ARR,
    LOCK_DOWN_DELAY,
    SET_DELAY,
    DEL_DELAY,
    INIT_KEY_MAP,
    BLOCK_SIZE,
    HOLD_CANVAS_SIZE,
    FIELD_CANVAS_SIZE,
    NEXT_CANVAS_SIZE,
    FRAME_COLOR,
    PLACED_MINO_COLOR,
    BACKGROUND_COLOR,
    KSKS_LIMIT,
} from "./constant";

const Field = require("./Field.class");
type Field = typeof Field;

const Mino = require("./Mino.class");
type Mino = typeof Mino;

export class Wetris {
    sender: electronSender;

    currentMino: Mino;
    nextMinos: Number[] = [];
    afterNextMinos: Number[] = [];
    holdMino: Number;

    field: Field;

    isLocking = false;
    latestTime: number;

    readJson: Function;
    // Record<key, value>
    keyMap: Record<string, string> = {};
    idInterval: Record<string, NodeJS.Timeout> = {};
    isKeyDown: Record<string, boolean> = {};
    isUsedHold = false;
    countKSKS = 0;

    score = 0;
    ren = 0;
    modeTspin = false;
    isBtB = false;

    isMainloopActive: boolean;

    lines = 0; // debug

    constructor(sender: electronSender) {
        this.sender = sender;
        console.log("wetris constructor started.");

        this.clearFieldContext();
        this.clearHoldContext();
        this.clearNextContext();

        this.field = new Field();
        this.latestTime = Date.now();

        this.nextMinos = this.getTurn();
        this.afterNextMinos = this.getTurn();

        this.makeNewMino();
        this.mainloop();
        this.isMainloopActive = true;

        console.log("wetris constructor ended.");
    }

    /**
     *  よくわからんけどスリープできるようになる。Promiseてなんやねん
     * @param waitTime  ms
     * @return Promise
     */
    sleep(waitTime: number) {
        return new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    clearFieldContext() {
        this.sender.send("clearFieldContext");
    }

    clearHoldContext() {
        this.sender.send("clearHoldContext");
    }

    clearNextContext() {
        this.sender.send("clearNextContext");
    }

    getConfig = async () => {
        const config = await window.electronAPI.readJson(CONFIG_PATH);
        // if (config.keyMode == "default") {
        //     this.keyMap = INIT_KEY_MAP;
        // } else if (config.keyMode == "custom") {
        //     this.keyMap = config.keyMap;
        // } else {
        //     console.log("error : unknown keymap");
        //     this.keyMap = INIT_KEY_MAP;
        // }
        // console.log(config);
        // console.log(config.keyMap);
        // console.log(this.keyMap);
        this.keyMap = config.keyMap;
        console.log("read:config");
    };

    mainloop = async () => {
        while (" ω ") {
            await this.sleep(1000);
            if (!this.isMainloopActive) continue;
            // console.log("mainloop");
            // this.sender.send("test", "mainloop");
            if (!this.currentMino) {
                // 接地硬直中はcurrentMinoが存在せずTypeErrorとなる
                continue;
            }
            if (this.currentMino.moveMino(0, 1)) {
                this.isLocking = false;
                this.countKSKS = 0;
            } else {
                this.lockDown();
            }
        }
    };

    drawField() {
        this.sender.send("drawField", this.field.field);
        this.currentMino.drawGhostMino();
        this.currentMino.drawMino();
    }

    makeNewMino() {
        if (!this.nextMinos.length) {
            // ネクストが空なら生成
            this.nextMinos = this.afterNextMinos;
            this.afterNextMinos = this.getTurn();
        }

        this.currentMino = new Mino(this.field, this.nextMinos.pop() as number, this.sender);

        if (this.currentMino.blockPos.length !== 4) {
            // gameover
            this.currentMino = null;
            this.isMainloopActive = false;
            return;
        }
        // console.log(this.nextMinos);
        // console.log(this.afterNextMinos);
        this.drawField();
        this.drawNext();
    }

    getTurn(): number[] {
        const getRandomInt = (min: number, max: number): number => {
            //整数の乱数を生成 https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        };

        //七種一巡を生成
        let idxArr = [...Array(7).keys()]; // 0~6を配列に展開
        let turn: number[] = [];
        for (let i = 0; i < 7; i++) {
            let random = getRandomInt(0, 7 - i);
            turn.push(idxArr[random]);
            idxArr.splice(random, 1);
        }
        // console.log(turn);
        return turn;
    }

    drawNext() {
        // console.log("---------- draw next ----------")
        this.clearNextContext();
        // ネクスト配列のコピーを作り、popで取り出す
        let nextMinos = [...this.nextMinos];
        let afterNextMinos = [...this.afterNextMinos];
        const NUM_OF_NEXT = 5;
        for (let i = 0; i < NUM_OF_NEXT; i++) {
            if (!nextMinos.length) {
                nextMinos = afterNextMinos;
                // console.log("入れ替えた");
            }
            // console.log(nextMinos);
            // console.log(afterNextMinos);
            // console.log("");
            let idxMino = nextMinos.pop() as number;

            for (let j = 0; j < MINO_POS[idxMino][0].length; j++) {
                const block: position = {
                    x: MINO_POS[idxMino][0][j][0],
                    y: MINO_POS[idxMino][0][j][1],
                };
                this.sender.send(
                    "drawNextBlock",
                    { x: 1 + block.x, y: 1 + i * 4 + block.y },
                    MINO_COLORS[idxMino]
                );
            }
        }
        // console.log("---------- end draw next ----------")
    }

    /**
     * カサカサの処理
     * @return true:接地した false:接地していない
     */
    checkKSKS(): boolean {
        // 空中にいるなら何もしない
        if (this.currentMino.y !== this.currentMino.getGhostY()) {
            return false;
        }

        // まだカサカサできる
        if (this.countKSKS < KSKS_LIMIT) {
            // console.log("plus");
            this.countKSKS += 1;
            return false;
        }

        this.set();
        this.countKSKS = 0;
        return true;
    }

    /**
     * 接地硬直の処理
     */
    lockDown() {
        if (!this.isLocking) {
            this.latestTime = Date.now();
            this.isLocking = true;
            return;
        }
        let delay = Date.now() - this.latestTime;
        // console.log(delay);
        if (LOCK_DOWN_DELAY < delay) {
            this.set();
            this.isLocking = false;
        }
    }

    set = async () => {
        let modeTspin, lines;

        // debug
        // if (this.currentMino.idxMino === T_MINO) console.log(this.currentMino.lastSRS);

        // 接地硬直中操作不能にする
        let settingMino = this.currentMino;
        this.currentMino = null;
        // console.log("lock");

        settingMino.setMino();
        modeTspin = settingMino.getModeTspin();
        // console.log("modeTspin:" + modeTspin);
        lines = this.field.clearLines();
        console.log("l:", this.lines);
        this.lines += lines;
        if (lines) {
            this.ren += 1;
            // 今回がTspinかどうか、前回がTspinかどうかの4パターン存在する。いい感じにした
            if (this.isBtB) {
                this.isBtB === !!modeTspin || lines === 4;
                this.addScore(lines, this.ren, modeTspin, this.isBtB);
            } else {
                this.addScore(lines, this.ren, modeTspin, this.isBtB);
                this.isBtB === !!modeTspin || lines === 4;
            }
            await this.sleep(DEL_DELAY);
        } else {
            this.ren = -1;
            await this.sleep(SET_DELAY);
        }
        // console.log("release")
        // this.draw();
        this.makeNewMino();
        this.isUsedHold = false;
        this.sender.send("setLabelScore", String("score:" + this.score));
        let ren = this.ren;
        if (ren < 0) ren = 0;
        this.sender.send("setLabelRen", String("ren:" + ren));
    };

    /**
     * 基礎得点 ： line*100 + 10*(ren+2)^2+60
     * T-spin   ： line*1000
     * Wetris   ： +2000
     * BtB      ： 1.5 * (基礎得点+T-spin+Wetris)
     * PC       ： +4000
     */
    addScore(lines: number, ren: number, modeTspin: number, isBtB: boolean) {
        let score = 0;

        // 適当にいい感じの二次関数 0renで0, 1renで100, 20renで4800くらい
        score += 10 * (ren + 2) * (ren + 2) - 40;

        // このタイミング一旦で整数にしないと（多分）情報落ちで計算がおかしくなる
        score = Math.floor(score);

        if (lines === 4) {
            console.log("Wetris");
            score += 2000;
        } else if (modeTspin === 1) {
            console.log("T-spin");
            score += 1000 * lines;
        } else if (modeTspin === 2) {
            console.log("T-spin mini");
            score += 500 * lines;
        } else {
            // default
            score += 100 * lines;
        }

        if (isBtB) {
            score *= 1.5;
            score = Math.floor(score);
            console.log("BtB!");
        }

        if (this.field.isPerfectClear()) {
            console.log("ぱふぇ");
            score += 4000;
        }
        console.log("+" + score);
        this.score += score;
    }

    moveLeft() {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        if (this.checkKSKS()) return;
        if (this.currentMino.moveMino(-1, 0)) {
            this.isLocking = false;
        }
    }

    moveRight() {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        if (this.checkKSKS()) return;
        if (this.currentMino.moveMino(1, 0)) {
            this.isLocking = false;
        }
    }

    rotateLeft() {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        if (this.checkKSKS()) return;
        if (this.currentMino.rotateMino(-1)) {
            this.isLocking = false;
        }
    }

    rotateRight() {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        if (this.checkKSKS()) return;
        if (this.currentMino.rotateMino(1)) {
            this.isLocking = false;
        }
    }

    /**
     *
     * @returns true:接地した false:接地していない
     */
    softDrop(): boolean {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return true;

        // 下へ動かせなければ接地
        if (this.currentMino.moveMino(0, 1)) {
            this.isLocking = false;
            this.countKSKS = 0;
            this.score += 1;
            this.sender.send("setLabelScore", String("score:" + this.score));
            return false;
        } else {
            this.lockDown();
            return true;
        }
    }

    hardDrop() {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        this.score += this.currentMino.getGhostY() - this.currentMino.y;
        this.score += 10;

        // ゴーストのy座標まで移動(接地)
        this.currentMino.moveMino(0, this.currentMino.getGhostY() - this.currentMino.y);

        this.set();
    }

    hold() {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        if (this.isUsedHold) return;
        this.isUsedHold = true;

        if (this.holdMino !== undefined) {
            this.nextMinos.push(this.holdMino);
        }

        this.holdMino = this.currentMino.idxMino;
        this.currentMino.drawHoldMino();
        this.makeNewMino();
        // console.log("hold");
    }
}

module.exports = Wetris;
