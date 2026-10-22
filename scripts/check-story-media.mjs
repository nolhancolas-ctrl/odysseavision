// Focused checks: exclude archived patch baselines and generated application routes.
import ts from "typescript";
import { ESLint } from "eslint";
import nextConfig from "eslint-config-next/core-web-vitals";

const files = [
  "scripts/story-media-harness.tsx",
  "src/components/stories/StoryArtboard.tsx",
  "src/components/stories/storySpatialLayout.ts",
  "src/components/stories/storyComposition.ts",
  "src/components/stories/StoryRichHtml.tsx",
  "src/components/admin/stories/StoryMediaDialog.tsx",
  "src/components/admin/stories/storyMediaHtml.ts",
  "src/components/admin/stories/storyTiptap.ts",
];
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, ".");
const program = ts.createProgram(
  [...files, "node_modules/next/types/global.d.ts", "src/components/admin/stories/StoryRichTextEditor.tsx"],
  { ...parsed.options, incremental: false },
);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: name => name,
    getNewLine: () => "\n",
  }));
}
const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: nextConfig });
const results = await eslint.lintFiles(files);
console.log((await eslint.loadFormatter("stylish")).format(results));
if (diagnostics.length || results.some(result => result.errorCount)) {
  process.exitCode = 1;
} else {
  console.log("Story media: TypeScript and ESLint checks passed.");
}
