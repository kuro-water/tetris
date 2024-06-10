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
            const bestField = await this.getBestField(this.mainWetris.currentMino.idxMino, this.mainWetris.field);
            // bestField.fieldData.field.printField();
            // info(`hole: ${bestField.hole}`);
            // info(`height: ${bestField.height}`);
            // info(`requiedIMinoCount: ${bestField.requiedIMinoCount}`);
            await this.moveMinoToMatchField(this.mainWetris, bestField.fieldData);
        }
    }
    async moveMinoToMatchField(wetris, fieldData) {
        while (wetris.currentMino.angle % 4 !== fieldData.angle % 4) {
            wetris.rotateRight();
            await wetris.sleep(constant_1.ARR);
        }
        while (wetris.currentMino.x !== fieldData.pos.x) {
            const dif = fieldData.pos.x - wetris.currentMino.x;
            const wasMoved = dif < 0 ? await wetris.moveLeft() : await wetris.moveRight();
            if (!wasMoved) {
                (0, messageUtil_1.error)("CPU: failed to move!");
            }
            await wetris.sleep(constant_1.ARR);
        }
        await wetris.hardDrop();
    }
    async getBestField(idxMino, field) {
        // 一手で積めるフィールドを全探索し、そのフィールドの評価を行う
        const fieldDataList = await this.getAllFieldPattern(idxMino, field);
        const fieldInfoList = await this.getAllFieldInfo(fieldDataList);
        const fieldScoreList = await this.culcAllFieldScore(fieldInfoList);
        // 評価値が最大のフィールドを返す
        const maxScore = fieldScoreList.reduce((max, b) => Math.max(max, b.score), -Infinity);
        return fieldScoreList.filter((item) => item.score === maxScore)[0];
    }
    async getAllFieldPattern(idxMino, field) {
        let fieldDataList = [];
        for (let angle = 0; angle < 4; angle++) {
            // 左から順に、移動可能な全てのx座標における一番下に接地した場合を調べる
            for (let movement = 0;; movement++) {
                this.trialWetris = new Wetris(null);
                this.trialWetris.isMainloopActive = false;
                this.trialWetris.currentMino.idxMino = idxMino;
                for (let i = 0; i < angle; i++) {
                    this.trialWetris.currentMino.rotateMino();
                }
                // ミノもfield: Fieldを持ってる。field.field: number[][]を書き換えると、ミノのfieldも書き換わる
                this.trialWetris.field.field = field.clone().field;
                // あるいは両方書き換える
                // this.trialWetris.field = field.clone();
                // this.trialWetris.currentMino.field = this.trialWetris.field;
                while (this.trialWetris.currentMino.moveMino({ x: -1, y: 0 }))
                    ;
                if (!this.trialWetris.currentMino.moveMino({ x: movement, y: 0 })) {
                    // これ以上右に動かせない
                    break;
                }
                while (this.trialWetris.currentMino.moveMino({ x: 0, y: 1 }))
                    ;
                const pos = {
                    x: this.trialWetris.currentMino.x,
                    y: this.trialWetris.currentMino.y,
                };
                await this.trialWetris.set();
                const feldData = {
                    field: this.trialWetris.field.clone(),
                    pos: pos,
                    idxMino: idxMino,
                    angle: angle,
                };
                fieldDataList.push(feldData);
                // // debug
                // this.trialWetris.field.printField();
                // this.getFieldInfo(feldData).then((fieldScore) => {
                //     info(`hole: ${fieldScore.hole}`);
                //     info(`height: ${fieldScore.height}`);
                //     info(`requiedIMinoCount: ${fieldScore.requiedIMinoCount}`);
                //     info(`pos: (${fieldScore.fieldData.pos.x}, ${fieldScore.fieldData.pos.y})`);
                // });
            }
        }
        return fieldDataList;
    }
    async getFieldInfo(fieldData) {
        let hole = 0;
        let lidBlock = 0;
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
            // 下穴を埋めているブロックを数える
            for (y = fieldData.field.field.length - 1; 0 <= y; y--) {
                if (!fieldData.field.isFilled({ x: x, y: y })) {
                    break;
                }
            }
            for (; 0 <= y; y--) {
                if (fieldData.field.isFilled({ x: x, y: y })) {
                    lidBlock++;
                }
            }
            // 縦に3つ以上空いた穴の数を数える
            // 1 0 1
            // 1 0 1
            // 1 0 1
            // 1 1 1
            // みたいなもの。
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
                // info(
                //     `x: ${x}, y: ${y}, ${
                //         fieldData.field.isFilled({ x: x - 1, y: y }) &&
                //         !fieldData.field.isFilled({ x: x, y: y }) &&
                //         fieldData.field.isFilled({ x: x + 1, y: y })
                //     }`
                // );
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
            lidBlock: lidBlock,
            height: maxHeight,
            requiedIMinoCount: requiedIMinoCount,
        };
    }
    async getAllFieldInfo(fieldDataList) {
        // let fieldInfoList: FieldInfo[] = [];
        // for (const fieldData of fieldDataList) {
        //     fieldInfoList.push(await this.getFieldInfo(fieldData));
        // }
        // return fieldInfoList;
        return await Promise.all(fieldDataList.map((fieldData) => this.getFieldInfo(fieldData)));
    }
    async culcFieldScore(fieldInfo) {
        let score = 0;
        score -= fieldInfo.hole * 4;
        score -= fieldInfo.lidBlock;
        score += fieldInfo.height;
        score -= fieldInfo.requiedIMinoCount * 2;
        score += fieldInfo.fieldData.pos.y;
        // 死にそうな高さは基本置かない
        if (fieldInfo.height - constant_1.DRAW_FIELD_TOP < 5) {
            (0, messageUtil_1.error)("hi");
            score *= 0 < score ? 0.01 : 100;
        }
        return { fieldData: fieldInfo.fieldData, score: score };
    }
    async culcAllFieldScore(fieldInfoList) {
        // let fieldScoreList: FieldScore[] = [];
        // for (const fieldInfo of fieldInfoList) {
        //     fieldScoreList.push(await this.culcFieldScore(fieldInfo));
        // }
        // return fieldScoreList;
        return await Promise.all(fieldInfoList.map((fieldInfo) => this.culcFieldScore(fieldInfo)));
    }
}
module.exports = Cpu;
//# sourceMappingURL=cpu.class.js.map