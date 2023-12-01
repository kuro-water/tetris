const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readJson: (jsonPath) => ipcRenderer.invoke('readJson', jsonPath),
    writeJson: (jsonPath, data) => ipcRenderer.invoke('writeJson', jsonPath, data),
});

contextBridge.exposeInMainWorld("I_MINO", 0);
contextBridge.exposeInMainWorld("T_MINO", 1);
contextBridge.exposeInMainWorld("O_MINO", 2);
contextBridge.exposeInMainWorld("L_MINO", 3);
contextBridge.exposeInMainWorld("J_MINO", 4);
contextBridge.exposeInMainWorld("S_MINO", 5);
contextBridge.exposeInMainWorld("Z_MINO", 6);


contextBridge.exposeInMainWorld("INIT_FIELD", [
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
]);

// 参考：https://tetris.wiki/Super_Rotation_System
// 画像を見ながら座標をベタ打ちした。こうでないとSRSの動作が難しい
// How Guideline move Really Works
contextBridge.exposeInMainWorld("MINO_POS", [
    [
        [
            [-1, 0],
            [0, 0],
            [1, 0],
            [2, 0]
        ],
        [
            [1, -1],
            [1, 0],
            [1, 1],
            [1, 2]
        ],
        [
            [-1, 1],
            [0, 1],
            [1, 1],
            [2, 1]
        ],
        [
            [0, -1],
            [0, 0],
            [0, 1],
            [0, 2]
        ]
    ],
    [
        [
            [0, -1],
            [-1, 0],
            [0, 0],
            [1, 0]
        ],
        [
            [0, -1],
            [0, 0],
            [1, 0],
            [0, 1]
        ],
        [
            [-1, 0],
            [0, 0],
            [1, 0],
            [0, 1]
        ],
        [
            [0, -1],
            [-1, 0],
            [0, 0],
            [0, 1]
        ]
    ],
    [
        [
            [0, -1],
            [1, -1],
            [0, 0],
            [1, 0]
        ],
        [
            [1, -1],
            [0, 0],
            [1, 0],
            [0, -1]
        ],
        [
            [0, 0],
            [1, 0],
            [0, -1],
            [1, -1]
        ],
        [
            [1, 0],
            [0, -1],
            [1, -1],
            [0, 0]
        ]
    ],
    [
        [
            [1, -1],
            [-1, 0],
            [0, 0],
            [1, 0]
        ],
        [
            [0, -1],
            [0, 0],
            [0, 1],
            [1, 1]
        ],
        [
            [-1, 0],
            [0, 0],
            [1, 0],
            [-1, 1]
        ],
        [
            [-1, -1],
            [0, -1],
            [0, 0],
            [0, 1]
        ]
    ],
    [
        [
            [-1, -1],
            [-1, 0],
            [0, 0],
            [1, 0]
        ],
        [
            [0, -1],
            [1, -1],
            [0, 0],
            [0, 1]
        ],
        [
            [-1, 0],
            [0, 0],
            [1, 0],
            [1, 1]
        ],
        [
            [0, -1],
            [0, 0],
            [-1, 1],
            [0, 1]
        ]
    ],
    [
        [
            [0, -1],
            [1, -1],
            [-1, 0],
            [0, 0]
        ],
        [
            [0, -1],
            [0, 0],
            [1, 0],
            [1, 1]
        ],
        [
            [0, 0],
            [1, 0],
            [-1, 1],
            [0, 1]
        ],
        [
            [-1, -1],
            [-1, 0],
            [0, 0],
            [0, 1]
        ]
    ],
    [
        [
            [-1, -1],
            [0, -1],
            [0, 0],
            [1, 0]
        ],
        [
            [1, -1],
            [0, 0],
            [1, 0],
            [0, 1]
        ],
        [
            [-1, 0],
            [0, 0],
            [0, 1],
            [1, 1]
        ],
        [
            [0, -1],
            [-1, 0],
            [0, 0],
            [-1, 1]
        ]
    ]
]);

// ITOLJSZ
contextBridge.exposeInMainWorld("MINO_COLORS", ["#0F9BD7", "#AF298A", "#E39F02", "#E35B02", "#2141C6", "#59B101", "#D70F37"]);
contextBridge.exposeInMainWorld("GHOST_COLORS", ["#074D6B", "#571445", "#714F01", "#712D01", "#102063", "#2C5800", "#6B071B"]);

// 参考：https://tetris.fandom.com/wiki/move
// Wall Kicks のデータ表
// T,L,J,S,Z表の 0>>1 が move[0][1]に、 0>>3 がSRS[0][3]に格納されている
// !!! wikiとはyの絶対値が逆なことに注意 !!!
contextBridge.exposeInMainWorld("SRS_TLJSZ", [
    [
        [],
        [
            [-1, 0],
            [-1, -1],
            [0, 2],
            [-1, 2]
        ],
        [],
        [
            [1, 0],
            [1, -1],
            [0, 2],
            [1, 2]
        ]
    ],
    [
        [
            [1, 0],
            [1, 1],
            [0, -2],
            [1, -2]
        ],
        [],
        [
            [1, 0],
            [1, 1],
            [0, -2],
            [1, -2]
        ],
        []
    ],
    [
        [],
        [
            [-1, 0],
            [-1, -1],
            [0, 2],
            [-1, 2]
        ],
        [],
        [
            [1, 0],
            [1, -1],
            [0, 2],
            [1, 2]
        ]
    ],
    [
        [
            [-1, 0],
            [-1, 1],
            [0, -2],
            [-1, -2]
        ],
        [],
        [
            [-1, 0],
            [-1, 1],
            [0, -2],
            [-1, -2]
        ],
        []
    ]
]);

contextBridge.exposeInMainWorld("SRS_I", [
    [
        [],
        [
            [-2, 0],
            [1, 0],
            [-2, 1],
            [1, -2]
        ],
        [],
        [
            [-1, 0],
            [2, 0],
            [-1, -2],
            [2, 1]
        ]
    ],
    [
        [
            [2, 0],
            [-1, 0],
            [2, -1],
            [-1, 2]
        ],
        [],
        [
            [-1, 0],
            [2, 0],
            [-1, -2],
            [2, 1]
        ],
        []
    ],
    [
        [],
        [
            [1, 0],
            [-2, 0],
            [1, 2],
            [-2, -1]
        ],
        [],
        [
            [2, 0],
            [-1, 0],
            [2, -1],
            [-1, 2]
        ]
    ],
    [
        [
            [1, 0],
            [-2, 0],
            [1, 2],
            [-2, -1]
        ],
        [],
        [
            [-2, 0],
            [1, 0],
            [-2, 1],
            [1, -2]
        ],
        []
    ]
]);

const _f = 1000 / 60; // 60fpsにおける1フレーム 16.6666...ミリ秒
contextBridge.exposeInMainWorld("DAS", Math.floor(10 * _f)); // 166ms
contextBridge.exposeInMainWorld("ARR", Math.floor(2 * _f)); // 33ms
contextBridge.exposeInMainWorld("LOCK_DOWN_DELAY", 500); // 接地猶予時間
contextBridge.exposeInMainWorld("SET_DELAY", 20); // 接地硬直
contextBridge.exposeInMainWorld("DEL_DELAY", 100); // ライン消去時の硬直
// 単位はms

contextBridge.exposeInMainWorld("INIT_KEY_MAP", {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    hardDrop: "Space",
    moveDown: "ArrowDown",
    rotateLeft: "KeyZ",
    rotateRight: "KeyX",
    hold: "KeyC",
});
contextBridge.exposeInMainWorld("BLOCK_SIZE", 20);


// as constがないとspread演算子(...)が使えない
// 参考：https://qiita.com/sho-19202325/items/d74f9ed527840488d149
contextBridge.exposeInMainWorld("HOLD_CANVAS_SIZE", [0, 0, 80, 80]);
contextBridge.exposeInMainWorld("FIELD_CANVAS_SIZE", [0, 0, 240, 420]);
contextBridge.exposeInMainWorld("NEXT_CANVAS_SIZE", [0, 0, 80, 420]);

contextBridge.exposeInMainWorld("FRAME_COLOR", "black");
contextBridge.exposeInMainWorld("PLACED_MINO_COLOR", "gray");
contextBridge.exposeInMainWorld("BACKGROUND_COLOR", "whitesmoke");
