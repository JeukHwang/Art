let seed = 6;
function random(min = 0, max = 1) {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
};

const bodyInfo = new Map();
const history = [];

function saveBody(body) {
    return { id: body.getUserData().id, x: body.getPosition().x, y: body.getPosition().y, angle: body.getAngle() };
}

planck.testbed('Boxes', function (testbed) {
    const width = 53, height = 77;
    var pl = planck, Vec2 = pl.Vec2;
    var world = pl.World(Vec2(0, -20));

    // Left wall
    var bar = world.createBody();
    bar.createFixture(pl.Edge(Vec2(-width / 2, -height / 2), Vec2(-width / 2, height / 2)));

    // Right wall
    var bar = world.createBody();
    bar.createFixture(pl.Edge(Vec2(width / 2, -height / 2), Vec2(width / 2, height / 2)));

    // Lower wall
    var bar = world.createBody();
    bar.createFixture(pl.Edge(Vec2(-width / 2, -height / 2), Vec2(width / 2, -height / 2)));

    // Upper wall
    var bar = world.createBody();
    bar.createFixture(pl.Edge(Vec2(-width / 2, height / 2), Vec2(-width / 4, height / 2)));

    // Upper wall
    var bar = world.createBody();
    bar.createFixture(pl.Edge(Vec2(width / 4, height / 2), Vec2(width / 2, height / 2)));

    let stepCounter = 0;
    let stepCounterCreate = 0;
    let createCounter = 0;

    function create() {
        createCounter += 1;
        // console.log(createCounter);
        // console.log(Array.from(bodyInfo));
        // console.log(history);
        if (createCounter == 105) {
            console.log(Array.from(bodyInfo));
            console.log(history);
        } else if (createCounter > 105) {
            return;
        }
        var box = world.createBody().setDynamic();
        var ran = random();
        var rad_ = 6 / (1 + Math.exp((stepCounter / 36 - 20 + random() * 5) / 6)) + 2;
        var rad = ran > 0.6 ? rad_ : 5 * random() + 1;
        box.createFixture(pl.Circle(rad), { density: 1.0, friction: 0.1 });
        box.setPosition(Vec2(random(-2, 2), height / 2 + rad));
        box.setUserData({ "id": createCounter });
        bodyInfo.set(createCounter, rad);
    }

    testbed.keydown = function (code, char) { if (testbed.activeKeys.fire) { create(); } };

    testbed.step = function () {
        var sleeping = true;
        var bodies = [];
        for (var b = world.getBodyList(); b; b = b.getNext()) {
            if (b.isDynamic() && b.isAwake()) { sleeping = false; }
            if (b.getUserData() !== null) {
                bodies.push(saveBody(b));
            }
        }
        history.push({ time: stepCounter, bodies: bodies });
        if (sleeping || stepCounterCreate > 100) {
            create();
            stepCounterCreate = 0;
        }
        stepCounter += 1;
        stepCounterCreate += 1;
    };
    return world;
});
