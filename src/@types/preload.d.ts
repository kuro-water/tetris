declare var electronAPI: any;
declare var ipcRenderer: any;

declare class wetris {
    static start(): Promise<number>;
    static moveLeft(idx: number): null;
    static moveRight(idx: number): null;
    static hardDrop(idx: number): null;
    static softDrop(idx: number): null;
    static rotateLeft(idx: number): null;
    static rotateRight(idx: number): null;
    static hold(idx: number): null;
    static getField(idx: number): Promise<number[][]>;
    static stop(idx: number): null;
}

type position = {
    x: nunber;
    y: number;
};
type blocks = position[]; // [[x, y], [x, y], ...]
// [position, position, position, position]
// としたほうが強制力は上がるが、
// a = []として後でpushする方法が使えなくなる

type electronEvent = typeof IpcMainInvokeEvent;
type electronSender = typeof IpcMainInvokeEvent.sender;
