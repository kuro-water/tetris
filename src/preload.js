const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readJson: (jsonPath) => ipcRenderer.invoke('readJson', jsonPath),
    writeJson: (jsonPath, data) => ipcRenderer.invoke('writeJson', jsonPath, data),
});

const CONFIG_PATH = "\\config.json";
contextBridge.exposeInMainWorld('CONFIG_PATH', CONFIG_PATH);


const I_MINO = 0;
const T_MINO = 1;
const O_MINO = 2;
const L_MINO = 3;
const J_MINO = 4;
const S_MINO = 5;
const Z_MINO = 6;

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
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

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

const MINO_COLORS = ["#0F9BD7", "#AF298A", "#E39F02", "#E35B02", "#2141C6", "#59B101", "#D70F37"];
const GHOST_COLORS = ["#074D6B", "#571445", "#714F01", "#712D01", "#102063", "#2C5800", "#6B071B"];

const FRAME_COLOR = "black";
const PLACED_MINO_COLOR = "gray";
const BACKGROUND_COLOR = "whitesmoke";

const BLOCK_SIZE = 20;
const HOLD_CANVAS_SIZE = [0, 0, 80, 80];
const FIELD_CANVAS_SIZE = [0, 0, 240, 420];
const NEXT_CANVAS_SIZE = [0, 0, 80, 420];

const _f = 1000 / 60; // 60fpsにおける1フレーム 16.6666...ミリ秒
const DAS = Math.floor(10 * _f); // 166ms
const ARR = Math.floor(2 * _f); // 33ms
const LOCK_DOWN_DELAY = 500; // 接地猶予時間
const SET_DELAY = 20; // 接地硬直
const DEL_DELAY = 100; // ライン消去時の硬直
// 単位はms


const INIT_KEY_MAP = {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    hardDrop: "Space",
    moveDown: "ArrowDown",
    rotateLeft: "KeyZ",
    rotateRight: "KeyX",
    hold: "KeyC",
};


contextBridge.exposeInMainWorld("I_MINO", I_MINO);
contextBridge.exposeInMainWorld("T_MINO", T_MINO);
contextBridge.exposeInMainWorld("O_MINO", O_MINO);
contextBridge.exposeInMainWorld("L_MINO", L_MINO);
contextBridge.exposeInMainWorld("J_MINO", J_MINO);
contextBridge.exposeInMainWorld("S_MINO", S_MINO);
contextBridge.exposeInMainWorld("Z_MINO", Z_MINO);

contextBridge.exposeInMainWorld("INIT_FIELD", INIT_FIELD);

contextBridge.exposeInMainWorld("MINO_POS", MINO_POS);

contextBridge.exposeInMainWorld("SRS_TLJSZ", SRS_TLJSZ);
contextBridge.exposeInMainWorld("SRS_I", SRS_I);

contextBridge.exposeInMainWorld("MINO_COLORS", MINO_COLORS);
contextBridge.exposeInMainWorld("GHOST_COLORS", GHOST_COLORS);

contextBridge.exposeInMainWorld("FRAME_COLOR", FRAME_COLOR);
contextBridge.exposeInMainWorld("PLACED_MINO_COLOR", PLACED_MINO_COLOR);
contextBridge.exposeInMainWorld("BACKGROUND_COLOR", BACKGROUND_COLOR);

contextBridge.exposeInMainWorld("BLOCK_SIZE", BLOCK_SIZE);
contextBridge.exposeInMainWorld("HOLD_CANVAS_SIZE", HOLD_CANVAS_SIZE);
contextBridge.exposeInMainWorld("FIELD_CANVAS_SIZE", FIELD_CANVAS_SIZE);
contextBridge.exposeInMainWorld("NEXT_CANVAS_SIZE", NEXT_CANVAS_SIZE);

contextBridge.exposeInMainWorld("DAS", DAS);
contextBridge.exposeInMainWorld("ARR", ARR);
contextBridge.exposeInMainWorld("LOCK_DOWN_DELAY", LOCK_DOWN_DELAY);
contextBridge.exposeInMainWorld("SET_DELAY", SET_DELAY);
contextBridge.exposeInMainWorld("DEL_DELAY", DEL_DELAY);

contextBridge.exposeInMainWorld("INIT_KEY_MAP", INIT_KEY_MAP);


// 未整形のSRS
//pritter-ignore
// const SRS_TLJSZ = [
//     [
//         [],
//         [
//             [
//                 -1,
//                 0
//             ],
//             [
//                 -1,
//                 -1
//             ],
//             [
//                 0,
//                 2
//             ],
//             [
//                 -1,
//                 2
//             ]
//         ],
//         [],
//         [
//             [
//                 1,
//                 0
//             ],
//             [
//                 1,
//                 -1
//             ],
//             [
//                 0,
//                 2
//             ],
//             [
//                 1,
//                 2
//             ]
//         ]
//     ],
//     [
//         [
//             [
//                 1,
//                 0
//             ],
//             [
//                 1,
//                 1
//             ],
//             [
//                 0,
//                 -2
//             ],
//             [
//                 1,
//                 -2
//             ]
//         ],
//         [],
//         [
//             [
//                 1,
//                 0
//             ],
//             [
//                 1,
//                 1
//             ],
//             [
//                 0,
//                 -2
//             ],
//             [
//                 1,
//                 -2
//             ]
//         ],
//         []
//     ],
//     [
//         [],
//         [
//             [
//                 -1,
//                 0
//             ],
//             [
//                 -1,
//                 -1
//             ],
//             [
//                 0,
//                 2
//             ],
//             [
//                 -1,
//                 2
//             ]
//         ],
//         [],
//         [
//             [
//                 1,
//                 0
//             ],
//             [
//                 1,
//                 -1
//             ],
//             [
//                 0,
//                 2
//             ],
//             [
//                 1,
//                 2
//             ]
//         ]
//     ],
//     [
//         [
//             [
//                 -1,
//                 0
//             ],
//             [
//                 -1,
//                 1
//             ],
//             [
//                 0,
//                 -2
//             ],
//             [
//                 -1,
//                 -2
//             ]
//         ],
//         [],
//         [
//             [
//                 -1,
//                 0
//             ],
//             [
//                 -1,
//                 1
//             ],
//             [
//                 0,
//                 -2
//             ],
//             [
//                 -1,
//                 -2
//             ]
//         ],
//         []
//     ]
// ]
//pritter-ignore
// const SRS_I = [
//     [
//         [],
//         [
//             [
//                 -2,
//                 0
//             ],
//             [
//                 1,
//                 0
//             ],
//             [
//                 -2,
//                 1
//             ],
//             [
//                 1,
//                 -2
//             ]
//         ],
//         [],
//         [
//             [
//                 -1,
//                 0
//             ],
//             [
//                 2,
//                 0
//             ],
//             [
//                 -1,
//                 -2
//             ],
//             [
//                 2,
//                 1
//             ]
//         ]
//     ],
//     [
//         [
//             [
//                 2,
//                 0
//             ],
//             [
//                 -1,
//                 0
//             ],
//             [
//                 2,
//                 -1
//             ],
//             [
//                 -1,
//                 2
//             ]
//         ],
//         [],
//         [
//             [
//                 -1,
//                 0
//             ],
//             [
//                 2,
//                 0
//             ],
//             [
//                 -1,
//                 -2
//             ],
//             [
//                 2,
//                 1
//             ]
//         ],
//         []
//     ],
//     [
//         [],
//         [
//             [
//                 1,
//                 0
//             ],
//             [
//                 -2,
//                 0
//             ],
//             [
//                 1,
//                 2
//             ],
//             [
//                 -2,
//                 -1
//             ]
//         ],
//         [],
//         [
//             [
//                 2,
//                 0
//             ],
//             [
//                 -1,
//                 0
//             ],
//             [
//                 2,
//                 -1
//             ],
//             [
//                 -1,
//                 2
//             ]
//         ]
//     ],
//     [
//         [
//             [
//                 1,
//                 0
//             ],
//             [
//                 -2,
//                 0
//             ],
//             [
//                 1,
//                 2
//             ],
//             [
//                 -2,
//                 -1
//             ]
//         ],
//         [],
//         [
//             [
//                 -2,
//                 0
//             ],
//             [
//                 1,
//                 0
//             ],
//             [
//                 -2,
//                 1
//             ],
//             [
//                 1,
//                 -2
//             ]
//         ],
//         []
//     ]
// ]
// ITOLJSZ

function test() {
    // 関数名: compareArray
    // 引数: array1, array2
    // 返り値: array1とarray2が同じ配列かどうか
    // 概要: array1とarray2が同じ配列かどうかを返す
    function compareArray(array1, array2) {
        if (array1.length !== array2.length) return false;
        return array1.every((value, index) => value === array2[index]);
    }

    // 関数名: compareDeepArray
    // 引数: array1, array2, deep
    // 返り値: array1とarray2がdeepまで同じ配列かどうか
    // 概要: array1とarray2がdeepまで同じ配列かどうかを返す
    function compareDeepArray(array1, array2, deep) {
        if (array1.length !== array2.length) return false;
        if (deep === 1) return compareArray(array1, array2);
        return array1.every((value, index) => compareDeepArray(value, array2[index], deep - 1));
    }

    // console.log(compareDeepArray([1, 2, 3], [1, 2, 3], 1)); // true
    // console.log(compareDeepArray([1, 2, 3], [1, 2, 4], 1)); // false
    // console.log(compareDeepArray([[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 6]], 2)); // true
    // console.log(compareDeepArray([[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 7]], 2)); // false
    // console.log(compareDeepArray([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]], [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]], 3)); // true
    // console.log(compareDeepArray([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]], [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 13]]], 3)); // false

    // console.log(compareDeepArray(SRS_I, SRS_I_, 4));
}
// test();
