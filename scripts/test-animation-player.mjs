// 時間軸播放時鐘的邏輯測試：以假的時間來源與排程驅動，不需要瀏覽器。
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {createPlaybackClock, SPEEDS} = await quizModule('components/AnimationPlayer/clock.ts');
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-9, `${m}: ${a} vs ${b}`);

const rig = (extra = {}) => {
  let t = 0, nextId = 1; const pending = new Map(); const seen = [];
  const scheduler = {request: cb => { const id = nextId++; pending.set(id, cb); return id; }, cancel: id => pending.delete(id)};
  const clock = createPlaybackClock({duration: 4, now: () => t, scheduler, onTime: v => seen.push(v), ...extra});
  const step = ms => { t += ms; const cbs = [...pending.values()]; pending.clear(); cbs.forEach(cb => cb(t)); };
  return {clock, step, seen, pending};
};

assert.deepEqual([...SPEEDS], [0.25, 0.5, 1, 1.5, 2]);

// 1x 速度：長度 4 秒，1 秒走 0.25
{ const r = rig(); r.clock.play(); r.step(1000); near(r.clock.position, .25, '1x'); }
// 各種倍速
for (const s of SPEEDS) { const r = rig({speed: s}); r.clock.play(); r.step(1000); near(r.clock.position, s / 4, `speed ${s}`); }
// 換速不跳格
{ const r = rig(); r.clock.play(); r.step(1000); r.clock.setSpeed(2); near(r.clock.position, .25, 'no jump'); r.step(1000); near(r.clock.position, .75, 'after speed change'); }
// 循環：超過 1 會繞回
{ const r = rig(); r.clock.play(); r.step(5000); near(r.clock.position, .25, 'loop wrap'); r.step(3000); near(r.clock.position, 0, 'exact wrap'); }
// 不循環：停在 1，再按播放從頭開始
{ const r = rig({loop: false}); r.clock.play(); r.step(9000); near(r.clock.position, 1, 'no loop end'); assert.equal(r.clock.playing, false); r.clock.play(); near(r.clock.position, 0, 'replay restarts'); }
// 暫停：不再推進，也不再排程
{ const r = rig(); r.clock.play(); r.step(1000); r.clock.pause(); const p = r.clock.position; assert.equal(r.pending.size, 0, 'no frame queued'); r.step(5000); near(r.clock.position, p, 'paused'); r.clock.play(); r.step(1000); near(r.clock.position, p + .25, 'resume continues'); }
// 暫停期間的時間不累積
{ const r = rig(); r.clock.play(); r.step(500); r.clock.pause(); r.step(60000); r.clock.play(); r.step(500); near(r.clock.position, .25, 'idle time ignored'); }
// seek：跳到位置並夾在 0..1，不改變播放狀態
{ const r = rig(); r.clock.seek(.6); near(r.clock.position, .6, 'seek'); r.clock.seek(2); near(r.clock.position, 1, 'clamp high'); r.clock.seek(-1); near(r.clock.position, 0, 'clamp low'); assert.equal(r.clock.playing, false, 'seek keeps state'); }
// 播放中拖曳：暫停接手，放開後恢復播放
{ const r = rig(); r.clock.play(); r.step(1000);
  r.clock.beginScrub(); assert.equal(r.clock.running, false); assert.equal(r.pending.size, 0, 'scrub stops frames');
  r.clock.scrubTo(.8); near(r.clock.position, .8, 'scrub'); r.step(3000); near(r.clock.position, .8, 'held during scrub');
  r.clock.endScrub(); assert.equal(r.clock.playing, true); assert.equal(r.clock.running, true);
  r.step(1000); near(r.clock.position, 0.05, 'resumes from scrub point (0.8+0.25 wraps to 0.05)'); }
// 暫停中拖曳：放開後仍然暫停
{ const r = rig(); r.clock.beginScrub(); r.clock.scrubTo(.3); r.clock.endScrub(); assert.equal(r.clock.playing, false); r.step(2000); near(r.clock.position, .3, 'stays paused'); }
// 拖曳期間經過的時間，放開後不補算
{ const r = rig(); r.clock.play(); r.clock.beginScrub(); r.step(10000); r.clock.endScrub(); near(r.clock.position, 0, 'scrub time not replayed'); r.step(1000); near(r.clock.position, .25, 'then continues'); }
// onTime 每幀回報、數值在 0..1
{ const r = rig(); r.clock.play(); for (let i = 0; i < 30; i++) r.step(16); assert.ok(r.seen.length >= 30); assert.ok(r.seen.every(v => v >= 0 && v <= 1)); }
// destroy 後不再排程
{ const r = rig(); r.clock.play(); r.clock.destroy(); assert.equal(r.pending.size, 0); }
console.log('animation player clock: ok');
