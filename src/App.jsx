import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

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
