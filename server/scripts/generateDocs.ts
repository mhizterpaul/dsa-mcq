import fs from 'fs';
import path from 'path';

const JEST_OUTPUT_PATH = path.resolve('jest-results.json');
const DOCS_DIR = path.resolve('../docs');

function generateMarkdown() {
    if (!fs.existsSync(JEST_OUTPUT_PATH)) {
        console.error('Jest results file not found. Run tests with --json --outputFile=jest-results.json first.');
        process.exit(1);
    }

    const results = JSON.parse(fs.readFileSync(JEST_OUTPUT_PATH, 'utf8'));

    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
    }

    results.testResults.forEach((testFile: any) => {
        const fileName = path.basename(testFile.name, '.test.ts') + '.md';
        let content = `# Documentation: ${path.basename(testFile.name)}\n\n`;

        // Read source file for @Doc annotations
        const sourceCode = fs.existsSync(testFile.name) ? fs.readFileSync(testFile.name, 'utf8') : '';

        testFile.assertionResults.forEach((assertion: any) => {
            const title = assertion.title;
            const feature = assertion.ancestorTitles.join(' > ');

            // Try to extract @Doc and @Route annotations from source
            let docOverride = '';
            let routeMapping = '';
            const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Regex to find comments preceding the specific test
            // We search for the test title and then look backwards for the nearest comment block
            const testIndex = sourceCode.indexOf(`test('${title}'`);
            const testIndex2 = testIndex === -1 ? sourceCode.indexOf(`test("${title}"`) : testIndex;

            if (testIndex2 !== -1) {
                const searchArea = sourceCode.substring(0, testIndex2);
                const commentBlocks = searchArea.match(/\/\*\*[\s\S]*?\*\//g);
                if (commentBlocks && commentBlocks.length > 0) {
                    const lastComment = commentBlocks[commentBlocks.length - 1];
                    // Verify the comment is reasonably close to the test (within 100 chars of trailing whitespace/code)
                    const lastCommentEnd = searchArea.lastIndexOf(lastComment) + lastComment.length;
                    const gap = searchArea.substring(lastCommentEnd).trim();
                    if (gap.length < 50) {
                        const docMatch = lastComment.match(/@Doc\(["'](.+?)["']\)/);
                        if (docMatch) docOverride = docMatch[1];

                        const routeMatch = lastComment.match(/@Route\(["'](.+?)["']\)/);
                        if (routeMatch) routeMapping = routeMatch[1];
                    }
                }
            }

            content += `## Feature: ${feature || 'General'}\n\n`;
            if (docOverride) {
                content += `### Scenario: ${docOverride}\n\n`;
            } else {
                content += `### Scenario: ${title.replace(/_/g, ' ')}\n\n`;
            }

            if (routeMapping) {
                content += `> 🔗 **API Route**: \`${routeMapping}\`\n\n`;
            }

            // Handle Given-When-Then convention: should_..._when_..._given_...
            // or variants: should_..._given_...
            if (title.includes('_given_')) {
                const parts = title.split('_given_');
                const given = parts[1].replace(/_/g, ' ');
                const actionPart = parts[0];

                let when = '';
                let then = actionPart;

                if (actionPart.includes('_when_')) {
                    const actionParts = actionPart.split('_when_');
                    then = actionParts[0];
                    when = actionParts[1].replace(/_/g, ' ');
                }

                const cleanedThen = then.replace(/^should_/, '').replace(/_/g, ' ');

                content += `- **Given**: ${given}\n`;
                if (when) {
                    content += `- **When**: ${when}\n`;
                }
                content += `- **Then**: ${cleanedThen}\n\n`;
            } else {
                content += `- Status: ${assertion.status === 'passed' ? '✅' : '❌'} ${assertion.status}\n\n`;
            }
        });

        fs.writeFileSync(path.join(DOCS_DIR, fileName), content, 'utf8');
        console.log(`Generated ${fileName}`);
    });
}

generateMarkdown();
