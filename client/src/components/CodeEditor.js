import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle, foldGutter } from '@codemirror/language';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { oneDark } from '@codemirror/theme-one-dark';
import { getLanguageExtension } from '../utils/languages';

const customTheme = EditorView.theme({
  '&': {
    height: '100%',
    background: 'transparent',
    color: '#d0d0f0',
    fontSize: '14px',
  },
  '.cm-content': {
    caretColor: '#00e5ff',
    fontFamily: "'JetBrains Mono', monospace",
    padding: '16px 0',
    lineHeight: '1.65',
  },
  '.cm-focused': { outline: 'none' },
  '.cm-line': { padding: '0 24px 0 4px' },
  '.cm-gutters': {
    background: 'rgba(4,4,7,0.5)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    color: '#2e2e52',
    minWidth: '48px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 8px',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  '.cm-activeLineGutter': {
    background: 'rgba(0,229,255,0.04)',
    color: 'rgba(0,229,255,0.7)',
  },
  '.cm-activeLine': { background: 'rgba(0,229,255,0.025)' },
  '.cm-selectionBackground, ::selection': { background: 'rgba(0,229,255,0.15) !important' },
  '.cm-cursor': { borderLeftColor: '#00e5ff', borderLeftWidth: '2px' },
  '.cm-matchingBracket': {
    background: 'rgba(0,229,255,0.12)',
    border: '1px solid rgba(0,229,255,0.4)',
    borderRadius: '2px',
  },
  '.cm-tooltip': {
    background: '#161628',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    background: 'rgba(0,229,255,0.15)',
    color: '#f0f0ff',
  },
  '.cm-foldGutter': { width: '16px' },
  '.cm-foldPlaceholder': {
    background: 'rgba(0,229,255,0.1)',
    border: '1px solid rgba(0,229,255,0.2)',
    color: '#00e5ff',
    borderRadius: '3px',
    padding: '0 4px',
  },
}, { dark: true });

export default function CodeEditor({ code, language, onChange, onCursor, readOnly = false }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const codeRef = useRef(code);
  const suppressRef = useRef(false);

  const buildExtensions = useCallback((lang) => [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    history(),
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    crosshairCursor(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    foldGutter(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    getLanguageExtension(lang),
    customTheme,
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !suppressRef.current) {
        const newCode = update.state.doc.toString();
        codeRef.current = newCode;
        onChange?.(newCode);
      }
      if (update.selectionSet) {
        const sel = update.state.selection.main;
        onCursor?.({ from: sel.from, to: sel.to, head: sel.head });
      }
    }),
    EditorView.editable.of(!readOnly),
    EditorState.readOnly.of(readOnly),
  ], [onChange, onCursor, readOnly]);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: buildExtensions(language),
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;
    codeRef.current = code;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line

  // Sync external code changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc === code) return;

    suppressRef.current = true;
    const cursor = view.state.selection.main.head;
    view.dispatch({
      changes: { from: 0, to: currentDoc.length, insert: code },
      selection: { anchor: Math.min(cursor, code.length) },
    });
    suppressRef.current = false;
    codeRef.current = code;
  }, [code]);

  // Sync language changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: [],
    });
    // Rebuild with new language — recreate state
    const currentCode = view.state.doc.toString();
    view.setState(EditorState.create({
      doc: currentCode,
      extensions: buildExtensions(language),
    }));
  }, [language]); // eslint-disable-line

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: 'rgba(4,4,7,0.6)',
      }}
    />
  );
}
