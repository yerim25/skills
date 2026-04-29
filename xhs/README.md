# XHS Chinese Learning Image Generator

Generate Xiaohongshu-style Chinese learning images in 9:16 ratio (1080x1920px).

## Installation

```bash
npm install
```

## Usage

### As Claude Code Skill

```
/xhs
```

Provide vocabulary in this format:
```
1. 你好 / nǐhǎo / 안녕하세요 / 你好,很高兴认识你
2. 谢谢 / xièxiè / 감사합니다 / 谢谢你的帮助
```

Use `**text**` in Chinese to highlight in red.

### Command Line

```bash
node generate.js <input.json> <output.png>
```

Input format:
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
