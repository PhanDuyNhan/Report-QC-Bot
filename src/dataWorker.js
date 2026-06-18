// dataWorker.js

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

self.onmessage = function (event) {
  const lines = event.data;
  try {
    const result = processData(lines);
    self.postMessage({ type: 'success', result });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
