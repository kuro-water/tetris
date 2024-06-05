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
            // 一手で積めるフィールドを全探索し、そのフィールドの評価を行う
            const fieldDataList = await this.getAllFieldPattern(this.mainWetris.currentMino.idxMino, this.mainWetris.field);
            let fieldScoreList = await this.culcAllFieldScore(fieldDataList);
            // そのうち、Iミノ要求数が最も少ないものを選択
            const minRequiedIMinoCountValue = fieldScoreList.reduce((min, b) => Math.min(min, b.requiedIMinoCount), Infinity);
            fieldScoreList = fieldScoreList.filter((item) => item.requiedIMinoCount === minRequiedIMinoCountValue);
            // そのうち、フィールドの高さが最も低いものを選択
            const minHeightValue = fieldScoreList.reduce((max, b) => Math.max(max, b.height), -Infinity);
            fieldScoreList = fieldScoreList.filter((item) => item.height === minHeightValue);
            // 埋まっている穴が最も少ないフィールドを選択
            const minHoleValue = fieldScoreList.reduce((min, b) => Math.min(min, b.hole), Infinity);
            fieldScoreList = fieldScoreList.filter((item) => item.hole === minHoleValue);
            // そのうち、設置するミノのy高さが最も低いものを選択
            const lowerPosFieldValue = fieldScoreList.reduce((max, b) => Math.max(max, b.fieldData.pos.y), -Infinity);
            fieldScoreList = fieldScoreList.filter((item) => item.fieldData.pos.y === lowerPosFieldValue);
            // 最初に出現したフィールドを優先する -> 左から順に積まれていく
            const bestField = fieldScoreList[0];
            bestField.fieldData.field.printField();
            (0, messageUtil_1.info)(`hole: ${bestField.hole}`);
            (0, messageUtil_1.info)(`height: ${bestField.height}`);
            (0, messageUtil_1.info)(`requiedIMinoCount: ${bestField.requiedIMinoCount}`);
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
            // await this.mainWetris.sleep(1000);
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
                // // debug
                // this.trialWetris.field.printField();
                // this.culcFieldScore(feldData).then((fieldScore) => {
                //     info(`hole: ${fieldScore.hole}`);
                //     info(`height: ${fieldScore.height}`);
                //     info(`requiedIMinoCount: ${fieldScore.requiedIMinoCount}`);
                //     info(`pos: (${fieldScore.fieldData.pos.x}, ${fieldScore.fieldData.pos.y})`);
                // });
            }
        }
        return fieldDataList;
    }
    async culcFieldScore(fieldData) {
        let hole = 0;
        let requiedIMinoCount = 0;
        let maxHeight = fieldData.field.field.length - 1;
        // 全てのx座標について順に確かめていく
        for (let x = 1; x < fieldData.field.field[0].length - 1; x++) {
            let y;
            // 上の方の空白は読み飛ばす
            for (y = 0;; y++) {
                if (fieldData.field.isFilled({ x: x, y: y })) {
                    break;
                }
            }
            // 一番高いブロックのy座標を記録
            // 値として小さい方がy座標としては高いことに注意
            if (y < maxHeight) {
                maxHeight = y;
            }
            // 埋まっている穴の数を数える
            for (; y < fieldData.field.field.length; y++) {
                if (!fieldData.field.isFilled({ x: x, y: y })) {
                    hole++;
                }
            }
            // 縦に3つ以上空いた穴の数を数える
            // 1 0 1
            // 1 0 1
            // 1 0 1
            // 1 1 1
            // みたいなこと。
            let trenchCount = 0;
            // 左右どちらかにブロックがある座標まで読み飛ばす
            for (y = 0;; y++) {
                if (fieldData.field.isFilled({ x: x - 1, y: y }) &&
                    fieldData.field.isFilled({ x: x + 1, y: y })) {
                    break;
                }
            }
            // カウント
            for (; y < fieldData.field.field.length; y++) {
                (0, messageUtil_1.info)(`x: ${x}, y: ${y}, ${fieldData.field.isFilled({ x: x - 1, y: y }) &&
                    !fieldData.field.isFilled({ x: x, y: y }) &&
                    fieldData.field.isFilled({ x: x + 1, y: y })}`);
                if (fieldData.field.isFilled({ x: x - 1, y: y }) &&
                    !fieldData.field.isFilled({ x: x, y: y }) &&
                    fieldData.field.isFilled({ x: x + 1, y: y })) {
                    trenchCount++;
                }
                else {
                    break;
                }
            }
            if (trenchCount >= 3) {
                requiedIMinoCount++;
            }
        }
        // fieldData.field.printField();
        // info(`requiedIMinoCount: ${requiedIMinoCount}`);
        return {
            fieldData: fieldData,
            hole: hole,
            height: maxHeight,
            requiedIMinoCount: requiedIMinoCount,
        };
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