const LABEL: HTMLLabelElement = document.getElementById("label") as HTMLLabelElement;

(async () => {
    LABEL.innerText = await socket.get();
})();
