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

type FieldData = { field: Field; pos: position; idxMino: MINO_IDX; angle: number };

/**
 * 評価後のフィールドデータ
 * hole: 埋まっている穴の数
 * height: 一番高い(内部的な値としては一番小さい)ブロックのy座標
 * requiedIMinoCount: 縦に3つ以上空いた穴の数 = 必要なIミノの数
 */
type FieldInfo = { fieldData: FieldData; hole: number; height: number; requiedIMinoCount: number };

type FieldScore = { fieldData: FieldData; score: number };

class Cpu {
    mainWetris: Wetris;
    trialWetris: Wetris;

    constructor(wetris: Wetris) {
        this.mainWetris = wetris;
        this.trialWetris = new Wetris(null);
        this.trialWetris.isMainloopActive = false;
        this.main();
    }

    async main() {
        while (true) {
            // 一手で積めるフィールドを全探索し、そのフィールドの評価を行う
            const fieldDataList = await this.getAllFieldPattern(
                this.mainWetris.currentMino.idxMino,
                this.mainWetris.field
            );
            const fieldInfoList = await this.getAllFieldInfo(fieldDataList);

            // const bestField = await this.choiceGoodField(fieldInfoList);

            const fieldScoreList = await this.culcAllFieldScore(fieldInfoList);

            const maxScore = fieldScoreList.reduce((max, b) => Math.max(max, b.score), -Infinity);
            const bestField = fieldScoreList.filter((item) => item.score === maxScore)[0];

            bestField.fieldData.field.printField();
            // info(`hole: ${bestField.hole}`);
            // info(`height: ${bestField.height}`);
            // info(`requiedIMinoCount: ${bestField.requiedIMinoCount}`);

            // 実際に操作する
            while (this.mainWetris.currentMino.angle % 4 !== bestField.fieldData.angle % 4) {
                this.mainWetris.rotate(1);
                await this.mainWetris.sleep(ARR);
            }
            while (this.mainWetris.currentMino.x !== bestField.fieldData.pos.x) {
                const dif = bestField.fieldData.pos.x - this.mainWetris.currentMino.x;
                const wasMoved = await this.mainWetris.move({ x: 0 < dif ? 1 : -1, y: 0 });
                if (!wasMoved) {
                    error("CPU: failed to move!");
                }
                await this.mainWetris.sleep(ARR);
            }
            await this.mainWetris.hardDrop();
            // await this.mainWetris.sleep(1000);
        }
    }

    async getAllFieldPattern(idxMino: MINO_IDX, field: Field): Promise<FieldData[]> {
        let fieldDataList: FieldData[] = [];
        for (let rotation = 0; rotation < 4; rotation++) {
            // 左から順に、移動可能な全てのx座標における一番下に接地した場合を調べる
            for (let movement = 0; ; movement++) {
                this.trialWetris = new Wetris(null);
                this.trialWetris.isMainloopActive = false;
                this.trialWetris.currentMino.idxMino = idxMino;
                for (let i = 0; i < rotation; i++) {
                    this.trialWetris.currentMino.rotateMino();
                }
                this.trialWetris.field.field = field.field.map((row: number[]) => [...row]);

                while (this.trialWetris.currentMino.moveMino({ x: -1, y: 0 }));
                const wasMoved = this.trialWetris.currentMino.moveMino({ x: movement, y: 0 });
                while (this.trialWetris.currentMino.moveMino({ x: 0, y: 1 }));
                const pos = {
                    x: this.trialWetris.currentMino.x,
                    y: this.trialWetris.currentMino.y,
                };
                await this.trialWetris.set();

                if (!wasMoved) break; // これ以上右に動かせない

                const feldData: FieldData = {
                    field: this.trialWetris.field.clone(),
                    pos: pos,
                    idxMino: idxMino,
                    angle: rotation,
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

    async getFieldInfo(fieldData: FieldData): Promise<FieldInfo> {
        let hole = 0;
        let requiedIMinoCount = 0;
        let maxHeight = fieldData.field.field.length - 1;
        // 全てのx座標について順に確かめていく
        for (let x = 1; x < fieldData.field.field[0].length - 1; x++) {
            let y: number;

            // 上の方の空白は読み飛ばす
            for (y = 0; ; y++) {
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
            for (y = 0; ; y++) {
                if (
                    fieldData.field.isFilled({ x: x - 1, y: y }) &&
                    fieldData.field.isFilled({ x: x + 1, y: y })
                ) {
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
                if (
                    fieldData.field.isFilled({ x: x - 1, y: y }) &&
                    !fieldData.field.isFilled({ x: x, y: y }) &&
                    fieldData.field.isFilled({ x: x + 1, y: y })
                ) {
                    trenchCount++;
                } else {
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

    async getAllFieldInfo(fieldDataList: FieldData[]): Promise<FieldInfo[]> {
        let fieldInfoList: FieldInfo[] = [];
        for (const fieldData of fieldDataList) {
            fieldInfoList.push(await this.getFieldInfo(fieldData));
        }
        return fieldInfoList;
    }

    async culcFieldScore(fieldInfo: FieldInfo): Promise<FieldScore> {
        let score = 0;

        score -= fieldInfo.hole * 8;
        score += fieldInfo.height * 4;
        score -= fieldInfo.requiedIMinoCount * 2;
        score += fieldInfo.fieldData.pos.y;

        return { fieldData: fieldInfo.fieldData, score: score };
    }

    async culcAllFieldScore(fieldInfoList: FieldInfo[]): Promise<FieldScore[]> {
        let fieldScoreList: FieldScore[] = [];
        for (const fieldInfo of fieldInfoList) {
            fieldScoreList.push(await this.culcFieldScore(fieldInfo));
        }
        return fieldScoreList;
    }

    async choiceGoodField(fieldInfoList: FieldInfo[]): Promise<FieldInfo> {
        // 埋まっている穴が最も少ないフィールドを選択
        const minHoleValue = fieldInfoList.reduce((min, b) => Math.min(min, b.hole), Infinity);
        fieldInfoList = fieldInfoList.filter((item) => item.hole === minHoleValue);

        // そのうち、Iミノ要求数が最も少ないものを選択
        const minRequiedIMinoCountValue = fieldInfoList.reduce(
            (min, b) => Math.min(min, b.requiedIMinoCount),
            Infinity
        );
        fieldInfoList = fieldInfoList.filter(
            (item) => item.requiedIMinoCount === minRequiedIMinoCountValue
        );

        // そのうち、フィールドの高さが最も低いものを選択
        const minHeightValue = fieldInfoList.reduce((max, b) => Math.max(max, b.height), -Infinity);
        fieldInfoList = fieldInfoList.filter((item) => item.height === minHeightValue);

        // そのうち、設置するミノのy高さが最も低いものを選択
        const lowerPosFieldValue = fieldInfoList.reduce(
            (max, b) => Math.max(max, b.fieldData.pos.y),
            -Infinity
        );
        fieldInfoList = fieldInfoList.filter((item) => item.fieldData.pos.y === lowerPosFieldValue);

        // 最初に出現したフィールドを採用する -> 左から順に積まれていく
        return fieldInfoList[0];
    }
}

module.exports = Cpu;
