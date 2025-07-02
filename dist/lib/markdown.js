"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFileName = exports.extractTitle = exports.parseMarkdown = void 0;
const unified_1 = require("unified");
const remark_parse_1 = __importDefault(require("remark-parse"));
const remark_gfm_1 = __importDefault(require("remark-gfm"));
const remark_rehype_1 = __importDefault(require("remark-rehype"));
const rehype_highlight_1 = __importDefault(require("rehype-highlight"));
const rehype_raw_1 = __importDefault(require("rehype-raw"));
const rehype_stringify_1 = __importDefault(require("rehype-stringify"));
async function parseMarkdown(content) {
    try {
        const result = await (0, unified_1.unified)()
            .use(remark_parse_1.default)
            .use(remark_gfm_1.default)
            .use(remark_rehype_1.default, { allowDangerousHtml: true })
            .use(rehype_raw_1.default)
            .use(rehype_highlight_1.default, {
            detect: true,
            ignoreMissing: true,
        })
            .use(rehype_stringify_1.default)
            .process(content);
        return result.toString();
    }
    catch (error) {
        console.error('Error parsing markdown:', error);
        return `<p>Error parsing markdown content: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
    }
}
exports.parseMarkdown = parseMarkdown;
function extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
            return trimmed.substring(2).trim();
        }
    }
    return '';
}
exports.extractTitle = extractTitle;
function formatFileName(fileName) {
    return fileName
        .replace(/\.(md|mdx)$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}
exports.formatFileName = formatFileName;
//# sourceMappingURL=markdown.js.map