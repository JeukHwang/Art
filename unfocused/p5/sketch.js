import { drawSpade } from "./util.js";

// Asset reference: https://pixabay.com/images/id-2459465/
const render = {
    ratio: 0.2,
    asset: { width: 4000, height: 2250, path: "../asset/apocalypse-2459465.jpg", },
    blur: { level: 5, size: 200 }
};

const sketch = (p5) => {
    let width = render.asset.width * render.ratio;
    let height = render.asset.height * render.ratio;
    let size = render.blur.size;
    let image, blurredImage, mask;
    p5.preload = () => {
        // image = p5.loadImage(render.asset.path);
    };
    p5.setup = () => {
        // image.resize(width, height);
        image = p5.createGraphics(width, height);
        // p5.noStroke();
        // image.noStroke();
        image.fill(0);
        image.rect(0, 0, width, height);
        image.fill(255);
        image.circle(width / 2, height / 2, 200);
        blurredImage = p5.createImage(width, height);
        blurredImage.copy(image, 0, 0, width, height, 0, 0, width, height);
        blurredImage.filter(p5.BLUR, render.blur.level);

        p5.createCanvas(width, height);
        mask = p5.createGraphics(size*2, size*2);
        // mask.circle(size, size, size - 2);
        drawSpade(mask, size * 1, size*0.5, size * 0.8, size);
    };
    p5.draw = () => {
        p5.image(image, 0, 0);
        const assetClip = p5.createImage(size * 2, size * 2);
        assetClip.copy(blurredImage, p5.mouseX - size, p5.mouseY - size, size * 2, size * 2, 0, 0, size * 2, size * 2);
        assetClip.mask(mask);
        p5.image(assetClip, p5.mouseX - size, p5.mouseY - size);
    };
};

const canvas = new p5(sketch);

// 나는 진실을 직면하지 않곤 한다.
// 직면하는 순간에조차 나에겐 해당되지 않는 이야기라 생각한다.
// 흔한 착각이자 보잘것없는 오만에 차 있곤 한다.
// Reference: https://www.fal-works.com/creative-coding-posts/invisible
// Reference: https://editor.p5js.org/lberdugo/sketches/tcJ_atAqp
// Reference: curve design for spade - http://www.java2s.com/ref/javascript/html-canvas-bezier-curve-draw-spade.html

// 중도의 중요성 - 가치는 경계에서 나오곤 한다