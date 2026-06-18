import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

<<<<<<< HEAD
function Dragon() {
  const canvasRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef(null);

  const playDrum = (ctx, time) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, time);
      
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
      
      gain.gain.setValueAtTime(0.85, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      
      osc.start(time);
      osc.stop(time + 0.22);
    } catch (e) {
      console.warn(e);
    }
  };

  const playGong = (ctx, time) => {
    try {
      const freqs = [140, 215, 310, 440];
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
      
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, time);
        osc.frequency.linearRampToValueAtTime(f * 0.96, time + 0.3);
        
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(idx === 0 ? 0.8 : 0.45, time);
        
        osc.connect(oscGain);
        oscGain.connect(gain);
        
        osc.start(time);
        osc.stop(time + 2.0);
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const playSuona = (ctx, freq, time, duration = 0.18) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(13.5, time);
      vibratoGain.gain.setValueAtTime(freq * 0.035, time);
      
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.35, time);
      filter.Q.setValueAtTime(1.4, time);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      vibrato.start(time);
      osc.start(time);
      vibrato.stop(time + duration + 0.1);
      osc.stop(time + duration + 0.1);
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleAudio = () => {
    if (isMuted) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setIsMuted(false);
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsMuted(true);
    }
  };

  const dragonState = useRef({
    gold: {
      x: window.innerWidth / 3,
      y: window.innerHeight / 2,
      angle: 0,
      targetX: Math.random() * window.innerWidth,
      targetY: Math.random() * window.innerHeight,
      segments: Array.from({ length: 13 }, (_, i) => ({ x: window.innerWidth / 3 - i * 15, y: window.innerHeight / 2, angle: 0 })),
      fireTimer: 0,
      theme: 'gold',
    },
    azure: {
      x: (window.innerWidth / 3) * 2,
      y: window.innerHeight / 2,
      angle: Math.PI,
      targetX: Math.random() * window.innerWidth,
      targetY: Math.random() * window.innerHeight,
      segments: Array.from({ length: 13 }, (_, i) => ({ x: (window.innerWidth / 3) * 2 + i * 15, y: window.innerHeight / 2, angle: Math.PI })),
      fireTimer: 0,
      theme: 'azure',
    },
    particles: [],
    mouseX: 0,
    mouseY: 0,
    mouseActive: false,
    mouseLastActive: 0,
    celebrateTimer: 0,
    celebratePhase: 0,
    drumPulse: 0,
    gongPulse: 0,
    beatCounter: 0,
    beatNum: 0,
    fightTimer: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let time = 0;
    const state = dragonState.current;
    
    const euroImg = new Image();
    euroImg.src = '/european_dragon.png';
    
    const asianImg = new Image();
    asianImg.src = '/asian_dragon.png';
    
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
      state.gold.fireTimer = 45;
      state.azure.fireTimer = 45;
      state.gold.targetX = e.clientX - 50;
      state.gold.targetY = e.clientY;
      state.azure.targetX = e.clientX + 50;
      state.azure.targetY = e.clientY;
      state.mouseActive = true;
      state.mouseLastActive = Date.now();
    };
    window.addEventListener('mousedown', handleMouseDown);
    
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === 'a') {
        state.azure.fireTimer = 150;
      } else if (key === 'b') {
        state.gold.fireTimer = 150;
      } else if (key === 'h') {
        state.fightTimer = 600; // 10 seconds at 60fps
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    const drawDrum = (c, w, h, pulse) => {
      const cx = 95;
      const cy = h - 90;
      const baseR = 45;
      const r = baseR + pulse * 7;
      
      c.save();
      if (pulse > 0.01) {
        c.strokeStyle = `rgba(239, 68, 68, ${pulse * 0.6})`;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(cx, cy, baseR + (1 - pulse) * 60, 0, Math.PI * 2);
        c.stroke();
      }
      
      c.fillStyle = '#b91c1c';
      c.beginPath();
      c.ellipse(cx, cy + 12, r, r * 0.85, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#7f1d1d';
      c.lineWidth = 2.5;
      c.stroke();
      
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.ellipse(cx, cy, r, r * 0.65, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      
      c.fillStyle = '#fbbf24';
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const sx = cx + Math.cos(angle) * r;
        const sy = cy + Math.sin(angle) * r * 0.65;
        c.beginPath();
        c.arc(sx, sy, 3, 0, Math.PI * 2);
        c.fill();
      }
      
      c.strokeStyle = '#fde047';
      c.lineWidth = 3.5;
      c.lineCap = 'round';
      
      c.save();
      c.translate(cx - 18, cy - 8);
      const rotL = pulse > 0.7 ? 0.35 : -0.25;
      c.rotate(rotL);
      c.beginPath();
      c.moveTo(0, -22);
      c.lineTo(0, 5);
      c.stroke();
      c.fillStyle = '#b91c1c';
      c.beginPath();
      c.arc(0, -22, 4.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
      
      c.save();
      c.translate(cx + 18, cy - 8);
      const rotR = pulse > 0.35 && pulse < 0.7 ? 0.35 : -0.25;
      c.rotate(rotR);
      c.beginPath();
      c.moveTo(0, -22);
      c.lineTo(0, 5);
      c.stroke();
      c.fillStyle = '#b91c1c';
      c.beginPath();
      c.arc(0, -22, 4.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
      
      c.restore();
    };

    const drawGong = (c, w, h, pulse) => {
      const cx = w - 95;
      const cy = h - 90;
      const r = 38 + pulse * 5;
      
      c.save();
      if (pulse > 0.01) {
        c.strokeStyle = `rgba(245, 158, 11, ${pulse * 0.6})`;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(cx, cy, 38 + (1 - pulse) * 60, 0, Math.PI * 2);
        c.stroke();
      }
      
      c.strokeStyle = '#451a03';
      c.lineWidth = 7;
      c.lineCap = 'square';
      c.beginPath();
      c.moveTo(cx - 48, cy + 45);
      c.lineTo(cx - 48, cy - 45);
      c.lineTo(cx + 48, cy - 45);
      c.lineTo(cx + 48, cy + 45);
      c.stroke();
      
      c.strokeStyle = '#ef4444';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(cx - 18, cy - 45);
      c.lineTo(cx - 12, cy - r + 3);
      c.moveTo(cx + 18, cy - 45);
      c.lineTo(cx + 12, cy - r + 3);
      c.stroke();
      
      const gongGrad = c.createRadialGradient(cx, cy, 2, cx, cy, r);
      gongGrad.addColorStop(0, '#fef08a');
      gongGrad.addColorStop(0.6, '#d97706');
      gongGrad.addColorStop(1, '#451a03');
      c.fillStyle = gongGrad;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#b45309';
      c.lineWidth = 2;
      c.stroke();
      
      c.strokeStyle = 'rgba(254, 240, 138, 0.35)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      c.stroke();
      
      c.save();
      c.translate(cx + 30, cy + 20);
      const malRot = pulse > 0.7 ? -0.35 : 0.15;
      c.rotate(malRot);
      c.strokeStyle = '#b45309';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-35, -35);
      c.stroke();
      c.fillStyle = '#ef4444';
      c.beginPath();
      c.arc(-35, -35, 7, 0, Math.PI * 2);
      c.fill();
      c.restore();
      
      c.restore();
    };

    const drawPearl = (c, cx, cy, timer) => {
      c.save();
      const pulse = Math.sin(time * 0.1) * 5;
      const r = 18 + pulse;
      
      c.shadowColor = '#fde047';
      c.shadowBlur = 30 + pulse * 2;
      
      const pearlGrad = c.createRadialGradient(cx, cy, 2, cx, cy, r);
      pearlGrad.addColorStop(0, '#ffffff');
      pearlGrad.addColorStop(0.4, '#fef08a');
      pearlGrad.addColorStop(1, '#eab308');
      
      c.fillStyle = pearlGrad;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
      
      c.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(cx, cy, r + 5, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    };
    
    const loop = () => {
      time += 1;
      const width = canvas.width;
      const height = canvas.height;
      const currentAudioCtx = audioCtxRef.current;
      const hasAudio = currentAudioCtx && currentAudioCtx.state === 'running';
      
      state.drumPulse = Math.max(0, state.drumPulse - 0.05);
      state.gongPulse = Math.max(0, state.gongPulse - 0.04);
      
      if (state.mouseActive && Date.now() - state.mouseLastActive > 4000) {
        state.mouseActive = false;
      }
      
      let beatCycle = state.celebrateTimer > 0 ? 10 : 33;
      state.beatCounter++;
      if (state.beatCounter >= beatCycle) {
        state.beatCounter = 0;
        state.beatNum = (state.beatNum + 1) % 16;
        state.drumPulse = 1.0;
        
        if (hasAudio) {
          const now = currentAudioCtx.currentTime;
          if (state.celebrateTimer > 0) {
            playDrum(currentAudioCtx, now);
            if (time % 12 === 0) {
              const fscale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
              const noteIdx = Math.floor((180 - state.celebrateTimer) / 11) % fscale.length;
              playSuona(currentAudioCtx, fscale[noteIdx], now, 0.15);
            }
          } else {
            if (state.beatNum === 0) {
              state.gongPulse = 1.0;
              playGong(currentAudioCtx, now);
              playDrum(currentAudioCtx, now);
            } else if (state.beatNum % 4 === 0) {
              playDrum(currentAudioCtx, now);
              if (Math.random() > 0.7) {
                state.gongPulse = 1.0;
                playGong(currentAudioCtx, now);
              }
            } else {
              playDrum(currentAudioCtx, now);
            }
            
            const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
            if (state.beatNum % 2 === 0 && Math.random() > 0.25) {
              const freq = scale[Math.floor(Math.random() * scale.length)];
              playSuona(currentAudioCtx, freq, now, 0.16);
            }
          }
        } else {
          if (state.beatNum === 0 || (state.beatNum % 4 === 0 && Math.random() > 0.7)) {
            state.gongPulse = 1.0;
          }
        }
      }
      
      const clashDist = Math.hypot(state.gold.x - state.azure.x, state.gold.y - state.azure.y);
      const isClashing = clashDist < 220 && state.celebrateTimer <= 0;
      
      const updateDragon = (drag, other) => {
        let tx = drag.targetX;
        let ty = drag.targetY;
        
        if (state.fightTimer > 0) {
          tx = other.x;
          ty = other.y;
          if (Math.random() < 0.05) drag.fireTimer = Math.max(drag.fireTimer, 10);
        } else if (state.celebrateTimer > 0) {
          const cx = width / 2;
          const cy = height / 2;
          const phaseOffset = drag.theme === 'gold' ? 0 : Math.PI;
          tx = cx + Math.cos(state.celebratePhase + phaseOffset) * 165;
          ty = cy + Math.sin(state.celebratePhase + phaseOffset) * 115;
        } else if (isClashing) {
          tx = other.x;
          ty = other.y;
        } else if (state.mouseActive) {
          const offsetSign = drag.theme === 'gold' ? -1 : 1;
          tx = state.mouseX + offsetSign * 60;
          ty = state.mouseY + offsetSign * 40;
        } else {
          const dx = tx - drag.x;
          const dy = ty - drag.y;
          const d = Math.hypot(dx, dy);
          if (d < 80) {
            drag.targetX = Math.random() * (width - 150) + 75;
            drag.targetY = Math.random() * (height - 150) + 75;
          }
        }
        
        const dx = tx - drag.x;
        const dy = ty - drag.y;
        const dist = Math.hypot(dx, dy);
        
        let targetAngle = Math.atan2(dy, dx);
        let diff = targetAngle - drag.angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        
        let turnRate = state.fightTimer > 0 ? 0.18 : state.celebrateTimer > 0 ? 0.12 : isClashing ? 0.085 : state.mouseActive ? 0.065 : 0.035;
        drag.angle += diff * turnRate;
        
        let baseSpeed = state.fightTimer > 0 ? 9.5 : state.celebrateTimer > 0 ? 6.5 : isClashing ? 4.8 : state.mouseActive ? 4.2 : 2.5;
        let speed = dist < 60 && state.mouseActive ? dist * 0.08 : baseSpeed;
        
        drag.x += Math.cos(drag.angle) * speed;
        drag.y += Math.sin(drag.angle) * speed;
        
        if (drag.x < -100) drag.x = width + 100;
        if (drag.x > width + 100) drag.x = -100;
        if (drag.y < -100) drag.y = height + 100;
        if (drag.y > height + 100) drag.y = -100;
        
      };
      
      updateDragon(state.gold, state.azure);
      updateDragon(state.azure, state.gold);
      
      if (isClashing && clashDist < 65) {
        const bounceAngle = Math.atan2(state.gold.y - state.azure.y, state.gold.x - state.azure.x);
        state.gold.angle = bounceAngle + (Math.random() - 0.5) * 0.6;
        state.azure.angle = bounceAngle + Math.PI + (Math.random() - 0.5) * 0.6;
        state.gold.targetX = Math.random() * width;
        state.gold.targetY = Math.random() * height;
        state.azure.targetX = Math.random() * width;
        state.azure.targetY = Math.random() * height;
      }
      
      if (state.fightTimer > 0) {
        state.fightTimer--;
      }
      
      if (state.celebrateTimer > 0) {
        state.celebratePhase += 0.065;
        state.celebrateTimer--;
      }
      
      const spawnEmbers = (drag, mainColor, secondColor) => {
        if (time % 2 === 0) {
          const tailX = drag.x - Math.cos(drag.angle) * 120;
          const tailY = drag.y - Math.sin(drag.angle) * 120;
          state.particles.push({
            x: tailX,
            y: tailY,
            vx: (Math.random() - 0.5) * 1 - Math.cos(drag.angle) * 1.5,
            vy: (Math.random() - 0.5) * 1 - Math.sin(drag.angle) * 1.5,
            size: 2 + Math.random() * 3,
            color: mainColor,
            life: 30 + Math.random() * 20,
            maxLife: 50,
          });
          
          if (Math.random() > 0.4) {
            const randomOffset = Math.random() * 100;
            const rX = drag.x - Math.cos(drag.angle) * randomOffset;
            const rY = drag.y - Math.sin(drag.angle) * randomOffset;
            state.particles.push({
              x: rX,
              y: rY,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5 - 0.2,
              size: 1.5 + Math.random() * 2,
              color: secondColor,
              life: 20 + Math.random() * 15,
              maxLife: 35,
            });
          }
        }
      };
      
      spawnEmbers(state.gold, '#06b6d4', '#fbbf24');
      spawnEmbers(state.azure, '#d946ef', '#22d3ee');
      
      const triggerFire = (drag, colorScale) => {
        const mouthX = drag.x + Math.cos(drag.angle) * 22;
        const mouthY = drag.y + Math.sin(drag.angle) * 22;
        
        const isMegaFire = drag.fireTimer > 45;
        const multiplier = isMegaFire ? 3 : 1;
        const spread = isMegaFire ? 1.2 : 0.45;
        const count = isMegaFire ? 12 : 4;
        
        for (let j = 0; j < count; j++) {
          const fangle = drag.angle + (Math.random() - 0.5) * spread;
          const fspeed = (4.5 + Math.random() * 6) * multiplier;
          state.particles.push({
            x: mouthX,
            y: mouthY,
            vx: Math.cos(fangle) * fspeed + (Math.random() - 0.5) * 2,
            vy: Math.sin(fangle) * fspeed + (Math.random() - 0.5) * 2,
            size: (3 + Math.random() * 7) * (isMegaFire ? 2.5 : 1),
            color: colorScale[Math.floor(Math.random() * colorScale.length)],
            life: (25 + Math.random() * 18) * (isMegaFire ? 1.5 : 1),
            maxLife: 43 * (isMegaFire ? 1.5 : 1),
          });
        }
      };
      
      const fireColorsGold = ['#f97316', '#facc15', '#ef4444', '#f59e0b'];
      const fireColorsAzure = ['#06b6d4', '#3b82f6', '#d946ef', '#a855f7'];
      
      if (isClashing && clashDist < 160) {
        state.gold.fireTimer = Math.max(state.gold.fireTimer, 2);
        state.azure.fireTimer = Math.max(state.azure.fireTimer, 2);
        
        const mx = (state.gold.x + state.azure.x) / 2;
        const my = (state.gold.y + state.azure.y) / 2;
        if (time % 3 === 0) {
          for (let k = 0; k < 4; k++) {
            state.particles.push({
              x: mx + (Math.random() - 0.5) * 25,
              y: my + (Math.random() - 0.5) * 25,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6 - 1,
              size: 2.5 + Math.random() * 4.5,
              color: Math.random() > 0.5 ? '#ffffff' : Math.random() > 0.5 ? '#fde047' : '#22d3ee',
              life: 18 + Math.random() * 14,
              maxLife: 32,
            });
          }
        }
      }
      
      if (state.gold.fireTimer > 0) {
        state.gold.fireTimer--;
        triggerFire(state.gold, fireColorsGold);
      }
      if (state.azure.fireTimer > 0) {
        state.azure.fireTimer--;
        triggerFire(state.azure, fireColorsAzure);
      }
      
      if (state.celebrateTimer > 0) {
        for (let j = 0; j < 2; j++) {
          const cangle = Math.random() * Math.PI * 2;
          const cspeed = 2.5 + Math.random() * 5.5;
          state.particles.push({
            x: width / 2,
            y: height / 2,
            vx: Math.cos(cangle) * cspeed,
            vy: Math.sin(cangle) * cspeed,
            size: 3 + Math.random() * 5,
            color: Math.random() > 0.5 ? '#22d3ee' : '#fde047',
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
        p.vx *= 0.975;
        p.vy *= 0.975;
        p.vy -= 0.008;
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
        ctx.shadowBlur = p.size * 1.6;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.35 + 0.65 * pct), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      const wingFlap = Math.sin(time * 0.11) * 0.5;
      
      const drawDragonEntity = (drag, img) => {
        ctx.save();
        ctx.translate(drag.x, drag.y);
        ctx.rotate(drag.angle);
        
        ctx.globalCompositeOperation = 'screen';
        
        if (img.complete) {
          const size = 300;
          ctx.drawImage(img, -size/2 + 20, -size/2, size, size);
        }
        
        ctx.restore();
      };
      
      // Draw Azure Dragon (European)
      drawDragonEntity(state.azure, euroImg);
      
      // Draw Gold Dragon (Asian)
      drawDragonEntity(state.gold, asianImg);
      
      // Draw Data Pearl in center when celebrating
      if (state.celebrateTimer > 0) {
        drawPearl(ctx, width / 2, height / 2, state.celebrateTimer);
      }
      
      // Draw Instruments
      drawDrum(ctx, width, height, state.drumPulse);
      drawGong(ctx, width, height, state.gongPulse);
      
      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
    
    const handleCelebration = () => {
      state.celebrateTimer = 180;
      state.celebratePhase = 0;
      if (audioCtxRef.current && !isMuted) {
        const now = audioCtxRef.current.currentTime;
        // Play celebratory gong strike + suona fanfare!
        playGong(audioCtxRef.current, now);
        
        const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        scale.forEach((freq, idx) => {
          const delay = idx * 0.08;
          const dur = idx === scale.length - 1 ? 0.55 : 0.08;
          playSuona(audioCtxRef.current, freq, now + delay, dur);
        });
      }
    };
    window.addEventListener('qc-file-uploaded', handleCelebration);
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('qc-file-uploaded', handleCelebration);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMuted]);

  return (
    <>
      <canvas ref={canvasRef} className="dragon-canvas-container" />
      <button 
        className={`audio-toggle-btn ${!isMuted ? 'playing' : ''}`}
        onClick={toggleAudio}
        title="Bật/Tắt Nhạc Hội Rồng"
        type="button"
      >
        {isMuted ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM12 4L9.91 6.09 12 8.18V4zm-8.86-.43L1.71 4.71 6 9H3v6h4l5 5v-6.88l4.7 4.7c-.66.52-1.4 1.01-2.2 1.41v2.04c1.35-.61 2.54-1.46 3.51-2.52l2.43 2.43 1.41-1.41L3.14 3.57zM12 15.82v-4.64L7.82 7H7v4H4v2h3v3.18l5-3.18z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        )}
      </button>
    </>
  );
}

=======
>>>>>>> parent of aa0c315 (xin chào)
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
