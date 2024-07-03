ipcRenderer.on("test", (arg1: string, arg2: string) => {
    console.log("received:" + arg1 + "," + arg2);
});

let idxWetris: number;

// let keyMap = {
//     moveLeft: "KeyA",
//     moveRight: "KeyD",
//     softDrop: "KeyS",
//     hardDrop: "KeyW",
//     rotateLeft: "ArrowLeft",
//     rotateRight: "ArrowRight",
//     hold: "ArrowUp",
// };
// let keyMap = {
//     moveLeft: "ArrowLeft",
//     moveRight: "ArrowRight",
//     softDrop: "ArrowDown",
//     hardDrop: "Space",
//     rotateLeft: "KeyZ",
//     rotateRight: "ArrowUp",
//     hold: "KeyV",
// };
let keyMap: KeyMap;

// Record<key, value>
let idInterval: Record<string, NodeJS.Timeout> = {};
let isKeyDown: Record<string, boolean> = {};

const CANVAS_FIELD = document.getElementById("canvasField") as HTMLCanvasElement;
const CANVAS_HOLD = document.getElementById("canvasHold") as HTMLCanvasElement;
const CANVAS_NEXT = document.getElementById("canvasNext") as HTMLCanvasElement;

const CANVAS_FIELD_CONTEXT = CANVAS_FIELD.getContext("2d") as CanvasRenderingContext2D;
const CANVAS_HOLD_CONTEXT = CANVAS_HOLD.getContext("2d") as CanvasRenderingContext2D;
const CANVAS_NEXT_CONTEXT = CANVAS_NEXT.getContext("2d") as CanvasRenderingContext2D;

const LABEL_SCORE = document.getElementById("labelScore") as HTMLLabelElement;
const LABEL_REN = document.getElementById("labelRen") as HTMLLabelElement;

(async function constructor() {
    console.log("renderer started.");

    const path = window.location.pathname;
    if (path.includes("cpu.html")) {
        console.log("this is cpu.html");
        await getConfig();
        idxWetris = await wetris.start();
        wetris.startCpu(idxWetris);
    } else if (path.includes("wetris.html")) {
        console.log("this is wetris.html");
        await getConfig();
        idxWetris = await wetris.start();
        // console.log(idxWetris);
    }
})();

window.addEventListener("beforeunload", (_event) => {
    wetris.stop(idxWetris);
});

/**
 *  よくわからんけどスリープできるようになる。Promiseてなんやねん
 * @param waitTime  ミリ秒
 * @return Promise
 */
function sleep(waitTime: number) {
    return new Promise((resolve) => setTimeout(resolve, waitTime));
}

async function getConfig() {
    const config = await electronAPI.getConfig();
    keyMap = config.keyMap;
    console.log("read:config");
}

document.onkeydown = async (event) => {
    // console.log("down:" + event.code);

    // 押下中ならreturn
    if (isKeyDown[event.code]) return;
    isKeyDown[event.code] = true;

    keyEvent(event);
    await sleep(DAS);

    // ハードドロップは長押し無効
    if (event.code === keyMap.hardDrop) return;

    // 離されていたらreturn
    if (!isKeyDown[event.code]) return;

    // 既にsetIntervalが動いていたらreturn
    if (idInterval[event.code] !== undefined) return;

    idInterval[event.code] = setInterval(() => {
        keyEvent(event);
    }, ARR); // 33ms毎にループ実行する、非同期
};

document.onkeyup = (event) => {
    clearInterval(idInterval[event.code]); // 変数の中身はただのIDであり、clearしないと止まらない
    idInterval[event.code] = undefined;
    isKeyDown[event.code] = false;
    // console.log("up:" + event.code);
};

function keyEvent(event: KeyboardEvent) {
    const actions = {
        [keyMap.moveLeft]: () => wetris.moveLeft(idxWetris),
        [keyMap.moveRight]: () => wetris.moveRight(idxWetris),
        [keyMap.softDrop]: () => wetris.softDrop(idxWetris),
        [keyMap.hardDrop]: () => wetris.hardDrop(idxWetris),
        [keyMap.rotateLeft]: () => wetris.rotateLeft(idxWetris),
        [keyMap.rotateRight]: () => wetris.rotateRight(idxWetris),
        [keyMap.hold]: () => wetris.hold(idxWetris),
    };

    const action = actions[event.code];
    if (action) {
        action();
    } else {
        console.log("unknown key");
    }
}

function setLabelScore(score: string) {
    LABEL_SCORE.innerText = score;
}

ipcRenderer.on("setLabelScore", setLabelScore);

function setLabelRen(ren: string) {
    LABEL_REN.innerText = ren;
}

ipcRenderer.on("setLabelRen", setLabelRen);

function clearFieldContext() {
    console.log("clearFieldContext");
    drawField(INIT_FIELD);

    CANVAS_FIELD_CONTEXT.fillStyle = FRAME_COLOR;
    CANVAS_FIELD_CONTEXT.fillRect(0, 0, BLOCK_SIZE, FIELD_CANVAS_SIZE[3]);
    CANVAS_FIELD_CONTEXT.fillRect(
        FIELD_CANVAS_SIZE[2] - BLOCK_SIZE,
        0,
        BLOCK_SIZE,
        FIELD_CANVAS_SIZE[3]
    );
    CANVAS_FIELD_CONTEXT.fillRect(
        0,
        FIELD_CANVAS_SIZE[3] - BLOCK_SIZE,
        FIELD_CANVAS_SIZE[2],
        BLOCK_SIZE
    );
    // 行っているのは以下と同等の操作
    // CANVAS_FIELD_CONTEXT.fillRect(0, 0, 20, 420);
    // CANVAS_FIELD_CONTEXT.fillRect(220, 0, 20, 420);
    // CANVAS_FIELD_CONTEXT.fillRect(0, 400, 220, 20);
}

ipcRenderer.on("clearFieldContext", clearFieldContext);

function clearHoldContext() {
    console.log("clearHoldContext");
    CANVAS_HOLD_CONTEXT.fillStyle = BACKGROUND_COLOR;
    CANVAS_HOLD_CONTEXT.fillRect(...(HOLD_CANVAS_SIZE as [number, number, number, number]));
}

ipcRenderer.on("clearHoldContext", clearHoldContext);

function clearNextContext() {
    CANVAS_NEXT_CONTEXT.fillStyle = BACKGROUND_COLOR;
    CANVAS_NEXT_CONTEXT.fillRect(...(NEXT_CANVAS_SIZE as [number, number, number, number]));
}

ipcRenderer.on("clearNextContext", clearNextContext);

function drawBlock(block: position, color: string) {
    // console.log("draw block");
    // console.log("x:" + x + ",y:" + y + ",color:" + color);
    CANVAS_FIELD_CONTEXT.fillStyle = color;
    CANVAS_FIELD_CONTEXT.fillRect(
        block.x * BLOCK_SIZE,
        block.y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

ipcRenderer.on("drawBlock", drawBlock);

function drawMino(minoPos: position, blocks: position[], color: string) {
    console.log("draw mino");
    for (const block of blocks) {
        drawBlock({ x: minoPos.x + block.x, y: minoPos.y + block.y }, color);
    }
}

ipcRenderer.on("drawMino", drawMino);

// メインプロセスから起動するとラグでチカチカするのでこちらで処理
ipcRenderer.on(
    "reDrawMino",
    (
        preBlockPos: position[],
        preMinoPos: position,
        preGhostPos: position,
        postBlockPos: position[],
        postMinoPos: position,
        postGhostPos: position,
        idxMino: number
    ) => {
        console.log("move");
        for (const pos of preBlockPos) {
            drawBlock({ x: preGhostPos.x + pos.x, y: preGhostPos.y + pos.y }, BACKGROUND_COLOR);
            drawBlock({ x: preMinoPos.x + pos.x, y: preMinoPos.y + pos.y }, BACKGROUND_COLOR);
        }
        for (const pos of postBlockPos) {
            drawBlock(
                { x: postGhostPos.x + pos.x, y: postGhostPos.y + pos.y },
                GHOST_COLORS[idxMino]
            );
            drawBlock({ x: postMinoPos.x + pos.x, y: postMinoPos.y + pos.y }, MINO_COLORS[idxMino]);
        }
    }
);

function drawNextBlock(block: position, color: string) {
    CANVAS_NEXT_CONTEXT.fillStyle = color;
    CANVAS_NEXT_CONTEXT.fillRect(
        block.x * BLOCK_SIZE,
        block.y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

ipcRenderer.on("drawNextBlock", drawNextBlock);

function drawHoldBlock(block: position, color: string) {
    // console.log("draw hold block");
    // console.log("x:" + x + ",y:" + y + ",color:" + color);
    CANVAS_HOLD_CONTEXT.fillStyle = color;
    CANVAS_HOLD_CONTEXT.fillRect(
        (1 + block.x) * BLOCK_SIZE,
        (1 + block.y) * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

ipcRenderer.on("drawHoldBlock", drawHoldBlock);

function drawField(field: number[][]) {
    console.log("draw field");
    // console.log("i:" + this.field.length);
    // console.log("j:" + this.field[0].length);
    for (let i = DRAW_FIELD_TOP; i < DRAW_FIELD_HEIGHT + DRAW_FIELD_TOP; i++) {
        // console.log(this.field[i])
        for (let j = DRAW_FIELD_LEFT; j < DRAW_FIELD_LEFT + DRAW_FIELD_WIDTH; j++) {
            if (field[i][j]) {
                CANVAS_FIELD_CONTEXT.fillStyle = PLACED_MINO_COLOR;
            } else {
                CANVAS_FIELD_CONTEXT.fillStyle = BACKGROUND_COLOR;
            }
            CANVAS_FIELD_CONTEXT.fillRect(
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
