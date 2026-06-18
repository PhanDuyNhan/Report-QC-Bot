import fs from 'fs';

const appFile = 'd:/Concentrix/Report-QC-Bot/src/App.jsx';
let content = fs.readFileSync(appFile, 'utf8');

// 1. Remove extractJsonArray, safeParse, processData
const extractIndex = content.indexOf('function extractJsonArray(');
const resultBadgeIndex = content.indexOf('function ResultBadge({ value }) {');
const oldDragonIndex = content.indexOf('function Dragon() {');

// 2. New Dragon Component
const newDragon = `function Dragon() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const particles = [];
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const fireColorsLeft = ['#f97316', '#facc15', '#ef4444', '#f59e0b'];
    const fireColorsRight = ['#06b6d4', '#3b82f6', '#d946ef', '#a855f7'];

    const triggerFire = (isLeft) => {
      const leftDragon = document.getElementById('left-dragon-img');
      const rightDragon = document.getElementById('right-dragon-img');
      
      const dragonRect = isLeft 
        ? (leftDragon ? leftDragon.getBoundingClientRect() : { width: 300, left: 0, top: window.innerHeight * 0.4 })
        : (rightDragon ? rightDragon.getBoundingClientRect() : { width: 300, left: window.innerWidth - 300, top: window.innerHeight * 0.4 });
        
      const imgWidth = dragonRect.width;
      
      // Calculate mouth relative to image bounding box (approximate center height, towards inner edge)
      const mouthX = isLeft ? dragonRect.left + imgWidth * 0.75 : dragonRect.left + imgWidth * 0.25;
      const mouthY = dragonRect.top + dragonRect.height * 0.4;
      
      const dx = mouse.x - mouthX;
      const dy = mouse.y - mouthY;
      const angle = Math.atan2(dy, dx);
      const colors = isLeft ? fireColorsLeft : fireColorsRight;

      for (let j = 0; j < 45; j++) {
        const fangle = angle + (Math.random() - 0.5) * 0.35;
        const fspeed = 6 + Math.random() * 15;
        particles.push({
          x: mouthX,
          y: mouthY,
          vx: Math.cos(fangle) * fspeed,
          vy: Math.sin(fangle) * fspeed,
          size: 4 + Math.random() * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 25 + Math.random() * 25,
          maxLife: 50,
        });
      }
    };

    const handleMouseDown = (e) => {
      if (e.target.closest('button, input, select, a, [role="button"], pre, code, table, tr, td')) return;
      triggerFire(true);
      triggerFire(false);
    };
    window.addEventListener('mousedown', handleMouseDown);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life--;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const pct = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = pct;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pct, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const leftDragon = document.getElementById('left-dragon-img');
      const rightDragon = document.getElementById('right-dragon-img');

      if (leftDragon) {
        const rect = leftDragon.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(mouse.y - cy, mouse.x - cx);
        const tilt = Math.max(-0.25, Math.min(0.25, angle));
        leftDragon.style.transform = \`translateY(-50%) rotate(\${tilt}rad)\`;
      }

      if (rightDragon) {
        const rect = rightDragon.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(mouse.y - cy, mouse.x - cx);
        const adjustedAngle = angle > 0 ? angle - Math.PI : angle + Math.PI;
        const tilt = Math.max(-0.25, Math.min(0.25, adjustedAngle));
        rightDragon.style.transform = \`translateY(-50%) rotate(\${tilt}rad)\`;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="dragon-canvas-container" style={{ pointerEvents: 'none', zIndex: 1 }} />
      <img id="left-dragon-img" src="/left_dragon.png" alt="Left Dragon" className="dragon-img left" />
      <img id="right-dragon-img" src="/right_dragon.png" alt="Right Dragon" className="dragon-img right" />
    </>
  );
}
`;

content = content.substring(0, oldDragonIndex) + newDragon + '\n\n' + content.substring(resultBadgeIndex);

// Remove the audio toggle button
const audioToggleRegex = /<button[\s\S]*?className={`audio-toggle-btn[\s\S]*?<\/button>/;
content = content.replace(audioToggleRegex, '');

// 3. Replace App component handleFile and add loading state
content = content.replace(
  'const [dragging, setDragging] = useState(false);',
  'const [dragging, setDragging] = useState(false);\n  const [loading, setLoading] = useState(false);'
);

const oldHandleFile = `const handleFile = (file) => {
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setData(processData(String(event.target.result).split('\\n')));
        // Trigger dragon celebration animation
        window.dispatchEvent(new CustomEvent('qc-file-uploaded'));
      } catch (err) {
        setError(\`Parse error: \${err.message}\`);
      }
    };
    reader.readAsText(file);
  };`;

const newHandleFile = `const handleFile = (file) => {
    setError('');
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = String(event.target.result).split('\\n');
      const worker = new Worker(new URL('./dataWorker.js', import.meta.url), { type: 'module' });
      
      worker.onmessage = (e) => {
        if (e.data.type === 'success') {
          setData(e.data.result);
          setLoading(false);
        } else {
          setError(\`Parse error: \${e.data.error}\`);
          setLoading(false);
        }
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        setError(\`Worker error: \${err.message}\`);
        setLoading(false);
        worker.terminate();
      };

      worker.postMessage(lines);
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };
    reader.readAsText(file);
  };`;

content = content.replace(oldHandleFile, newHandleFile);

// Add loading indicator to UI
content = content.replace(
  '{error && <div className="error-msg">{error}</div>}',
  `{error && <div className="error-msg">{error}</div>}
      {loading && <div className="loading-msg" style={{textAlign: 'center', marginBottom: '24px', color: '#38bdf8', fontSize: '1.2em', fontWeight: 'bold', animation: 'pulse 1.5s infinite'}}>Đang xử lý dữ liệu... Vui lòng đợi...</div>}`
);

fs.writeFileSync(appFile, content, 'utf8');
console.log('App.jsx updated successfully.');
