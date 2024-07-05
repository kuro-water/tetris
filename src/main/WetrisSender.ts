const { IpcMainInvokeEvent } = require("electron");

import { DEL_DELAY, DRAW_FIELD_TOP, GHOST_COLORS, MINO_COLORS, MINO_IDX, MINO_POS, SET_DELAY } from "./constant";

import { info } from "./messageUtil";
import { WetrisCore } from "./WetrisCore";

export class WetrisSender extends WetrisCore {
    private readonly sender: typeof IpcMainInvokeEvent.sender;
    setDelay = SET_DELAY;
    delDelay = DEL_DELAY;


    protected start() {
        // this.senderをセットしてからでないとエラーになるので、startさせない
        // 本来はsuperのコンストラクタでstartしている
        // nWetrisCoreのconstructorでstart();を非同期にして少し遅らせてもいいかも。
        return;
    }

    constructor(sender: typeof IpcMainInvokeEvent.sender) {
        super();
        this.sender = sender;

        this.clearFieldContext();
        this.clearHoldContext();
        this.clearNextContext();

        super.start();
    }

    // @Override
    protected gameOver(): void {
        info("game over");
        // debug(`before currentMino: ${this.currentMino}`);
        this.drawField();
        this.currentMino = null;
        this.isMainloopActive = false;
    }

    // @Override
    public move(dif: position): boolean {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return false;

        // 移動前の情報を格納
        const prePos = { x: this.currentMino.pos.x, y: this.currentMino.pos.y - DRAW_FIELD_TOP };
        const preGhostPos = {
            x: this.currentMino.pos.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };

        // 移動
        if (!super.move(dif)) {
            return false;
        }

        // 移動後の情報を格納
        const postPos = { x: this.currentMino.pos.x, y: this.currentMino.pos.y - DRAW_FIELD_TOP };
        const postGhostPos = {
            x: this.currentMino.pos.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };

        // 描画
        this.sender.send(
            "reDrawMino",
            this.currentMino.blocksPos(),
            prePos,
            preGhostPos,
            this.currentMino.blocksPos(),
            postPos,
            postGhostPos,
            this.currentMino.idxMino
        );

        return true;
    }

    // @Override
    public rotate(angle: number): boolean {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return false;

        // 移動前の情報を格納
        const prePos = { x: this.currentMino.pos.x, y: this.currentMino.pos.y - DRAW_FIELD_TOP };
        const preGhostPos = {
            x: this.currentMino.pos.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };
        const preBlockPos: position[] = this.currentMino.blocksPos().map((block) => ({ ...block }));

        if (!super.rotate(angle)) {
            return false;
        }

        // 移動後の情報を格納
        const postPos = { x: this.currentMino.pos.x, y: this.currentMino.pos.y - DRAW_FIELD_TOP };
        const postGhostPos = {
            x: this.currentMino.pos.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };
        const postBlockPos: position[] = this.currentMino
        .blocksPos()
        .map((block) => ({ ...block }));

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

    // @Override
    public softDrop(): boolean {
        if (super.softDrop()) {
            return true;
        }

        this.sender.send("setLabelScore", String("score:" + this.score));
        return false;
    }

    // @Override
    public hold() {
        // 接地硬直中に入力されるとcurrentMinoが存在せずTypeErrorとなるため
        if (!this.currentMino) return;

        if (this.isUsedHold) return;

        this.drawHoldMino();
        this.isUsedHold = true;

        if (this.holdMino !== undefined) {
            this.nextMinos.push(this.holdMino);
        }

        this.holdMino = this.currentMino.idxMino;
        this.makeNewMino();
    }

    // @Override
    public async set() {
        await super.set();
        let ren = this.ren;
        if (ren < 0) ren = 0;
        this.sender.send("setLabelScore", String("score:" + this.score));
        this.sender.send("setLabelRen", String("ren:" + ren));
    }

    // @Override
    protected makeNewMino(): void {
        super.makeNewMino();

        // game over時を蹴る
        if (this.currentMino === null) return;

        this.drawField();
        this.drawNext();
    }

    // ---------- フィールド描画関連 ----------
    private clearFieldContext() {
        this.sender.send("clearFieldContext");
    }

    private clearHoldContext() {
        this.sender.send("clearHoldContext");
    }

    private clearNextContext() {
        this.sender.send("clearNextContext");
    }

    private drawField() {
        this.sender.send("drawField", this.field.field);
        this.drawGhostMino();
        this.drawMino();
    }

    private drawNext() {
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
    // ---------- フィールド描画関連終わり ----------

    // ---------- ミノ描画関連 ----------
    private drawMino() {
        for (const blockPos of this.currentMino.blocksPos()) {
            this.sender.send(
                "drawBlock",
                {
                    x: this.currentMino.pos.x + blockPos.x,
                    y: this.currentMino.pos.y + blockPos.y - DRAW_FIELD_TOP,
                },
                MINO_COLORS[this.currentMino.idxMino]
            );
        }
    }

    /**
     * ゴーストを描画する
     * 別途現在地にも描画しないと上書きされる
     */
    private drawGhostMino() {
        // debug(`currentMino: ${this.currentMino}`);
        // debug(`minoIdx: ${this.currentMino.idxMino}`);
        // debug(`angle: ${this.currentMino.angle}`);
        for (const blockPos of this.currentMino.blocksPos()) {
            this.sender.send(
                "drawBlock",
                {
                    x: this.currentMino.pos.x + blockPos.x,
                    y: this.currentMino.getGhostY() + blockPos.y - DRAW_FIELD_TOP,
                },
                GHOST_COLORS[this.currentMino.idxMino]
            );
        }
    }

    private drawHoldMino() {
        if (this.sender === null) return;
        // debug("drawHoldMino");
        this.sender.send("clearHoldContext");
        for (const blockPos of this.currentMino.blocksPos()) {
            this.sender.send("drawHoldBlock", blockPos, MINO_COLORS[this.currentMino.idxMino]);
        }
    }
    // ---------- ミノ描画関連終わり ----------
}
