import { DRAW_FIELD_TOP, INIT_FIELD, MINO_IDX, MINO_POS, SRS_I, SRS_TLJSZ, } from "./constant";
import { FieldCore } from "./FieldCore";

export class MinoCore {
    public field: FieldCore;

    //基準ブロックの絶対座標(内部座標)
    public pos: position = { x: 5, y: DRAW_FIELD_TOP + 1 };
    public blocksPos = () => MINO_POS[this.idxMino][this.angle % 4];

    public idxMino: MINO_IDX;
    public angle = 0;
    public lastSRS: number;

    public isGameOver = false;


    constructor(field: FieldCore, idxMino: MINO_IDX) {
        // task("mino constructor start.");
        this.idxMino = idxMino;
        this.field = field;
        // debug("idxMino:" + idxMino);
        // debug("angle:" + this.angle);
        for (const blockPos of this.blocksPos()) {
            // const x = blockPos.x + this.pos.x;
            // const y = blockPos.y + this.pos.y;
            const pos = { x: this.pos.x + blockPos.x, y: this.pos.y + blockPos.y };
            if (this.field.isFilled(pos)) {
                // for (const blockPos of MINO_POS[idxMino][this.angle % 4]) {
                //     debug(blockPos.x + this.pos.x, blockPos.y + this.pos.y);
                // }
                // info("game over");
                // info(`out:${x + this.pos.x}, ${y + this.pos.y}`);
                this.isGameOver = true;
            }
        }
        // if (this.isGameOver) return;
        // task("mino constructor end.");
    }

    /**
     * ミノを移動させる
     * 座標は 1/BLOCK_SIZE
     * @return {boolean} true:移動可(移動済) false:移動不可
     */
    public moveMino(dif: position): boolean {
        // const toX = this.pos.x + dif.x;
        // const toY = this.pos.y + dif.y;
        const toPos: position = { x: this.pos.x + dif.x, y: this.pos.y + dif.y };

        for (let i = 0; i < 4; i++) {
            // 移動先の検証
            const pos: position = {
                x: toPos.x + this.blocksPos()[i].x,
                y: toPos.y + this.blocksPos()[i].y,
            };
            if (this.field.isFilled(pos)) {
                return false;
            }
        }
        this.pos = toPos;

        // info("moved");
        return true;
    }

    /**
     * ミノを回転させる
     * @param dif この値だけ右回転する 負なら左回転
     * @return {boolean} true:移動可(移動済) false:移動不可
     */
    public rotateMino(dif = 1): boolean {
        // 回転後の block.x,y を格納([x,y],[x,y],[x,y],[x,y])
        let postBlockPos: position[] = [];
        // SRSにより移動する座標(x,y)
        let move: position = { x: 0, y: 0 };

        while (this.angle <= 0) {
            // -1%4は3ではなく-1と出てしまうため、正の数にする
            this.angle += 4;
        }

        for (let i = 0; i < 4; i++) {
            // 基本回転
            postBlockPos.push({
                x: MINO_POS[this.idxMino][(this.angle + dif) % 4][i].x,
                y: MINO_POS[this.idxMino][(this.angle + dif) % 4][i].y,
            });
            // debug("rotating x,y:" + (this.pos.x + rotatedX[i]) + "," + (this.pos.y + rotatedY[i]));
            // debug("x:" + rotatedX + "y:" + rotatedY);
        }

        if (!this.canRotate(dif, postBlockPos, move)) {
            // 回転不可
            return false;
        }

        // 回転処理を反映
        this.angle += dif;
        this.pos.x += move.x;
        this.pos.y += move.y;

        // info("rotated");
        return true;
    }

    /**
     *  returnが使いたいので別関数に分けた
     * @returns {boolean} true:移動可 false:移動不可
     */
    private canRotate(dif: number, postBlockPos: position[], move: position): boolean {
        let wallKickData: position[][][];

        for (let i = 0; i < 4; i++) {
            // 基本回転の検証
            if (
                this.field.isFilled({
                    x: this.pos.x + postBlockPos[i].x,
                    y: this.pos.y + postBlockPos[i].y,
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
            move.x = wallKickData[this.angle % 4][(this.angle + dif) % 4][i].x;
            move.y = wallKickData[this.angle % 4][(this.angle + dif) % 4][i].y;
            // debug("moved:" + move);
            for (let j = 0; j < 4; j++) {
                // 移動先の検証
                if (
                    this.field.isFilled({
                        x: this.pos.x + postBlockPos[j].x + move.x,
                        y: this.pos.y + postBlockPos[j].y + move.y,
                    })
                ) {
                    // debug("break:" + i);
                    // debug((this.pos.x + postBlockPos[0][j] + move[0]) + "," + (this.pos.y + postBlockPos[1][j] + move[1]))
                    break;
                }
                if (j === 3) {
                    // debug("move:" + i);
                    // if (this.idxMino === T_MINO) {
                    //     info("T-spin");
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
    public setMino() {
        for (const blockPos of this.blocksPos()) {
            this.field.setBlock({
                x: this.pos.x + blockPos.x,
                y: this.pos.y + blockPos.y,
            });
        }
        // info("set");
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

    public getModeTspin(): number {
        if (this.idxMino !== MINO_IDX.T_MINO) return 0;

        let filled_count = 0;
        if (this.field.isFilled({ x: this.pos.x + 1, y: this.pos.y + 1 })) filled_count += 1;
        if (this.field.isFilled({ x: this.pos.x + 1, y: this.pos.y - 1 })) filled_count += 1;
        if (this.field.isFilled({ x: this.pos.x - 1, y: this.pos.y + 1 })) filled_count += 1;
        if (this.field.isFilled({ x: this.pos.x - 1, y: this.pos.y - 1 })) filled_count += 1;
        if (filled_count < 3) return 0;

        if (this.lastSRS === 3) return 1;
        // debug("miniかも");

        // debug("angle:" + (this.angle % 4));

        //prettier-ignore
        const TSM_POS = [
            [[1, -1], [-1, -1]],
            [[1, 1], [1, -1]],
            [[1, -1], [1, 1]],
            [[-1, -1], [1, -1]]
        ];
        const [x1, x2] = TSM_POS[this.angle % 4][0];
        const [y1, y2] = TSM_POS[this.angle % 4][1];
        if (!this.field.isFilled({ x: this.pos.x + x1, y: this.pos.y + y1 })) {
            // debug("(x, y) = (" + (this.pos.x + x1) + ", " + (this.pos.y + y1) + ")");
            return 2;
        }
        if (!this.field.isFilled({ x: this.pos.x + x2, y: this.pos.y + y2 })) {
            // debug("(x, y) = (" + (this.pos.x + x1) + ", " + (this.pos.y + y2) + ")");
            return 2;
        }

        return 1;
    }

    /**
     * ゴーストのy座標を返す
     * @param x 指定したx座標のゴーストを返す デフォルトでは現在地
     * */
    public getGhostY(x = this.pos.x): number {
        for (let i = 1; INIT_FIELD.length; i++) {
            for (const block of this.blocksPos()) {
                if (
                    this.field.isFilled({
                        x: x + block.x,
                        y: this.pos.y + block.y + i,
                    })
                ) {
                    return this.pos.y + i - 1; // ぶつかる1つ手前がゴーストの位置
                }
            }
        }
        throw new Error("ghostY not found");
    }
}
