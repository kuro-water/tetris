const { ipcMain, BrowserWindow, IpcMainInvokeEvent } = require("electron");
const {
    CONFIG_PATH,
    I_MINO,
    T_MINO,
    O_MINO,
    L_MINO,
    J_MINO,
    S_MINO,
    Z_MINO,
    EMPTY_ROW,
    FULL_ROW,
    INIT_FIELD,
    DRAW_FIELD_TOP,
    DRAW_FIELD_HEIGHT,
    DRAW_FIELD_WITDH,
    DRAW_FIELD_LEFT,
    MINO_POS,
    MINO_COLORS,
    GHOST_COLORS,
    SRS_TLJSZ,
    SRS_I,
    DAS,
    ARR,
    LOCK_DOWN_DELAY,
    SET_DELAY,
    DEL_DELAY,
    INIT_KEY_MAP,
    BLOCK_SIZE,
    HOLD_CANVAS_SIZE,
    FIELD_CANVAS_SIZE,
    NEXT_CANVAS_SIZE,
    FRAME_COLOR,
    PLACED_MINO_COLOR,
    BACKGROUND_COLOR,
    KSKS_LIMIT,
} = require("./constant");

const Field = require("./Field.class");
type Field = typeof Field;

const Mino = require("./Mino.class");
type Mino = typeof Mino;

const Wetris = require("./Wetris.class");
type Wetris = typeof Wetris;

let listWetris: Wetris[] = [];

function handleWetris() {
    ipcMain.handle("start", (event: electronEvent): number => {
        console.log("wetris starting...");

        listWetris.push(new Wetris(event.sender));

        // console.log(listWetris.length - 1); // idx
        return listWetris.length - 1; // idx
    });

    ipcMain.handle("stop", (event: electronEvent, idx: number) => {
        listWetris[idx].isMainloopActive = false;
        console.log("stop:" + idx);
    });

    ipcMain.handle("moveLeft", (event: electronEvent, idx: number) => {
        listWetris[idx].moveLeft();
    });

    ipcMain.handle("moveRight", (event: electronEvent, idx: number) => {
        listWetris[idx].moveRight();
    });

    ipcMain.handle("softDrop", (event: electronEvent, idx: number) => {
        listWetris[idx].softDrop();
    });

    ipcMain.handle("hardDrop", (event: electronEvent, idx: number) => {
        listWetris[idx].hardDrop();
    });

    ipcMain.handle("rotateLeft", (event: electronEvent, idx: number) => {
        listWetris[idx].rotateLeft();
    });

    ipcMain.handle("rotateRight", (event: electronEvent, idx: number) => {
        listWetris[idx].rotateRight();
    });

    ipcMain.handle("hold", (event: electronEvent, idx: number) => {
        listWetris[idx].hold();
    });

    ipcMain.handle("printField", (event: electronEvent, idx: number) => {
        listWetris[idx].field.printField();
    });

    ipcMain.handle("getField", (event: electronEvent, idx: number) => {
        return listWetris[idx].field.field;
    });

    ipcMain.handle("getLength", (event: electronEvent): number => {
        return listWetris.length;
    });
}

module.exports = { handleWetris };
