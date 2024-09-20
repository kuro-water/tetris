declare class electronAPI {
    static getInitConfig(): Promise<Config>;

    static getConfig(): Promise<Config>;

    static saveConfig(data: Config): Promise<void>;
}

declare class wetris {
    static start(idx: number): null;

    static startCpu(idx: number): null;

    static stop(idx: number): null;

    static moveLeft(idx: number): null;

    static moveRight(idx: number): null;

    static hardDrop(idx: number): null;

    static softDrop(idx: number): null;

    static rotateLeft(idx: number): null;

    static rotateRight(idx: number): null;

    static hold(idx: number): null;
}

declare class socket {
    static get(): Promise<string>;
}
