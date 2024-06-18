const { ipcMain, BrowserWindow, IpcMainInvokeEvent } = require("electron");

// import { Field } from "./Field.class";
// import { Mino } from "./Mino.class";
// import { Wetris } from "./Wetris.class";
// import { WetrisController } from "./WetrisController";
import { WetrisSender } from "./WetrisSender";
import { Cpu } from "./Cpu.class";

import { success, error, warning, task, debug, info } from "./messageUtil";

let listWetris: WetrisSender[] = [];
//

export function handleWetris() {
    ipcMain.handle("start", (event: typeof IpcMainInvokeEvent): number => {
        task("wetris starting...");

        listWetris.push(new WetrisSender(event.sender));
        // info(listWetris.length - 1); // idx

        return listWetris.length - 1; // idx
    });

    ipcMain.handle("startCpu", (event: typeof IpcMainInvokeEvent, idx: number): void => {
        new Cpu(listWetris[idx]);
    });

    ipcMain.handle("stop", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].isMainloopActive = false;
        listWetris[idx] = null;
        task("stop:" + idx);
    });

    ipcMain.handle("moveLeft", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].moveLeft();
    });

    ipcMain.handle("moveRight", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].moveRight();
    });

    ipcMain.handle("softDrop", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].softDrop();
    });

    ipcMain.handle("hardDrop", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].hardDrop();
    });

    ipcMain.handle("rotateLeft", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].rotateLeft();
    });

    ipcMain.handle("rotateRight", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].rotateRight();
    });

    ipcMain.handle("hold", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].hold();
    });

    ipcMain.handle("printField", (event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].field.printField();
    });

    ipcMain.handle("getField", (event: typeof IpcMainInvokeEvent, idx: number) => {
        return listWetris[idx].field.field;
    });

    ipcMain.handle("getLength", (event: typeof IpcMainInvokeEvent): number => {
        return listWetris.length;
    });
}
