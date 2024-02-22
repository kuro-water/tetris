import {
    MINO_IDX,
    INIT_FIELD,
    DRAW_FIELD_TOP,
    MINO_POS,
    MINO_COLORS,
    GHOST_COLORS,
    SRS_TLJSZ,
    SRS_I,
    BACKGROUND_COLOR,
} from "./constant";

const Field = require("./Field.class");
type Field = typeof Field;

export class Mino {
    sender: typeof IpcMainInvokeEvent.sender;

    field: Field;

    //基準ブロックの絶対座標(内部座標)
    x = 5;
    y = DRAW_FIELD_TOP + 1;
    idxMino: MINO_IDX;
    angle = 0;
    blockPos: blocks = [];
    lastSRS: number;

    constructor(field: Field, idxMino: MINO_IDX, sender: typeof IpcMainInvokeEvent.sender) {
        // console.log("mino constructor start.");
        this.sender = sender;
        this.idxMino = idxMino;
        this.field = field;
        for (const minoPos of MINO_POS[idxMino][this.angle % 4]) {
            const x = minoPos[0] + this.x;
            const y = minoPos[1] + this.y;
            if (this.field.isFilled({ x: x, y: y })) {
                for (const minoPos of MINO_POS[idxMino][this.angle % 4]) {
                    console.log("gameover");
                    console.log(minoPos[0] + this.x, minoPos[1] + this.y);
                }
                console.log("out:", x + this.x, y + this.y);
                return;
            }
            this.blockPos.push({ x: minoPos[0], y: minoPos[1] });
        }
        this.drawMino();
        // console.log("mino constructor end.");
    }

    clearMino() {
        this.blockPos.forEach((block) => {
            this.sender.send(
                "drawBlock",
                { x: this.x + block.x, y: this.y + block.y - DRAW_FIELD_TOP },
                BACKGROUND_COLOR
            );
        });
    }

    drawMino() {
        this.blockPos.forEach((block) => {
            this.sender.send(
                "drawBlock",
                { x: this.x + block.x, y: this.y + block.y - DRAW_FIELD_TOP },
                MINO_COLORS[this.idxMino]
            );
        });
    }

    /**
     * ゴーストのy座標を返す
     * @param x 指定したx座標のゴーストを返す デフォルトでは現在地
     * */
    getGhostY(x = this.x): number {
        for (let i = 1; INIT_FIELD.length; i++) {
            for (const block of this.blockPos) {
                if (this.field.isFilled({ x: x + block.x, y: this.y + block.y + i })) {
                    return this.y + i - 1; // ぶつかる1つ手前がゴーストの位置
                }
            }
        }
        return -1; // error
    }

    /**
     * ゴーストを描画する
     * 別途現在地にも描画しないと上書きされる
     */
    drawGhostMino() {
        this.blockPos.forEach((block) => {
            this.sender.send(
                "drawBlock",
                { x: this.x + block.x, y: this.getGhostY() + block.y - DRAW_FIELD_TOP },
                GHOST_COLORS[this.idxMino]
            );
        });
    }

    drawHoldMino() {
        // console.log("drawHoldMino");
        this.sender.send("clearHoldContext");
        this.blockPos.forEach((block) => {
            this.sender.send("drawHoldBlock", block, MINO_COLORS[this.idxMino]);
        });
    }

    /**
     * ミノを移動させる
     * 座標は 1/BLOCK_SIZE
     * @return {bool} true:移動可(移動済) false:移動不可
     */
    moveMino(dif: position): boolean {
        const toX = this.x + dif.x;
        const toY = this.y + dif.y;
        // 移動前のブロックの座標を格納([[x,y],[x,y],[x,y],[x,y]])
        let blockPos: blocks = [];

        for (let i = 0; i < 4; i++) {
            // 移動先の検証
            if (this.field.isFilled({ x: toX + this.blockPos[i].x, y: toY + this.blockPos[i].y })) {
                return false;
            }
            // ブロックの座標を格納(send用)
            blockPos.push(Object.assign({}, this.blockPos[i]));
        }

        const preX = this.x;
        const preY = this.y;
        const preGhostY = this.getGhostY();
        this.x = toX;
        this.y = toY;

        this.sender.send(
            "reDrawMino",
            blockPos,
            { x: preX, y: preY - DRAW_FIELD_TOP },
            { x: preX, y: preGhostY - DRAW_FIELD_TOP },
            blockPos,
            { x: this.x, y: this.y - DRAW_FIELD_TOP },
            { x: this.x, y: this.getGhostY() - DRAW_FIELD_TOP },
            this.idxMino
        );

        return true;
    }

    /**
     * ミノを回転させる
     * @param dif この値だけ右回転する 負なら左回転
     * @return {bool} true:移動可(移動済) false:移動不可
     */
    rotateMino(dif = 1): boolean {
        // 回転後の block.x,y を格納([x,y],[x,y],[x,y],[x,y])
        let postBlockPos: blocks = [];
        // SRSにより移動する座標(x,y)
        let move: position = { x: 0, y: 0 };

        while (this.angle <= 0) {
            // -1%4は3ではなく-1と出てしまうため、正の数にする
            this.angle += 4;
        }

        for (let i = 0; i < 4; i++) {
            // 基本回転
            postBlockPos.push({
                x: MINO_POS[this.idxMino][(this.angle + dif) % 4][i][0],
                y: MINO_POS[this.idxMino][(this.angle + dif) % 4][i][1],
            });
            // console.log("rotating x,y:" + (this.x + rotatedX[i]) + "," + (this.y + rotatedY[i]));
            // console.log("x:" + rotatedX + "y:" + rotatedY);
        }

        if (!this.canRotate(dif, postBlockPos, move)) {
            // 回転不可
            return false;
        }

        // 移動前のブロックの座標を格納([[x,y],[x,y],[x,y],[x,y]])
        let preBlockPos: blocks = [];
        this.blockPos.forEach((block) => {
            // 移動前の座標を格納しておく
            preBlockPos.push(Object.assign({}, block));
        });

        // 回転前の座標を格納しておく
        const preX = this.x;
        const preY = this.y;
        const preGhostY = this.getGhostY();

        // 回転処理を反映
        this.angle += dif;
        this.x += move.x;
        this.y += move.y;
        postBlockPos.forEach((pos, i) => {
            // this.blocks[i].x = pos[0];
            // this.blocks[i].y = pos[1];
            this.blockPos[i] = Object.assign({}, pos);
        });

        this.sender.send(
            "reDrawMino",
            preBlockPos,
            { x: preX, y: preY - DRAW_FIELD_TOP },
            { x: preX, y: preGhostY - DRAW_FIELD_TOP },
            postBlockPos,
            { x: this.x, y: this.y - DRAW_FIELD_TOP },
            { x: this.x, y: this.getGhostY() - DRAW_FIELD_TOP },
            this.idxMino
        );

        return true;
    }

    /**
     *  returnが使いたいので別関数に分けた
     * @returns {bool} true:移動可 false:移動不可
     */
    canRotate(dif: number, postBlockPos: blocks, move: position): boolean {
        let wallKickData: number[][][][];

        for (let i = 0; i < 4; i++) {
            // 基本回転の検証
            if (
                this.field.isFilled({
                    x: this.x + postBlockPos[i].x,
                    y: this.y + postBlockPos[i].y,
                })
            ) {
                // 埋まっているブロックがあればSRSを試す
                break;
            }
            if (i === 3) {
                // 埋まってなければ回転可能
                return true;
            }
        }

        if (this.idxMino === MINO_IDX.O_MINO) return false; // OミノにSRSは存在しない
        if (this.idxMino === MINO_IDX.I_MINO)
            wallKickData = SRS_I; // Iミノは独自のSRS判定を使用する
        else wallKickData = SRS_TLJSZ;

        for (let i = 0; i < 4; i++) {
            // SRSの動作
            move.x = wallKickData[this.angle % 4][(this.angle + dif) % 4][i][0];
            move.y = wallKickData[this.angle % 4][(this.angle + dif) % 4][i][1];
            // console.log("moved:" + move);
            for (let j = 0; j < 4; j++) {
                // 移動先の検証
                if (
                    this.field.isFilled({
                        x: this.x + postBlockPos[j].x + move.x,
                        y: this.y + postBlockPos[j].y + move.y,
                    })
                ) {
                    // console.log("braek:" + i);
                    // console.log((this.x + postBlockPos[0][j] + move[0]) + "," + (this.y + postBlockPos[1][j] + move[1]))
                    break;
                }
                if (j === 3) {
                    // console.log("move:" + i);
                    // if (this.idxMino === T_MINO) {
                    //     console.log("T-spin");
                    // }
                    this.lastSRS = i;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * ミノを接地する。
     * 接地の可不の判定等は無いので注意
     */
    setMino() {
        this.blockPos.forEach((block) => {
            this.field.setBlock({ x: this.x + block.x, y: this.y + block.y });
        });
    }

    /**
     * 基準ブロックを中心とした3*3の四隅のうち、三か所以上埋まっているとTspin
     * miniの判定：
     * ・T-Spinの条件を満たしていること。
     * ・SRSにおける回転補正の4番目(SRS_DATA[3])でないこと。
     * ・ミノ固定時のＴミノ4隅のうち、凸側の2つのうちどちらかが空いていること。
     * 参考：https://tetris-matome.com/judgment/
     * @returns 1:Tspin, 2:Tspin mini
     */
    getModeTspin(): number {
        if (this.idxMino !== MINO_IDX.T_MINO) return 0;

        let filled_count = 0;
        if (this.field.isFilled({ x: this.x + 1, y: this.y + 1 })) filled_count += 1;
        if (this.field.isFilled({ x: this.x + 1, y: this.y - 1 })) filled_count += 1;
        if (this.field.isFilled({ x: this.x - 1, y: this.y + 1 })) filled_count += 1;
        if (this.field.isFilled({ x: this.x - 1, y: this.y - 1 })) filled_count += 1;
        if (filled_count < 3) return 0;

        if (this.lastSRS === 3) return 1;
        // console.log("miniかも");

        // console.log("angle:" + (this.angle % 4));

        //prettier-ignore
        const TSM_POS = [
            [[1, -1], [-1, -1]],
            [[1, 1], [1, -1]],
            [[1, -1], [1, 1]],
            [[-1, -1], [1, -1]]
        ];
        const [x1, x2] = TSM_POS[this.angle % 4][0];
        const [y1, y2] = TSM_POS[this.angle % 4][1];
        if (!this.field.isFilled({ x: this.x + x1, y: this.y + y1 })) {
            // console.log("(x, y) = (" + (this.x + x1) + ", " + (this.y + y1) + ")");
            return 2;
        }
        if (!this.field.isFilled({ x: this.x + x2, y: this.y + y2 })) {
            // console.log("(x, y) = (" + (this.x + x1) + ", " + (this.y + y2) + ")");
            return 2;
        }

        return 1;
    }
}

module.exports = Mino;
