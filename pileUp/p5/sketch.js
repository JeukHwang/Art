import { render } from "./constant.js";
import { randInt, random } from "./util.js";

class System {
    constructor() {
        this.particles = new Set();
        this.ground = Array.from(Array(render.width), () => new Array(render.height).fill(0));
    }

    getLevel(i, j) {
        const ps = [...this.particles].filter(p => (p.x === i) && (p.y === j));
        const particleLevel = ps.reduce((sum_, p) => sum_ + p.level, 0);
        const groundLevel = this.ground[i][j];
        const index = Math.min(render.palette.length - 1, particleLevel + groundLevel);
        return `#${render.palette[index]}`;
    }

    addParticle(n) {
        [...Array(n)].forEach(_ => {
            this.particles.add({ x: randInt(0, render.width), y: 0, level: 1, hit: false });
        });
    }

    update() {
        this.particles.forEach(p => {
            let shouldStop = false;
            if (p.y === render.height - 1) {
                shouldStop = true; // hit bottom
            } else {
                const isFloorSolid = (p.level <= this.ground[p.x][p.y + 1]);
                if (!isFloorSolid) {
                    shouldStop = false; // cannot stop here
                } else {
                    if (random() < render.stopPossibility) {
                        shouldStop = true; // dig successfully
                    }
                }
            }
            if (shouldStop) {
                p.hit = true;
            } else {
                p.y += 1;
            }
        });
        this.particles.forEach(p => {
            if (p.hit) {
                if (p.y === render.height - 1) {
                    // hit bottom
                    this.ground[p.x][p.y] += p.level;
                    this.particles.delete(p);
                } else {
                    const isFloorSolid = this.ground[p.x][p.y] + p.level <= this.ground[p.x][p.y + 1];
                    if (isFloorSolid) {
                        this.ground[p.x][p.y] += p.level;
                        this.particles.delete(p);
                    } else {
                        const delta = this.ground[p.x][p.y + 1] - this.ground[p.x][p.y];
                        this.ground[p.x][p.y] += delta;
                        p.level -= delta;
                    }
                }
            }
        });
    }

    isStable() {
        return [...Array(render.width).keys()].every(i => this.ground[i][0] >= render.palette.length - 1);
    }
}

const sketch = (p5) => {
    const system = new System();
    const capturer = new CCapture({ format: 'webm', framerate: render.fps });

    p5.setup = () => {
        p5.createCanvas(render.width * render.block, render.height * render.block);
        p5.frameRate(render.fps);
        // p5.pixelDensity(p5.displayDensity());
    };
    p5.draw = () => {
        if (p5.frameCount === 1) { capturer.start(); }
        p5.background(`#${render.palette[0]}`);
        [...Array(render.width).keys()].forEach(i => {
            [...Array(render.height).keys()].forEach(j => {
                p5.fill(system.getLevel(i, j));
                p5.stroke(system.getLevel(i, j));
                p5.rect(i * render.block, j * render.block, render.block, render.block);
            });
        });
        system.update();
        system.addParticle(5);
        capturer.capture(document.getElementById('defaultCanvas0'));
        if (system.isStable()) {
            p5.noLoop();
            capturer.stop();
            capturer.save();
            console.log("Animation is finished");
        }
    };
};

const canvas = new p5(sketch);
