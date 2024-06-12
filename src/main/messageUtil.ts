import dayjs from "dayjs";

const getTime = () => {
    return dayjs().format("HH:mm:ss:SSS");
};
const getLabel = () => {
    return `[${getTime()}]`;
};

export const success = (msg: string) => {
    console.log("\x1b[32m%s \x1b[0m", `${getLabel()} SUCCESS: ${msg}`);
};

export const error = (msg: string) => {
    console.log("\x1b[31m%s \x1b[0m", `${getLabel()} ERROR: ${msg}`);
};

export const warning = (msg: string) => {
    console.log("\x1b[33m%s \x1b[0m", `${getLabel()} WARNING: ${msg}`);
};

export const task = (msg: string) => {
    console.log("\x1b[35m%s \x1b[0m", `${getLabel()} TASK: ${msg}`);
};

export const info = (msg: string) => {
    if (!msg) return;
    const lines = msg.split("\n").filter(Boolean);
    for (const line of lines) {
        console.log("\x1b[34m%s \x1b[0m", `${getLabel()} INFO: ${line}`);
    }
};
