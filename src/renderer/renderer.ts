// ---------- 型宣言 ----------
type PlayerInfo = {
    readonly idx: number;
    canvasField?: HTMLCanvasElement;
    canvasHold?: HTMLCanvasElement;
    canvasNext?: HTMLCanvasElement;
    canvasFieldContext?: CanvasRenderingContext2D;
    canvasHoldContext?: CanvasRenderingContext2D;
    canvasNextContext?: CanvasRenderingContext2D;
    labelScore?: HTMLLabelElement;
    labelRen?: HTMLLabelElement;
};

type ElementIdList = [string, string, string, string, string];
// ---------- 型宣言終わり ----------

// ---------- wetris開始処理 ----------
const playerList: PlayerInfo[] = [];
const player: PlayerInfo = { idx: 0 };
const cpu: PlayerInfo = { idx: 1 }

const PlayerIdList: ElementIdList = ["canvasPlayerField", "canvasPlayerHold", "canvasPlayerNext", "labelPlayerScore", "labelPlayerRen"];
const CpuIdList: ElementIdList = ["canvasCpuField", "canvasCpuHold", "canvasCpuNext", "labelCpuScore", "labelCpuRen"];

let keyMap: KeyMap;

/**
 * getElement
 * @description PlayerInfoにHTML要素を格納する
 * @returns void
 * @param playerInfo
 * @param idList
 */
function getElement(playerInfo: PlayerInfo, idList: ElementIdList) {
    playerInfo.canvasField = document.getElementById(idList[0]) as HTMLCanvasElement;
    playerInfo.canvasHold = document.getElementById(idList[1]) as HTMLCanvasElement;
    playerInfo.canvasNext = document.getElementById(idList[2]) as HTMLCanvasElement;
    playerInfo.canvasFieldContext = (document.getElementById(idList[0]) as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
    playerInfo.canvasHoldContext = (document.getElementById(idList[1]) as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
    playerInfo.canvasNextContext = (document.getElementById(idList[2]) as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
    playerInfo.labelScore = document.getElementById(idList[3]) as HTMLLabelElement;
    playerInfo.labelRen = document.getElementById(idList[4]) as HTMLLabelElement;
}

(async function constructor() {
    console.log("renderer started.");
    keyMap = (await electronAPI.getConfig()).keyMap;

    const path = window.location.pathname;
    if (path.includes("wetris.html")) {
        console.log("this is wetris.html");

        getElement(player, PlayerIdList);
        wetris.start(player.idx);
        playerList[player.idx] = player;
    }
    else if (path.includes("cpu.html")) {
        console.log("this is cpu.html");

        getElement(player, PlayerIdList);
        wetris.start(player.idx);
        playerList[player.idx] = player;

        getElement(cpu, CpuIdList);
        wetris.start(cpu.idx);
        wetris.startCpu(cpu.idx);
        playerList[cpu.idx] = cpu;
    }
})();
// ---------- wetris開始処理終わり ----------

// ---------- イベント処理 ----------
window.addEventListener("beforeunload", (_event) => {
    playerList.forEach(player => wetris.stop(player.idx));
});
// ---------- イベント処理終わり ----------

// ---------- キー入力受付 ----------

// Record<keycode, value>
const idInterval: Record<string, NodeJS.Timeout> = {};
const isKeyDown: Record<string, boolean> = {};

document.onkeydown = async (event) => {
    // console.log("down:" + event.code);

    // 押下中ならreturn
    if (isKeyDown[event.code]) return;

    // 処理を実行
    isKeyDown[event.code] = true;
    keyEvent(event);
    await new Promise((resolve) => setTimeout(resolve, DAS));

    // ハードドロップは長押しでもループ実行しないのでreturn
    if (event.code === keyMap.hardDrop) return;

    // 既に離されていたらreturn
    if (!isKeyDown[event.code]) return;

    // 既にsetIntervalが動いていたらreturn
    if (idInterval[event.code] !== undefined) return;

    // 33ms毎にループ実行する、非同期
    idInterval[event.code] = setInterval(() => {
        keyEvent(event);
    }, ARR);
};

document.onkeyup = (event) => {
    // ループを止める
    clearInterval(idInterval[event.code]);
    idInterval[event.code] = undefined;
    isKeyDown[event.code] = false;
    // console.log("up:" + event.code);
};

/**
 * keyEvent
 * @description キー入力に対する処理を行う
 * @returns void
 * @param event
 */
function keyEvent(event: KeyboardEvent) {
    // KeyMapと関数の対応
    // KeyMapはconstructorで取得
    const actions = {
        [keyMap.moveLeft]: () => wetris.moveLeft(player.idx),
        [keyMap.moveRight]: () => wetris.moveRight(player.idx),
        [keyMap.softDrop]: () => wetris.softDrop(player.idx),
        [keyMap.hardDrop]: () => wetris.hardDrop(player.idx),
        [keyMap.rotateLeft]: () => wetris.rotateLeft(player.idx),
        [keyMap.rotateRight]: () => wetris.rotateRight(player.idx),
        [keyMap.hold]: () => wetris.hold(player.idx),
    };

    const action = actions[event.code];
    if (action) {
        action();
    }
    else {
        console.log("unknown key");
    }
}

// ---------- キー入力受付終わり ----------

// ---------- 描画処理 ----------
/**
 * @description スコアを反映
 * @param {number} idx
 * @param {string} score
 */
function setLabelScore(idx: number, score: string) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on setLabelScore\nidx : ${idx}`);
    }
    playerList[idx].labelScore.innerText = score;
}

ipcRenderer.on("setLabelScore", setLabelScore);

/**
 * @description renを反映
 * @param {number} idx
 * @param {string} ren
 */
function setLabelRen(idx: number, ren: string) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on setLabelRen\nidx : ${idx}`);
    }
    playerList[idx].labelRen.innerText = ren;
}

ipcRenderer.on("setLabelRen", setLabelRen);

/**
 * @description フィールドの描画エリアを初期化
 * @param {number} idx
 */
function clearFieldContext(idx: number) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on clearFieldContext\nidx : ${idx}`);
    }
    console.log("clearFieldContext");
    drawField(idx, INIT_FIELD);

    playerList[idx].canvasFieldContext.fillStyle = FRAME_COLOR;
    playerList[idx].canvasFieldContext.fillRect(0, 0, BLOCK_SIZE, FIELD_CANVAS_SIZE[3]);
    playerList[idx].canvasFieldContext.fillRect(
        FIELD_CANVAS_SIZE[2] - BLOCK_SIZE,
        0,
        BLOCK_SIZE,
        FIELD_CANVAS_SIZE[3]
    );
    playerList[idx].canvasFieldContext.fillRect(
        0,
        FIELD_CANVAS_SIZE[3] - BLOCK_SIZE,
        FIELD_CANVAS_SIZE[2],
        BLOCK_SIZE
    );
    // 行っているのは以下と同等の操作
    // playerList[idx].canvasFieldContext.fillRect(0, 0, 20, 420);
    // playerList[idx].canvasFieldContext.fillRect(220, 0, 20, 420);
    // playerList[idx].canvasFieldContext.fillRect(0, 400, 220, 20);
}

ipcRenderer.on("clearFieldContext", clearFieldContext);

/**
 * @description ホールドの描画エリアを初期化
 * @param {number} idx
 */
function clearHoldContext(idx: number) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on clearHoldContext\nidx : ${idx}`);
    }
    console.log("clearHoldContext");
    playerList[idx].canvasHoldContext.fillStyle = BACKGROUND_COLOR;
    playerList[idx].canvasHoldContext.fillRect(...(HOLD_CANVAS_SIZE as [number, number, number, number]));
}

ipcRenderer.on("clearHoldContext", clearHoldContext);

/**
 * @description ネクストの描画エリアを初期化
 * @param {number} idx
 */
function clearNextContext(idx: number) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on clearNextContext\nidx : ${idx}`);
    }
    playerList[idx].canvasNextContext.fillStyle = BACKGROUND_COLOR;
    playerList[idx].canvasNextContext.fillRect(...(NEXT_CANVAS_SIZE as [number, number, number, number]));
}

ipcRenderer.on("clearNextContext", clearNextContext);

/**
 * @description 1ブロック描画
 * @param {number} idx
 * @param {Position} block
 * @param {string} color
 */
function drawBlock(idx: number, block: Position, color: string) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on drawBlock\nidx : ${idx}`);
    }
    // console.log("draw block");
    // console.log("x:" + x + ",y:" + y + ",color:" + color);
    playerList[idx].canvasFieldContext.fillStyle = color;
    playerList[idx].canvasFieldContext.fillRect(
        block.x * BLOCK_SIZE,
        block.y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

ipcRenderer.on("drawBlock", drawBlock);

/**
 * @description ミノを描画
 * @param {number} idx
 * @param {Position} minoPos
 * @param {Position[]} blocks
 * @param {string} color
 */
function drawMino(idx: number, minoPos: Position, blocks: Position[], color: string) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on drawMino\nidx : ${idx}`);
    }
    console.log("draw mino");
    for (const block of blocks) {
        drawBlock(idx, { x: minoPos.x + block.x, y: minoPos.y + block.y }, color);
    }
}

ipcRenderer.on("drawMino", drawMino);

/**
 * @description 描画済ミノを消し、新しい座標に描画しなおす
 * メインプロセスから起動するとラグでチカチカするのでこちらで処理
 * @param {number} idx
 * @param {Position[]} preBlockPos
 * @param {Position} preMinoPos
 * @param {Position} preGhostPos
 * @param {Position[]} postBlockPos
 * @param {Position} postMinoPos
 * @param {Position} postGhostPos
 * @param {number} idxMino
 */
function reDrawMino(idx: number,
                    preBlockPos: Position[],
                    preMinoPos: Position,
                    preGhostPos: Position,
                    postBlockPos: Position[],
                    postMinoPos: Position,
                    postGhostPos: Position,
                    idxMino: number
) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on reDrawMino\nidx : ${idx}`);
    }
    console.log("move");
    for (const pos of preBlockPos) {
        drawBlock(idx, { x: preGhostPos.x + pos.x, y: preGhostPos.y + pos.y }, BACKGROUND_COLOR);
        drawBlock(idx, { x: preMinoPos.x + pos.x, y: preMinoPos.y + pos.y }, BACKGROUND_COLOR);
    }
    for (const pos of postBlockPos) {
        drawBlock(
            idx, { x: postGhostPos.x + pos.x, y: postGhostPos.y + pos.y },
            GHOST_COLORS[idxMino]
        );
        drawBlock(idx, { x: postMinoPos.x + pos.x, y: postMinoPos.y + pos.y }, MINO_COLORS[idxMino]);
    }
}

ipcRenderer.on("reDrawMino", reDrawMino);

/**
 * @description ネクストの描画エリアにミノを描画
 * @param {number} idx
 * @param {Position} block
 * @param {string} color
 */
function drawNextBlock(idx: number, block: Position, color: string) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on drawNextBlock\nidx : ${idx}`);
    }
    playerList[idx].canvasNextContext.fillStyle = color;
    playerList[idx].canvasNextContext.fillRect(
        block.x * BLOCK_SIZE,
        block.y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

ipcRenderer.on("drawNextBlock", drawNextBlock);

/**
 * @description ホールドの描画エリアにミノを描画
 * @param {number} idx
 * @param {Position} block
 * @param {string} color
 */
function drawHoldBlock(idx: number, block: Position, color: string) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on drawHoldBlock\nidx : ${idx}`);
    }
    // console.log("draw hold block");
    // console.log("x:" + x + ",y:" + y + ",color:" + color);
    playerList[idx].canvasHoldContext.fillStyle = color;
    playerList[idx].canvasHoldContext.fillRect(
        (1 + block.x) * BLOCK_SIZE,
        (1 + block.y) * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

ipcRenderer.on("drawHoldBlock", drawHoldBlock);

/**
 * @description 指定されたフィールドを描画
 * @param {number} idx
 * @param {number[][]} field
 */
function drawField(idx: number, field: number[][]) {
    if (playerList[idx] === undefined) {
        throw new Error(`playerList[idxWetris] is undefined on drawField\nidx : ${idx}`);
    }
    console.log("draw field");
    // console.log("i:" + this.field.length);
    // console.log("j:" + this.field[0].length);
    for (let i = DRAW_FIELD_TOP; i < DRAW_FIELD_HEIGHT + DRAW_FIELD_TOP; i++) {
        // console.log(this.field[i])
        for (let j = DRAW_FIELD_LEFT; j < DRAW_FIELD_LEFT + DRAW_FIELD_WIDTH; j++) {
            if (field[i][j]) {
                playerList[idx].canvasFieldContext.fillStyle = PLACED_MINO_COLOR;
            }
            else {
                playerList[idx].canvasFieldContext.fillStyle = BACKGROUND_COLOR;
            }
            playerList[idx].canvasFieldContext.fillRect(
                j * BLOCK_SIZE,
                (i - DRAW_FIELD_TOP) * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
            // console.log("draw:" + i + "," + j);
        }
    }
}

ipcRenderer.on("drawField", drawField);
// ---------- 描画処理終わり ----------
