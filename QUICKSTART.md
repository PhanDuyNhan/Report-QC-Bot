# 🚀 Quick Start Guide - QC Dashboard with Model Comparison

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173/`

## 📊 Two Ways to Use

### Option 1: Single Model Report (Traditional)
Perfect for analyzing one AI model's performance:

1. **Upload 1 JSONL file** with columns:
   - `gold_output`: Expected results
   - `prediction_output`: Model predictions

2. **View Report**:
   - ✓ Mean accuracy percentage
   - ✓ Count of perfect predictions
   - ✓ Per-step accuracy charts
   - ✓ Wrong cases browser
   - ✓ Raw record browser

### Option 2: Model Comparison (NEW!)
Compare two models side-by-side:

1. **Upload 2 JSONL files** (same format as above)
   - Either drag 2 files at once
   - Or upload first, then click "+ Add Model 2"

2. **View Comparison**:
   - **Metrics Panel**: Side-by-side accuracy with color coding
     - 🟢 Green: Model is better
     - 🔴 Red: Model is worse
     - 🟡 Yellow: Models are equal
   - **Charts**: Separate per-step accuracy for each model
   - **Performance Indicators**: Visual comparison of perfect records

## 📁 Sample Files for Testing

Two sample files are included to test the comparison feature:

```bash
# Test single model
# Drag sample_model1.jsonl to the dashboard

# Test comparison
# Drag both sample_model1.jsonl and sample_model2.jsonl at once
```

### Sample Data Format
```jsonl
{"id": "record1", "gold_output": [{"id": 1, "r": "S", "e": "explanation"}], "prediction_output": "[{\"id\": 1, \"r\": \"S\", \"e\": \"explanation\"}]"}
{"id": "record2", "gold_output": [{"id": 1, "r": "S", "e": "explanation"}], "prediction_output": "[{\"id\": 1, \"r\": \"F\", \"e\": \"explanation\"}]"}
```

**Field Codes**:
- `r`: Result - "S" (Success), "F" (Failure), "MISSING" (Missing)
- `e`: Explanation text
- `g`: Additional notes

## 🎮 Controls

| Action | Result |
|--------|--------|
| Drop 1 file | Single model report |
| Drop 2 files | Comparison view |
| Click "+ Add Model 2" | Add second model for comparison |
| Click "✕ Remove Model 2" | Go back to single model view |
| Click "Clear All" | Reset and upload new files |
| Arrow keys | Navigate raw records |
| 🔊 Icon (top-right) | Toggle dragon celebration music |

## 💡 Pro Tips

1. **Consistent Format**: Ensure both files have the same structure for meaningful comparison
2. **Same Records**: Compare models on identical test sets for fair comparison
3. **Color Coding**: Red/Green makes it easy to spot performance differences at a glance
4. **Music Toggle**: Enable the dragon song toggle to celebrate when models load!
5. **Raw Browser**: Use arrow keys to quickly navigate through raw records

## 🔍 What Gets Compared

When comparing two models, you see:
- **Mean Accuracy**: Which model is more accurate overall
- **Perfect Records**: Which model gets more 100% correct
- **Per-Step Performance**: Accuracy breakdown for each step in the pipeline
- **Difference Metrics**: Visual indicators of performance gaps

## 📋 Requirements

- Modern web browser with JavaScript enabled
- JSONL files with `gold_output` and `prediction_output` columns
- All data processing happens locally (no cloud uploads)

## 🐉 Dragon Features!

The dashboard includes animated dragons that:
- React to mouse movement
- Celebrate when files are loaded
- Play celebratory music (toggle with 🔊 button)
- Fight each other in the background
- Can be controlled with keyboard shortcuts:
  - `A`: Make Azure dragon fire
  - `B`: Make Blue dragon fire  
  - `H`: Trigger dragon fight

---

**Need Help?** Check `FEATURES.md` for detailed feature documentation or review sample files for format examples.
