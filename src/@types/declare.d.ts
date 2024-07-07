

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
