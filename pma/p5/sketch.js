import { render } from "./constant.js";

const sketch = (p5) => {
    let scale = Math.min(
        p5.windowHeight / render.height * 0.8,
        p5.windowWidth / render.width * 0.9
    );
    let width = render.width * scale;
    let height = render.height * scale;
    let image;
    let image_blur;
    let image_blur_masked;
    let mask;
    let history = [{ x: width / 2, y: height / 2 }];

    p5.preload = () => {
        image = p5.loadImage("../data/jeuk.png");
    };
    p5.setup = () => {
        const canvas = p5.createCanvas(width, height);
        canvas.parent(document.getElementById("p5"));
        p5.frameRate(60);
        p5.pixelDensity(p5.displayDensity());

        image.resize(width, height);
        
        image_black = p5.createImage(width, height);
        image_blur.copy(image, 0, 0, width, height, 0, 0, width, height);
        image_blur = p5.createImage(width, height);
        image_blur.copy(image, 0, 0, width, height, 0, 0, width, height);
        image_blur.filter(p5.BLUR, render.blur);
        image_blur_masked = p5.createImage(width, height);

        mask = p5.createGraphics(width, height);
    };

    const sum = (array) => array.reduce((a, b) => a + b, 0);
    const pythagoras = (a, b) => (a ** 2 + b ** 2) ** 0.5;
    p5.draw = () => {
        const pos = {
            x: Math.min(Math.max(p5.mouseX, 0), width),
            y: Math.min(Math.max(p5.mouseY, 0), height)
        };
        history.push(pos);
        if (history.length > render.historyLength) {
            history.shift();
        }

        const distance = sum(history.map((pos, i) => {
            if (i === 0) { return 0; }
            return pythagoras(pos.x - history[i - 1].x, pos.y - history[i - 1].y);
        }));
        const diagonal = pythagoras(width, height);
        const radius = diagonal - p5.map(distance, 0, scale * render.maxPossibleDistance, 0, diagonal, true);

        mask.clear();
        mask.circle(pos.x, pos.y, 2 * radius);
        image_blur_masked.copy(image_blur, 0, 0, width, height, 0, 0, width, height);
        image_blur_masked.mask(mask);
        p5.image(image, 0, 0);
        p5.image(image_blur_masked, 0, 0);
    };
    p5.windowResized = () => {
        scale = Math.min(
            p5.windowHeight / render.height * 0.8,
            p5.windowWidth / render.width * 0.9
        );
        width = render.width * scale;
        height = render.height * scale;
        image.resize(width, height);
        image_blur = p5.createImage(width, height);
        image_blur.copy(image, 0, 0, width, height, 0, 0, width, height);
        image_blur.filter(p5.BLUR, render.blur);
        image_blur_masked.resize(width, height);
        p5.resizeCanvas(width, height);
    };
};

const canvas = new p5(sketch);