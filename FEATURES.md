# QC AI Result Dashboard - Enhanced with Model Comparison

## ✨ New Features

The dashboard now supports comparing two AI model outputs side-by-side, while maintaining full backward compatibility with single model reports.

### Features

#### 1. **Single Model Report** (Original)
- Upload 1 JSONL file to see the standard performance report
- Shows:
  - Mean Accuracy %
  - Number of Perfect Records
  - Valid/Skipped Records
  - Per-step accuracy charts
  - Wrong cases browser
  - Raw record browser

#### 2. **Dual Model Comparison** (New!)
- Upload 2 JSONL files to compare models side-by-side
- Shows:
  - **Comparison Metrics**: Side-by-side accuracy metrics with visual indicators
    - Green highlights the better performing model
    - Red shows lower performance
    - Yellow shows equal performance
  - **Side-by-Side Charts**: Per-step accuracy for each model
  - Easy model management with add/remove buttons

## 📋 Requirements

### File Format
Both files must be JSONL (JSON Lines) format with the required columns:

```json
{
  "gold_output": [{"id": 1, "r": "S", "e": "explanation", "g": "notes"}],
  "prediction_output": "[{\"id\": 1, \"r\": \"S\", \"e\": \"explanation\", \"g\": \"notes\"}]"
}
```

**Required Fields:**
- `gold_output`: Expected/reference output (array or JSON string)
- `prediction_output`: Model output (array or JSON string)

**Step Result Codes:**
- `S`: Success/Correct
- `F`: Failure/Incorrect
- `MISSING`: Step was missing from prediction

## 🚀 How to Use

### Single Model (Default)
1. Open the dashboard
2. Drag and drop a single `.jsonl` file, OR click to browse and select one file
3. View the single model report with all performance metrics

### Comparing Two Models
1. Open the dashboard
2. **Option A**: Drag and drop 2 files at once
3. **Option B**: Upload first model, then click "+ Add Model 2" to upload the second
4. The comparison report appears automatically with:
   - Side-by-side metrics
   - Color-coded performance indicators
   - Separate charts for each model

### Model Management
- **Add Model 2**: Click the button to add a second model for comparison
- **Remove Model 2**: Click the "✕ Remove Model 2" button to go back to single model view
- **Clear All**: Remove both models and reset

## 📊 Metrics Explained

### Comparison View Shows:
- **Mean Accuracy**: Average accuracy across all records
- **Perfect Records**: Count of 100% accurate predictions
- **Accuracy Difference**: Visual comparison metric

### Color Coding:
- 🟢 **Green**: Better performance
- 🔴 **Red**: Lower performance  
- 🟡 **Yellow**: Equal performance
- 🟣 **Purple**: Difference metric

## 📂 Sample Files

Two sample JSONL files are included:
- `sample_model1.jsonl`: Model 1 results
- `sample_model2.jsonl`: Model 2 results with slightly different performance

Use these to test the comparison feature.

## 🎨 Interactive Features

- **Dragon Animation**: Background animated dragons react to file uploads
- **Charts**: Interactive charts for accuracy analysis
- **Raw Browser**: Navigate through individual records
- **Wrong Cases**: Browse and analyze incorrect predictions

## 🔧 Development

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Dev Server
```bash
npm run dev
```

## 📝 Notes

- Both files should have the same structure for meaningful comparison
- The dashboard works offline - no data is sent anywhere
- Use with any model output format as long as it fits the required columns
- Dragon celebration plays when files are successfully loaded!

---

**Tip**: Use the dragon song toggle (top-right) to enable/disable the celebratory music when models are loaded! 🐉🎵
