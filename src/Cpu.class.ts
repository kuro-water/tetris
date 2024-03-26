import { Wetris } from "Wetris.class";
class Cpu {
    wetris: Wetris;
    constructor(wetris: Wetris) {
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
