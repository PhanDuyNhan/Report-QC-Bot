import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

function Dragon() {
  const canvasRef = useRef(null);
  const dragonState = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    angle: 0,
    speed: 4,
    targetX: Math.random() * window.innerWidth,
    targetY: Math.random() * window.innerHeight,
    segments: Array.from({ length: 12 }, (_, i) => ({
      x: window.innerWidth / 2 - i * 15,
      y: window.innerHeight / 2,
      angle: 0,
    })),
    particles: [],
    mouseX: 0,
    mouseY: 0,
    mouseActive: false,
    mouseLastActive: 0,
    celebrateTimer: 0,
    celebratePhase: 0,
    fireTimer: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let time = 0;
    
    const state = dragonState.current;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    
    const handleMouseMove = (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      state.mouseActive = true;
      state.mouseLastActive = Date.now();
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseDown = (e) => {
      if (e.target.closest('button, input, select, a, [role="button"], pre, code, table, tr, td')) return;
      state.fireTimer = 45;
      state.targetX = e.clientX;
      state.targetY = e.clientY;
      state.mouseActive = true;
      state.mouseLastActive = Date.now();
    };
    window.addEventListener('mousedown', handleMouseDown);
    
    const loop = () => {
      time += 1;
      const width = canvas.width;
      const height = canvas.height;
      
      if (state.mouseActive && Date.now() - state.mouseLastActive > 4000) {
        state.mouseActive = false;
      }
      
      let tx = state.targetX;
      let ty = state.targetY;
      
      if (state.celebrateTimer > 0) {
        const cx = width / 2;
        const cy = height / 2;
        tx = cx + Math.cos(state.celebratePhase) * 180;
        ty = cy + Math.sin(state.celebratePhase) * 120;
        state.celebratePhase += 0.08;
      } else if (state.mouseActive) {
        tx = state.mouseX;
        ty = state.mouseY;
      } else {
        const dx = tx - state.x;
        const dy = ty - state.y;
        const d = Math.hypot(dx, dy);
        if (d < 80) {
          state.targetX = Math.random() * (width - 100) + 50;
          state.targetY = Math.random() * (height - 100) + 50;
        }
      }
      
      const dx = tx - state.x;
      const dy = ty - state.y;
      const dist = Math.hypot(dx, dy);
      
      let targetAngle = Math.atan2(dy, dx);
      let diff = targetAngle - state.angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      
      const turnRate = state.celebrateTimer > 0 ? 0.12 : state.mouseActive ? 0.07 : 0.035;
      state.angle += diff * turnRate;
      
      const baseSpeed = state.celebrateTimer > 0 ? 6.5 : state.mouseActive ? 5 : 2.5;
      const speed = dist < 60 && state.mouseActive ? dist * 0.08 : baseSpeed;
      
      state.x += Math.cos(state.angle) * speed;
      state.y += Math.sin(state.angle) * speed;
      
      if (state.x < -100) state.x = width + 100;
      if (state.x > width + 100) state.x = -100;
      if (state.y < -100) state.y = height + 100;
      if (state.y > height + 100) state.y = -100;
      
      const spacing = 14;
      for (let i = 0; i < state.segments.length; i++) {
        const parent = i === 0 ? { x: state.x, y: state.y, angle: state.angle } : state.segments[i - 1];
        const seg = state.segments[i];
        const sdx = parent.x - seg.x;
        const sdy = parent.y - seg.y;
        const sdist = Math.hypot(sdx, sdy);
        
        if (sdist > spacing) {
          const sangle = Math.atan2(sdy, sdx);
          seg.x = parent.x - Math.cos(sangle) * spacing;
          seg.y = parent.y - Math.sin(sangle) * spacing;
          seg.angle = sangle;
        }
      }
      
      if (time % 2 === 0) {
        const tail = state.segments[state.segments.length - 1];
        state.particles.push({
          x: tail.x,
          y: tail.y,
          vx: (Math.random() - 0.5) * 1 - Math.cos(tail.angle) * 1.5,
          vy: (Math.random() - 0.5) * 1 - Math.sin(tail.angle) * 1.5,
          size: 2 + Math.random() * 3,
          color: '#06b6d4',
          life: 30 + Math.random() * 20,
          maxLife: 50,
        });
        
        if (Math.random() > 0.4) {
          const randomSeg = state.segments[Math.floor(Math.random() * state.segments.length)];
          state.particles.push({
            x: randomSeg.x,
            y: randomSeg.y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.2,
            size: 1.5 + Math.random() * 2,
            color: '#fbbf24',
            life: 20 + Math.random() * 15,
            maxLife: 35,
          });
        }
      }
      
      const mouthX = state.x + Math.cos(state.angle) * 22;
      const mouthY = state.y + Math.sin(state.angle) * 22;
      
      if (state.fireTimer > 0) {
        state.fireTimer--;
        for (let j = 0; j < 5; j++) {
          const fangle = state.angle + (Math.random() - 0.5) * 0.45;
          const fspeed = 4.5 + Math.random() * 6.5;
          state.particles.push({
            x: mouthX,
            y: mouthY,
            vx: Math.cos(fangle) * fspeed + (Math.random() - 0.5) * 1,
            vy: Math.sin(fangle) * fspeed + (Math.random() - 0.5) * 1,
            size: 3 + Math.random() * 7,
            color: Math.random() > 0.45 ? '#f97316' : Math.random() > 0.5 ? '#facc15' : '#ef4444',
            life: 25 + Math.random() * 20,
            maxLife: 45,
          });
        }
      }
      
      if (state.celebrateTimer > 0) {
        state.celebrateTimer--;
        for (let j = 0; j < 3; j++) {
          const cangle = Math.random() * Math.PI * 2;
          const cspeed = 2.5 + Math.random() * 6;
          state.particles.push({
            x: state.x,
            y: state.y,
            vx: Math.cos(cangle) * cspeed,
            vy: Math.sin(cangle) * cspeed,
            size: 3 + Math.random() * 5,
            color: Math.random() > 0.5 ? '#06b6d4' : '#fbbf24',
            life: 35 + Math.random() * 25,
            maxLife: 60,
          });
        }
      }
      
      ctx.clearRect(0, 0, width, height);
      
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.vy -= 0.01;
        p.life--;
        
        if (p.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
        
        const pct = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = pct;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 1.5;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.3 + 0.7 * pct), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      const wingFlap = Math.sin(time * 0.1) * 0.5;
      
      for (let i = state.segments.length - 1; i >= 0; i--) {
        const seg = state.segments[i];
        const r = i === 0 ? 13 : Math.max(6, 15 - i * 0.75);
        
        ctx.save();
        
        const grad = ctx.createRadialGradient(seg.x, seg.y, 2, seg.x, seg.y, r);
        grad.addColorStop(0, '#fde047');
        grad.addColorStop(0.5, '#ea580c');
        grad.addColorStop(1, '#7c2d12');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r, 0, Math.PI * 2);
        ctx.fill();
        
        const nx = -Math.sin(seg.angle);
        const ny = Math.cos(seg.angle);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y);
        ctx.lineTo(seg.x + nx * (r + 7), seg.y + ny * (r + 7));
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.restore();
        
        if (i === 1) {
          ctx.save();
          ctx.translate(seg.x, seg.y);
          ctx.rotate(seg.angle);
          
          ctx.save();
          ctx.scale(1, -1);
          drawWing(ctx, wingFlap);
          ctx.restore();
          
          ctx.save();
          drawWing(ctx, wingFlap);
          ctx.restore();
          
          ctx.restore();
        }
      }
      
      const tail = state.segments[state.segments.length - 1];
      ctx.save();
      ctx.translate(tail.x, tail.y);
      ctx.rotate(tail.angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const tailSway = Math.sin(time * 0.12) * 8;
      ctx.quadraticCurveTo(-15, -15 + tailSway, -30, -5 + tailSway);
      ctx.quadraticCurveTo(-20, 0, -30, 5 + tailSway);
      ctx.quadraticCurveTo(-15, 15 + tailSway, 0, 0);
      const tailGrad = ctx.createLinearGradient(0, 0, -30, 0);
      tailGrad.addColorStop(0, '#ea580c');
      tailGrad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = tailGrad;
      ctx.fill();
      ctx.restore();
      
      ctx.save();
      ctx.translate(state.x, state.y);
      ctx.rotate(state.angle);
      
      const snoutGrad = ctx.createLinearGradient(-10, -10, 22, 10);
      snoutGrad.addColorStop(0, '#fde047');
      snoutGrad.addColorStop(0.5, '#ea580c');
      snoutGrad.addColorStop(1, '#b91c1c');
      ctx.fillStyle = snoutGrad;
      ctx.beginPath();
      ctx.moveTo(10, -10);
      ctx.lineTo(24, -5);
      ctx.lineTo(24, 5);
      ctx.lineTo(10, 10);
      ctx.quadraticCurveTo(-12, 14, -12, -14);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4, -7);
      ctx.quadraticCurveTo(-16, -20, -28, -17);
      ctx.moveTo(-4, 7);
      ctx.quadraticCurveTo(-16, 20, -28, 17);
      ctx.stroke();
      
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(8, -5, 3.5, 0, Math.PI * 2);
      ctx.arc(8, 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      const wSway1 = Math.sin(time * 0.08) * 3;
      const wSway2 = Math.sin(time * 0.08 + Math.PI) * 3;
      ctx.beginPath();
      ctx.moveTo(18, -4);
      ctx.quadraticCurveTo(8, -14 + wSway1, -22, -10 + wSway1);
      ctx.moveTo(18, 4);
      ctx.quadraticCurveTo(8, 14 + wSway2, -22, 10 + wSway2);
      ctx.stroke();
      
      ctx.restore();
      
      animationFrameId = requestAnimationFrame(loop);
    };
    
    const drawWing = (c, flap) => {
      c.beginPath();
      c.moveTo(0, 0);
      const wingLen = 42;
      const flapOffset = flap * 14;
      c.quadraticCurveTo(12, 15 - flapOffset, wingLen, 25 - flapOffset);
      c.quadraticCurveTo(18, 30 - flapOffset, 0, 0);
      const wgrad = c.createLinearGradient(0, 0, wingLen, 25);
      wgrad.addColorStop(0, '#fde047');
      wgrad.addColorStop(0.6, '#ea580c');
      wgrad.addColorStop(1, '#a855f7');
      c.fillStyle = wgrad;
      c.fill();
      
      c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(wingLen, 25 - flapOffset);
      c.moveTo(0, 0);
      c.lineTo(wingLen - 8, 16 - flapOffset);
      c.stroke();
    };
    
    animationFrameId = requestAnimationFrame(loop);
    
    const handleCelebration = () => {
      state.celebrateTimer = 180;
      state.celebratePhase = 0;
    };
    window.addEventListener('qc-file-uploaded', handleCelebration);
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('qc-file-uploaded', handleCelebration);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="dragon-canvas-container" />;
}

function extractJsonArray(input) {
  if (!input || input === 'None') return [];
  let text = String(input)
    .replace(/<\|im_end\|>/g, '')
    .replace(/<\|im_start\|>/g, '')
    .trim()
    .replace(/```json/g, '')
    .replace(/```/g, '');

  const matches = [...text.matchAll(/\[\s*\{[\s\S]*?\}\s*\]/g)];
  for (const match of matches.reverse()) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length && 'id' in parsed[0]) return parsed;
    } catch {
      // Try the next candidate.
    }
  }

  const idx = text.lastIndexOf('[{"id"');
  if (idx !== -1) {
    try {
      return JSON.parse(text.slice(idx));
    } catch {
      return [];
    }
  }
  return [];
}

function safeParse(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      const steps = [];
      for (const roundKey of ['round1', 'round2', 'round3']) {
        for (const stepKey of ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8', 'step9']) {
          if (parsed[roundKey]?.[stepKey]) steps.push(parsed[roundKey][stepKey]);
        }
      }
      return steps;
    }
  } catch {
    return [];
  }
  return [];
}

function processData(lines) {
  const text = lines.join('\n').trim();
  const raw = text.startsWith('[')
    ? JSON.parse(text)
    : lines.filter((line) => line.trim()).map((line) => JSON.parse(line));
  const first = raw[0];

  if (!first) {
    throw new Error('File is empty.');
  }

  if (!('gold_output' in first) || !('prediction_output' in first)) {
    throw new Error(`Missing required columns. Found: ${Object.keys(first).join(', ')}`);
  }

  const stepCorrect = {};
  const stepTotal = {};
  const stepWrong = {};
  const valid = [];
  const parseErrors = [];

  raw.forEach((record, index) => {
    const cid = String(index + 1);
    const gold = safeParse(record.gold_output);
    const pred = extractJsonArray(record.prediction_output);

    if (!gold.length || !pred.length) {
      parseErrors.push(cid);
      return;
    }

    const predMap = {};
    pred.forEach((step) => {
      predMap[step.id] = step;
    });

    let correct = 0;
    const wrongIds = [];

    gold.forEach((goldStep) => {
      const predStep = predMap[goldStep.id];
      if (predStep && predStep.r === goldStep.r) correct += 1;
      else wrongIds.push(goldStep.id);
    });

    const acc = correct / gold.length;
    if (acc === 0) {
      parseErrors.push(cid);
      return;
    }

    valid.push({ cid, acc, wrongIds, gold, predMap, raw: record });

    gold.forEach((goldStep) => {
      const sid = goldStep.id;
      stepTotal[sid] = (stepTotal[sid] || 0) + 1;
      const predStep = predMap[sid];
      const ok = predStep && predStep.r === goldStep.r;

      if (ok) stepCorrect[sid] = (stepCorrect[sid] || 0) + 1;
      else {
        if (!stepWrong[sid]) stepWrong[sid] = [];
        stepWrong[sid].push({
          cid,
          gold_r: goldStep.r,
          pred_r: predStep ? predStep.r : 'MISSING',
          gold_e: (goldStep.e || '').slice(0, 300),
          gold_g: goldStep.g || '',
          pred_e: predStep ? (predStep.e || '').slice(0, 300) : '',
          pred_g: predStep ? predStep.g || '' : '',
        });
      }
    });
  });

  const steps = Object.keys(stepTotal).map(Number).sort((a, b) => a - b);
  const stepAcc = {};
  steps.forEach((step) => {
    stepAcc[step] = Math.round((100 * (stepCorrect[step] || 0) / stepTotal[step]) * 10) / 10;
  });

  const meanAcc = valid.length
    ? Math.round((valid.reduce((sum, record) => sum + record.acc, 0) / valid.length) * 1000) / 10
    : 0;
  const perfect = valid.filter((record) => record.acc === 1).length;

  return { raw, valid, parseErrors, steps, stepAcc, stepCorrect, stepTotal, stepWrong, meanAcc, perfect };
}

function ResultBadge({ value }) {
  const color = value === 'S' ? '#4ade80' : value === 'MISSING' ? '#f87171' : '#facc15';
  return (
    <span className="badge" style={{ background: color, color: '#000' }}>
      {value}
    </span>
  );
}

function AccuracyBadge({ value }) {
  const cls = value >= 80 ? 'green' : value >= 60 ? 'yellow' : 'red';
  return <span className={`badge ${cls}`}>{value}%</span>;
}

function Charts({ data }) {
  const accRef = useRef(null);
  const stackRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => {
    if (!data) return undefined;

    const labels = data.steps.map((step) => `Step ${step}`);
    const accs = data.steps.map((step) => data.stepAcc[step]);
    const corrects = data.steps.map((step) => data.stepCorrect[step] || 0);
    const wrongs = data.steps.map((step) => (data.stepTotal[step] || 0) - (data.stepCorrect[step] || 0));
    const barColors = accs.map((acc) => (acc >= 80 ? '#4ade80' : acc >= 60 ? '#facc15' : '#f87171'));
    const axisColor = '#94a3b8';
    const gridColor = '#334155';

    const charts = [
      new Chart(accRef.current, {
        type: 'bar',
        data: { labels, datasets: [{ data: accs, backgroundColor: barColors, borderRadius: 4 }] },
        options: {
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw}%` } } },
          scales: {
            x: { ticks: { color: axisColor }, grid: { color: '#1e293b' } },
            y: { max: 110, ticks: { color: axisColor, callback: (value) => `${value}%` }, grid: { color: gridColor } },
          },
        },
      }),
      new Chart(stackRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Correct', data: corrects, backgroundColor: '#4ade80', borderRadius: 2 },
            { label: 'Wrong', data: wrongs, backgroundColor: '#f87171', borderRadius: 2 },
          ],
        },
        options: {
          plugins: { legend: { labels: { color: axisColor } } },
          scales: {
            x: { stacked: true, ticks: { color: axisColor }, grid: { color: '#1e293b' } },
            y: { stacked: true, ticks: { color: axisColor }, grid: { color: gridColor } },
          },
        },
      }),
      new Chart(recRef.current, {
        type: 'bar',
        data: {
          labels: data.valid.map((record) => `#${record.cid}`),
          datasets: [{
            data: data.valid.map((record) => Math.round(record.acc * 1000) / 10),
            backgroundColor: data.valid.map((record) => {
              const acc = Math.round(record.acc * 1000) / 10;
              return acc === 100 ? '#4ade80' : acc >= 70 ? '#facc15' : '#f87171';
            }),
            borderRadius: 2,
          }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: axisColor, font: { size: 9 } }, grid: { color: '#1e293b' } },
            y: { max: 110, ticks: { color: axisColor, callback: (value) => `${value}%` }, grid: { color: gridColor } },
          },
        },
      }),
    ];

    return () => charts.forEach((chart) => chart.destroy());
  }, [data]);

  return (
    <div className="charts">
      <div className="chart-box">
        <div className="chart-title">Per-Step Accuracy %</div>
        <canvas ref={accRef} height="220" />
      </div>
      <div className="chart-box">
        <div className="chart-title">Correct vs Wrong Count</div>
        <canvas ref={stackRef} height="220" />
      </div>
      <div className="chart-box full">
        <div className="chart-title">Per-Record Accuracy</div>
        <canvas ref={recRef} height="140" />
      </div>
    </div>
  );
}

function WrongCases({ data }) {
  const stepsWithWrong = useMemo(() => data.steps.filter((step) => data.stepWrong[step]?.length), [data]);
  const [activeStep, setActiveStep] = useState(stepsWithWrong[0] || null);

  useEffect(() => {
    setActiveStep(stepsWithWrong[0] || null);
  }, [stepsWithWrong]);

  const cases = activeStep ? data.stepWrong[activeStep] || [] : [];

  return (
    <div className="wrong-box">
      <div className="wrong-title">Wrong Cases Browser</div>
      <div className="step-filter">
        {stepsWithWrong.map((step) => (
          <button
            className={`step-btn ${step === activeStep ? 'active' : ''}`}
            key={step}
            onClick={() => setActiveStep(step)}
            type="button"
          >
            Step {step} ({data.stepWrong[step].length})
          </button>
        ))}
      </div>

      {!activeStep && <p className="muted">No wrong cases.</p>}
      {cases.map((item, index) => (
        <div className="case-card" key={`${item.cid}-${index}`}>
          <div className="case-header">
            <span className="case-id">Record #{item.cid}</span>
            <span className="case-count">Case {index + 1}/{cases.length}</span>
          </div>
          <div className="case-grid">
            <div className="case-col gold-col">
              <div className="case-col-title">GOLD <ResultBadge value={item.gold_r} /></div>
              <div className="case-text">{item.gold_e || '-'}</div>
              {item.gold_g && <div className="case-note">{item.gold_g}</div>}
            </div>
            <div className="case-col pred-col">
              <div className="case-col-title">PRED <ResultBadge value={item.pred_r} /></div>
              <div className="case-text">{item.pred_e || '-'}</div>
              {item.pred_g && <div className="case-note">{item.pred_g}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ValueBlock({ value }) {
  if (Array.isArray(value)) {
    return <pre className="json-value">{JSON.stringify(value, null, 2)}</pre>;
  }

  if (typeof value === 'string' && ['[', '{'].includes(value.trim()[0])) {
    try {
      return <pre className="json-value">{JSON.stringify(JSON.parse(value), null, 2)}</pre>;
    } catch {
      // Fall through to plain text.
    }
  }

  return <div className="plain-value">{String(value ?? '')}</div>;
}

function RawRecordBrowser({ raw }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('1');
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    setCurrentIndex(0);
    setInputValue(raw.length ? '1' : '');
    setCollapsed({});
  }, [raw]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') setCurrentIndex((idx) => Math.max(0, idx - 1));
      if (event.key === 'ArrowRight') setCurrentIndex((idx) => Math.min(raw.length - 1, idx + 1));
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [raw.length]);

  useEffect(() => {
    if (raw.length) setInputValue(String(currentIndex + 1));
  }, [currentIndex, raw.length]);

  const record = raw[currentIndex];
  const keys = record ? Object.keys(record) : [];
  const thinkOutputKeys = keys.filter((key) => key.toLowerCase().includes('thinking') || key.toLowerCase().includes('output'));
  const metaKeys = keys.filter((key) => !thinkOutputKeys.includes(key));
  const bigTextKeys = metaKeys.filter((key) => ['input', 'system_prompt', 'system prompt'].includes(key.toLowerCase()));
  const smallMetaKeys = metaKeys.filter((key) => !['input', 'system_prompt', 'system prompt'].includes(key.toLowerCase()));

  const showRecord = () => {
    const next = Number.parseInt(inputValue, 10) - 1;
    setCurrentIndex(Number.isNaN(next) || next < 0 || next >= raw.length ? 0 : next);
  };

  return (
    <div className="wrong-box raw-browser">
      <div className="wrong-title">Raw Record Browser</div>
      <div className="raw-toolbar">
        <input
          className="record-input"
          min="1"
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Record #"
          type="number"
          value={inputValue}
        />
        <button className="step-btn active" onClick={showRecord} type="button">Show Record</button>
        <button className="step-btn" onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))} type="button">Prev</button>
        <button className="step-btn" onClick={() => setCurrentIndex((idx) => Math.min(raw.length - 1, idx + 1))} type="button">Next</button>
        {raw.length > 0 && <span className="record-nav">{currentIndex + 1} / {raw.length}</span>}
      </div>

      {!record && <div className="muted">Load a result file to browse raw records.</div>}
      {record && (
        <div className="raw-record">
          <div className="record-summary">{keys.length} columns · Record {currentIndex + 1} of {raw.length}</div>

          {smallMetaKeys.length > 0 && (
            <div className="meta-box">
              {smallMetaKeys.map((key) => (
                <div className="meta-chip" key={key}>
                  <span>{key}</span>
                  <strong>{String(record[key] ?? '').slice(0, 120)}</strong>
                </div>
              ))}
            </div>
          )}

          {bigTextKeys.length > 0 && (
            <div className="meta-box">
              {bigTextKeys.map((key) => {
                const collapseKey = `${currentIndex}-${key}`;
                return (
                  <div className="big-text" key={key}>
                    <div className="big-text-title">
                      <span>{key}</span>
                      <button
                        className="toggle-btn"
                        onClick={() => setCollapsed((state) => ({ ...state, [collapseKey]: !state[collapseKey] }))}
                        type="button"
                      >
                        toggle
                      </button>
                    </div>
                    {!collapsed[collapseKey] && <div className="big-text-content">{String(record[key] ?? '')}</div>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="raw-columns">
            {thinkOutputKeys.length === 0 && <div className="muted">No thinking/output columns found.</div>}
            {thinkOutputKeys.map((key) => (
              <div className="raw-column" key={key}>
                <div className={key.toLowerCase().includes('gold') ? 'raw-column-title gold' : 'raw-column-title pred'}>{key}</div>
                <div className="raw-column-value"><ValueBlock value={record[key]} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setData(processData(String(event.target.result).split('\n')));
        // Trigger dragon celebration animation
        window.dispatchEvent(new CustomEvent('qc-file-uploaded'));
      } catch (err) {
        setError(`Parse error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Dragon />
      <h1>QC AI Result Dashboard</h1>
      <p className="subtitle">Drag & drop a .jsonl result file - supports gold_output / prediction_output format</p>

      <div
        className={`upload-zone ${dragging ? 'drag' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files[0]) handleFile(event.dataTransfer.files[0]);
        }}
        role="button"
        tabIndex="0"
      >
        <input
          accept=".jsonl,.json"
          onChange={(event) => {
            if (event.target.files[0]) handleFile(event.target.files[0]);
          }}
          ref={fileInputRef}
          type="file"
        />
        <div className="upload-icon">Folder</div>
        <div className="upload-label">Drop <b>.jsonl</b> file here or <span>browse</span></div>
        <div className="upload-help">Required columns: <code>gold_output</code> · <code>prediction_output</code></div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {data && (
        <div>
          <div className="cards">
            <div className="card blue"><div className="val">{data.meanAcc}%</div><div className="lbl">Mean Acc</div></div>
            <div className="card green"><div className="val">{data.perfect}</div><div className="lbl">Perfect</div></div>
            <div className="card yellow"><div className="val">{data.valid.length}</div><div className="lbl">Valid</div></div>
            <div className="card red"><div className="val">{data.parseErrors.length}</div><div className="lbl">Skipped</div></div>
            <div className="card gray"><div className="val">{data.raw.length}</div><div className="lbl">Total</div></div>
          </div>

          <Charts data={data} />

          <div className="table-box">
            <div className="chart-title table-title">Per-Step Summary</div>
            <table>
              <thead>
                <tr><th>Step</th><th>Correct</th><th>Wrong</th><th>Total</th><th>Accuracy</th></tr>
              </thead>
              <tbody>
                {data.steps.map((step) => {
                  const correct = data.stepCorrect[step] || 0;
                  const total = data.stepTotal[step] || 0;
                  return (
                    <tr key={step}>
                      <td>Step {step}</td>
                      <td className="correct">{correct}</td>
                      <td className="wrong">{total - correct}</td>
                      <td className="total">{total}</td>
                      <td><AccuracyBadge value={data.stepAcc[step]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <WrongCases data={data} />
        </div>
      )}

      <RawRecordBrowser raw={data?.raw || []} />
    </>
  );
}
