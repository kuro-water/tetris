"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIT_KEY_MAP = exports.KSKS_LIMIT = exports.DEL_DELAY = exports.SET_DELAY = exports.LOCK_DOWN_DELAY = exports.ARR = exports.DAS = exports._f = exports.NEXT_CANVAS_SIZE = exports.FIELD_CANVAS_SIZE = exports.HOLD_CANVAS_SIZE = exports.BLOCK_SIZE = exports.BACKGROUND_COLOR = exports.PLACED_MINO_COLOR = exports.FRAME_COLOR = exports.GHOST_COLORS = exports.MINO_COLORS = exports.SRS_I = exports.SRS_TLJSZ = exports.MINO_POS = exports.DRAW_FIELD_LEFT = exports.DRAW_FIELD_WITDH = exports.DRAW_FIELD_HEIGHT = exports.DRAW_FIELD_TOP = exports.INIT_FIELD = exports.FULL_ROW = exports.EMPTY_ROW = exports.MINO_IDX = exports.CONFIG_PATH = void 0;
exports.CONFIG_PATH = "\\config.json";
var MINO_IDX;
(function (MINO_IDX) {
    MINO_IDX[MINO_IDX["I_MINO"] = 0] = "I_MINO";
    MINO_IDX[MINO_IDX["T_MINO"] = 1] = "T_MINO";
    MINO_IDX[MINO_IDX["O_MINO"] = 2] = "O_MINO";
    MINO_IDX[MINO_IDX["L_MINO"] = 3] = "L_MINO";
    MINO_IDX[MINO_IDX["J_MINO"] = 4] = "J_MINO";
    MINO_IDX[MINO_IDX["S_MINO"] = 5] = "S_MINO";
    MINO_IDX[MINO_IDX["Z_MINO"] = 6] = "Z_MINO";
})(MINO_IDX || (exports.MINO_IDX = MINO_IDX = {}));
exports.EMPTY_ROW = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
exports.FULL_ROW = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
exports.INIT_FIELD = [
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
// xを増やすと右、yを増やすと下になる
// 0が空白、1が壁または設置済みミノ
// 内部座標では0,0が左上、11,40が右下
// 描画上でミノが動かせる範囲は1,20が左上、10,39が右下
// 内部座標にDRAW_FIELD_TOP, DRAW_FIELD_LEFTを足すと描画上の座標になる
exports.DRAW_FIELD_TOP = 20;
exports.DRAW_FIELD_HEIGHT = 20;
exports.DRAW_FIELD_WITDH = 10;
exports.DRAW_FIELD_LEFT = 1;
// 参考：https://tetris.wiki/Super_Rotation_System
// 画像を見ながら座標をベタ打ちした。こうでないとSRSの動作が難しい
// How Guideline move Really Works
// prettier-ignore
exports.MINO_POS = [
    [
        [[-1, 0], [0, 0], [1, 0], [2, 0]],
        [[1, -1], [1, 0], [1, 1], [1, 2]],
        [[-1, 1], [0, 1], [1, 1], [2, 1]],
        [[0, -1], [0, 0], [0, 1], [0, 2]],
    ],
    [
        [[0, -1], [-1, 0], [0, 0], [1, 0]],
        [[0, -1], [0, 0], [1, 0], [0, 1]],
        [[-1, 0], [0, 0], [1, 0], [0, 1]],
        [[0, -1], [-1, 0], [0, 0], [0, 1]],
    ],
    [
        [[0, -1], [1, -1], [0, 0], [1, 0]],
        [[1, -1], [0, 0], [1, 0], [0, -1]],
        [[0, 0], [1, 0], [0, -1], [1, -1]],
        [[1, 0], [0, -1], [1, -1], [0, 0]],
    ],
    [
        [[1, -1], [-1, 0], [0, 0], [1, 0]],
        [[0, -1], [0, 0], [0, 1], [1, 1]],
        [[-1, 0], [0, 0], [1, 0], [-1, 1]],
        [[-1, -1], [0, -1], [0, 0], [0, 1]],
    ],
    [
        [[-1, -1], [-1, 0], [0, 0], [1, 0]],
        [[0, -1], [1, -1], [0, 0], [0, 1]],
        [[-1, 0], [0, 0], [1, 0], [1, 1]],
        [[0, -1], [0, 0], [-1, 1], [0, 1]],
    ],
    [
        [[0, -1], [1, -1], [-1, 0], [0, 0]],
        [[0, -1], [0, 0], [1, 0], [1, 1]],
        [[0, 0], [1, 0], [-1, 1], [0, 1]],
        [[-1, -1], [-1, 0], [0, 0], [0, 1]],
    ],
    [
        [[-1, -1], [0, -1], [0, 0], [1, 0]],
        [[1, -1], [0, 0], [1, 0], [0, 1]],
        [[-1, 0], [0, 0], [0, 1], [1, 1]],
        [[0, -1], [-1, 0], [0, 0], [-1, 1]],
    ],
];
// prettier-ignore
exports.SRS_TLJSZ = [
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
// prettier-ignore
exports.SRS_I = [
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
exports.MINO_COLORS = [
    "#0F9BD7",
    "#AF298A",
    "#E39F02",
    "#E35B02",
    "#2141C6",
    "#59B101",
    "#D70F37",
];
exports.GHOST_COLORS = [
    "#074D6B",
    "#571445",
    "#714F01",
    "#712D01",
    "#102063",
    "#2C5800",
    "#6B071B",
];
exports.FRAME_COLOR = "black";
exports.PLACED_MINO_COLOR = "gray";
exports.BACKGROUND_COLOR = "whitesmoke";
exports.BLOCK_SIZE = 20;
exports.HOLD_CANVAS_SIZE = [0, 0, 80, 80];
exports.FIELD_CANVAS_SIZE = [0, 0, 240, 420];
exports.NEXT_CANVAS_SIZE = [0, 0, 80, 420];
// 単位はすべてms
exports._f = 1000 / 60; // 60fpsにおける1フレーム 16.6666...ミリ秒
exports.DAS = Math.floor(10 * exports._f); // 166ms
exports.ARR = Math.floor(2 * exports._f); // 33ms
exports.LOCK_DOWN_DELAY = 500; // 接地猶予時間
exports.SET_DELAY = 20; // 接地硬直
exports.DEL_DELAY = 100; // ライン消去時の硬直
exports.KSKS_LIMIT = 12;
exports.INIT_KEY_MAP = {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    hardDrop: "Space",
    softDrop: "ArrowDown",
    rotateLeft: "KeyZ",
    rotateRight: "KeyX",
    hold: "KeyC",
};
//# sourceMappingURL=constant.js.map