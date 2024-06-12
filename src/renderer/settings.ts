const BUTTON_SAVE = document.getElementById("save") as HTMLButtonElement;
const BUTTON_INIT = document.getElementById("init") as HTMLButtonElement;
const INPUT_MOVE_LEFT = document.getElementById("moveLeft") as HTMLInputElement;
const INPUT_MOVE_RIGHT = document.getElementById("moveRight") as HTMLInputElement;
const INPUT_SOFT_DROP = document.getElementById("softDrop") as HTMLInputElement;
const INPUT_HARD_DROP = document.getElementById("hardDrop") as HTMLInputElement;
const INPUT_ROTATE_LEFT = document.getElementById("rotateLeft") as HTMLInputElement;
const INPUT_ROTATE_RIGHT = document.getElementById("rotateRight") as HTMLInputElement;
const INPUT_HOLD = document.getElementById("hold") as HTMLInputElement;

let config: any = undefined;

const setInputValue = function () {
    INPUT_MOVE_LEFT.value = config.keyMap.moveLeft;
    INPUT_MOVE_RIGHT.value = config.keyMap.moveRight;
    INPUT_SOFT_DROP.value = config.keyMap.softDrop;
    INPUT_HARD_DROP.value = config.keyMap.hardDrop;
    INPUT_ROTATE_LEFT.value = config.keyMap.rotateLeft;
    INPUT_ROTATE_RIGHT.value = config.keyMap.rotateRight;
    INPUT_HOLD.value = config.keyMap.hold;
};

const main = async function () {
    config = await electronAPI.readJson(CONFIG_PATH);

    setInputValue();

    INPUT_HARD_DROP.onkeydown = (event) => (INPUT_HARD_DROP.value = event.code);
    INPUT_MOVE_LEFT.onkeydown = (event) => (INPUT_MOVE_LEFT.value = event.code);
    INPUT_MOVE_RIGHT.onkeydown = (event) => (INPUT_MOVE_RIGHT.value = event.code);
    INPUT_SOFT_DROP.onkeydown = (event) => (INPUT_SOFT_DROP.value = event.code);
    INPUT_ROTATE_LEFT.onkeydown = (event) => (INPUT_ROTATE_LEFT.value = event.code);
    INPUT_ROTATE_RIGHT.onkeydown = (event) => (INPUT_ROTATE_RIGHT.value = event.code);
    INPUT_HOLD.onkeydown = (event) => (INPUT_HOLD.value = event.code);

    BUTTON_SAVE.onclick = async () => {
        console.log(config);
        config.keyMap.moveLeft = INPUT_MOVE_LEFT.value;
        config.keyMap.moveRight = INPUT_MOVE_RIGHT.value;
        config.keyMap.softDrop = INPUT_SOFT_DROP.value;
        config.keyMap.hardDrop = INPUT_HARD_DROP.value;
        config.keyMap.rotateLeft = INPUT_ROTATE_LEFT.value;
        config.keyMap.rotateRight = INPUT_ROTATE_RIGHT.value;
        config.keyMap.hold = INPUT_HOLD.value;
        await electronAPI.writeJson(CONFIG_PATH, config);
        console.log("saved");
    };

    BUTTON_INIT.onclick = async () => {
        config.keyMap = { ...INIT_KEY_MAP };
        setInputValue();
    };
};
main();
