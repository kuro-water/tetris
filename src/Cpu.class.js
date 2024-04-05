"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messageUtil_1 = require("./messageUtil");
const Wetris = require("./wetris.class");
class Cpu {
    mainWetris;
    trialWetris;
    constructor(wetris) {
        this.mainWetris = wetris;
        this.trialWetris = new Wetris(null);
        this.trialWetris.isMainloopActive = false;
        this.main();
    }
    async main() {
        while (true) {
            const fieldDataList = await this.getAllFieldPattern(this.mainWetris.currentMino.idxMino, this.mainWetris.field);
            const fieldScoreList = await this.culcAllFieldScore(fieldDataList);
            const minHoleValue = fieldScoreList.reduce((min, b) => Math.min(min, b.hole), Infinity);
            const minHoleFieldList = fieldScoreList.filter((item) => item.hole === minHoleValue);
            const minMaxHeightValue = minHoleFieldList.reduce((max, b) => Math.max(max, b.maxHeight), -Infinity);
            const minMaxHeightFieldList = minHoleFieldList.filter((item) => item.maxHeight === minMaxHeightValue);
            const lowerPosFieldValue = minMaxHeightFieldList.reduce((max, b) => Math.max(max, b.fieldData.pos.y), -Infinity);
            const lowerPosFieldList = minMaxHeightFieldList.filter((item) => item.fieldData.pos.y === lowerPosFieldValue);
            // 最初に出現したフィールドを優先する -> 左から順に積まれていく
            const bestField = lowerPosFieldList[0];
            bestField.fieldData.field.printField();
            await this.mainWetris.sleep(3000);
        }
    }
    async getAllFieldPattern(idxMino, field) {
        let fieldDataList = [];
        for (let rotation = 0; rotation < 4; rotation++) {
            // 左から順に、移動可能な全てのx座標における一番下に接地した場合を調べる
            for (let movement = 0;; movement++) {
                this.trialWetris.currentMino.idxMino = idxMino;
                this.trialWetris.currentMino.rotateMino(rotation);
                this.trialWetris.field.field = field.field.map((row) => [...row]);
                while (this.trialWetris.currentMino.moveMino({ x: -1, y: 0 }))
                    ;
                const wasMoved = this.trialWetris.currentMino.moveMino({ x: movement, y: 0 });
                while (this.trialWetris.currentMino.moveMino({ x: 0, y: 1 }))
                    ;
                const pos = {
                    x: this.trialWetris.currentMino.x,
                    y: this.trialWetris.currentMino.y,
                };
                await this.trialWetris.set();
                if (!wasMoved)
                    break; // これ以上右に動かせない
                const feldData = {
                    field: this.trialWetris.field.clone(),
                    pos: pos,
                    idxMino: idxMino,
                };
                fieldDataList.push(feldData);
                // debug
                this.trialWetris.field.printField();
                this.culcFieldScore(feldData).then((fieldScore) => {
                    (0, messageUtil_1.info)(`hole: ${fieldScore.hole}`);
                    (0, messageUtil_1.info)(`maxHeight: ${fieldScore.maxHeight}`);
                    (0, messageUtil_1.info)(`pos: (${fieldScore.fieldData.pos.x}, ${fieldScore.fieldData.pos.y})`);
                });
            }
        }
        return fieldDataList;
    }
    async culcFieldScore(fieldData) {
        let hole = 0;
        let maxHeight = fieldData.field.field.length - 1;
        // 全てのx座標について、上から順に確かめていく
        for (let x = 1; x < fieldData.field.field[0].length - 1; x++) {
            let y;
            // 上の方の空白は読み飛ばす
            for (y = 0;; y++) {
                if (fieldData.field.isFilled({ x: x, y: y })) {
                    break;
                }
            }
            // 一番高いブロックのy座標を記録
            // 値として小さい方がゲームとしては高いことに注意
            if (y < maxHeight) {
                maxHeight = y;
            }
            // 穴の数を数える
            for (; y < fieldData.field.field.length; y++) {
                if (!fieldData.field.isFilled({ x: x, y: y })) {
                    hole++;
                }
            }
        }
        return { fieldData: fieldData, hole: hole, maxHeight: maxHeight };
    }
    async culcAllFieldScore(fieldDataList) {
        let fieldScoreList = [];
        for (const fieldData of fieldDataList) {
            fieldScoreList.push(await this.culcFieldScore(fieldData));
        }
        return fieldScoreList;
    }
}
module.exports = Cpu;
//# sourceMappingURL=cpu.class.js.map