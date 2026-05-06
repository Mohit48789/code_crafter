import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { cpp } from '@codemirror/lang-cpp';

export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js', color: '#F7DF1E' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts', color: '#3178C6' },
  { id: 'python', label: 'Python', ext: 'py', color: '#3776AB' },
  { id: 'html', label: 'HTML', ext: 'html', color: '#E34F26' },
  { id: 'css', label: 'CSS', ext: 'css', color: '#1572B6' },
  { id: 'json', label: 'JSON', ext: 'json', color: '#00FF88' },
  { id: 'java', label: 'Java', ext: 'java', color: '#007396' },
  { id: 'rust', label: 'Rust', ext: 'rs', color: '#CE422B' },
  { id: 'cpp', label: 'C++', ext: 'cpp', color: '#00599C' },
  { id: 'sql', label: 'SQL', ext: 'sql', color: '#E38C00' },
];

export function getLanguageExtension(langId) {
  switch (langId) {
    case 'javascript': return javascript({ jsx: true });
    case 'typescript': return javascript({ typescript: true, jsx: true });
    case 'python': return python();
    case 'html': return html();
    case 'css': return css();
    case 'json': return json();
    case 'java': return java();
    case 'rust': return rust();
    case 'cpp': return cpp();
    case 'sql': return sql();
    default: return javascript();
  }
}

export function getLanguageInfo(langId) {
  return LANGUAGES.find(l => l.id === langId) || LANGUAGES[0];
}

export const STARTER_TEMPLATES = {
  javascript: `// Welcome to Code Crafter! 🚀
// Edit together in real-time

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const results = Array.from({ length: 10 }, (_, i) => fibonacci(i));
console.log('Fibonacci sequence:', results);

// Try: const sum = results.reduce((a, b) => a + b, 0);
`,
  python: `# Welcome to Code Crafter! 🚀
# Edit together in real-time

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

results = [fibonacci(i) for i in range(10)]
print("Fibonacci sequence:", results)

# Try: print("Sum:", sum(results))
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Code Crafter Demo</title>
  <style>
    body { font-family: sans-serif; background: #0a0a1a; color: #fff; }
    h1 { color: #00e5ff; }
  </style>
</head>
<body>
  <h1>Hello, Code Crafter! 🚀</h1>
  <p>Edit this HTML together in real-time!</p>
</body>
</html>
`,
};
