const { IpcMainInvokeEvent } = require("electron");

import { DEL_DELAY, DRAW_FIELD_TOP, GHOST_COLORS, MINO_COLORS, MINO_IDX, MINO_POS, SET_DELAY } from "./constant";

import { info } from "./messageUtil";
import { WetrisCore } from "./WetrisCore";

type Attack = (idx: number, lines: number, ren: number, modeTspin: number, isBtB: boolean) => void;

export class WetrisSender extends WetrisCore {
    private readonly sender: typeof IpcMainInvokeEvent.sender;
    private readonly idx: number;

    setDelay = SET_DELAY;
    delDelay = DEL_DELAY;

    // 外部から変更できる攻撃処理
    private attack: Attack = (sender: typeof IpcMainInvokeEvent.sender, score: number) => {
    };
    public attackedLineBuffer: number[] = [];


    protected start() {
        // this.senderをセットしてからでないとエラーになるので、startさせない
        // 本来はsuperのコンストラクタでstartしている
        // nWetrisCoreのconstructorでstart();を非同期にして少し遅らせてもいいかも。
        return;
    }

    constructor(sender: typeof IpcMainInvokeEvent.sender, idx: number) {
        super();
        this.sender = sender;
        this.idx = idx;

        this.clearFieldContext();
        this.clearHoldContext();
        this.clearNextContext();

        super.start();
    }

    // @Override
    protected async mainloop() {
        // debug(this.attackedLineBuffer);
        await super.mainloop();
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
    public move(dif: Position): boolean {
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
            this.idx,
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
        const preBlockPos: Position[] = this.currentMino.blocksPos().map((block) => ({ ...block }));

        if (!super.rotate(angle)) {
            return false;
        }

        // 移動後の情報を格納
        const postPos = { x: this.currentMino.pos.x, y: this.currentMino.pos.y - DRAW_FIELD_TOP };
        const postGhostPos = {
            x: this.currentMino.pos.x,
            y: this.currentMino.getGhostY() - DRAW_FIELD_TOP,
        };
        const postBlockPos: Position[] = this.currentMino
        .blocksPos()
        .map((block) => ({ ...block }));

        // 描画
        this.sender.send(
            "reDrawMino",
            this.idx,
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

        this.sender.send("setLabelScore", this.idx, String("score:" + this.score));
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

        if (this.attackedLineBuffer.length) {
            this.attackedLineBuffer.forEach((line => this.field.addCheese(line)));
            this.attackedLineBuffer = [];
            this.drawField();
        }

        let ren = this.ren;
        if (ren < 0) ren = 0;
        this.sender.send("setLabelScore", this.idx, String("score:" + this.score));
        this.sender.send("setLabelRen", this.idx, String("ren:" + ren));
    }

    // @Override
    protected addScore(lines: number, ren: number, modeTspin: number, isBtB: boolean) {
        super.addScore(lines, ren, modeTspin, isBtB);
        this.attack(this.idx, lines, ren, modeTspin, isBtB);
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
        this.sender.send("clearFieldContext", this.idx);
    }

    private clearHoldContext() {
        this.sender.send("clearHoldContext", this.idx);
    }

    private clearNextContext() {
        this.sender.send("clearNextContext", this.idx);
    }

    private drawField() {
        this.sender.send("drawField", this.idx, this.field.field);
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
                const block: Position = {
                    x: MINO_POS[idxMino][0][j].x,
                    y: MINO_POS[idxMino][0][j].y,
                };
                this.sender.send(
                    "drawNextBlock",
                    this.idx,
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
                this.idx,
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
                this.idx,
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
        this.sender.send("clearHoldContext", this.idx);
        for (const blockPos of this.currentMino.blocksPos()) {
            this.sender.send("drawHoldBlock", this.idx, blockPos, MINO_COLORS[this.currentMino.idxMino]);
        }
    }

    // ---------- ミノ描画関連終わり ----------

    // ---------- 対戦関連 ----------
    public setAttackMethod(method: Attack) {
        this.attack = method;
    }

    // ---------- 対戦関連終わり ----------
}
