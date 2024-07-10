const { ipcMain, IpcMainInvokeEvent } = require("electron");
import { Cpu } from "./Cpu";

import { debug, task } from "./messageUtil";
import { WetrisSender } from "./WetrisSender";

let listWetris: WetrisSender[] = [];

export function handleWetris() {
    ipcMain.handle("start", (event: typeof IpcMainInvokeEvent, idx: number): void => {
        task("wetris starting...");

        if (listWetris[idx]) {
            listWetris[idx].isMainloopActive = false;
            listWetris[idx] = null;
            task("stop:" + idx);
        }
        listWetris[idx] = (new WetrisSender(event.sender, idx));
        debug("start:" + idx);

        listWetris[idx].setAttackMethod((idx: number, lines: number, ren: number, modeTspin: number, isBtB: boolean) => {
            if (lines <= 0) {
                throw new Error("lines must be positive number");
            }
            let power = 0;

            // 基本火力
            power += lines - 1;

            // renボーナス
            power += 2 < ren ? ren - 2 : 0;

            // wetris, Tspinボーナス
            if (lines === 4) {
                power += 2;
            }
            else if (modeTspin === 1) {
                power += lines + 1;
            }

            // BtBボーナス
            if (isBtB) {
                power += 1;
            }
            debug(`power:${power}, lines:${lines}, ren:${ren}, modeTspin:${modeTspin}, isBtB:${isBtB}`);

            listWetris.forEach((wetris, i) => {
                if (i !== idx) {
                    wetris.attackedLineBuffer.push(power);
                }
            });
        });
    });

    ipcMain.handle("startCpu", (_event: typeof IpcMainInvokeEvent, idx: number): void => {
        new Cpu(listWetris[idx]);
    });

    ipcMain.handle("stop", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].isMainloopActive = false;
        listWetris[idx] = null;
        task("stop:" + idx);
    });

    ipcMain.handle("moveLeft", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].moveLeft();
    });

    ipcMain.handle("moveRight", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].moveRight();
    });

    ipcMain.handle("softDrop", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].softDrop();
    });

    ipcMain.handle("hardDrop", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].hardDrop();
    });

    ipcMain.handle("rotateLeft", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].rotateLeft();
    });

    ipcMain.handle("rotateRight", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].rotateRight();
    });

    ipcMain.handle("hold", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].hold();
    });

    ipcMain.handle("printField", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        listWetris[idx].field.printField();
    });

    ipcMain.handle("getField", (_event: typeof IpcMainInvokeEvent, idx: number) => {
        return listWetris[idx].field.field;
    });

    ipcMain.handle("getLength", (_event: typeof IpcMainInvokeEvent): number => {
        return listWetris.length;
    });
}
