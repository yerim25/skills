# XHS Chinese Learning Image Generator

Generate Xiaohongshu-style Chinese learning images in 9:16 ratio (1080x1920px).

## Installation

```bash
npm install
```

## Usage

```bash
node generate.js <input.json> <output.png>
```

### Input Format

```json
[
  {
    "chinese": "你好",
    "pinyin": "nǐhǎo",
    "korean": "안녕하세요",
    "example": "你好,很高兴认识你"
  }
]
```

Use `**text**` in Chinese to highlight in red.
