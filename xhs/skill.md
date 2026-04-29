# Xiaohongshu Chinese Learning Image Generator

Generate 9:16 ratio Xiaohongshu-style images for Chinese vocabulary learning.

## Instructions

You are helping create beautiful Chinese learning content for Xiaohongshu (小红书).

When invoked, follow these steps:

1. **Gather vocabulary items** from the user in this format:
   - Chinese word/phrase
   - Pinyin (romanization)
   - Korean meaning
   - Example sentence

2. **Create an HTML file** using the template at `~/.claude/skills/xiaohongshu/template.html`
   - Use 9:16 aspect ratio (1080x1920 pixels)
   - Style it beautifully with gradients, proper spacing, and readable fonts
   - Each vocabulary item should be clearly formatted

3. **Convert to PNG** using the Node.js script at `~/.claude/skills/xiaohongshu/generate.js`

4. **Save the output** to the user's working directory with a descriptive filename

## Example usage

User provides vocabulary list:
```
你好 nǐhǎo 안녕하세요
你好,很高兴认识你

谢谢 xièxiè 감사합니다
谢谢你的帮助
```

You generate:
- HTML file with styled content
- PNG image (1080x1920) saved to current directory

## Technical details

- Aspect ratio: 9:16 (1080x1920 pixels)
- Font: Noto Sans SC for Chinese, sans-serif for Korean/English
- Style: Clean, modern, Instagram/Xiaohongshu aesthetic
- Color scheme: Soft gradients with good contrast for readability
