"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cpu {
    wetris;
    constructor(wetris) {
        this.wetris = wetris;
        this.test();
    }
    async test() {
        this.wetris.moveLeft();
        await this.wetris.sleep(20);
        this.wetris.moveRight();
        await this.wetris.sleep(20);
        this.wetris.moveLeft();
        await this.wetris.sleep(20);
        this.wetris.moveRight();
        await this.wetris.sleep(20);
        this.wetris.moveLeft();
        await this.wetris.sleep(20);
        this.wetris.moveRight();
        await this.wetris.sleep(20);
        this.wetris.softDrop();
        await this.wetris.sleep(20);
        this.wetris.softDrop();
        await this.wetris.sleep(20);
        this.wetris.softDrop();
    }
}
module.exports = Cpu;
//# sourceMappingURL=Cpu.class.js.map