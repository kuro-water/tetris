"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./constant");
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
            const minHeightValue = minHoleFieldList.reduce((max, b) => Math.max(max, b.height), -Infinity);
            const minHeightFieldList = minHoleFieldList.filter((item) => item.height === minHeightValue);
            const lowerPosFieldValue = minHeightFieldList.reduce((max, b) => Math.max(max, b.fieldData.pos.y), -Infinity);
            const lowerPosFieldList = minHeightFieldList.filter((item) => item.fieldData.pos.y === lowerPosFieldValue);
            // 最初に出現したフィールドを優先する -> 左から順に積まれていく
            const bestField = lowerPosFieldList[0];
            bestField.fieldData.field.printField();
            // 実際に操作する
            while (this.mainWetris.currentMino.angle % 4 !== bestField.fieldData.angle % 4) {
                this.mainWetris.rotate(1);
                await this.mainWetris.sleep(constant_1.ARR);
            }
            while (this.mainWetris.currentMino.x !== bestField.fieldData.pos.x) {
                const dif = bestField.fieldData.pos.x - this.mainWetris.currentMino.x;
                const wasMoved = await this.mainWetris.move({ x: 0 < dif ? 1 : -1, y: 0 });
                if (!wasMoved) {
                    (0, messageUtil_1.error)("CPU: failed to move!");
                }
                await this.mainWetris.sleep(constant_1.ARR);
            }
            await this.mainWetris.hardDrop();
        }
    }
    async getAllFieldPattern(idxMino, field) {
        let fieldDataList = [];
        for (let rotation = 0; rotation < 4; rotation++) {
            // 左から順に、移動可能な全てのx座標における一番下に接地した場合を調べる
            for (let movement = 0;; movement++) {
                this.trialWetris = new Wetris(null);
                this.trialWetris.isMainloopActive = false;
                this.trialWetris.currentMino.idxMino = idxMino;
                for (let i = 0; i < rotation; i++) {
                    this.trialWetris.currentMino.rotateMino();
                }
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
                    angle: rotation,
                };
                fieldDataList.push(feldData);
                // debug
                // this.trialWetris.field.printField();
                // this.culcFieldScore(feldData).then((fieldScore) => {
                //     info(`hole: ${fieldScore.hole}`);
                //     info(`height: ${fieldScore.height}`);
                //     info(`pos: (${fieldScore.fieldData.pos.x}, ${fieldScore.fieldData.pos.y})`);
                // });
            }
        }
        return fieldDataList;
    }
    async culcFieldScore(fieldData) {
        let hole = 0;
        let height = fieldData.field.field.length - 1;
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
            if (y < height) {
                height = y;
            }
            // 穴の数を数える
            for (; y < fieldData.field.field.length; y++) {
                if (!fieldData.field.isFilled({ x: x, y: y })) {
                    hole++;
                }
            }
        }
        return { fieldData: fieldData, hole: hole, height: height };
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