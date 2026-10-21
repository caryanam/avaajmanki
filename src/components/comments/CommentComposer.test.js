import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('CommentComposer - React Hook Order and Early Return Integrity', async (t) => {
  const componentPath = path.resolve(__dirname, 'CommentComposer.jsx');
  const source = fs.readFileSync(componentPath, 'utf8');

  await t.test('All hook calls must occur before any early return statements', () => {
    const lines = source.split('\n');
    let insideComponent = false;
    let componentStartLine = 0;
    const hookLines = [];
    const earlyReturnLines = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      if (line.includes('export function CommentComposer(')) {
        insideComponent = true;
        componentStartLine = lineNum;
      }

      if (insideComponent) {
        const trimmed = line.trim();

        // Detect hook calls: useState, useEffect, useRef, useCallback, useMemo, custom hooks
        if (/(\buse[A-Z]\w*|React\.use[A-Z]\w*)\s*\(/.test(trimmed)) {
          hookLines.push({ lineNum, code: trimmed });
        }

        // Detect early return statements before the main form JSX return
        if (
          trimmed.startsWith('return ') &&
          !trimmed.includes('<form') &&
          !trimmed.includes('() =>') &&
          !lineNum <= componentStartLine + 5
        ) {
          // Check if it's inside a handler function like handleSubmit
          const precedingCode = lines.slice(componentStartLine, index).join('\n');
          const isInsideFunction = /(const|function)\s+\w+\s*=\s*(async\s*)?\([^)]*\)\s*=>\s*\{[^}]*$/.test(precedingCode);
          if (!isInsideFunction) {
            earlyReturnLines.push({ lineNum, code: trimmed });
          }
        }
      }
    });

    assert.ok(hookLines.length >= 10, `Expected at least 10 hook invocations in CommentComposer, found ${hookLines.length}`);

    // If an early return exists (like if (activeReplyCommentId) return null),
    // it MUST come AFTER the last hook invocation
    const lastHookLine = Math.max(...hookLines.map(h => h.lineNum));

    earlyReturnLines.forEach(ret => {
      assert.ok(
        ret.lineNum > lastHookLine,
        `React Hooks violation: Early return at line ${ret.lineNum} ("${ret.code}") is placed BEFORE hook at line ${lastHookLine}. All hooks must execute unconditionally!`
      );
    });
  });

  await t.test('activeReplyCommentId conditional return must be placed after useVoiceRecorder and useEffect', () => {
    const activeReplyIndex = source.indexOf('if (activeReplyCommentId)');
    assert.ok(activeReplyIndex !== -1, 'Expected activeReplyCommentId conditional check in CommentComposer');

    const voiceRecorderIndex = source.indexOf('useVoiceRecorder(');
    assert.ok(voiceRecorderIndex !== -1, 'Expected useVoiceRecorder invocation in CommentComposer');

    assert.ok(
      activeReplyIndex > voiceRecorderIndex,
      'Regression check failed: if (activeReplyCommentId) must be placed AFTER useVoiceRecorder hook to prevent Rendered fewer hooks than expected crash'
    );
  });

  await t.test('handleSubmit must enforce currentUser authentication check', () => {
    assert.ok(
      source.includes('if (!currentUser)'),
      'CommentComposer must check !currentUser in handleSubmit to prevent unauthenticated comment submission'
    );
  });
});
