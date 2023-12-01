declare var electronAPI: any;
declare var I_MINO: number;
declare var T_MINO: number;
declare var O_MINO: number;
declare var L_MINO: number;
declare var J_MINO: number;
declare var S_MINO: number;
declare var Z_MINO: number;

declare var INIT_FIELD: number[][];
declare var MINO_POS: number[][][][];

declare var MINO_COLORS: string[];
declare var GHOST_COLORS: string[];

declare var SRS_TLJSZ: number[][][][];
declare var SRS_I: number[][][][];

declare var DAS: number;
declare var ARR: number;
declare var LOCK_DOWN_DELAY: number;
declare var SET_DELAY: number;
declare var DEL_DELAY: number;

declare var INIT_KEY_MAP: {
    moveLeft: string;
    moveRight: string;
    hardDrop: string;
    moveDown: string;
    rotateLeft: string;
    rotateRight: string;
    hold: string;
};

declare var BLOCK_SIZE: number;

declare var HOLD_CANVAS_SIZE: [number, number, number, number];
declare var FIELD_CANVAS_SIZE: [number, number, number, number];
declare var NEXT_CANVAS_SIZE: [number, number, number, number];

declare var FRAME_COLOR: string;
declare var PLACED_MINO_COLOR: string;
declare var BACKGROUND_COLOR: string;
