# Xiaohongshu Chinese Learning Image Generator

9:16 비율의 샤오홍슈 스타일 중국어 학습 이미지를 생성하는 도구입니다.

## 기능

- 중국어 단어/문장 + 병음 + 한국어 뜻 + 예문을 리스트 형식으로 표시
- 자동 페이지 분할 (컨텐츠가 한 페이지에 들어가지 않을 경우)
- 9:16 비율 (1080x1920px)
- **텍스트** 형식으로 중국어 강조 표시 가능

## 설치

```bash
npm install
```

## 사용법

### 명령줄에서 직접 사용

```bash
node generate.js <input.json> <output.png>
```

### Claude Code 스킬로 사용

```
/xhs
```

또는

```
/xiaohongshu
```

## 입력 형식 (JSON)

```json
[
  {
    "chinese": "你好",
    "pinyin": "nǐhǎo",
    "korean": "안녕하세요",
    "example": "你好,很高兴认识你"
  },
  {
    "chinese": "我**很喜欢**中文",
    "pinyin": "wǒ hěn xǐhuan zhōngwén",
    "korean": "나는 중국어를 아주 좋아한다",
    "example": "我很喜欢学习中文"
  }
]
```

### 강조 표시

중국어 텍스트에서 `**텍스트**` 형식으로 감싸면 빨간색 볼드로 강조됩니다.

## 출력

- 한 페이지로 충분한 경우: `output.png`
- 여러 페이지 필요한 경우: `output-1.png`, `output-2.png`, ...

페이지는 컨텐츠 높이를 자동으로 측정하여 단어가 잘리지 않도록 분할됩니다.

## 예제

```bash
node generate.js example.json output.png
```

## 스타일 사양

- **배경**: #fafafa
- **번호**: 42px, Pretendard, #000
- **중국어**: 42px, Noto Sans SC, #000
- **중국어 강조**: 42px, bold, #ff6645
- **병음**: 36px, Pretendard, #4fb0ff
- **한국어**: 42px, Pretendard, #000
- **예문**: 36px, Noto Sans SC, opacity 50%
