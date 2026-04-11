import fs from 'fs';
import path from 'path';

const testDir = 'src/__tests__/acceptance';
const outputDoc = 'docs/acceptance.md';

function extractDocs() {
    const files = fs.readdirSync(testDir);
    let markdown = '# 📜 Acceptance Testing Scenarios (Single Source of Truth)\n\n';
    markdown += 'This document is auto-generated from `@Doc` and `@Route` annotations in acceptance tests.\n\n';

    files.forEach(file => {
        if (!file.endsWith('.test.ts')) return;

        const content = fs.readFileSync(path.join(testDir, file), 'utf8');
        const docRegex = /\/\*\*([\s\S]*?)\*\//g;
        let match;

        while ((match = docRegex.exec(content)) !== null) {
            const comment = match[1];
            const docMatch = /@Doc\("([^"]+)"\)/.exec(comment);
            if (docMatch) {
                const scenario = docMatch[1];
                const routes = [];
                const routeRegex = /@Route\("([^"]+)"\)/g;
                let routeMatch;
                while ((routeMatch = routeRegex.exec(comment)) !== null) {
                    routes.push(routeMatch[1]);
                }

                markdown += `## Scenario: ${scenario}\n`;
                if (routes.length > 0) {
                    markdown += `- **Routes:** ${routes.map(r => `\`${r}\``).join(', ')}\n`;
                }
                markdown += `- **Source:** \`${file}\`\n\n`;
            }
        }
    });

    const docPath = path.dirname(outputDoc);
    if (!fs.existsSync(docPath)) {
        fs.mkdirSync(docPath, { recursive: true });
    }
    fs.writeFileSync(outputDoc, markdown);
    console.log(`Documentation generated at ${outputDoc}`);
}

extractDocs();
