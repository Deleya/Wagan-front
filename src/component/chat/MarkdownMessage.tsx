import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { FiCopy } from 'react-icons/fi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import pwsh from 'react-syntax-highlighter/dist/esm/languages/hljs/powershell';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import { useAppSelector } from '../../page/hooks/hooks.tsx';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('powershell', pwsh);

interface Props {
    content: string;
}

const MarkdownMessage = ({ content }: Props) => {

    const isDark = useAppSelector((state) => state.theme.darkMode)

    const markdownComponents: Components = {
        strong: ({ node, ...props }) => (
            <strong className="text-[#009688] font-semibold" {...props} />
        ),
        ul: ({ children }) => (
            <ul className="list-disc pl-6 pt-3 space-y-1 mb-5">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
            <li className="text-gray-800 mb-5" style={{color: isDark ? '#fff' :'#424242'}}>{children}</li>
        ),

        code({ node, inline, className, children, ...props }: any) {
            const [copied, setCopied] = useState(false);
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).trim();

            const handleCopy = () => {
                navigator.clipboard.writeText(codeText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            };
            const isSingleLine = codeText.split('\n').length === 1;


            // ✅ Si ce n’est pas du code en bloc (donc inline)
            if (!inline && isSingleLine) {
                return (
                    <code
                        // [#FF9900]
                        className="relative bg-gray-100 text-[#FF9900] pl-2 pr-8 py-0.5 rounded text-[13px] font-mono"
                        {...props}
                    >
                        {codeText}
                        <button
                            onClick={handleCopy}
                            className="absolute top-1 right-1 text-gray-700  text-xs rounded  cursor-pointer"
                        >
                            {copied ? <p className='bg-gray-300 ml-5 text-black'>Cpier!</p> : <FiCopy />}
                        </button>
                    </code>
                );
            }

            // 🧱 Sinon, code block
            return (
                <div className="relative my-4">
                    {match?.[1] && (
                        <div className="absolute top-1 left-2 bg-gray-200 text-gray-800 text-[11px] font-semibold px-2 rounded uppercase">
                            {match[1]}
                        </div>
                    )}
                    <SyntaxHighlighter
                        language={match?.[1] || ''}
                        style={atomOneLight}
                        PreTag="div"
                        customStyle={{
                            borderRadius: '8px',
                            paddingTop: '1.5rem',
                            backgroundColor: '#f3f1f1',
                        }}
                        {...props}
                    >
                        {codeText}
                    </SyntaxHighlighter>
                    <button
                        onClick={handleCopy}
                        className="absolute top-1 right-2 text-gray-700 px-2 py-1 text-xs rounded hover:bg-white cursor-pointer"
                    >
                        {copied ? 'Copié !' : <FiCopy />}
                    </button>
                </div>
            );

        }

    };

    return (
        <div className="prose prose-sm max-w-full dark:prose-invert  prose-p:mb-3 prose-li:mb-1 prose-pre:rounded-xl prose-code:before:hidden prose-code:after:hidden">

            <ReactMarkdown
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {content}
            </ReactMarkdown>
        </div>

        // <div className="prose prose-sm max-w-full dark:prose-invert text-black dark:text-white prose-p:mb-3 prose-li:mb-1 prose-pre:rounded-xl prose-code:before:hidden prose-code:after:hidden">
        //     <ReactMarkdown
        //         components={markdownComponents}
        //         remarkPlugins={[remarkGfm]}
        //         rehypePlugins={[rehypeRaw]}
        //     >
        //         {content}
        //     </ReactMarkdown>
        // </div>
    );
};

export default MarkdownMessage;

// ici j'ai mis le bloc du code en bg rouge donc je vois que meme quand il fias des explication
// les petit code qu'il explique il va prendre ti=outes la largeur donc ce qui suivent fait retour al ligne drecte
// je pense que si on arrive a bien lui dire quand le code il s'agis d'un code de 1 ligne il vas maitre le texte apres juste le code pas en bas 