function initPhysics(physics) {
    const gravity = planck.Vec2(0.0, -10.0);
    const world = planck.World({ gravity: gravity });
    const leftWall = world.createBody();
    leftWall.createFixture(planck.Edge(planck.Vec2(-physics.width / 2, -physics.height / 2), planck.Vec2(-physics.width / 2, physics.height / 2)));
    const rightWall = world.createBody();
    rightWall.createFixture(planck.Edge(planck.Vec2(physics.width / 2, -physics.height / 2), planck.Vec2(physics.width / 2, physics.height / 2)));
    const lowerWall = world.createBody();
    lowerWall.createFixture(planck.Edge(planck.Vec2(-physics.width / 2, -physics.height / 2), planck.Vec2(physics.width / 2, -physics.height / 2)));
    // const upperLeftWall = world.createBody();
    // upperLeftWall.createFixture(planck.Edge(planck.Vec2(-physics.width / 2, physics.height / 2), planck.Vec2(-physics.width / 4, physics.height / 2)));
    // const upperRightWall = world.createBody();
    // upperRightWall.createFixture(planck.Edge(planck.Vec2(physics.width / 4, physics.height / 2), planck.Vec2(physics.width / 2, physics.height / 2)));
    physics.world = world;
}

function createCircle(physics) {
    const box = physics.world.createBody().setDynamic();
    const radius = physics.random() > 0.6
        ? (9 / (1 + Math.exp((physics.counter.total / 36 - 20 + physics.random() * 5) / 6)) + 2)
        : (7 * physics.random() + 2);
    box.createFixture(planck.Circle(radius), { density: 1.0, friction: 0.1 });
    box.setPosition(planck.Vec2(physics.random(-2, 2), physics.height / 2 + radius));
    box.setUserData({ id: physics.counter.circle, radius: radius });
    physics.counter.circle += 1;
}

function savePhysics(physics) {
    console.log(physics.counter.total);
    const bodies = [];
    for (let body = physics.world.getBodyList(); body; body = body.getNext()) {
        let data = body.getUserData();
        let pos = body.getPosition();
        let angle = body.getAngle();
        if (data !== null) {
            let { id, radius } = data;
            bodies.push({ id, radius, x: pos.x, y: pos.y, angle });
        }
    }
    physics.flag.sleep = true;
    console.log(bodies);
}

function updatePhysics(physics) {
    const timeStep = 1 / physics.fps;
    physics.world.step(timeStep, physics.velocityIterations, physics.positionIterations);
    let sleeping = true;
    for (var b = physics.world.getBodyList(); b; b = b.getNext()) {
        if (b.isDynamic() && b.isAwake()) { sleeping = false; }
    }
    if (!physics.flag.sleep && sleeping && physics.counter.circle == physics.counter.maxCircle) {
        savePhysics(physics);
    }
    if (sleeping || physics.counter.lastCreate > 100) {
        if (physics.counter.circle < physics.counter.maxCircle) {
            createCircle(physics);
            physics.counter.lastCreate = 0;
        }
    }
    physics.counter.lastCreate += 1;
    physics.counter.total += 1;
}

function initRender(p5, render, physics) {
    p5.createCanvas(render.width, render.height);
    p5.frameRate(render.fps);
    p5.noStroke();
    p5.strokeWeight(0);
    p5.imageMode(p5.CENTER);
    p5.pixelDensity(p5.displayDensity());

    render.asset.resize(render.width, render.height);
    render.sleep_body_info.forEach((body_info) => {
        const { id, radius: radius_ } = body_info;
        const radius = render.convert.length(radius_);
        const diameter = 2 * radius;
        const size = diameter + 2 * render.margin;
        const pos = render.convert.pos(body_info);
        const assetClip = p5.createImage(size, size);
        assetClip.copy(render.asset, Math.round(pos.x - radius - render.margin), Math.round(pos.y - radius - render.margin), size, size, 0, 0, size, size);
        let shape = p5.createGraphics(size, size);
        shape.circle(radius + render.margin, radius + render.margin, diameter + 2 * render.margin);
        assetClip.mask(shape);
        render.graphics[id] = assetClip;
    });
}

function updateRender(p5, render, physics) {
    p5.background(220);
    for (let body = physics.world.getBodyList(); body; body = body.getNext()) {
        let data = body.getUserData();
        let pos = body.getPosition();
        if (data !== null) {
            let { id, radius } = data;
            let body_info = render.sleep_body_info[89 - id];
            let pos_ = render.convert.pos(pos);
            let angle = body_info.angle - body.getAngle();
            let radius_ = render.convert.length(radius);
            p5.ellipse(pos_.x, pos_.y, 2 * radius_, 2 * radius_);
            p5.push();
            p5.translate(pos_.x, pos_.y);
            p5.rotate(angle);
            p5.image(render.graphics[id], 0,0);
            p5.pop();
        }
    }
}

const sketch = (p5) => {
    const physics_ = {
        fps: 60, seed: 6,
        random: (min = 0, max = 1) => {
            physics_.seed = (physics_.seed * 9301 + 49297) % 233280;
            return min + (physics_.seed / 233280) * (max - min);
        },
        width: 72.5, height: 108,
        velocityIterations: 6, positionIterations: 2,
        world: null,
        counter: { total: 0, lastCreate: 0, circle: 0, maxCircle: 90 },
        flag: { sleep: false }
    };
    const render_ = {
        ratio: 5, convert: {
            pos: (position) => {
                return {
                    x: Math.round(position.x * render_.ratio + render_.width / 2),
                    y: Math.round(-position.y * render_.ratio + render_.height / 2)
                };
            },
            length: (length) => Math.round(length * render_.ratio)
        },
        width: null, height: null, margin: 5,
        fps: physics_.fps,
        asset: null, sleep_body_info: null,
        graphics: {}
    };
    render_.width = render_.convert.length(physics_.width);
    render_.height = render_.convert.length(physics_.height);
    render_.sleep_body_info = [
        {
            "id": 89,
            "radius": 2,
            "x": 1.1555759683021396,
            "y": 39.88720697854672,
            "angle": -0.02848980913743917
        },
        {
            "id": 88,
            "radius": 1.7010459533607682,
            "x": -6.56833254936135,
            "y": 35.155354687998795,
            "angle": 3.4545058614487356
        },
        {
            "id": 87,
            "radius": 2.0000000000000004,
            "x": 4.610098718488759,
            "y": 37.873814379224015,
            "angle": -1.410723774254762
        },
        {
            "id": 86,
            "radius": 3.899219821673525,
            "x": -22.59581562006054,
            "y": 28.61774254391067,
            "angle": 5.543413036209932
        },
        {
            "id": 85,
            "radius": 4.772612311385459,
            "x": -0.37283950017971323,
            "y": 33.29452000817327,
            "angle": -0.14656454445366582
        },
        {
            "id": 84,
            "radius": 2.000000000000001,
            "x": 3.3377434635069885,
            "y": 27.634837260460166,
            "angle": 0.4338034631408486
        },
        {
            "id": 83,
            "radius": 5.651341735253772,
            "x": 10.012707133611285,
            "y": 32.46290314583268,
            "angle": -2.2303930108756953
        },
        {
            "id": 82,
            "radius": 2.0000000000000036,
            "x": 6.4773419436875725,
            "y": 25.164519082998968,
            "angle": -2.600675757979888
        },
        {
            "id": 81,
            "radius": 2.000000000000003,
            "x": 10.030585392059397,
            "y": 23.33858162811791,
            "angle": -4.42923281318034
        },
        {
            "id": 80,
            "radius": 3.549296982167353,
            "x": 15.331789630355738,
            "y": 24.962081777068697,
            "angle": -4.471197790588838
        },
        {
            "id": 79,
            "radius": 5.603245027434842,
            "x": -9.56950967060526,
            "y": 28.501637561357104,
            "angle": 1.0962976306400825
        },
        {
            "id": 78,
            "radius": 3.8956189986282577,
            "x": 22.599460825346096,
            "y": 23.371269526881516,
            "angle": -5.932495114664036
        },
        {
            "id": 77,
            "radius": 2.000000000000037,
            "x": 15.698314926533804,
            "y": 19.430591945835594,
            "angle": -8.10859122161799
        },
        {
            "id": 76,
            "radius": 5.862311385459534,
            "x": -17.54409713060782,
            "y": 20.271026200417808,
            "angle": 3.8323441945338694
        },
        {
            "id": 75,
            "radius": 2.000000000000048,
            "x": 5.91751641549992,
            "y": 21.209024604159712,
            "angle": -1.71324208502808
        },
        {
            "id": 74,
            "radius": 2.0000000000001172,
            "x": 9.470814818650547,
            "y": 19.383128010779544,
            "angle": -5.827662576133211
        },
        {
            "id": 73,
            "radius": 1.0172110768175584,
            "x": -15.228989381830013,
            "y": 13.802158510701236,
            "angle": 9.144969218662832
        },
        {
            "id": 72,
            "radius": 2.9901406035665294,
            "x": 12.614575082111038,
            "y": 15.514299346928853,
            "angle": -3.9796097581908505
        },
        {
            "id": 71,
            "radius": 1.6181627229080933,
            "x": -21.847663767707893,
            "y": 14.158900982724935,
            "angle": 2.8923420507945816
        },
        {
            "id": 70,
            "radius": 4.817944101508916,
            "x": -1.086110649671918,
            "y": 22.453614978164904,
            "angle": -0.7880692498710969
        },
        {
            "id": 69,
            "radius": 5.5061514060356656,
            "x": 20.98902505046492,
            "y": 14.113602984933497,
            "angle": -2.6839911994481223
        },
        {
            "id": 68,
            "radius": 2.000000000002363,
            "x": -24.494999999997646,
            "y": 11.696148110940497,
            "angle": -7.145359413056112
        },
        {
            "id": 67,
            "radius": 2.000000000004158,
            "x": -24.49645034066821,
            "y": 16.61322210021872,
            "angle": 13.30818593948765
        },
        {
            "id": 66,
            "radius": 1.6679955418381345,
            "x": 24.82700534230743,
            "y": 4.06642686174773,
            "angle": -15.045955799085293
        },
        {
            "id": 65,
            "radius": 2.0000000000098077,
            "x": -2.94809900496857,
            "y": 15.900334667209027,
            "angle": 4.362878342933475
        },
        {
            "id": 64,
            "radius": 2.000000000011443,
            "x": -2.3612528319835295,
            "y": 11.949019681015065,
            "angle": 0.24210763102535038
        },
        {
            "id": 63,
            "radius": 5.225673010973937,
            "x": 4.522757759057217,
            "y": 14.124398751363152,
            "angle": -1.2901290591713082
        },
        {
            "id": 62,
            "radius": 4.999528463648834,
            "x": -9.28386464326971,
            "y": 12.937428295434977,
            "angle": 1.7345076631782061
        },
        {
            "id": 61,
            "radius": 2.000000000032044,
            "x": 9.83386363844227,
            "y": 9.221099203413313,
            "angle": 1.9682793064360946
        },
        {
            "id": 60,
            "radius": 4.929183813443073,
            "x": -18.25423928946661,
            "y": 8.693843536415296,
            "angle": 3.895296600298217
        },
        {
            "id": 59,
            "radius": 2.0000000000773572,
            "x": -11.727567374383536,
            "y": 6.306377685485315,
            "angle": 3.0767724006419104
        },
        {
            "id": 58,
            "radius": 1.4792095336076818,
            "x": 12.785324271438064,
            "y": 11.053494401125395,
            "angle": 0.11022073946908349
        },
        {
            "id": 57,
            "radius": 2.0000000002484515,
            "x": 24.49500627988859,
            "y": 0.4185242740906097,
            "angle": -13.129415875786279
        },
        {
            "id": 56,
            "radius": 2.000000000513084,
            "x": -0.5604198190644039,
            "y": 8.384938017131354,
            "angle": 1.9901049453289963
        },
        {
            "id": 55,
            "radius": 4.759109224965707,
            "x": 15.50237294838147,
            "y": 5.443872170154997,
            "angle": -2.671144520206457
        },
        {
            "id": 54,
            "radius": 2.000000001353564,
            "x": 20.326542127234116,
            "y": 0.7125922426283819,
            "angle": -10.726118376000402
        },
        {
            "id": 53,
            "radius": 4.943394204389575,
            "x": -5.414505652762442,
            "y": 3.4277558920358744,
            "angle": 0.9575391852368633
        },
        {
            "id": 52,
            "radius": 4.1848422496570645,
            "x": -14.086309084835998,
            "y": 0.594483823378916,
            "angle": 2.4281051068864348
        },
        {
            "id": 51,
            "radius": 3.4147162208504804,
            "x": -21.66462605905287,
            "y": 1.0853035904518227,
            "angle": -0.2341823935669326
        },
        {
            "id": 50,
            "radius": 5.549682784636488,
            "x": 5.073204129355762,
            "y": 3.3681752536104557,
            "angle": -0.3893448837046821
        },
        {
            "id": 49,
            "radius": 3.506408607681756,
            "x": -7.317136471475806,
            "y": -4.799837958225954,
            "angle": 0.5911169559638804
        },
        {
            "id": 48,
            "radius": 2.0000000149342037,
            "x": 5.766688400925301,
            "y": -4.148541949395214,
            "angle": -5.120237469158235
        },
        {
            "id": 47,
            "radius": 3.5518046982167353,
            "x": -14.068587615051122,
            "y": -7.136648037552036,
            "angle": 1.61226703888502
        },
        {
            "id": 46,
            "radius": 1.4738082990397805,
            "x": -9.51949615511744,
            "y": -9.260549775762904,
            "angle": 4.773853353396663
        },
        {
            "id": 45,
            "radius": 2.0000001055641667,
            "x": -24.495185499890976,
            "y": 5.695107541389437,
            "angle": 2.8620387145652035
        },
        {
            "id": 44,
            "radius": 2.6997599451303156,
            "x": -19.873201060800394,
            "y": -4.829109638287414,
            "angle": 0.9971530180965568
        },
        {
            "id": 43,
            "radius": 1.8370413237311385,
            "x": -24.659682045469296,
            "y": -3.2179776600245185,
            "angle": 10.629583140612409
        },
        {
            "id": 42,
            "radius": 2.2127486282578874,
            "x": -24.15429118994847,
            "y": -7.227209171340285,
            "angle": 10.680774931270602
        },
        {
            "id": 41,
            "radius": 1.743548525377229,
            "x": -17.386003812825685,
            "y": -11.25699031600681,
            "angle": 8.012887178138827
        },
        {
            "id": 40,
            "radius": 3.34610768175583,
            "x": -0.31691780083981524,
            "y": -4.422022004481567,
            "angle": -1.0142153786206245
        },
        {
            "id": 39,
            "radius": 4.937092764060356,
            "x": 12.691541915578691,
            "y": -3.8303762578536458,
            "angle": -3.3565356065832677
        },
        {
            "id": 38,
            "radius": 2.000001821917404,
            "x": 4.8631103928665205,
            "y": -8.039994565171087,
            "angle": -2.5627086546482207
        },
        {
            "id": 37,
            "radius": 2.0000027580091015,
            "x": 15.881682633370552,
            "y": -10.333425511616904,
            "angle": -2.6247009633277387
        },
        {
            "id": 36,
            "radius": 2.0000051520299205,
            "x": -3.470421854241206,
            "y": -8.732762150968792,
            "angle": -2.515085821884958
        },
        {
            "id": 35,
            "radius": 4.518625685871056,
            "x": 21.976647465777464,
            "y": -5.588541403527435,
            "angle": -4.572138540947361
        },
        {
            "id": 34,
            "radius": 2.000011120941575,
            "x": -6.629280160818148,
            "y": -11.17830291148381,
            "angle": -12.018639863554654
        },
        {
            "id": 33,
            "radius": 2.573281035665295,
            "x": 0.8487868813325231,
            "y": -10.220359211970747,
            "angle": -1.733584211104367
        },
        {
            "id": 32,
            "radius": 2.0000241910804317,
            "x": -24.4962090185087,
            "y": -11.417782224720929,
            "angle": 8.634794589941322
        },
        {
            "id": 31,
            "radius": 2.248306755829904,
            "x": -2.92545122158931,
            "y": -13.248528444252953,
            "angle": 4.674666624463758
        },
        {
            "id": 30,
            "radius": 4.985125171467764,
            "x": 9.530892687267508,
            "y": -13.229825762615452,
            "angle": -2.0223200412609788
        },
        {
            "id": 29,
            "radius": 1.8770361796982167,
            "x": 12.538531927270457,
            "y": -19.392182482095684,
            "angle": -5.869138095623453
        },
        {
            "id": 28,
            "radius": 2.000154655580596,
            "x": 16.358814572046526,
            "y": -20.0240765282233,
            "angle": -6.103153741703494
        },
        {
            "id": 27,
            "radius": 4.792802640603567,
            "x": 20.9584953017023,
            "y": -14.8389668523407,
            "angle": -5.112813801002118
        },
        {
            "id": 26,
            "radius": 1.649991426611797,
            "x": 19.82058983832502,
            "y": -21.174592375910755,
            "angle": -14.446916327783692
        },
        {
            "id": 25,
            "radius": 2.0008090255135618,
            "x": -20.836060111918993,
            "y": -9.8155124574774,
            "angle": -4.744620155148148
        },
        {
            "id": 24,
            "radius": 2.001019593146943,
            "x": -6.092933491803112,
            "y": -16.295943513445103,
            "angle": 5.483088281074144
        },
        {
            "id": 23,
            "radius": 3.8187800068587103,
            "x": -11.657808600123593,
            "y": -14.095892614554291,
            "angle": 8.090956578815804
        },
        {
            "id": 22,
            "radius": 1.463005829903978,
            "x": -2.6959283739024986,
            "y": -16.947630216204733,
            "angle": 4.971430790333706
        },
        {
            "id": 21,
            "radius": 2.0082709380717305,
            "x": -8.853471264206425,
            "y": -19.196530979855503,
            "angle": 1.9813444401836047
        },
        {
            "id": 20,
            "radius": 2.1334019204389576,
            "x": -12.722146163839126,
            "y": -20.65875893423528,
            "angle": 5.877980515445717
        },
        {
            "id": 19,
            "radius": 5.992905521262003,
            "x": -20.5021130828105,
            "y": -18.332122036219484,
            "angle": 2.747908264261914
        },
        {
            "id": 18,
            "radius": 1.0908350480109739,
            "x": -20.529262306745142,
            "y": -25.401902705797568,
            "angle": 19.6582830245612
        },
        {
            "id": 17,
            "radius": 2.0286459495011844,
            "x": -10.54295607758844,
            "y": -24.19784485480558,
            "angle": 4.956786641368468
        },
        {
            "id": 16,
            "radius": 1.6686385459533608,
            "x": -22.175060551021293,
            "y": -27.599490307063782,
            "angle": 10.753268872190779
        },
        {
            "id": 15,
            "radius": 2.1067720269405705,
            "x": 24.388228394662594,
            "y": -20.82539954642251,
            "angle": -10.965381273045265
        },
        {
            "id": 14,
            "radius": 2.1913522227497912,
            "x": -14.848868324091073,
            "y": -24.919488199320856,
            "angle": 10.404567736664943
        },
        {
            "id": 13,
            "radius": 2.297832276124811,
            "x": -18.22442006338223,
            "y": -27.871350239534998,
            "angle": 12.665612886054895
        },
        {
            "id": 12,
            "radius": 1.018689986282579,
            "x": 17.963645834569416,
            "y": -23.08231503442804,
            "angle": -14.776197954910943
        },
        {
            "id": 11,
            "radius": 1.4522676611796983,
            "x": -25.047004531038844,
            "y": -28.787014026777936,
            "angle": 14.437204990145055
        },
        {
            "id": 10,
            "radius": 3.169042147350809,
            "x": 1.8055437847463107,
            "y": -15.877261809190948,
            "angle": -1.9815580930411036
        },
        {
            "id": 9,
            "radius": 3.951367455418381,
            "x": 6.164161078346928,
            "y": -21.50136883101975,
            "angle": -1.2881480032975157
        },
        {
            "id": 8,
            "radius": 4.196423816337385,
            "x": 13.30454916748034,
            "y": -25.412080250854494,
            "angle": -3.114001736169359
        },
        {
            "id": 7,
            "radius": 4.575437331806904,
            "x": 21.919949452482292,
            "y": -27.02964848997497,
            "angle": -4.1746055563718025
        },
        {
            "id": 6,
            "radius": 5.529878257887518,
            "x": -2.994518809014173,
            "y": -23.928932893326266,
            "angle": 0.8312793526255549
        },
        {
            "id": 5,
            "radius": 6.14587603982226,
            "x": -11.074445981107216,
            "y": -32.34946938392288,
            "angle": 2.8015506365356946
        },
        {
            "id": 4,
            "radius": 5.829903978052126,
            "x": 4.474495812256261,
            "y": -32.66192153231745,
            "angle": -0.5179117184731954
        },
        {
            "id": 3,
            "radius": 4.504222393689986,
            "x": 14.721767626788075,
            "y": -33.99094923631507,
            "angle": -3.6350462152738663
        },
        {
            "id": 2,
            "radius": 1.083633401920439,
            "x": 19.13165395254014,
            "y": -37.41247606945841,
            "angle": -14.644600086969037
        },
        {
            "id": 1,
            "radius": 3.4848036694101507,
            "x": 23.01030349218537,
            "y": -35.010367868376235,
            "angle": -7.564313460302548
        },
        {
            "id": 0,
            "radius": 4.624399862825789,
            "x": -21.731556318748456,
            "y": -33.87084075962825,
            "angle": 4.2058450911603655
        }
    ];

    const capturer = new CCapture({ format: 'webm', framerate: physics_.fps });

    p5.preload = () => {
        render_.asset = p5.loadImage("../data/725px-Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg");
    };

    p5.setup = () => {
        initPhysics(physics_);
        initRender(p5, render_, physics_);
    };
    p5.draw = () => {
        if (p5.frameCount === 1) { capturer.start(); }
        if (physics_.flag.sleep) {
            p5.noLoop();
            console.log('Recording stop');
            capturer.stop();
            capturer.save();
            return;
        }

        // main
        updatePhysics(physics_);
        updateRender(p5, render_, physics_);

        capturer.capture(document.getElementById('defaultCanvas0'));
    };
};

const canvas = new p5(sketch); 