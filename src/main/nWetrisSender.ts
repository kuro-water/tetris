const { IpcMainInvokeEvent } = require("electron");

import { Field } from "./Field.class";
import { nMinoCore } from "./nMinoCore";
import { nWetrisCore } from "./nWetrisCore";

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

export class nWetrisSender extends nWetrisCore {
    sender: typeof IpcMainInvokeEvent.sender;
    setDelay = SET_DELAY;
    delDelay = DEL_DELAY;

    constructor(sender: typeof IpcMainInvokeEvent.sender) {
        super();
        this.sender = sender;

        this.clearFieldContext();
        this.clearHoldContext();
        this.clearNextContext();

        this.makeNewMino();
        this.mainloop();
        this.isMainloopActive = true;
    }

    start() {
        // this.senderをセットしてからでないとエラーになるので、startさせない
        // 本来はsuperのコンストラクタでstartしている
        // nWetrisCoreのconstructorでstart();を非同期にして少し遅らせてもいいかも。
        return;
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
    drawField() {
        this.sender.send("drawField", this.field.field);
        // this.currentMino.drawGhostMino();
        // this.currentMino.drawMino();
    }

    makeNewMino(): void {
        if (!this.nextMinos.length) {
            // ネクストが空なら生成
            if (!this.afterNextMinos.length) this.afterNextMinos = this.getTurn();
            this.nextMinos = this.afterNextMinos;
            this.afterNextMinos = this.getTurn();
        }

        this.currentMino = new nMinoCore(this.field, this.nextMinos.pop());

        if (this.currentMino.isGameOver) {
            this.drawField();
            // this.currentMino.drawMino();
            this.currentMino = null;
            this.isMainloopActive = false;
            return;
        }
        // info(this.nextMinos);
        // info(this.afterNextMinos);
        this.drawField();
        this.drawNext();
    }

    drawNext() {
        if (this.sender === null) return;
        // info("---------- draw next ----------")
        this.clearNextContext();
        // ネクスト配列のコピーを作り、popで取り出す
        let nextMinos = [...this.nextMinos];
        let afterNextMinos = [...this.afterNextMinos];
        const NUM_OF_NEXT = 5;
        for (let i = 0; i < NUM_OF_NEXT; i++) {
            if (!nextMinos.length) {
                nextMinos = afterNextMinos;
                // info("入れ替えた");
            }
            // info(nextMinos);
            // info(afterNextMinos);
            // info("");
            let idxMino = nextMinos.pop() as MINO_IDX;

            for (let j = 0; j < MINO_POS[idxMino][0].length; j++) {
                const block: position = {
                    x: MINO_POS[idxMino][0][j].x,
                    y: MINO_POS[idxMino][0][j].y,
                };
                this.sender.send(
                    "drawNextBlock",
                    { x: 1 + block.x, y: 1 + i * 4 + block.y },
                    MINO_COLORS[idxMino]
                );
            }
        }
        // info("---------- end draw next ----------")
    }

    set = async () => {
        await super.set();
        let ren = this.ren;
        if (ren < 0) ren = 0;
        this.sender.send("setLabelScore", String("score:" + this.score));
        this.sender.send("setLabelRen", String("ren:" + ren));
    };

    softDrop(): boolean {
        if (super.softDrop()) {
            return true;
        }

        this.sender.send("setLabelScore", String("score:" + this.score));
        return false;
    }

    hold() {
        super.hold();
        // this.currentMino.drawHoldMino();
    }
}
