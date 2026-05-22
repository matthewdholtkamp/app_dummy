import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

type ItemKind = 'star' | 'heart' | 'rainbow' | 'candy' | 'bomb';

type Item = {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  vy: number;
  rot: number;
  vr: number;
  emoji: string;
  points: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  emoji: string;
};

type FloatScore = {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
};

type Screen = 'menu' | 'playing' | 'over';

const KINDS: Array<{
  kind: ItemKind;
  emoji: string;
  points: number;
  weight: number;
}> = [
  { kind: 'star', emoji: '⭐', points: 10, weight: 5 },
  { kind: 'heart', emoji: '💖', points: 15, weight: 4 },
  { kind: 'candy', emoji: '🍭', points: 20, weight: 3 },
  { kind: 'rainbow', emoji: '🌈', points: 30, weight: 2 },
  { kind: 'bomb', emoji: '⛈️', points: 0, weight: 3 },
];

const TOTAL_WEIGHT = KINDS.reduce((s, k) => s + k.weight, 0);

function pickKind() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const k of KINDS) {
    r -= k.weight;
    if (r <= 0) return k;
  }
  return KINDS[0];
}

const HIGH_SCORE_KEY = 'rainbow-catch-high-score';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    const stored = Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0);
    return Number.isFinite(stored) ? stored : 0;
  });
  const [items, setItems] = useState<Item[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floats, setFloats] = useState<FloatScore[]>([]);
  const [catcherX, setCatcherX] = useState(0.5);
  const [hurt, setHurt] = useState(false);

  const playfieldRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Item[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatsRef = useRef<FloatScore[]>([]);
  const catcherXRef = useRef(0.5);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const idRef = useRef(1);
  const spawnAccumRef = useRef(0);
  const lastTimeRef = useRef(0);
  const runningRef = useRef(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);
  useEffect(() => {
    floatsRef.current = floats;
  }, [floats]);
  useEffect(() => {
    catcherXRef.current = catcherX;
  }, [catcherX]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) => {
      try {
        if (!audioCtxRef.current) {
          const AC =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.value = gain;
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const playCatchSound = useCallback(
    (points: number) => {
      const base = 440 + Math.min(points, 30) * 20;
      playTone(base, 0.12, 'triangle', 0.18);
      setTimeout(() => playTone(base * 1.5, 0.12, 'triangle', 0.12), 60);
    },
    [playTone],
  );

  const playHurtSound = useCallback(() => {
    playTone(180, 0.2, 'sawtooth', 0.18);
    setTimeout(() => playTone(120, 0.25, 'sawtooth', 0.18), 80);
  }, [playTone]);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setItems([]);
    setParticles([]);
    setFloats([]);
    setCatcherX(0.5);
    catcherXRef.current = 0.5;
    livesRef.current = 3;
    scoreRef.current = 0;
    spawnAccumRef.current = 0;
    elapsedRef.current = 0;
    lastTimeRef.current = 0;
    setScreen('playing');
    runningRef.current = true;
    playTone(660, 0.08, 'sine', 0.1);
  }, [playTone]);

  const handlePointerMove = useCallback((clientX: number) => {
    const el = playfieldRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    catcherXRef.current = Math.max(0.05, Math.min(0.95, x));
    setCatcherX(catcherXRef.current);
  }, []);

  useEffect(() => {
    const el = playfieldRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (e.buttons > 0 || screen === 'playing') handlePointerMove(e.clientX);
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('mousemove', onMouseMove);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, [handlePointerMove, screen]);

  useEffect(() => {
    if (screen !== 'playing') {
      runningRef.current = false;
      return;
    }
    runningRef.current = true;
    let raf = 0;

    const step = (t: number) => {
      if (!runningRef.current) return;
      if (lastTimeRef.current === 0) lastTimeRef.current = t;
      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000);
      lastTimeRef.current = t;
      elapsedRef.current += dt;

      const el = playfieldRef.current;
      const width = el?.clientWidth ?? window.innerWidth;
      const height = el?.clientHeight ?? window.innerHeight;

      const difficulty = 1 + elapsedRef.current / 30;
      const spawnInterval = Math.max(0.35, 1.1 / difficulty);

      spawnAccumRef.current += dt;
      const newItems = [...itemsRef.current];
      while (spawnAccumRef.current > spawnInterval) {
        spawnAccumRef.current -= spawnInterval;
        const kind = pickKind();
        newItems.push({
          id: idRef.current++,
          kind: kind.kind,
          emoji: kind.emoji,
          points: kind.points,
          x: 40 + Math.random() * (width - 80),
          y: -40,
          vy: 120 + Math.random() * 100 + difficulty * 30,
          rot: Math.random() * 360,
          vr: (Math.random() - 0.5) * 180,
        });
      }

      const catcherPx = catcherXRef.current * width;
      const catcherY = height - 60;
      const catchRadiusX = 56;
      const catchRadiusY = 48;

      const survivors: Item[] = [];
      const newParticles: Particle[] = [...particlesRef.current];
      const newFloats: FloatScore[] = [...floatsRef.current];
      let scoreDelta = 0;
      let livesDelta = 0;
      let hurtFlash = false;

      for (const it of newItems) {
        const ny = it.y + it.vy * dt;
        const nrot = it.rot + it.vr * dt;
        const dx = it.x - catcherPx;
        const dy = ny - catcherY;
        const inCatch = Math.abs(dx) < catchRadiusX && dy > -catchRadiusY && dy < catchRadiusY;
        if (inCatch) {
          if (it.kind === 'bomb') {
            livesDelta -= 1;
            hurtFlash = true;
            playHurtSound();
            for (let i = 0; i < 10; i++) {
              newParticles.push({
                id: idRef.current++,
                x: it.x,
                y: ny,
                vx: (Math.random() - 0.5) * 280,
                vy: -120 - Math.random() * 160,
                life: 0.7,
                emoji: '💥',
              });
            }
          } else {
            scoreDelta += it.points;
            playCatchSound(it.points);
            for (let i = 0; i < 8; i++) {
              newParticles.push({
                id: idRef.current++,
                x: it.x,
                y: ny,
                vx: (Math.random() - 0.5) * 240,
                vy: -100 - Math.random() * 160,
                life: 0.6,
                emoji: it.emoji,
              });
            }
            newFloats.push({
              id: idRef.current++,
              x: it.x,
              y: ny - 20,
              text: `+${it.points}`,
              life: 0.9,
            });
          }
          continue;
        }
        if (ny > height + 60) continue;
        survivors.push({ ...it, y: ny, rot: nrot });
      }

      const stillParticles: Particle[] = [];
      for (const p of newParticles) {
        const nl = p.life - dt;
        if (nl <= 0) continue;
        stillParticles.push({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 600 * dt,
          life: nl,
        });
      }

      const stillFloats: FloatScore[] = [];
      for (const f of newFloats) {
        const nl = f.life - dt;
        if (nl <= 0) continue;
        stillFloats.push({ ...f, y: f.y - 60 * dt, life: nl });
      }

      setItems(survivors);
      setParticles(stillParticles);
      setFloats(stillFloats);
      if (scoreDelta !== 0) {
        scoreRef.current += scoreDelta;
        setScore(scoreRef.current);
      }
      if (livesDelta !== 0) {
        livesRef.current = Math.max(0, livesRef.current + livesDelta);
        setLives(livesRef.current);
        if (hurtFlash) {
          setHurt(true);
          setTimeout(() => setHurt(false), 500);
        }
        if (livesRef.current <= 0) {
          runningRef.current = false;
          const finalScore = scoreRef.current;
          setHighScore((prev) => {
            const next = Math.max(prev, finalScore);
            try {
              localStorage.setItem(HIGH_SCORE_KEY, String(next));
            } catch {
              /* ignore */
            }
            return next;
          });
          setScreen('over');
        }
      }

      if (runningRef.current) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(raf);
    };
  }, [screen, playCatchSound, playHurtSound]);

  return (
    <div className="game">
      <div className="playfield" ref={playfieldRef}>
        {items.map((it) => (
          <div
            key={it.id}
            className={`item ${it.kind}`}
            style={{
              left: it.x,
              top: it.y,
              transform: `translate(-50%, -50%) rotate(${it.rot}deg)`,
            }}
          >
            {it.emoji}
          </div>
        ))}

        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.x,
              top: p.y,
              opacity: Math.max(0, Math.min(1, p.life * 1.6)),
            }}
          >
            {p.emoji}
          </div>
        ))}

        {floats.map((f) => (
          <div
            key={f.id}
            className="floating-score"
            style={{
              left: f.x,
              top: f.y,
              opacity: Math.max(0, Math.min(1, f.life * 1.2)),
            }}
          >
            {f.text}
          </div>
        ))}

        {screen === 'playing' && (
          <div
            className={`catcher${hurt ? ' hurt' : ''}`}
            style={{ left: `${catcherX * 100}%` }}
          >
            🦄
          </div>
        )}
      </div>

      {screen === 'playing' && (
        <div className="hud">
          <div className="hud-pill">⭐ {score}</div>
          <div className="hud-pill lives">
            {'💗'.repeat(lives)}
            {'🩶'.repeat(Math.max(0, 3 - lives))}
          </div>
        </div>
      )}

      {screen === 'menu' && (
        <div className="overlay">
          <div className="card">
            <h1 className="title">Rainbow Catch</h1>
            <p className="subtitle">Drag the unicorn to catch the goodies!</p>
            <div className="legend">
              <span>
                <em>⭐</em> +10
              </span>
              <span>
                <em>💖</em> +15
              </span>
              <span>
                <em>🍭</em> +20
              </span>
              <span>
                <em>🌈</em> +30
              </span>
              <span style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
                <em>⛈️</em> avoid the storm clouds!
              </span>
            </div>
            <button className="play-button" onClick={startGame}>
              ▶ Play
            </button>
            {highScore > 0 && (
              <div style={{ marginTop: 10, fontSize: 14, color: '#6d28d9' }}>
                Best: <b style={{ fontSize: 18 }}>{highScore}</b>
              </div>
            )}
          </div>
        </div>
      )}

      {screen === 'over' && (
        <div className="overlay">
          <div className="card">
            <h1 className="title">Game Over</h1>
            <div className="big-score">{score}</div>
            <div className="row">
              <div>
                Score<b>{score}</b>
              </div>
              <div>
                Best<b>{highScore}</b>
              </div>
            </div>
            {score >= highScore && score > 0 && (
              <div style={{ color: '#ec4899', fontWeight: 800, fontSize: 16 }}>
                🎉 New best!
              </div>
            )}
            <button className="play-button" onClick={startGame}>
              ▶ Play Again
            </button>
            <button
              className="play-button"
              style={{
                background: 'transparent',
                color: '#6d28d9',
                boxShadow: 'none',
                marginTop: 0,
              }}
              onClick={() => setScreen('menu')}
            >
              Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
