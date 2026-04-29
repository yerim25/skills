#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Available height for content
const VIEWPORT_HEIGHT = 1920;
const HEADER_HEIGHT = 80;  // padding top
const FOOTER_HEIGHT = 100; // padding bottom + footer
const AVAILABLE_HEIGHT = VIEWPORT_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;

/**
 * Get formatted date string
 * @returns {string} - Formatted date (e.g., "2026.04.29")
 */
function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

/**
 * Check if content fits in available height
 */
async function checkContentHeight(page) {
    return await page.evaluate(() => {
        const content = document.querySelector('.content');
        return content ? content.scrollHeight : 0;
    });
}

/**
 * Generate a single page image
 * @param {Array} vocabItems - Array of vocabulary items for this page
 * @param {number} pageNumber - Current page number
 * @param {number} totalPages - Total number of pages (may be updated)
 * @param {string} outputPath - Output PNG file path
 * @param {Object} browser - Playwright browser instance
 */
async function generateSinglePage(vocabItems, pageNumber, totalPages, outputPath, browser) {
    // Read template
    const templatePath = path.join(__dirname, 'template.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Helper function to convert **text** to <strong>text</strong>
    const formatBold = (text) => {
        return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    };

    // Generate vocab items HTML in list format
    const vocabHtml = vocabItems.map((item) => `
        <div class="vocab-item">
            <div class="vocab-header">
                <div class="vocab-number">${item.globalIndex}.</div>
                <div class="chinese">${formatBold(item.chinese)}</div>
                <div class="pinyin">${item.pinyin}</div>
            </div>
            <div class="vocab-details">
                <div class="korean">${item.korean}</div>
                <div class="example">${item.example}</div>
            </div>
        </div>
    `).join('\n');

    // Replace placeholders
    html = html.replace('<!-- VOCAB_ITEMS -->', vocabHtml);

    // Remove page info
    html = html.replace('<!-- PAGE_INFO -->', '');

    // Create temporary HTML file
    const tempHtmlPath = path.join(__dirname, `temp-page-${pageNumber}.html`);
    fs.writeFileSync(tempHtmlPath, html);

    try {
        const page = await browser.newPage();

        // Set viewport to 9:16 ratio
        await page.setViewportSize({
            width: 1080,
            height: 1920
        });

        // Load HTML
        await page.goto(`file://${tempHtmlPath}`, {
            waitUntil: 'networkidle'
        });

        // Wait for fonts to load
        await page.evaluate(() => document.fonts.ready);

        // Take screenshot
        await page.screenshot({
            path: outputPath,
            type: 'png',
            fullPage: false
        });

        await page.close();

        console.log(`✅ Page ${pageNumber}/${totalPages} generated: ${outputPath}`);
    } finally {
        // Clean up temp file
        if (fs.existsSync(tempHtmlPath)) {
            fs.unlinkSync(tempHtmlPath);
        }
    }
}

/**
 * Find how many items fit on a page
 */
async function findItemsPerPage(items, startIdx, browser) {
    const templatePath = path.join(__dirname, 'template.html');
    const formatBold = (text) => text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    let count = 1;
    const maxCount = items.length - startIdx;

    while (count <= maxCount) {
        const testItems = items.slice(startIdx, startIdx + count).map((item, idx) => ({
            ...item,
            globalIndex: startIdx + idx + 1
        }));

        const vocabHtml = testItems.map((item) => `
            <div class="vocab-item">
                <div class="vocab-header">
                    <div class="vocab-number">${item.globalIndex}.</div>
                    <div class="chinese">${formatBold(item.chinese)}</div>
                    <div class="pinyin">${item.pinyin}</div>
                </div>
                <div class="vocab-details">
                    <div class="korean">${item.korean}</div>
                    <div class="example">${item.example}</div>
                </div>
            </div>
        `).join('\n');

        let html = fs.readFileSync(templatePath, 'utf8');
        html = html.replace('<!-- VOCAB_ITEMS -->', vocabHtml);
        html = html.replace('<!-- PAGE_INFO -->', '');

        const tempHtmlPath = path.join(__dirname, 'temp-test.html');
        fs.writeFileSync(tempHtmlPath, html);

        try {
            const page = await browser.newPage();
            await page.setViewportSize({ width: 1080, height: 1920 });
            await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle' });
            await page.evaluate(() => document.fonts.ready);

            const contentHeight = await checkContentHeight(page);
            await page.close();

            if (contentHeight > AVAILABLE_HEIGHT) {
                // This item causes overflow, return previous count
                fs.unlinkSync(tempHtmlPath);
                return Math.max(1, count - 1);
            }

            // Try adding one more item
            count++;
        } catch (error) {
            fs.unlinkSync(tempHtmlPath);
            throw error;
        }
    }

    // Clean up
    const tempHtmlPath = path.join(__dirname, 'temp-test.html');
    if (fs.existsSync(tempHtmlPath)) {
        fs.unlinkSync(tempHtmlPath);
    }

    return maxCount;
}

/**
 * Generate Xiaohongshu-style Chinese learning images (multiple pages if needed)
 * @param {Array} vocabItems - Array of vocabulary items
 * @param {string} outputPath - Output PNG file path (will add page numbers if multiple pages)
 */
async function generateImages(vocabItems, outputPath) {
    const { chromium } = require('playwright');

    // Parse output path
    const outputDir = path.dirname(outputPath);
    const outputExt = path.extname(outputPath);
    const outputName = path.basename(outputPath, outputExt);

    try {
        // Launch browser once for all pages
        const browser = await chromium.launch({
            headless: true
        });

        const pages = [];
        let currentIdx = 0;

        // Dynamically split items into pages based on overflow detection
        while (currentIdx < vocabItems.length) {
            const itemsForThisPage = await findItemsPerPage(vocabItems, currentIdx, browser);
            const endIdx = currentIdx + itemsForThisPage;

            const pageItems = vocabItems.slice(currentIdx, endIdx).map((item, idx) => ({
                ...item,
                globalIndex: currentIdx + idx + 1
            }));

            pages.push(pageItems);
            currentIdx = endIdx;
        }

        const totalPages = pages.length;

        // Generate each page
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
            let pageOutputPath;
            if (totalPages === 1) {
                pageOutputPath = outputPath;
            } else {
                pageOutputPath = path.join(outputDir, `${outputName}-${pageNum + 1}${outputExt}`);
            }

            await generateSinglePage(pages[pageNum], pageNum + 1, totalPages, pageOutputPath, browser);
        }

        await browser.close();

        console.log(`\n🎉 All done! Generated ${totalPages} page(s) with ${vocabItems.length} word(s).`);
    } catch (error) {
        console.error('❌ Error generating images:', error);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node generate.js <input.json> <output.png>');
        console.log('\nInput JSON format:');
        console.log('[');
        console.log('  {');
        console.log('    "chinese": "你好",');
        console.log('    "pinyin": "nǐhǎo",');
        console.log('    "korean": "안녕하세요",');
        console.log('    "example": "你好,很高兴认识你"');
        console.log('  }');
        console.log(']');
        console.log('\nNote: Pages are automatically split based on content height.');
        console.log('Output files: output.png (single page) or output-1.png, output-2.png, ... (multiple pages)');
        process.exit(1);
    }

    const inputPath = args[0];
    const outputPath = args[1];

    // Read input JSON
    const vocabItems = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    generateImages(vocabItems, outputPath)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { generateImages };
