export function drawSpade(p5, x, y, width, height) {
    var bottomWidth = width * 0.7;
    var topHeight = height * 0.7;
    var bottomHeight = height * 0.3;

    p5.beginShape();
    p5.vertex(x, y);
    p5.bezierVertex(x, y + topHeight / 2, x - width / 2, y + topHeight / 2, x - width / 2, y + topHeight);
    p5.bezierVertex(x - width / 2, y + topHeight * 1.3, x, y + topHeight * 1.3, x, y + topHeight);
    p5.bezierVertex(x, y + topHeight * 1.3, x + width / 2, y + topHeight * 1.3, x + width / 2, y + topHeight);
    p5.bezierVertex(x + width / 2, y + topHeight / 2, x, y + topHeight / 2, x, y);
    p5.endShape(p5.CLOSE);

    p5.beginShape();
    p5.vertex(x, y + topHeight);
    p5.quadraticVertex(x, y + topHeight + bottomHeight, x - bottomWidth / 2, y + topHeight + bottomHeight);
    p5.vertex(x + bottomWidth / 2, y + topHeight + bottomHeight);
    p5.quadraticVertex(x, y + topHeight + bottomHeight, x, y + topHeight);
    p5.endShape(p5.CLOSE);

}