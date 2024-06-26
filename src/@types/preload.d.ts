declare class electronAPI {
    static getInitConfig(): Promise<Config>;
    static getConfig(): Promise<Config>;
    static saveConfig(data: Config): Promise<void>;
}

declare class wetris {
    static start(): Promise<number>;
    static startCpu(idx: number): null;
    static stop(idx: number): null;
    static moveLeft(idx: number): null;
    static moveRight(idx: number): null;
    static hardDrop(idx: number): null;
    static softDrop(idx: number): null;
    static rotateLeft(idx: number): null;
    static rotateRight(idx: number): null;
    static hold(idx: number): null;
    static getField(idx: number): Promise<number[][]>;
}

type KeyMap = {
    moveLeft: string;
    moveRight: string;
    softDrop: string;
    hardDrop: string;
    rotateLeft: string;
    rotateRight: string;
    hold: string;
};
type Config = {
    keyMode: string;
    keyMap: KeyMap;
};

type position = {
    x: number;
    y: number;
};

// Tuple<number, number>のとき、number[]を返す(number extends N == trueとなる)
// それ以外のとき、_TupleOfを呼び出す
type Tuple<T, N extends number> = number extends N ? T[] : _TupleOf<T, N, []>;
// (R["length"] === N)になるまで再帰でタプルを作成
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
    ? R
    : _TupleOf<T, N, [T, ...R]>;

type row = Tuple<number, 12>;
type field = Tuple<row, 41>;
