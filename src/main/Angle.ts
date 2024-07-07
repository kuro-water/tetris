export class Angle {
    private _angle: number = 0;

    get angle() {
        return this._angle;
    }

    set angle(newAngle: number) {
        newAngle %= 4;
        if (newAngle < 0) {
            newAngle += 4;
        }
        this._angle = newAngle;
    }

    constructor(angle: number = 0) {
        this.angle = angle;
    }
}
