/* Device-only progress. Saves contain IDs, never arbitrary player coordinates. */
export const DEFAULT_SETTINGS = Object.freeze({music: 28, effects: 50, muted: false, gentle: false, large: false});
const settingsKey = 'claire-treat-trail-settings:v2';
const prefix = 'claire-treat-trail-save:';
export function starsFor(count, total, completed = true) {
  if (!completed) return 0;
  return count >= total ? 3 : count >= Math.ceil(total * .75) ? 2 : 1;
}
export function validSave(raw, level) {
  if (!raw || raw.schema !== 2 || raw.levelVersion !== level.version || raw.completed) return null;
  if (!Number.isInteger(raw.checkpointIndex) || raw.checkpointIndex < -1 || raw.checkpointIndex >= level.checkpoints.length) return null;
  if (!Array.isArray(raw.collected) || raw.collected.length > level.treats.length ||
      raw.collected.some(i => !Number.isInteger(i) || i < 0 || i >= level.treats.length)) return null;
  return {schema: 2, levelVersion: level.version, checkpointIndex: raw.checkpointIndex,
    collected: [...new Set(raw.collected)], savedAt: Number(raw.savedAt) || 0};
}
export class ProgressStore {
  constructor(storage) {
    this.available = true;
    try { this.storage = storage === undefined ? window.localStorage : storage; }
    catch (_) { this.storage = null; this.available = false; }
  }
  get(key) { try { return this.storage?.getItem(key) ?? null; } catch (_) { this.available = false; return null; } }
  put(key, value) {
    try { if (!this.storage) throw new Error('No storage'); this.storage.setItem(key, value); return true; }
    catch (_) { this.available = false; return false; }
  }
  remove(key) { try { this.storage?.removeItem(key); } catch (_) { this.available = false; } }
  json(key) { try { return JSON.parse(this.get(key)); } catch (_) { return null; } }
  settings() {
    const s = this.json(settingsKey) || {}, result = {...DEFAULT_SETTINGS};
    for (const k of ['music', 'effects']) if (Number.isFinite(s[k])) result[k] = Math.max(0, Math.min(100, s[k]));
    for (const k of ['muted', 'gentle', 'large']) if (typeof s[k] === 'boolean') result[k] = s[k];
    return result;
  }
  saveSettings(s) { return this.put(settingsKey, JSON.stringify(s)); }
  load(level) { return validSave(this.json(prefix + level.id), level); }
  save(game) {
    if (game.finished) return false;
    return this.put(prefix + game.level.id, JSON.stringify({schema: 2, levelVersion: game.level.version,
      checkpointIndex: game.checkpointIndex, collected: [...game.collected], savedAt: Date.now()}));
  }
  restore(game, data) {
    const saved = validSave(data, game.level);
    if (!saved) return false;
    game.reset();
    game.checkpointIndex = saved.checkpointIndex;
    game.checkpoint = {...(saved.checkpointIndex < 0 ? game.level.start : game.level.checkpoints[saved.checkpointIndex])};
    Object.assign(game.player, game.checkpoint, {vx: 0, vy: 0, dir: 1, grounded: true});
    game.collected = new Set(saved.collected);
    game.seedTrail();
    return true;
  }
  best(level) {
    // Keep Beta 1's existing score key, including a completed zero-treat run.
    const raw = this.get('claire-treat-trail-best:' + level.id), value = Number(raw);
    const complete = raw !== null && raw.trim() !== '' && Number.isFinite(value) && value >= 0;
    const count = complete ? Math.min(level.treats.length, Math.floor(value)) : 0;
    return {count, complete, stars: starsFor(count, level.treats.length, complete)};
  }
  finish(game) {
    const best = Math.max(this.best(game.level).count, game.collected.size);
    this.put('claire-treat-trail-best:' + game.level.id, String(best));
    // A tombstone also prevents an old run resurfacing if removal is unavailable.
    this.put(prefix + game.level.id, JSON.stringify({completed: true}));
    this.remove(prefix + game.level.id);
    return this.best(game.level);
  }
}
