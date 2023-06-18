// Asset reference: https://pixabay.com/images/id-2459465/
const render = {
    ratio: 0.2,
    asset: { width: 4000, height: 2250, path: "../asset/apocalypse-2459465.jpg", },
    blur: { level: 5, radius: 400 }
};

const sketch = (p5) => {
    let width = render.asset.width * render.ratio;
    let height = render.asset.height * render.ratio;
    let radius = render.blur.radius;
    let image, blurredImage, mask;
    p5.preload = () => {
        image = p5.loadImage(render.asset.path);
        blurredImage = p5.loadImage(render.asset.path);
    };
    p5.setup = () => {
        p5.createCanvas(width, height);
        image.resize(width, height);
        blurredImage.resize(width, height);
        blurredImage.filter(p5.BLUR, render.blur.level);
        mask = p5.createGraphics(radius * 2, radius * 2);
        mask.circle(radius, radius, radius - 2);
    };
    p5.draw = () => {
        p5.image(image, 0, 0);
        const assetClip = p5.createImage(radius * 2, radius * 2);
        assetClip.copy(blurredImage, p5.mouseX - radius, p5.mouseY - radius, radius * 2, radius * 2, 0, 0, radius * 2, radius * 2);
        assetClip.mask(mask);
        p5.image(assetClip, p5.mouseX - radius, p5.mouseY - radius);
    };
};

const canvas = new p5(sketch);

// 나는 진실을 직면하지 않곤 한다.
// 직면하는 순간에조차 나에겐 해당되지 않는 이야기라 생각한다.
// 흔한 착각이자 보잘것없는 오만에 차 있곤 한다.
// Reference: https://www.fal-works.com/creative-coding-posts/invisible
// Reference: https://editor.p5js.org/lberdugo/sketches/tcJ_atAqp