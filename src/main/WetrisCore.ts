const { IpcMainInvokeEvent } = require("electron");

import { Field } from "./Field";
import { MinoCore } from "./MinoCore";

import {
    MINO_POS,
    MINO_COLORS,
    LOCK_DOWN_DELAY,
    SET_DELAY,
    DEL_DELAY,
    KSKS_LIMIT,
    MINO_IDX,
} from "./constant";

import { success, error, warning, task, debug, info } from "./messageUtil";

export class WetrisCore {
    currentMino: MinoCore;
    nextMinos: MINO_IDX[] = [];
    afterNextMinos: MINO_IDX[] = [];
    holdMino: MINO_IDX;

    field: Field;

    isLocking = false;
    latestTime: number;

    delDelay = 0;
    setDelay = 0;

    // Record<key, value>
    keyMap: Record<string, string> = {};
    idInterval: Record<string, NodeJS.Timeout> = {};
    isKeyDown: Record<string, boolean> = {};
    isUsedHold = false;
    countKSKS = 0;

    score = 0;
    ren = 0;
    modeTspin = 0;
    isBtB = false;

    isMainloopActive: boolean;

    lines = 0; // debug

    constructor() {
        // task("wetris constructor started.");
        this.field = new Field();
        this.latestTime = Date.now();
        this.start();

        // task("wetris constructor ended.");
    }

    start() {
        this.makeNewMino();
        this.mainloop();
        this.isMainloopActive = true;
    }

    /**
     *  よくわからんけどスリープできるようになる。Promiseてなんやねん
     * @param waitTime  ms
     * @return Promise
     */
    sleep(waitTime: number) {
        return new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    getConfig = async () => {
        const config = await electronAPI.getConfig();
        this.keyMap = config.keyMap;
        // task("read:config");
    };

    mainloop = async () => {
        while (" ω ") {
            // this.field.printField();
            await this.sleep(1000);
            if (!this.isMainloopActive) continue;
            // debug("mainloop");
            if (!this.currentMino) {
                // 接地硬直中はcurrentMinoが存在せずTypeErrorとなる
                continue;
            }
            if (this.move({ x: 0, y: 1 })) {
                this.isLocking = false;
                this.countKSKS = 0;
            } else {
                this.lockDown();
            }
        }
    };

    makeNewMino() {
        if (!this.nextMinos.length) {
            // ネクストが空なら生成
            if (!this.afterNextMinos.length) {
                this.afterNextMinos = this.getTurn();
            }
            this.nextMinos = this.afterNextMinos;
            this.afterNextMinos = this.getTurn();
        }

        this.currentMino = new MinoCore(this.field, this.nextMinos.pop());

        if (this.currentMino.isGameOver) {
            this.currentMino = null;
            this.isMainloopActive = false;
            return;
        }
        // info(this.nextMinos);
        // info(this.afterNextMinos);
    }

    getTurn(): MINO_IDX[] {
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
        // info(turn);
        return turn;
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
            // debug("plus");
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
        // debug(`${delay}`);
        if (LOCK_DOWN_DELAY < delay) {
            this.set();
            this.isLocking = false;
        }
    }

    async set() {
        let lines;

        // if (this.currentMino.idxMino === MINO_IDX.T_MINO) debug(this.currentMino.lastSRS);

        // 接地硬直中操作不能にする
        let settingMino = this.currentMino;
        this.currentMino = null;
        // debug("lock");

        settingMino.setMino();
        // info("set");
        // info("modeTspin:" + this.modeTspin);
        lines = this.field.clearLines();
        // info("l:", this.lines);
        this.lines += lines;
        if (lines) {
            this.ren += 1;
            // 今回がTspinかどうか、前回がTspinかどうかの4パターン存在する。いい感じにした
            if (this.isBtB) {
                this.isBtB = !!this.modeTspin || lines === 4;
                this.addScore(lines, this.ren, this.modeTspin, this.isBtB);
            } else {
                this.addScore(lines, this.ren, this.modeTspin, this.isBtB);
                this.isBtB = !!this.modeTspin || lines === 4;
            }
            // Delayが0でもsleepしてしまうと止まってしまう
            if (this.delDelay) await this.sleep(this.delDelay);
        } else {
            this.ren = -1;
            if (this.setDelay) await this.sleep(this.setDelay);
        }
        // debug("release")
        await this.makeNewMino();
        this.isUsedHold = false;
        let ren = this.ren;
        if (ren < 0) ren = 0;
    }

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
            // info("Wetris");
            score += 2000;
        } else if (modeTspin === 1) {
            // info("T-spin");
            score += 1000 * lines;
        } else if (modeTspin === 2) {
            // info("T-spin mini");
            score += 500 * lines;
        } else {
            // default
            score += 100 * lines;
        }

        // info("btb:" + isBtB);
        if (isBtB) {
            score *= 1.5;
            score = Math.floor(score);
            // info("BtB!");
        }

        if (this.field.isPerfectClear()) {
            // info("ぱふぇ");
            score += 4000;
        }
        // info("+" + score);
        this.score += score;
    }

    move(dif: position): boolean {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return false;

        if (this.checkKSKS()) return false;
        if (this.currentMino.moveMino(dif)) {
            this.isLocking = false;
            this.modeTspin = 0;
            this.countKSKS += 1;
            return true;
        }
        return false;
    }

    moveLeft(): boolean {
        return this.move({ x: -1, y: 0 });
    }

    moveRight(): boolean {
        return this.move({ x: 1, y: 0 });
    }

    rotate(angle: number): boolean {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return false;

        if (this.checkKSKS()) return false;
        if (this.currentMino.rotateMino(angle)) {
            this.isLocking = false;
            this.modeTspin = this.currentMino.getModeTspin();
            this.countKSKS += 1;
            return true;
        }
        return false;
    }

    rotateLeft(): boolean {
        return this.rotate(-1);
    }

    rotateRight(): boolean {
        return this.rotate(1);
    }

    /**
     *
     * @returns true:接地した false:接地していない
     */
    softDrop(): boolean {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return true;

        // 下へ動かせなければ接地
        if (this.move({ x: 0, y: 1 })) {
            this.isLocking = false;
            this.countKSKS = 0;
            this.score += 1;
            // info("score:" + this.score);
            return false;
        } else {
            this.lockDown();
            return true;
        }
    }

    hardDrop = async () => {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        this.score += this.currentMino.getGhostY() - this.currentMino.y;
        this.score += 10;

        // ゴーストのy座標まで移動(接地)
        this.move({ x: 0, y: this.currentMino.getGhostY() - this.currentMino.y });

        await this.set();
    };

    hold() {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        if (this.isUsedHold) return;
        this.isUsedHold = true;

        if (this.holdMino !== undefined) {
            this.nextMinos.push(this.holdMino);
        }

        this.holdMino = this.currentMino.idxMino;
        this.makeNewMino();
        // info("hold");
    }
}
