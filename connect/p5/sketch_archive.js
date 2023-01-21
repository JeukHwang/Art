// import history from "../data/bodyInfo.js";
// import test from '../data/test.json' assert { type: 'json' };

let bodyInfo;
let history;
function preload() {
    // bodyInfo = loadJSON("../data/bodyInfo.json");
    // history = loadJSON("../data/history.js");
}

function setup() {
    createCanvas(400, 400);
    // console.log(bodyInfo[0]);

    let timeStep = 1 / 60;
    let velocityIterations = 6;
    let positionIterations = 2;
    let gravity = planck.Vec2(0.0, -10.0);
    let world = planck.World({
        gravity: gravity,
    });
    for (let i = 0; i < 60; ++i) {
        world.step(timeStep, velocityIterations, positionIterations);
        let position = body.getPosition();
        let angle = body.getAngle();
        console.log(position.x, position.y, angle);
    }
}

function draw() {
    background(220);
    ellipse(50, 50, 80, 80);
}