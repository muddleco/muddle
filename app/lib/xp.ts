export function getLevel(xp: number) {
    return Math.floor(xp / 100);
}

export function getLevelName(xp: number) {
    switch (true) {
        case xp < 100:
            return "Beginner";
        case xp >= 100 && xp < 200:
            return "Intermediate";
        case xp >= 200 && xp < 300:
            return "Expert";
        case xp >= 300 && xp < 400:
            return "Master";
        default:
            return "Unknown";
    }
}

export function getRemainingXP(xp: number) {
  return 100 - (xp % 100);
}
