# Technical Documentation - QC Dashboard

## Architecture

### Component Structure

```
App (Main)
├── Dragon (Animated background)
├── File Upload Zone
├── File Status Panel (when files loaded)
├── Single Model Report (1 file)
│   ├── Cards (metrics)
│   ├── Charts (accuracy charts)
│   ├── Per-Step Summary Table
│   ├── WrongCases Browser
│   └── RawRecordBrowser
└── Comparison Report (2 files)
    ├── ComparisonMetrics (side-by-side)
    ├── ComparisonCharts (dual charts)
    └── RawRecordBrowser
```

## Key Functions

### `processData(lines: string[])`
Parses JSONL file and calculates metrics.

**Input**: Array of JSONL strings
**Output**: Object with:
```javascript
{
  raw: [],              // Raw parsed data
  valid: [],            // Records with accuracy
  parseErrors: [],      // Failed parse indices
  steps: [],            // Sorted step IDs
  stepAcc: {},          // Accuracy per step
  stepCorrect: {},      // Correct count per step
  stepTotal: {},        // Total count per step
  stepWrong: {},        // Wrong cases detail
  meanAcc: number,      // Mean accuracy %
  perfect: number       // Perfect record count
}
```

### `extractJsonArray(input: string | object)`
Extracts JSON array from string with flexible parsing.

Handles:
- Valid JSON arrays
- JSON in markdown code blocks
- Partially broken JSON
- Direct objects

### `safeParse(value: string | array)`
Safely parses various output formats.

Supports:
- JSON arrays
- JSON objects with round/step structure
- Direct arrays
- Fallback to empty array

## Component Props

### `ComparisonMetrics`
```javascript
ComparisonMetrics({ data1, data2 })
// data1, data2: Output of processData()
```

Displays:
- Side-by-side mean accuracy
- Accuracy difference
- Perfect records comparison
- Color-coded performance

### `ComparisonCharts`
```javascript
ComparisonCharts({ data1, data2 })
```

Shows:
- Bar charts for each model
- Per-step accuracy comparison
- Shared step IDs

### `Charts`
```javascript
Charts({ data })
```

Displays:
- Per-step accuracy bar chart
- Correct vs Wrong stacked chart
- Per-record accuracy bar chart

## Data Flow

```
User uploads file(s)
    ↓
handleFile1()/handleFile2() called
    ↓
FileReader reads text
    ↓
processData() parses JSONL
    ↓
setData1() / setData2() updates state
    ↓
Component re-renders
    ↓
- If only data1: Show single report
- If data1 && data2: Show comparison
```

## Styling System

### Color Scheme
- **Primary**: #38bdf8 (Cyan)
- **Secondary**: #a855f7 (Purple)
- **Success**: #4ade80 (Green)
- **Error**: #f87171 (Red)
- **Warning**: #facc15 (Yellow)
- **Dark**: #0f172a, #1e293b

### Animations
- `fadeInUp`: 0.6s ease-out
- `fadeInDown`: 0.5s ease-out
- `textGlow`: 6s infinite
- `pulseAudioGlow`: 1.5s infinite

## File Format Specification

### JSONL Record Structure
```json
{
  "id": "unique_id",
  "gold_output": [
    {
      "id": 1,
      "r": "S|F|MISSING",
      "e": "explanation",
      "g": "notes"
    }
  ],
  "prediction_output": "[{\"id\": 1, \"r\": \"S\", \"e\": \"...\", \"g\": \"...\"}]",
  ...other columns
}
```

### Field Definitions
- `gold_output`: Expected/reference output (array or JSON string)
- `prediction_output`: Model output (array or JSON string)
- `id`: Record identifier
- `r`: Result code (S/F/MISSING)
- `e`: Explanation text
- `g`: Additional notes/context

## Performance Metrics

### Calculated Metrics
- **Per-Record Accuracy**: Correct steps / Total steps
- **Step Accuracy**: Records with correct step / Total records
- **Mean Accuracy**: Average of all per-record accuracies
- **Perfect Count**: Records with 100% accuracy

## Browser Compatibility

Requires:
- ES6+ JavaScript
- Canvas API (for dragon animation)
- Web Audio API (for music)
- FileReader API (for file uploads)
- Chart.js 4.4+

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Extending the Dashboard

### Adding New Metrics
1. Update `processData()` to calculate metric
2. Add display component
3. Add styling in `styles.css`

### Adding New Chart Types
1. Import Chart.js plugin
2. Create chart component with useRef
3. Update Charts/ComparisonCharts components

### Customizing Colors
Edit `styles.css` color variables:
```css
/* Primary colors */
.some-element { color: #38bdf8; }

/* Update in multiple places:
-- .card.blue, .chart-title, .step-btn, etc.
*/
```

## Known Limitations

1. **Same Step IDs Required**: Both models should have same step ID structure
2. **JSONL Only**: Single file must be JSONL format
3. **No Backend**: All processing happens client-side
4. **Memory**: Very large files may slow down browser
5. **Missing Steps**: Treated as accuracy 0 for that record

## Future Enhancements

- [ ] Export comparison reports as PDF
- [ ] Import/save previous reports
- [ ] 3+ model comparison
- [ ] Per-step drill-down
- [ ] Statistical significance testing
- [ ] Confusion matrix for step outcomes
- [ ] Time tracking for model prediction duration
- [ ] Batch processing multiple files

## Dependencies

```json
{
  "chart.js": "^4.4.9",
  "react": "^19.1.0",
  "react-dom": "^19.1.0"
}
```

Dev dependencies:
```json
{
  "@vitejs/plugin-react": "^5.0.0",
  "vite": "^7.0.0"
}
```

## Building for Production

```bash
npm run build
# Output in dist/

npm run preview
# Preview production build
```

---

For user-facing documentation, see `FEATURES.md` and `QUICKSTART.md`
