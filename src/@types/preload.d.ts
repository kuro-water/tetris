declare const electronAPI: any;

declare class wetris {
    static start(): Promise<number>;
    static startCpu(idx: number): null;
    static stop(idx: number): null;
    static moveLeft(idx: number): null;
    static moveRight(idx: number): null;
    static hardDrop(idx: number): null;
    static softDrop(idx: number): null;
    static rotateLeft(idx: number): null;
    static rotateRight(idx: number): null;
    static hold(idx: number): null;
    static getField(idx: number): Promise<number[][]>;
}

type position = {
    x: nunber;
    y: number;
};
type blocks = position[]; // [[x, y], [x, y], ...]
// [position, position, position, position]
// としたほうが強制力は上がるが、
// a = []として後でpushする方法が使えなくなる

declare class Wetris_ {
    static sender: typeof IpcMainInvokeEvent.sender;

    static currentMino: Mino_;
    static nextMinos: MINO_IDX[] = [];
    static afterNextMinos: MINO_IDX[] = [];
    static holdMino: MINO_IDX;

    static field: Field_;

    static isLocking = false;
    static latestTime: number;

    static readJson: Function;
    // Record<key, value>
    static keyMap: Record<string, string> = {};
    static idInterval: Record<string, NodeJS.Timeout> = {};
    static isKeyDown: Record<string, boolean> = {};
    static isUsedHold = false;
    static countKSKS = 0;

    static score = 0;
    static ren = 0;
    static modeTspin = 0;
    static isBtB = false;

    static isMainloopActive: boolean;

    static lines = 0; // debug

    constructor(sender: typeof IpcMainInvokeEvent.sender);

    /**
     *  よくわからんけどスリープできるようになる。Promiseてなんやねん
     * @param waitTime  ms
     * @return Promise
     */
    static sleep(waitTime: number);

    static clearFieldContext();

    static clearHoldContext();

    static clearNextContext();

    static getConfig = async () => {};

    static mainloop = async () => {};

    static drawField();

    static makeNewMino = async () => {};

    static getTurn(): MINO_IDX[];

    static drawNext();

    /**
     * カサカサの処理
     * @return true:接地した false:接地していない
     */
    static checkKSKS(): boolean;

    /**
     * 接地硬直の処理
     */
    static lockDown();

    static set = async () => {};

    /**
     * 基礎得点 ： line*100 + 10*(ren+2)^2+60
     * T-spin   ： line*1000
     * Wetris   ： +2000
     * BtB      ： 1.5 * (基礎得点+T-spin+Wetris)
     * PC       ： +4000
     */
    static addScore(lines: number, ren: number, modeTspin: number, isBtB: boolean);

    static move(dif: position): boolean;
    static moveLeft(): boolean;
    static moveRight(): boolean;

    static rotate(angle: number): boolean;

    static rotateLeft(): boolean;

    static rotateRight(): boolean;

    /**
     *
     * @returns true:接地した false:接地していない
     */
    static softDrop(): boolean;

    static hardDrop();

    static hold();

    sender: typeof IpcMainInvokeEvent.sender;

    currentMino: Mino_;
    nextMinos: MINO_IDX[] = [];
    afterNextMinos: MINO_IDX[] = [];
    holdMino: MINO_IDX;

    field: Field_;

    isLocking = false;
    latestTime: number;

    readJson: Function;
    // Record<key, value>
    keyMap: Record<string, string> = {};
    idInterval: Record<string, NodeJS.Timeout> = {};
    isKeyDown: Record<string, boolean> = {};
    isUsedHold = false;
    countKSKS = 0;

    score = 0;
    ren = 0;
    modeTspin = 0;
    isBtB = false;

    isMainloopActive: boolean;

    lines = 0; // debug

    /**
     *  よくわからんけどスリープできるようになる。Promiseてなんやねん
     * @param waitTime  ms
     * @return Promise
     */
    sleep(waitTime: number);

    clearFieldContext();

    clearHoldContext();

    clearNextContext();

    getConfig = async () => {};

    mainloop = async () => {};

    drawField();

    makeNewMino = async () => {};

    getTurn(): MINO_IDX[];

    drawNext();

    /**
     * カサカサの処理
     * @return true:接地した false:接地していない
     */
    checkKSKS(): boolean;

    /**
     * 接地硬直の処理
     */
    lockDown();

    set = async () => {};

    /**
     * 基礎得点 ： line*100 + 10*(ren+2)^2+60
     * T-spin   ： line*1000
     * Wetris   ： +2000
     * BtB      ： 1.5 * (基礎得点+T-spin+Wetris)
     * PC       ： +4000
     */
    addScore(lines: number, ren: number, modeTspin: number, isBtB: boolean);

    move(dif: position): boolean;
    moveLeft(): boolean;
    moveRight(): boolean;

    rotate(angle: number): boolean;

    rotateLeft(): boolean;

    rotateRight(): boolean;

    /**
     *
     * @returns true:接地した false:接地していない
     */
    softDrop(): boolean;

    hardDrop();

    hold();
}

declare class Mino_ {
    static sender: typeof IpcMainInvokeEvent.sender;

    static field: Field_;

    //基準ブロックの絶対座標(内部座標)
    static x = 5;
    static y = DRAW_FIELD_TOP + 1;
    static idxMino: MINO_IDX;
    static angle = 0;
    static lastSRS: number;
    static blockPos = () => MINO_POS[this.idxMino][this.angle % 4];

    static isGameOver = false;

    constructor(field: Field_, idxMino: MINO_IDX, sender: typeof IpcMainInvokeEvent.sender);

    static clearMino();

    static drawMino();

    /**
     * ゴーストのy座標を返す
     * @param x 指定したx座標のゴーストを返す デフォルトでは現在地
     * */
    static getGhostY(x = this.x): number;

    /**
     * ゴーストを描画する
     * 別途現在地にも描画しないと上書きされる
     */
    static drawGhostMino();

    static drawHoldMino();

    /**
     * ミノを移動させる
     * 座標は 1/BLOCK_SIZE
     * @return {bool} true:移動可(移動済) false:移動不可
     */
    static moveMino(dif: position): boolean;

    /**
     * ミノを回転させる
     * @param dif この値だけ右回転する 負なら左回転
     * @return {bool} true:移動可(移動済) false:移動不可
     */
    static rotateMino(dif = 1): boolean;

    /**
     *  returnが使いたいので別関数に分けた
     * @returns {bool} true:移動可 false:移動不可
     */
    static canRotate(dif: number, postBlockPos: blocks, move: position): boolean;
    /**
     * ミノを接地する。
     * 接地の可不の判定等は無いので注意
     */
    static setMino();

    /**
     * 基準ブロックを中心とした3*3の四隅のうち、三か所以上埋まっているとTspin
     * miniの判定：
     * ・T-Spinの条件を満たしていること。
     * ・SRSにおける回転補正の4番目(SRS_DATA[3])でないこと。
     * ・ミノ固定時のＴミノ4隅のうち、凸側の2つのうちどちらかが空いていること。
     * 参考：https://tetris-matome.com/judgment/
     * @returns 1:Tspin, 2:Tspin mini
     */
    static getModeTspin(): number;

    sender: typeof IpcMainInvokeEvent.sender;

    field: Field_;

    //基準ブロックの絶対座標(内部座標)
    x = 5;
    y = DRAW_FIELD_TOP + 1;
    idxMino: MINO_IDX;
    angle = 0;
    lastSRS: number;
    blockPos = () => MINO_POS[this.idxMino][this.angle % 4];

    isGameOver = false;

    clearMino();

    drawMino();

    /**
     * ゴーストのy座標を返す
     * @param x 指定したx座標のゴーストを返す デフォルトでは現在地
     * */
    getGhostY(x = this.x): number;

    /**
     * ゴーストを描画する
     * 別途現在地にも描画しないと上書きされる
     */
    drawGhostMino();

    drawHoldMino();

    /**
     * ミノを移動させる
     * 座標は 1/BLOCK_SIZE
     * @return {bool} true:移動可(移動済) false:移動不可
     */
    moveMino(dif: position): boolean;

    /**
     * ミノを回転させる
     * @param dif この値だけ右回転する 負なら左回転
     * @return {bool} true:移動可(移動済) false:移動不可
     */
    rotateMino(dif = 1): boolean;

    /**
     *  returnが使いたいので別関数に分けた
     * @returns {bool} true:移動可 false:移動不可
     */
    canRotate(dif: number, postBlockPos: blocks, move: position): boolean;
    /**
     * ミノを接地する。
     * 接地の可不の判定等は無いので注意
     */
    setMino();

    /**
     * 基準ブロックを中心とした3*3の四隅のうち、三か所以上埋まっているとTspin
     * miniの判定：
     * ・T-Spinの条件を満たしていること。
     * ・SRSにおける回転補正の4番目(SRS_DATA[3])でないこと。
     * ・ミノ固定時のＴミノ4隅のうち、凸側の2つのうちどちらかが空いていること。
     * 参考：https://tetris-matome.com/judgment/
     * @returns 1:Tspin, 2:Tspin mini
     */
    getModeTspin(): number;
}

declare class Field_ {
    static field: number[][];

    constructor();

    /**
     * debug
     */
    static printField();

    /**
     * 指定した座標の真偽値を返す
     * @returns {boolean} true:すでに存在する
     */
    static isFilled(pos: position): boolean;

    static setBlock(pos: position);

    static removeBlock(pos: position);

    static isPerfectClear(): boolean;

    /**
     * 一列埋まっているラインがあれば消去し、下詰めする
     * @returns 消去したライン数
     */
    static clearLines(): number;

    static clone(): Field_;

    field: number[][];

    /**
     * debug
     */
    printField();

    /**
     * 指定した座標の真偽値を返す
     * @returns {boolean} true:すでに存在する
     */
    isFilled(pos: position): boolean;

    setBlock(pos: position);

    removeBlock(pos: position);

    isPerfectClear(): boolean;

    /**
     * 一列埋まっているラインがあれば消去し、下詰めする
     * @returns 消去したライン数
     */
    clearLines(): number;

    clone(): Field_;
}
