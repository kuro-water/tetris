const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readJson: (jsonPath) => ipcRenderer.invoke('readJson', jsonPath),
    writeJson: (jsonPath, data) => ipcRenderer.invoke('writeJson', jsonPath, data),
});

const CONFIG_PATH = "\\config.json";
contextBridge.exposeInMainWorld('CONFIG_PATH', CONFIG_PATH);


const I_MINO = 0;
contextBridge.exposeInMainWorld('I_MINO', I_MINO);
const T_MINO = 1;
contextBridge.exposeInMainWorld('T_MINO', T_MINO);
const O_MINO = 2;
contextBridge.exposeInMainWorld('O_MINO', O_MINO);
const L_MINO = 3;
contextBridge.exposeInMainWorld('L_MINO', L_MINO);
const J_MINO = 4;
contextBridge.exposeInMainWorld('J_MINO', J_MINO);
const S_MINO = 5;
contextBridge.exposeInMainWorld('S_MINO', S_MINO);
const Z_MINO = 6;
contextBridge.exposeInMainWorld('Z_MINO', Z_MINO);

const INIT_FIELD = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
contextBridge.exposeInMainWorld('INIT_FIELD', INIT_FIELD);
// xを増やすと右、yを増やすと下になる
// 0が空白、1が壁または設置済みミノ
// 内部座標では0,0が左上、11,40が右下
// 描画上でミノが動かせる範囲は1,20が左上、10,39が右下
// 内部座標にDRAW_FIELD_TOP, DRAW_FIELD_LEFTを足すと描画上の座標になる
const DRAW_FIELD_TOP = 20;
contextBridge.exposeInMainWorld('DRAW_FIELD_TOP', DRAW_FIELD_TOP);
const DRAW_FIELD_HEIGHT = 20;
contextBridge.exposeInMainWorld('DRAW_FIELD_HEIGHT', DRAW_FIELD_HEIGHT);
const DRAW_FIELD_WITDH = 10;
contextBridge.exposeInMainWorld('DRAW_FIELD_WITDH', DRAW_FIELD_WITDH);
const DRAW_FIELD_LEFT = 1;
contextBridge.exposeInMainWorld('DRAW_FIELD_LEFT', DRAW_FIELD_LEFT);

// 参考：https://tetris.wiki/Super_Rotation_System
// 画像を見ながら座標をベタ打ちした。こうでないとSRSの動作が難しい
// How Guideline move Really Works
// prettier-ignore
const MINO_POS = [
    [ // I
        [[-1, 0], [0, 0], [1, 0], [2, 0]],
        [[1, -1], [1, 0], [1, 1], [1, 2]],
        [[-1, 1], [0, 1], [1, 1], [2, 1]],
        [[0, -1], [0, 0], [0, 1], [0, 2]],
    ],
    [ // T
        [[0, -1], [-1, 0], [0, 0], [1, 0]],
        [[0, -1], [0, 0], [1, 0], [0, 1]],
        [[-1, 0], [0, 0], [1, 0], [0, 1]],
        [[0, -1], [-1, 0], [0, 0], [0, 1]],
    ],
    [ // O
        [[0, -1], [1, -1], [0, 0], [1, 0]],
        [[1, -1], [0, 0], [1, 0], [0, -1]],
        [[0, 0], [1, 0], [0, -1], [1, -1]],
        [[1, 0], [0, -1], [1, -1], [0, 0]],
    ],
    [ // L
        [[1, -1], [-1, 0], [0, 0], [1, 0]],
        [[0, -1], [0, 0], [0, 1], [1, 1]],
        [[-1, 0], [0, 0], [1, 0], [-1, 1]],
        [[-1, -1], [0, -1], [0, 0], [0, 1]],
    ],
    [ // J
        [[-1, -1], [-1, 0], [0, 0], [1, 0]],
        [[0, -1], [1, -1], [0, 0], [0, 1]],
        [[-1, 0], [0, 0], [1, 0], [1, 1]],
        [[0, -1], [0, 0], [-1, 1], [0, 1]],
    ],
    [ // S
        [[0, -1], [1, -1], [-1, 0], [0, 0]],
        [[0, -1], [0, 0], [1, 0], [1, 1]],
        [[0, 0], [1, 0], [-1, 1], [0, 1]],
        [[-1, -1], [-1, 0], [0, 0], [0, 1]],
    ],
    [ // Z
        [[-1, -1], [0, -1], [0, 0], [1, 0]],
        [[1, -1], [0, 0], [1, 0], [0, 1]],
        [[-1, 0], [0, 0], [0, 1], [1, 1]],
        [[0, -1], [-1, 0], [0, 0], [-1, 1]],
    ],
];
contextBridge.exposeInMainWorld('MINO_POS', MINO_POS);

// prettier-ignore
const SRS_TLJSZ = [
    [
        [],
        [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
        [],
        [[1, 0], [1, -1], [0, 2], [1, 2]],
    ],
    [
        [[1, 0], [1, 1], [0, -2], [1, -2]],
        [],
        [[1, 0], [1, 1], [0, -2], [1, -2]],
        [],
    ],
    [
        [],
        [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
        [],
        [[1, 0], [1, -1], [0, 2], [1, 2]],
    ],
    [
        [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
        [],
        [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
        [],
    ],
];
contextBridge.exposeInMainWorld('SRS_TLJSZ', SRS_TLJSZ);
// prettier-ignore
const SRS_I = [
    [
        [],
        [[-2, 0], [1, 0], [-2, 1], [1, -2]],
        [],
        [[-1, 0], [2, 0], [-1, -2], [2, 1]],
    ],
    [
        [[2, 0], [-1, 0], [2, -1], [-1, 2]],
        [],
        [[-1, 0], [2, 0], [-1, -2], [2, 1]],
        [],
    ],
    [
        [],
        [[1, 0], [-2, 0], [1, 2], [-2, -1]],
        [],
        [[2, 0], [-1, 0], [2, -1], [-1, 2]],
    ],
    [
        [[1, 0], [-2, 0], [1, 2], [-2, -1]],
        [],
        [[-2, 0], [1, 0], [-2, 1], [1, -2]],
        [],
    ],
];
contextBridge.exposeInMainWorld('SRS_I', SRS_I);

const MINO_COLORS = ["#0F9BD7", "#AF298A", "#E39F02", "#E35B02", "#2141C6", "#59B101", "#D70F37"];
contextBridge.exposeInMainWorld('MINO_COLORS', MINO_COLORS);
const GHOST_COLORS = ["#074D6B", "#571445", "#714F01", "#712D01", "#102063", "#2C5800", "#6B071B"];
contextBridge.exposeInMainWorld('GHOST_COLORS', GHOST_COLORS);

const FRAME_COLOR = "black";
contextBridge.exposeInMainWorld('FRAME_COLOR', FRAME_COLOR);
const PLACED_MINO_COLOR = "gray";
contextBridge.exposeInMainWorld('PLACED_MINO_COLOR', PLACED_MINO_COLOR);
const BACKGROUND_COLOR = "whitesmoke";
contextBridge.exposeInMainWorld('BACKGROUND_COLOR', BACKGROUND_COLOR);

const BLOCK_SIZE = 20;
contextBridge.exposeInMainWorld('BLOCK_SIZE', BLOCK_SIZE);
const HOLD_CANVAS_SIZE = [0, 0, 80, 80];
contextBridge.exposeInMainWorld('HOLD_CANVAS_SIZE', HOLD_CANVAS_SIZE);
const FIELD_CANVAS_SIZE = [0, 0, 240, 420];
contextBridge.exposeInMainWorld('FIELD_CANVAS_SIZE', FIELD_CANVAS_SIZE);
const NEXT_CANVAS_SIZE = [0, 0, 80, 420];
contextBridge.exposeInMainWorld('NEXT_CANVAS_SIZE', NEXT_CANVAS_SIZE);

// 単位はすべてms
const _f = 1000 / 60; // 60fpsにおける1フレーム 16.6666...ミリ秒
const DAS = Math.floor(10 * _f); // 166ms
contextBridge.exposeInMainWorld('DAS', DAS);
const ARR = Math.floor(2 * _f); // 33ms
contextBridge.exposeInMainWorld('ARR', ARR);
const LOCK_DOWN_DELAY = 500; // 接地猶予時間
contextBridge.exposeInMainWorld('LOCK_DOWN_DELAY', LOCK_DOWN_DELAY);
const SET_DELAY = 20; // 接地硬直
contextBridge.exposeInMainWorld('SET_DELAY', SET_DELAY);
const DEL_DELAY = 100; // ライン消去時の硬直
contextBridge.exposeInMainWorld('DEL_DELAY', DEL_DELAY);

const KSKS_LIMIT = 12;
contextBridge.exposeInMainWorld('KSKS_LIMIT', KSKS_LIMIT);

const INIT_KEY_MAP = {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    hardDrop: "Space",
    softDrop: "ArrowDown",
    rotateLeft: "KeyZ",
    rotateRight: "KeyX",
    hold: "KeyC",
};
contextBridge.exposeInMainWorld('INIT_KEY_MAP', INIT_KEY_MAP);
