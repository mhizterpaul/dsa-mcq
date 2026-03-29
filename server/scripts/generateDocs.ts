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

        testFile.assertionResults.forEach((assertion: any) => {
            const title = assertion.title;
            if (title.includes('_given_')) {
                const [thenPart, givenPart] = title.split('_given_');
                const feature = assertion.ancestorTitles.join(' > ');

                content += `## Feature: ${feature}\n\n`;
                content += `### Scenario: ${thenPart.replace(/_/g, ' ')}\n\n`;

                const given = givenPart.replace(/_/g, ' ');
                const [then, when] = thenPart.split('_should_');

                content += `- **Given**: ${given}\n`;
                if (when) {
                   content += `- **When**: ${when.replace(/_/g, ' ')}\n`;
                }
                content += `- **Then**: ${then.replace(/should_/, '').replace(/_/g, ' ')}\n\n`;
            } else {
                content += `### ${title}\n\n- ${assertion.status === 'passed' ? '✅' : '❌'} ${assertion.status}\n\n`;
            }
        });

        fs.writeFileSync(path.join(DOCS_DIR, fileName), content, 'utf8');
        console.log(`Generated ${fileName}`);
    });
}

generateMarkdown();
