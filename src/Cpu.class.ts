import {
    CONFIG_PATH,
    MINO_IDX,
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

import { success, error, warning, task, info } from "./messageUtil";

const Wetris = require("./wetris.class");
type Wetris = Wetris_;
type Mino = Mino_;
type Field = Field_;

// import { Wetris } from "Wetris.class";

class Cpu {
    mainWetris: Wetris;
    trialWetris: Wetris;
    constructor(wetris: Wetris) {
        this.mainWetris = wetris;
        this.trialWetris = new Wetris(null);
        this.trialWetris.isMainloopActive = false;
        this.testAllSet();
    }

    async testAllSet() {
        let fieldList: Field[] = [];
        // 全ての回転を試す
        for (let rotation = 0; rotation < 4; rotation++) {
            // 移動可能な全てのx座標における一番下に接地した場合を調べる
            for (let movement = 0; ; movement++) {
                this.trialWetris.currentMino.idxMino = this.mainWetris.currentMino.idxMino;
                this.trialWetris.currentMino.rotateMino(rotation);
                this.trialWetris.field.field = this.mainWetris.field.field.map((row: number[]) => [
                    ...row,
                ]);

                while (this.trialWetris.currentMino.moveMino({ x: -1, y: 0 }));
                while (this.trialWetris.currentMino.moveMino({ x: 0, y: 1 }));
                const wasMoved = this.trialWetris.currentMino.moveMino({ x: movement, y: 0 });
                await this.trialWetris.set();

                if (!wasMoved) break; // これ以上右に動かせない

                this.trialWetris.field.printField();
                fieldList.push(this.trialWetris.field.clone());
            }
        }
        return fieldList;
    }
}

module.exports = Cpu;
