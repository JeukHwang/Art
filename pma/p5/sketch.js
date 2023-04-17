const sketch = (p5) => {
    let image;
    let image_blur;
    let image_blur_masked;
    let mask;
    let width, height;

    p5.preload = () => {
        image = p5.loadImage("../data/wally.jpg");
    };
    p5.setup = () => {
        width = image.width;
        height = image.height;

        p5.createCanvas(width, height);
        p5.frameRate(60);
        p5.pixelDensity(p5.displayDensity());

        image_blur = p5.createImage(width, height);
        image_blur.copy(image, 0, 0, width, height, 0, 0, width, height);
        image_blur.filter(p5.BLUR, 10);
        image_blur_masked = p5.createImage(width, height);
    };
    p5.draw = () => {
        p5.image(image, 0, 0);
        mask = p5.createGraphics(width, height);
        mask.circle(p5.mouseX, p5.mouseY, 300);
        image_blur_masked.copy(image_blur, 0, 0, width, height, 0, 0, width, height);
        image_blur_masked.mask(mask);
        p5.image(image_blur_masked, 0, 0);
    };
};

const canvas = new p5(sketch);
