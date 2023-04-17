let seed = 1;
export function random(min = 0, max = 1) {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
}

export function randInt(min, max) {
    return Math.floor(random()*(max-min)+min)
}