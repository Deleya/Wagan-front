import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm  from 'remark-gfm';
import rehypeRaw  from 'rehype-raw';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js     from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts     from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import xml    from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import java   from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import bash   from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import css    from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import sql    from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useAppSelector } from '../../page/hooks/hooks.tsx';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('js',         js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('ts',         ts);
SyntaxHighlighter.registerLanguage('html',       xml);
SyntaxHighlighter.registerLanguage('xml',        xml);
SyntaxHighlighter.registerLanguage('java',       java);
SyntaxHighlighter.registerLanguage('python',     python);
SyntaxHighlighter.registerLanguage('py',         python);
SyntaxHighlighter.registerLanguage('bash',       bash);
SyntaxHighlighter.registerLanguage('sh',         bash);
SyntaxHighlighter.registerLanguage('css',        css);
SyntaxHighlighter.registerLanguage('sql',        sql);

/* ── Bouton copier pour les blocs de code ── */
function CodeCopyBtn({ text, isDark }: { text: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 6,
        fontSize: 11, fontWeight: 500,
        border: 'none', cursor: 'pointer',
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        color: isDark ? '#aaa' : '#666',
        transition: 'background 0.12s',
      }}
    >
      {copied
        ? <><FiCheck size={11} style={{ color: '#009688' }} /> Copié</>
        : <><FiCopy  size={11} /> Copier</>
      }
    </button>
  );
}

export default function MarkdownMessage({ content }: { content: string }) {
  const isDark = useAppSelector(s => s.theme.darkMode);

  const text   = isDark ? '#ececec' : '#111';
  const muted  = isDark ? '#888'    : '#666';
  const border = isDark ? '#2a2a2a' : '#e5e5e5';
  const codeBg = isDark ? '#161616' : '#f6f8fa';
  const codeHeaderBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const inlineCodeBg = isDark ? '#252525' : '#f0f0f0';
  const inlineCodeColor = isDark ? '#e06c75' : '#c0392b';

  const components: Components = {

    p: ({ children }) => (
      <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: text, lastChild: { marginBottom: 0 } } as any}>
        {children}
      </p>
    ),

    h1: ({ children }) => (
      <h1 style={{ fontSize: 18, fontWeight: 700, margin: '20px 0 10px', color: text, letterSpacing: '-0.2px' }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '16px 0 8px', color: text }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: 14, fontWeight: 600, margin: '12px 0 6px', color: text }}>
        {children}
      </h3>
    ),

    strong: ({ children }) => (
      <strong style={{ fontWeight: 600, color: text }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ fontStyle: 'italic', color: muted }}>{children}</em>
    ),

    ul: ({ children }) => (
      <ul style={{ paddingLeft: 20, margin: '0 0 12px', color: text, listStyleType: 'disc' }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingLeft: 20, margin: '0 0 12px', color: text, listStyleType: 'decimal' }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ marginBottom: 4, lineHeight: 1.7 }}>{children}</li>
    ),

    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: '3px solid #009688',
        paddingLeft: 12, margin: '12px 0',
        color: muted, fontStyle: 'italic',
        background: isDark ? '#1a1a1a' : '#f9f9f9',
        borderRadius: '0 8px 8px 0',
        padding: '8px 12px',
      }}>
        {children}
      </blockquote>
    ),

    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{ color: '#009688', textDecoration: 'underline', textUnderlineOffset: 2 }}>
        {children}
      </a>
    ),

    hr: () => (
      <hr style={{ border: 'none', borderTop: `1px solid ${border}`, margin: '16px 0' }} />
    ),

    table: ({ children }) => (
      <div style={{ overflowX: 'auto', margin: '12px 0', borderRadius: 10, border: `1px solid ${border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead style={{ background: codeHeaderBg }}>{children}</thead>
    ),
    th: ({ children }) => (
      <th style={{
        padding: '8px 14px', textAlign: 'left',
        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: muted,
        borderBottom: `1px solid ${border}`,
      }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{
        padding: '8px 14px', color: text,
        borderBottom: `1px solid ${border}`,
      }}>
        {children}
      </td>
    ),

    code({ node, inline, className, children, ...props }: any) {
      const match    = /language-(\w+)/.exec(className || '');
      const lang     = match?.[1] ?? '';
      const codeText = String(children).replace(/\n$/, '');
      const isBlock  = !inline && (codeText.includes('\n') || !!lang);

      /* ── Inline code ── */
      if (!isBlock) {
        return (
          <code style={{
            padding: '2px 6px', borderRadius: 5,
            fontSize: 13, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            background: inlineCodeBg, color: inlineCodeColor,
          }}>
            {codeText}
          </code>
        );
      }

      /* ── Block code ── */
      return (
        <div style={{
          margin: '14px 0', borderRadius: 12, overflow: 'hidden',
          border: `1px solid ${border}`,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 14px',
            background: codeHeaderBg,
            borderBottom: `1px solid ${border}`,
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '0.06em', color: muted,
            }}>
              {lang || 'code'}
            </span>
            <CodeCopyBtn text={codeText} isDark={isDark} />
          </div>

          {/* Code */}
          <SyntaxHighlighter
            language={lang}
            style={isDark ? atomOneDark : atomOneLight}
            PreTag="div"
            customStyle={{
              margin: 0, padding: '14px 16px',
              background: codeBg,
              fontSize: 13, lineHeight: 1.65,
              borderRadius: 0,
            }}
            {...props}
          >
            {codeText}
          </SyntaxHighlighter>
        </div>
      );
    },
  };

  return (
    <div style={{ fontSize: 14, lineHeight: 1.7 }}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
