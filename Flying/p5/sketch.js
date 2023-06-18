import { render } from "./constant.js";
class BeatAnalyzer {
    constructor(p5) {
        this.p5 = p5;

        this.option = {
            smooth: 0.5,
            bins: 64,
            threshold: {
                counter: 40,
                debounce: 100
            }
        };
        this.fft = new (this.p5.constructor.FFT)(this.option.smooth, this.option.bins);
        this.date = {
            initial: null,
            currentBeat: null,
        };
        this.counter = 0;
        this.beat = [];
    }

    get() {
        if (this.date.initial === null) {
            this.date.initial = Date.now();
        }
        let spectrum = this.fft.analyze();
        if (spectrum[0] == 255) {
            this.counter = this.counter + 1;
        } else {
            this.counter = 0;
            this.date.currentBeat = Date.now() - this.date.initial;
        }
        let lastBeat = this.beat.at(-1) ?? 0;
        let enough_counter = this.option.threshold.counter > 40;
        let debounced = this.initial.currentBeat - lastBeat > this.option.threshold.debounce;
        if (enough_counter && debounced) {
            this.beat.push(this.initial.currentBeat);
            console.log(`${this.initial.currentBeat}`);
            console.log(this.beat);
            this.initial.currentBeat = 0;
        }
    }

    show(x, y, width, height) {
        let dx = width / spectrum.length;
        this.p5.rect(x, y, width, height);
        let spectrum = this.fft.analyze();
        for (let i = 0; i < spectrum.length; i++) {
            let x = p5.map(i, 0, spectrum.length, 0, width);
            let h = - height + p5.map(spectrum[i], 0, 255, p5.height, 0);
            p5.rect(x, height, dx, h);
        }
    }
}


class Slider {
    constructor(p5, x1, y1, x2, y2) {
        this.p5 = p5;
        this.fft = new (p5.constructor.FFT)(0.5, 64);
        this.p1 = new p5.Vector(x1, y1);
        this.p2 = new p5.Vector(x2, y2);
    }

    set time() {

    }

    get pos() {

    }
}

const sketch = (p5) => {

    let fft;
    let sound, sound2;
    let pos;
    let velocity = 0.15;
    let pos_;
    let velocity_ = 0.15;
    p5.preload = () => {
        sound = p5.loadSound('./assets/Flying_GarthStevenson_small.mp3');
    };
    p5.setup = () => {
        let cnv = p5.createCanvas(render.width, render.height);
        cnv.mouseClicked(togglePlay);
    };

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
        if (sound.isPlaying()) {
            sound.pause();
        } else {
            sound.play(0, 0.5, 1, 170);
        }
    }
};

window.onload = () => {
    const canvas = new p5(sketch);
};
