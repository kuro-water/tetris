const INPUT_MOVE_LEFT = document.getElementById("moveLeft") as HTMLInputElement;
const INPUT_MOVE_RIGHT = document.getElementById("moveRight") as HTMLInputElement;
const INPUT_SOFT_DROP = document.getElementById("softDrop") as HTMLInputElement;
const INPUT_HARD_DROP = document.getElementById("hardDrop") as HTMLInputElement;
const INPUT_ROTATE_LEFT = document.getElementById("rotateLeft") as HTMLInputElement;
const INPUT_ROTATE_RIGHT = document.getElementById("rotateRight") as HTMLInputElement;
const INPUT_HOLD = document.getElementById("hold") as HTMLInputElement;

const settings_main = async () => {
    let config = await window.electronAPI.readJson(CONFIG_PATH);
    config.key_map.moveLeft = "KeyA";
    window.electronAPI.writeJson(CONFIG_PATH, config);
};
settings_main();

// INPUT_HARD_DROP.onkeydown = () => {};
