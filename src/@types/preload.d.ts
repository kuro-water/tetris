declare var electronAPI: any;
declare const I_MINO: number;
declare const T_MINO: number;
declare const O_MINO: number;
declare const L_MINO: number;
declare const J_MINO: number;
declare const S_MINO: number;
declare const Z_MINO: number;

declare const INIT_FIELD: number[][];
declare const MINO_POS: number[][][][];

declare const MINO_COLORS: string[];
declare const GHOST_COLORS: string[];

declare const SRS_TLJSZ: number[][][][];
declare const SRS_I: number[][][][];

declare const DAS: number;
declare const ARR: number;
declare const LOCK_DOWN_DELAY: number;
declare const SET_DELAY: number;
declare const DEL_DELAY: number;

declare const INIT_KEY_MAP: {
    moveLeft: string;
    moveRight: string;
    hardDrop: string;
    moveDown: string;
    rotateLeft: string;
    rotateRight: string;
    hold: string;
};

declare const BLOCK_SIZE: number;

declare const HOLD_CANVAS_SIZE: [number, number, number, number];
declare const FIELD_CANVAS_SIZE: [number, number, number, number];
declare const NEXT_CANVAS_SIZE: [number, number, number, number];

declare const FRAME_COLOR: string;
declare const PLACED_MINO_COLOR: string;
declare const BACKGROUND_COLOR: string;

declare const CONFIG_PATH: string;
