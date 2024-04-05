"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wetris = require("./wetris.class");
// import { Wetris } from "Wetris.class";
class Cpu {
    mainWetris;
    trialWetris;
    constructor(wetris) {
        this.mainWetris = wetris;
        this.trialWetris = new Wetris(null);
        this.trialWetris.isMainloopActive = false;
        this.testAllSet();
    }
    async testAllSet() {
        let fieldList = [];
        // 全ての回転を試す
        for (let rotation = 0; rotation < 4; rotation++) {
            // 移動可能な全てのx座標における一番下に接地した場合を調べる
            for (let movement = 0;; movement++) {
                this.trialWetris.currentMino.idxMino = this.mainWetris.currentMino.idxMino;
                this.trialWetris.currentMino.rotateMino(rotation);
                this.trialWetris.field.field = this.mainWetris.field.field.map((row) => [
                    ...row,
                ]);
                while (this.trialWetris.currentMino.moveMino({ x: -1, y: 0 }))
                    ;
                while (this.trialWetris.currentMino.moveMino({ x: 0, y: 1 }))
                    ;
                const wasMoved = this.trialWetris.currentMino.moveMino({ x: movement, y: 0 });
                await this.trialWetris.set();
                if (!wasMoved)
                    break; // これ以上右に動かせない
                this.trialWetris.field.printField();
                fieldList.push(this.trialWetris.field.clone());
            }
        }
        return fieldList;
    }
}
module.exports = Cpu;
//# sourceMappingURL=cpu.class.js.map