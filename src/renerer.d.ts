declare var electronAPI: any;
interface electronAPI {
    readJson(jsonPath: string): any;
    writeJson(jsonPath: string): null;
}
