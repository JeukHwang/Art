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
    // const system = new System();
    // const capturer = new CCapture({ format: 'webm', framerate: render.fps });
    // let time = 0;
    // let music;

    let fft;
    let sound, sound2;
    let pos;
    let velocity = 0.15;
    let pos_;
    let velocity_ = 0.15;
    p5.preload = () => {
        sound = p5.loadSound('./Flying_GarthStevenson_small.mp3');
        // sound2 = p5.loadSound('./Flying_GarthStevenson_small.mp3');
    };
    p5.setup = () => {
        // console.log(new Object.getPrototypeOf(p).constructor.FFT());
        let cnv = p5.createCanvas(500, 500);
        cnv.mouseClicked(togglePlay);
        // console.log(p5.constructor)
        fft = new (p5.constructor.FFT)(0.5, 64);
        // fft.setInput(sound2);
        pos = p5.width *0.25;
        pos_ = p5.width *0.25;
    };

    let offCounter = 0;
    let initial = -1;
    let lastBoom = Date.now();
    let lastSmallBoom = Date.now();
    let a = [];

    let a_ = [
        2912,
        8028,
        12745,
        14196,
        19846,
        25528,
        30512,
        32247,
        36762,
        42464,
        48079,
        53747,
        58113,
        59131,
        70664,
        76346,
        77862,
        81013,
        81964,
        87646,
        93281,
        98897,
        102964,
        110181,
        115815,
        121348,
        125732,
        132781,
        138382,
        144082,
        148265,
        155282,
        160999,
        166616,
        170849,
        177899
    ];
    a_ = a_.reverse();
    p5.draw = () => {
        p5.background(220);

        let spectrum = fft.analyze();
        // console.log(fft.analyze());
        // let spectrum = p5.linAverages(128);
        p5.noStroke();
        p5.fill(255, 0, 255);
        for (let i = 0; i < spectrum.length; i++) {
            let x = p5.map(i, 0, spectrum.length, 0, p5.width);
            let h = - p5.height + p5.map(spectrum[i], 0, 255, p5.height, 0);
            p5.rect(x, p5.height, p5.width / spectrum.length, h);
            if (i == 0) {
                if (h == -500) {
                    offCounter += 1;
                    if (offCounter > 40) {
                        let newBoom = Date.now();
                        if (newBoom - lastSmallBoom > 100) {
                            a.push(newBoom - initial);
                            console.log(a);
                            console.log(`BOOM ${newBoom - lastBoom}`);

                            velocity_ *= -1;
                            lastBoom = newBoom;
                        }
                        lastSmallBoom = newBoom;
                    }
                } else {
                    offCounter = 0;
                }
                // console.log(offCounter);
            }
        }
        if (initial != -1 && Date.now() - initial > a_[a_.length - 1] - 500) {
            console.log(`a_ ${a_.pop()}`);
            velocity *= -1;
        }
        p5.text('tap to play', 20, 20);

        let spectralCentroid = fft.getCentroid();
        // the mean_freq_index calculation is for the display.
        let nyquist = 22050;
        let mean_freq_index = spectralCentroid / (nyquist / spectrum.length);

        let centroidplot = p5.map(p5.log(mean_freq_index), 0, p5.log(spectrum.length), 0, p5.width);

        p5.stroke("red");
        let criteria = 15;
        if (centroidplot < criteria) {
            // console.log(centroidplot);
        }
        p5.rect(centroidplot, 0, 0, p5.height);
        p5.noFill();
        p5.stroke("green");
        p5.rect(criteria, 0, 0, p5.height);

        p5.fill("blue");
        p5.stroke("blue");
        p5.rect(pos, p5.height * 0.5, 50, 50);
        pos += velocity;
        p5.fill("violet");
        p5.stroke("violet");
        p5.rect(pos_, p5.height * 0.5 + 50, 50, 50);
        pos_ += velocity_;
    };

    function togglePlay() {
        offCounter = 0;
        initial = Date.now();
        lastBoom = Date.now();
        lastSmallBoom = Date.now();
        if (sound.isPlaying()) {
            // sound2.pause();
            sound.pause();
        } else {
            // sound2.play(0, 0.5, 0, 172);
            sound.play(0, 0.5, 1, 170);
            // sound.loop();
        }
    }
    // p5.preload = () => {
    //     music = p5.loadSound("./Flying_GarthStevenson.mp3");
    // };
    // p5.setup = () => {
    //     p5.createCanvas(render.width, render.height);
    //     p5.frameRate(render.fps);
    //     // p5.pixelDensity(p5.displayDensity());
    // };
    // p5.draw = () => {
    //     p5.background("black");
    //     time += p5.deltaTime;
    //     // console.log(time);
    //     let pos = time % (2 * render.period);
    //     if (pos > render.period) {
    //         pos = 2 * render.period - pos;
    //     }
    //     pos /= render.period;
    //     // console.log(pos);
    //     p5.fill("white");
    //     p5.circle(pos * render.width, render.height / 2, 5);
    //     // if (p5.frameCount === 1) { capturer.start(); }
    //     // p5.background(`#${render.palette[0]}`);
    //     // [...Array(render.width).keys()].forEach(i => {
    //     //     [...Array(render.height).keys()].forEach(j => {
    //     //         p5.fill(system.getLevel(i, j));
    //     //         p5.stroke(system.getLevel(i, j));
    //     //         p5.rect(i * render.block, j * render.block, render.block, render.block);
    //     //     });
    //     // });
    //     // system.update();
    //     // system.addParticle(5);
    //     // capturer.capture(document.getElementById('defaultCanvas0'));
    //     // if (system.isStable()) {
    //     //     p5.noLoop();
    //     //     capturer.stop();
    //     //     capturer.save();
    //     //     console.log("Animation is finished");
    //     // }
    // };
    // p5.mouseClicked = () => {
    //     console.log("START");
    //     time = 0;
    //     music.play(0, 0.5, 1, 160);
    // };
};

window.onload = () => {
    const canvas = new p5(sketch);
};
