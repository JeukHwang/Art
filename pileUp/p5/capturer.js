export class Capturer {
    constructor(p5, fps) {
        this.camera = new CCapture({ format: 'webm', framerate: fps });
        this.p5 = p5;

        this.canvas = document.getElementById('defaultCanvas0');
        this.p5.keyPressed = this.handleKey.bind(this);
    }

    handleFrame(isEnd) {
        if (this.p5.frameCount === 1) { this.camera.start(); }
        this.camera.capture(this.canvas);
        if (isEnd) { this.end(); }
    }

    handleKey() {
        switch (this.p5.keyCode) {
            case this.p5.LEFT_ARROW:
                console.log("LEFT");
                this.end();
                break;
            case this.p5.RIGHT_ARROW:
                console.log("RIGHT");
                this.camera.save();
                break;
            default:
                break;
        }
    }

    end() {
        this.camera.stop();
        this.camera.save();
    }
}