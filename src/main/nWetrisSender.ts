const { IpcMainInvokeEvent } = require("electron");

import { Field } from "./Field.class";
import { nMinoCore } from "./nMinoCore";
import { nWetrisCore } from "./nWetrisCore";

import {
    DRAW_FIELD_TOP,
    MINO_POS,
    MINO_COLORS,
    GHOST_COLORS,
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

        super.start();
    }

    start() {
        // this.senderをセットしてからでないとエラーになるので、startさせない
        // 本来はsuperのコンストラクタでstartしている
        // nWetrisCoreのconstructorでstart();を非同期にして少し遅らせてもいいかも。
        return;
    }

    // ---------- フィールド描画関連 ----------
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

    // ---------- ミノ描画関連 ----------

    drawMino() {
        this.currentMino.blockPos().forEach((block) => {
            this.sender.send(
                "drawBlock",
                {
                    x: this.currentMino.x + block.x,
                    y: this.currentMino.y + block.y - DRAW_FIELD_TOP,
                },
                MINO_COLORS[this.currentMino.idxMino]
            );
        });
    }

    /**
     * ゴーストを描画する
     * 別途現在地にも描画しないと上書きされる
     */
    drawGhostMino() {
        this.currentMino.blockPos().forEach((block) => {
            this.sender.send(
                "drawBlock",
                {
                    x: this.currentMino.x + block.x,
                    y: this.currentMino.getGhostY() + block.y - DRAW_FIELD_TOP,
                },
                GHOST_COLORS[this.currentMino.idxMino]
            );
        });
    }

    drawHoldMino() {
        if (this.sender === null) return;
        // debug("drawHoldMino");
        this.sender.send("clearHoldContext");
        this.currentMino.blockPos().forEach((block) => {
            this.sender.send("drawHoldBlock", block, MINO_COLORS[this.currentMino.idxMino]);
        });
    }

    // ---------- オーバーライド ----------

    move(dif: position): boolean {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return false;

        // 移動前の情報を格納
        const prePos = { x: this.currentMino.x, y: this.currentMino.y - DRAW_FIELD_TOP };
        const preGhostPos = {
            x: this.currentMino.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };

        // 移動
        if (!super.move(dif)) {
            return false;
        }

        // 移動後の情報を格納
        const postPos = { x: this.currentMino.x, y: this.currentMino.y - DRAW_FIELD_TOP };
        const postGhostPos = {
            x: this.currentMino.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };

        // 描画
        this.sender.send(
            "reDrawMino",
            this.currentMino.blockPos(),
            prePos,
            preGhostPos,
            this.currentMino.blockPos(),
            postPos,
            postGhostPos,
            this.currentMino.idxMino
        );

        return true;
    }

    rotate(angle: number): boolean {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return false;

        // 移動前の情報を格納
        const prePos = { x: this.currentMino.x, y: this.currentMino.y - DRAW_FIELD_TOP };
        const preGhostPos = {
            x: this.currentMino.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };
        const preBlockPos: blocks = this.currentMino.blockPos().map((block) => ({ ...block }));

        if (!super.rotate(angle)) {
            return false;
        }

        // 移動後の情報を格納
        const postPos = { x: this.currentMino.x, y: this.currentMino.y - DRAW_FIELD_TOP };
        const postGhostPos = {
            x: this.currentMino.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };
        const postBlockPos: blocks = this.currentMino.blockPos().map((block) => ({ ...block }));

        // 描画
        this.sender.send(
            "reDrawMino",
            preBlockPos,
            prePos,
            preGhostPos,
            postBlockPos,
            postPos,
            postGhostPos,
            this.currentMino.idxMino
        );

        return false;
    }

    // gameover関数に切り分けたらここにも反映
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
        this.drawMino();
        this.drawGhostMino();
        this.drawNext();
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
        this.drawHoldMino();
        super.hold();
    }
}
