// Accuracy / integrity check for all 50 interview questions.
// Run: npm run check:accuracy  (reads src/data/*.ts as text, no build needed)
import { readFileSync, writeFileSync } from 'node:fs';

const files = {
  questions: 'src/data/cloudSecurityQuestions.ts',
  answers: 'src/data/interviewAnswers.ts',
  meta: 'src/data/questionMeta.ts',
  followUps: 'src/data/followUps.ts',
};
const src = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, readFileSync(p, 'utf8')]));
const issues = []; // {qid, severity: 'FAIL'|'WARN', check, detail}
const flag = (qid, severity, check, detail) => issues.push({ qid, severity, check, detail });

// 1. IDs 1..50 present exactly once in questions file
const idMatches = [...src.questions.matchAll(/^\s*id:\s*(\d+)/gm)].map((m) => Number(m[1]));
for (let id = 1; id <= 50; id++) {
  const count = idMatches.filter((x) => x === id).length;
  if (count === 0) flag(id, 'FAIL', 'id-present', 'missing from cloudSecurityQuestions.ts');
  if (count > 1) flag(id, 'FAIL', 'id-unique', `appears ${count}x (duplicate)`);
}

// 2. Per-question structural checks (split by "id: N")
const blocks = src.questions.split(/(?=^\s*id:\s*\d+)/m).filter((b) => /^\s*id:\s*\d+/.test(b));
for (const b of blocks) {
  const qid = Number(b.match(/id:\s*(\d+)/)[1]);
  const has = (re) => re.test(b);
  if (!has(/question:\s*['"`].{10,}/)) flag(qid, 'FAIL', 'question-text', 'question text missing/too short');
  if (!has(/shortDescription:\s*['"`].{10,}/)) flag(qid, 'FAIL', 'shortDescription', 'missing/too short');
  if (!has(/keywords:\s*\[/)) flag(qid, 'FAIL', 'keywords', 'missing keywords array');
  else {
    const kw = b.match(/keywords:\s*\[([^\]]*)\]/)?.[1] ?? '';
    const n = kw.split(',').filter((s) => s.trim()).length;
    if (n < 3) flag(qid, 'WARN', 'keywords', `only ${n} keywords (<3)`);
  }
  const steps = [...b.matchAll(/title:\s*['"`]Step \d+/g)].length;
  if (steps < 3) flag(qid, 'FAIL', 'steps', `only ${steps} steps (<3)`);
  const focuses = [...b.matchAll(/focus:\s*(\d+)/g)].map((m) => Number(m[1]));
  for (const f of focuses) if (f < 0 || f > 7) flag(qid, 'FAIL', 'focus-range', `focus=${f} out of range`);
  if (!has(/takeaway:\s*['"`].{20,}/)) flag(qid, 'FAIL', 'takeaway', 'missing/too short (<20 chars)');
  if (!has(/keyPoints:\s*\[/)) flag(qid, 'FAIL', 'keyPoints', 'missing keyPoints array');
  else {
    const kp = b.match(/keyPoints:\s*\[([\s\S]*?)\]/)?.[1] ?? '';
    const n = kp.split(/['"`]\s*,/).length;
    if (n < 3) flag(qid, 'WARN', 'keyPoints', `only ~${n} key points (<3)`);
  }
  const nodes = [...b.matchAll(/N\(\s*['"`]/g)].length;
  if (nodes === 0) flag(qid, 'WARN', 'nodes', 'no N(...) flow nodes found');
    if (/TODO|FIXME|XXX/i.test(b) || /lorem ipsum|placeholder/i.test(b)) flag(qid, 'WARN', 'placeholder', 'possible placeholder text');
  // (takeaway-vs-keyPoints word-overlap heuristic removed: too noisy,
  // takeaways legitimately paraphrase key points with different words)
}

// 3. Cross-file coverage: answers / meta / followUps
for (let id = 1; id <= 50; id++) {
  if (!new RegExp(`\\b${id}:\\s*['"\`]|\\b${id}:\\s*\\{`).test(src.answers)) flag(id, 'WARN', 'answer-coverage', 'no entry in interviewAnswers.ts');
  if (!new RegExp(`\\b${id}:\\s*\\{`).test(src.meta)) flag(id, 'FAIL', 'meta-coverage', 'no entry in questionMeta.ts');
}
const answerIds = [...src.answers.matchAll(/^\s*(\d+):\s*[`'"]/gm)].map((m) => Number(m[1]));
for (const id of answerIds) if (id < 1 || id > 50) flag(id, 'WARN', 'answer-range', `answer id ${id} outside 1..50`);
// followUps is partial by design — report coverage %, don't fail
const fuIds = new Set([...src.followUps.matchAll(/^\s*(\d+):\s*\{/gm)].map((m) => Number(m[1])));
// 4. Duplicate question text
const qTexts = [...src.questions.matchAll(/question:\s*['"`]([^'"`]+)['"`]/g)].map((m) => m[1].trim().toLowerCase());
const seen = new Set();
for (const t of qTexts) {
  if (seen.has(t)) flag(0, 'FAIL', 'duplicate-question', `"${t.slice(0, 60)}..." appears twice`);
  seen.add(t);
}

// ---- Report ----
const fails = issues.filter((i) => i.severity === 'FAIL');
const warns = issues.filter((i) => i.severity === 'WARN');
const lines = [
  '# Accuracy check report',
  '',
  `- Questions scanned: 50 | blocks parsed: ${blocks.length}`,
  `- FAIL: ${fails.length} | WARN: ${warns.length}`,
  `- interviewAnswers entries: ${answerIds.length}/50 | followUps entries: ${fuIds.size}/50 (partial OK)`,
  '',
  '| Q | Severity | Check | Detail |',
  '|---|----------|-------|--------|',
  ...issues.map((i) => `| ${i.qid || '—'} | ${i.severity} | ${i.check} | ${i.detail} |`),
  '',
  '## What this proves / does NOT prove',
  '- PROVES: structure complete, no missing/duplicate IDs, no empty fields, cross-file coverage.',
  '- DOES NOT prove factual correctness — an expert (or doc-grounded LLM review) must still verify each takeaway/answer against AWS/Azure/GCP docs.',
];
writeFileSync('accuracy-report.md', lines.join('\n'));
console.log(lines.slice(0, 8).join('\n'));
if (issues.length) console.table(issues);
else console.log('All checks passed.');
process.exit(fails.length ? 1 : 0);
