const { ipcMain, IpcMainInvokeEvent } = require("electron");

export function handleSocketTest() {
    ipcMain.handle("get", async (_: typeof IpcMainInvokeEvent): Promise<string> => {

        const WebSocket_ = require("ws");
        const wss = new WebSocket_.Server({ port: 8080 });

        wss.on("connection", (ws: any) => {
            ws.on("message", (message: string) => {
                console.log(`Client: ${message}`);
                ws.send("Hello, Client!");
            });
        });


        const connection = new WebSocket("ws://localhost:8080");

        let message: string = "";
        connection.onopen = () => {
            connection.send("Hello, Server!");
        };
        connection.onerror = (error) => {
            console.log(`WebSocket error: ${error}`);
        };
        connection.onmessage = (e) => {
            console.log(`Server: ${e.data}`);
            message = e.data;
        };
        // サーバー側からメッセージが来るまで待つ
        while (connection.readyState !== connection.OPEN) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        connection.close();

        return message;
    });

    ipcMain.handle("server", async (_: typeof IpcMainInvokeEvent): Promise<void> => {
        const WebSocket = require("ws");
        const wss = new WebSocket.Server({ port: 8080 });

        wss.on("connection", (ws: any) => {
            ws.on("message", (message: string) => {
                console.log(`Client: ${message}`);
                ws.send("Hello, Client!");
            });
        });

    });
}
