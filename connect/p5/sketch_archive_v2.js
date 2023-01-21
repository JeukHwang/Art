function initPhysics(physics) {
    const gravity = planck.Vec2(0.0, -20.0);
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
        ? (6 / (1 + Math.exp((physics.counter.total / 36 - 20 + physics.random() * 5) / 6)) + 2)
        : (5 * physics.random() + 1);
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

function initRender(p5, render) {
    p5.createCanvas(render.width, render.height);
    p5.frameRate(render.fps);
    p5.noStroke();
    p5.strokeWeight(0);
    p5.imageMode(p5.CENTER);
}

function updateRender(p5, render, physics) {
    p5.background(220);
    for (let body = physics.world.getBodyList(); body; body = body.getNext()) {
        let data = body.getUserData();
        let pos = body.getPosition();
        if (data !== null) {
            let { id, radius } = data;
            let pos_ = render.convert.pos(pos);
            let radius_ = render.convert.length(radius);
            // let body_info = render.sleep_body_info.find((b) => b.id === id);
            let body_info = render.sleep_body_info[89 - id];

            let pos__ = render.convert.pos(body_info);
            let angle = body_info.angle - body.getAngle();
            // p5.ellipse(pos_.x, pos_.y, 2 * radius_, 2 * radius_);
            p5.push();
            let assetClip = p5.createImage(2 * radius_, 2 * radius_);
            assetClip.copy(
                render.asset,
                pos__.x - radius_, pos__.y - radius_, 2 * radius_, 2 * radius_,
                0, 0, 2 * radius_, 2 * radius_
            );
            let shape = p5.createGraphics(2 * radius_, 2 * radius_);
            shape.ellipse(radius_, radius_, 2 * radius_, 2 * radius_);
            assetClip.mask(shape);
            p5.translate(pos_.x, pos_.y);
            p5.rotate(angle);
            p5.image(assetClip, 0, 0, 2 * radius_, 2 * radius_);
            p5.pop();
        }
    }
}

const sketch = (p5) => {
    const physics_ = {
        fps: 60, seed: 6, random: (min = 0, max = 1) => {
            physics_.seed = (physics_.seed * 9301 + 49297) % 233280;
            return min + (physics_.seed / 233280) * (max - min);
        },
        width: 53, height: 77,
        velocityIterations: 6, positionIterations: 2,
        world: null,
        counter: { total: 0, lastCreate: 0, circle: 0, maxCircle: 90 },
        flag: { sleep: false }
    };
    const render_ = {
        ratio: 15, convert: {
            pos: (position) => {
                return {
                    x: position.x * render_.ratio + render_.width / 2,
                    y: -position.y * render_.ratio + render_.height / 2
                };
            },
            length: (length) => length * render_.ratio
        },
        width: null, height: null,
        fps: physics_.fps,
        asset: null, sleep_body_info: null
    };
    render_.width = render_.convert.length(physics_.width);
    render_.height = render_.convert.length(physics_.height);
    render_.sleep_body_info = [
        { "id": 89, "radius": 2, "x": -15.019748698431814, "y": 27.19482748876731, "angle": 10.031758169914195 },
        { "id": 88, "radius": 1.7010459533607682, "x": -17.18948567221496, "y": 24.202682322386913, "angle": 10.832776348628293 },
        { "id": 87, "radius": 2.0000000000000004, "x": 2.105555737612525, "y": 34.281655638669804, "angle": -0.9898770327558817 },
        { "id": 86, "radius": 3.899219821673525, "x": -22.595783607349837, "y": 27.343916940045457, "angle": 5.296305071929124 },
        { "id": 85, "radius": 4.772612311385459, "x": 10.514451314965878, "y": 33.76377329387236, "angle": -2.0900092277687494 },
        { "id": 84, "radius": 2.000000000000001, "x": 13.239664232179612, "y": 27.569361537192503, "angle": -5.862508920566209 },
        { "id": 83, "radius": 5.651341735253772, "x": 20.838716959219653, "y": 28.417583518999223, "angle": -2.540949409250056 },
        { "id": 82, "radius": 2.0000000000000036, "x": 24.495350453254552, "y": 21.702876627794808, "angle": -8.156587251486128 },
        { "id": 81, "radius": 2.000000000000003, "x": 4.3480343239591, "y": 30.975426384304185, "angle": -0.9121999707454127 },
        { "id": 80, "radius": 3.549296982167353, "x": 6.362791101114559, "y": 25.810217380571988, "angle": -1.0011448841851627 },
        { "id": 79, "radius": 5.603245027434842, "x": 13.40595930463927, "y": 19.97321766245093, "angle": -1.864669195643116 },
        { "id": 78, "radius": 3.8956189986282577, "x": 22.599418056002154, "y": 16.126293388587317, "angle": -3.1040202407010287 },
        { "id": 77, "radius": 2.000000000000037, "x": 20.48662122048977, "y": 10.62843552177997, "angle": -7.066972995801745 },
        { "id": 76, "radius": 5.862311385459534, "x": -3.062170687258994, "y": 28.362925694486123, "angle": 0.12605052835059885 },
        { "id": 75, "radius": 2.000000000000048, "x": 24.495023542384967, "y": 10.156970107116816, "angle": -11.862630776469334 },
        { "id": 74, "radius": 2.0000000000001172, "x": -3.1810117212746856, "y": 20.507000770298884, "angle": 1.436709945258661 },
        { "id": 73, "radius": 1.0172110768175584, "x": -5.900249161086344, "y": 19.21412899095585, "angle": 4.27803096946737 },
        { "id": 72, "radius": 2.9901406035665294, "x": 1.9156175818770278, "y": 21.02265214924466, "angle": 0.23319694457871484 },
        { "id": 71, "radius": 1.6181627229080933, "x": -1.1063791830443614, "y": 17.55022212102215, "angle": -1.6044565634685921 },
        { "id": 70, "radius": 4.817944101508916, "x": -11.25518182279519, "y": 21.51647721212315, "angle": 1.7704871936904603 },
        { "id": 69, "radius": 5.5061514060356656, "x": -20.98604227214237, "y": 18.082429697017222, "angle": 4.316423449002687 },
        { "id": 68, "radius": 2.000000000002363, "x": -17.577355902423708, "y": 11.199863451731412, "angle": 3.8886199880935153 },
        { "id": 67, "radius": 2.000000000004158, "x": -24.495198317023394, "y": 11.453152828681851, "angle": 9.560212678978944 },
        { "id": 66, "radius": 1.6679955418381345, "x": -12.642380552912845, "y": 12.936816359381886, "angle": 7.97681540556401 },
        { "id": 65, "radius": 2.0000000000098077, "x": -20.701402371071474, "y": 8.709881419421512, "angle": 10.348272003666617 },
        { "id": 64, "radius": 2.000000000011443, "x": -24.495266505653806, "y": 7.458859431470926, "angle": 10.840956885940251 },
        { "id": 63, "radius": 5.225673010973937, "x": 4.089407089334279, "y": 13.104881800884096, "angle": 0.8037385178456486 },
        { "id": 62, "radius": 4.999528463648834, "x": 13.605359667844931, "y": 9.377484447553224, "angle": -2.8936635626761884 },
        { "id": 61, "radius": 2.000000000032044, "x": -13.617298264058336, "y": 9.40599429084077, "angle": 4.300132824970779 },
        { "id": 60, "radius": 4.929183813443073, "x": -6.058953414572201, "y": 13.27586392989675, "angle": 0.667358202236953 },
        { "id": 59, "radius": 2.0000000000773572, "x": -7.777851082133067, "y": 6.569227623061151, "angle": 4.323863859435237 },
        { "id": 58, "radius": 1.4792095336076818, "x": 5.790601597828653, "y": 3.741320232952468, "angle": -4.291321465859276 },
        { "id": 57, "radius": 2.0000000002484515, "x": -7.391177884220485, "y": 2.5940703730571655, "angle": 3.9706798415966094 },
        { "id": 56, "radius": 2.000000000513084, "x": 9.260920826979653, "y": 3.896799595453381, "angle": -0.6866442129195669 },
        { "id": 55, "radius": 4.759109224965707, "x": 21.736724348199694, "y": 3.99186728955237, "angle": -3.183102219306948 },
        { "id": 54, "radius": 2.000000001353564, "x": -16.98317072814485, "y": 7.24934274397465, "angle": 4.674491011031441 },
        { "id": 53, "radius": 4.943394204389575, "x": -0.6169186660131714, "y": 4.096214888210361, "angle": -0.03613735739449797 },
        { "id": 52, "radius": 4.1848422496570645, "x": 6.890685404621551, "y": -1.8097567844622438, "angle": 0.3425844859990454 },
        { "id": 51, "radius": 3.4147162208504804, "x": -12.588405766150492, "y": 4.095096242360213, "angle": 2.364642310400639 },
        { "id": 50, "radius": 5.549682784636488, "x": -20.924994249151023, "y": 0.8130476379437294, "angle": 4.653131310499544 },
        { "id": 49, "radius": 3.506408607681756, "x": 14.10676981931716, "y": 0.8314064849370855, "angle": 0.6287154914395687 },
        { "id": 48, "radius": 2.0000000149342037, "x": -12.286141998500796, "y": -1.3058337556865722, "angle": 6.641261505424311 },
        { "id": 47, "radius": 3.5518046982167353, "x": -22.944820270393013, "y": -8.056422158130474, "angle": 4.802325837070736 },
        { "id": 46, "radius": 1.4738082990397805, "x": 18.969946051836615, "y": -3.5967217407840706, "angle": -10.72593813935632 },
        { "id": 45, "radius": 2.0000001055641667, "x": 0.7798076569489847, "y": -2.699868315615148, "angle": -2.826977287571865 },
        { "id": 44, "radius": 2.6997599451303156, "x": 23.795491685186047, "y": -3.1717957403228376, "angle": -4.848463487264392 },
        { "id": 43, "radius": 1.8370413237311385, "x": 20.657095329485962, "y": -6.439615149405965, "angle": -10.077321034618329 },
        { "id": 42, "radius": 2.2127486282578874, "x": 24.282848125431226, "y": -8.229411832642429, "angle": -12.665948134694975 },
        { "id": 41, "radius": 1.743548525377229, "x": 0.28686423823286666, "y": -6.4906443208399285, "angle": -1.6483565225897026 },
        { "id": 40, "radius": 3.34610768175583, "x": 5.779564098092975, "y": -9.252648852307926, "angle": -2.0308151666576983 },
        { "id": 39, "radius": 4.937092764060356, "x": -5.984122844242923, "y": -4.193058493848935, "angle": 0.3055144696500637 },
        { "id": 38, "radius": 2.000001821917404, "x": -8.408052735562348, "y": -10.696854597663021, "angle": 1.2575799616053593 },
        { "id": 37, "radius": 2.0000027580091015, "x": 7.191945030978314, "y": -14.402230103639011, "angle": 3.4967682561749536 },
        { "id": 36, "radius": 2.0000051520299205, "x": 0.5284554742222168, "y": -10.221378587177295, "angle": -2.5951542678943587 },
        { "id": 35, "radius": 4.518625685871056, "x": -14.920717825960809, "y": -7.262602902113714, "angle": 2.481289551806353 },
        { "id": 34, "radius": 2.000011120941575, "x": -18.806809729978106, "y": -12.495654627776855, "angle": 6.240114856302789 },
        { "id": 33, "radius": 2.573281035665295, "x": 11.735318414256318, "y": -14.874437579160388, "angle": -0.03131358255332266 },
        { "id": 32, "radius": 2.0000241910804317, "x": 13.052940938572947, "y": -19.24767652456406, "angle": 0.7224363347492259 },
        { "id": 31, "radius": 2.248306755829904, "x": -3.6443410673823857, "y": -10.98072684130848, "angle": 2.1318159332211866 },
        { "id": 30, "radius": 4.985125171467764, "x": 13.95045953823288, "y": -7.653591791809532, "angle": -0.8735661121936248 },
        { "id": 29, "radius": 1.8770361796982167, "x": -2.937812134539711, "y": -15.883037260579233, "angle": -0.527314924461592 },
        { "id": 28, "radius": 2.000154655580596, "x": 16.942409548773103, "y": -20.15913007338151, "angle": -5.592699876842338 },
        { "id": 27, "radius": 4.792802640603567, "x": 21.00638765692594, "y": -14.415385117048803, "angle": -6.377553031569317 },
        { "id": 26, "radius": 1.649991426611797, "x": 20.523945186116705, "y": -20.83376747622928, "angle": -12.102355976580627 },
        { "id": 25, "radius": 2.0008090255135618, "x": -6.437643848351622, "y": -14.172809470462518, "angle": -7.34196503186141 },
        { "id": 24, "radius": 2.001019593146943, "x": -24.494436284863607, "y": -13.38260977745908, "angle": 11.12647663151943 },
        { "id": 23, "radius": 3.8187800068587103, "x": -12.172220722444253, "y": -15.127666070173458, "angle": 3.6189895120334334 },
        { "id": 22, "radius": 1.463005829903978, "x": -5.812986378292445, "y": -17.572584807874353, "angle": 5.960841904424528 },
        { "id": 21, "radius": 2.0082709380717305, "x": -8.556650374605633, "y": -19.688967823612504, "angle": 2.0912926951734443 },
        { "id": 20, "radius": 2.1334019204389576, "x": -12.426045090752092, "y": -21.14585850523601, "angle": 6.847044619169627 },
        { "id": 19, "radius": 5.992905521262003, "x": -20.502258468626255, "y": -20.301595848737637, "angle": 2.4452894787068113 },
        { "id": 18, "radius": 1.0908350480109739, "x": -25.404164951989035, "y": -26.79896492687966, "angle": 10.915816339655029 },
        { "id": 17, "radius": 2.0286459495011844, "x": -9.547947315480855, "y": -24.179684984172408, "angle": 6.999551298887625 },
        { "id": 16, "radius": 1.6686385459533608, "x": -22.364177539937923, "y": -27.726637860761496, "angle": 11.011030832020213 },
        { "id": 15, "radius": 2.1067720269405705, "x": 24.388239311678696, "y": -20.69026052962557, "angle": -11.278525108246 },
        { "id": 14, "radius": 2.1913522227497912, "x": -13.877455757172966, "y": -25.21336617856553, "angle": 10.42559677897459 },
        { "id": 13, "radius": 2.297832276124811, "x": -17.401535503283522, "y": -27.985037612002653, "angle": 11.28144173695404 },
        { "id": 12, "radius": 1.018689986282579, "x": 17.892101409503606, "y": -23.01935332209321, "angle": -15.466666377620362 },
        { "id": 11, "radius": 1.4522676611796983, "x": -25.043906267007948, "y": -29.312467172998286, "angle": 19.190706027376528 },
        { "id": 10, "radius": 3.169042147350809, "x": 2.050483594307786, "y": -15.156013598184558, "angle": -1.5491934689786988 },
        { "id": 9, "radius": 3.951367455418381, "x": 6.922690532475117, "y": -20.341467846572435, "angle": -1.7527678273566625 },
        { "id": 8, "radius": 4.196423816337385, "x": 13.275577770325752, "y": -25.434420609201783, "angle": -2.9419168376572182 },
        { "id": 7, "radius": 4.575437331806904, "x": 21.9197110967719, "y": -26.89431920676419, "angle": -3.5164769019168305 },
        { "id": 6, "radius": 5.529878257887518, "x": -2.030153056079443, "y": -23.446124369546034, "angle": 1.0906571500245232 },
        { "id": 5, "radius": 6.14587603982226, "x": -9.576139242371378, "y": -32.34915598613129, "angle": 2.3059771022371502 },
        { "id": 4, "radius": 5.829903978052126, "x": 4.5973738492560905, "y": -32.6652765265422, "angle": -0.47823855237044277 },
        { "id": 3, "radius": 4.504222393689986, "x": 14.841075778518752, "y": -33.987454235841646, "angle": -5.839444220132381 },
        { "id": 2, "radius": 1.083633401920439, "x": 19.23352198426522, "y": -37.419344741597335, "angle": -8.448165210030925 },
        { "id": 1, "radius": 3.4848036694101507, "x": 23.010771392672037, "y": -34.87470734590896, "angle": -7.435225349299553 },
        { "id": 0, "radius": 4.624399862825789, "x": -21.034450674715234, "y": -33.870866007348305, "angle": 3.375827963555388 }
    ];

    p5.preload = () => {
        render_.asset = p5.loadImage("../data/1449px-Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg");
    };

    p5.setup = () => {
        initPhysics(physics_);
        initRender(p5, render_);
    };
    p5.draw = () => {
        updatePhysics(physics_);
        updateRender(p5, render_, physics_);
    };
};

const canvas = new p5(sketch); 