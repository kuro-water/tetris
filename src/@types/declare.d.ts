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

type Position = {
    x: number;
    y: number;
};

// Tuple<number, number>のとき、number[]を返す(number extends N == trueとなる)
// それ以外のとき、_TupleOfを呼び出す
type Tuple<T, N extends number> = number extends N ? T[] : TupleOf<T, N, []>;
// (R["length"] === N)になるまで再帰でタプルを作成
type TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
    ? R
    : TupleOf<T, N, [T, ...R]>;

type Row = Tuple<number, 12>;
type Field = Tuple<Row, 41>;
