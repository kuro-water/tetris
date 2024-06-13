import dayjs from "dayjs";

const getTime = () => {
    return dayjs().format("HH:mm:ss:SSS");
};
const getLabel = () => {
    return `[${getTime()}]`;
};

export const success = (...args: any[]) => {
    console.log("\x1b[32m%s ", `${getLabel()} SUCCESS:`, ...args, "\x1b[0m");
};

export const error = (...args: any[]) => {
    console.log("\x1b[31m%s ", `${getLabel()} ERROR:`, ...args, "\x1b[0m");
};

export const warning = (...args: any[]) => {
    console.log("\x1b[33m%s ", `${getLabel()} WARNING:`, ...args, "\x1b[0m");
};

export const task = (...args: any[]) => {
    console.log("\x1b[35m%s ", `${getLabel()} TASK:`, ...args, "\x1b[0m");
};

export const info = (...args: any[]) => {
    console.log("\x1b[34m%s ", `${getLabel()} INFO:`, ...args, "\x1b[0m");
};

export const debug = (...args: any[]) => {
    console.log("\x1b[36m%s ", `${getLabel()} DEBUG:`, ...args, "\x1b[0m");
};

// info -> debug
// log -> info
