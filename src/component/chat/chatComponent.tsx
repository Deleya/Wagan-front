import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { sendMessageToBot } from '../../page/chat/chatSlice.tsx';

import wagan      from '../../assets/image/wagan.png';
import profil_img from '../../assets/image/profil-img.png';
import ousmaneImg from '../../assets/image/IA_ousmane.png';
import kalikaImg  from '../../assets/image/Kalika_Ia.png';

import ChatHistory       from './ChatHistory.tsx';
import ChatNavbar        from './ChatNavbar.tsx';
import MarkdownMessage   from './MarkdownMessage';
import AddAssistantModal from './AddAssistantModal.tsx';

import { IoLink }              from 'react-icons/io5';
import { MdOutlineAttachFile } from 'react-icons/md';
import { FiCopy, FiCheck }     from 'react-icons/fi';
import { LuSendHorizontal }    from 'react-icons/lu';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';

/* ─── Assistants disponibles ─── */
const ASSISTANTS = [
  { name: 'Ousmane', role: 'Data et AI Coach', image: ousmaneImg },
  { name: 'Kalika',  role: 'Bug Finder',       image: kalikaImg  },
];

/* ─── Typing dots ─── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 2px' }}>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

/* ─── Empty state ─── */
function EmptyState({ c }: { c: Colors }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 24px', gap: 20, userSelect: 'none',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        overflow: 'hidden', background: c.surfaceAlt,
      }}>
        <img src={wagan} alt="Wagan" style={{ width: 56, height: 56, objectFit: 'cover' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: c.text, marginBottom: 6, letterSpacing: '-0.3px' }}>
          Comment puis-je t'aider ?
        </h2>
        <p style={{ fontSize: 14, color: c.muted }}>
          Pose une question, partage du code ou décris ton problème.
        </p>
      </div>
    </div>
  );
}

/* ─── Palette de couleurs ─── */
interface Colors {
  bg: string; sidebar: string; border: string;
  text: string; muted: string; inputBg: string;
  surfaceAlt: string; userBubble: string;
}

function getColors(isDark: boolean): Colors {
  return isDark ? {
    bg:         '#111111',
    sidebar:    '#0a0a0a',
    border:     '#222222',
    text:       '#ececec',
    muted:      '#777777',
    inputBg:    '#1a1a1a',
    surfaceAlt: '#1e1e1e',
    userBubble: '#1e1e1e',
  } : {
    bg:         '#ffffff',
    sidebar:    '#fafafa',
    border:     '#ebebeb',
    text:       '#111111',
    muted:      '#888888',
    inputBg:    '#f5f5f5',
    surfaceAlt: '#f0f0f0',
    userBubble: '#f0f0f0',
  };
}

/* ══════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════ */
export default function ChatComponent() {
  const [input,       setInput]       = useState('');
  const [isModalOpen, setModalOpen]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIdx,   setCopiedIdx]   = useState<number | null>(null);

  const navigate    = useNavigate();
  const dispatch    = useAppDispatch();
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark           = useAppSelector(s => s.theme.darkMode);
  const assistantsActifs = useAppSelector(s => s.assistant.assistants);
  const { messages, status } = useAppSelector(s => s.chat);
  const allAdded = assistantsActifs.length >= ASSISTANTS.length;
  const isLoading = status === 'loading';

  const c = getColors(isDark);

  /* ── Auto-scroll vers le bas ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    dispatch(sendMessageToBot(input.trim()));
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const SW = 256; // largeur sidebar en px

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: c.bg, color: c.text, fontFamily: 'inherit',
    }}>

      {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
      <aside style={{
        width:    sidebarOpen ? SW : 0,
        minWidth: sidebarOpen ? SW : 0,
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        background: c.sidebar,
        borderRight: `1px solid ${c.border}`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ width: SW, height: '100%', display: 'flex', flexDirection: 'column', padding: '16px 12px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <img src={wagan} alt="Wagan" style={{
                width: 32, height: 32, borderRadius: 8, objectFit: 'cover',
                background: c.surfaceAlt,
              }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: c.text, letterSpacing: '-0.3px' }}>
                WA<span style={{ color: '#009688' }}>GAN</span>
              </span>
            </button>
          </div>

          {/* Bouton ajouter assistant */}
          <button
            className="add-assistant-btn"
            onClick={() => { if (!allAdded) setModalOpen(true); }}
            disabled={allAdded}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Ajouter un assistant
          </button>

          {/* Contenu scrollable */}
          <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
            <ChatHistory />
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN
      ════════════════════════════════ */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Header ── */}
        <header style={{
          height: 56, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: `1px solid ${c.border}`,
          background: c.bg,
        }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 8,
              border: 'none', background: 'none', cursor: 'pointer',
              color: c.muted, transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = c.surfaceAlt)}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            {sidebarOpen ? <RiMenuFoldLine size={19} /> : <RiMenuUnfoldLine size={19} />}
          </button>

          <ChatNavbar />
        </header>

        {/* ── Zone messages ── */}
        <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

            {messages.length === 0 && !isLoading && <EmptyState c={c} />}

            {messages.map((msg, idx) => {

              /* ── Message d'erreur ── */
              if (msg.role === 'error') {
                return (
                  <div key={idx} className="msg-enter" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '9px 16px', borderRadius: 10,
                      background: isDark ? '#2a1212' : '#fff5f5',
                      border: `1px solid ${isDark ? '#5a2020' : '#fecaca'}`,
                      color: isDark ? '#f87171' : '#dc2626',
                      fontSize: 13, maxWidth: '80%',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              }

              /* ── Message normal ── */
              return (
                <div
                  key={idx}
                  className="msg-enter msg-group"
                  style={{
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 10,
                    position: 'relative',
                  }}
                >
                  {/* Avatar */}
                  {msg.role === 'user' ? (
                    <img src={profil_img} alt="Profil" style={{
                      width: 28, height: 28, borderRadius: '50%',
                      objectFit: 'cover', flexShrink: 0, marginTop: 2,
                    }} />
                  ) : (
                    <img src={wagan} alt="Wagan" style={{
                      width: 28, height: 28, borderRadius: 8,
                      objectFit: 'cover', flexShrink: 0, marginTop: 2,
                      background: c.surfaceAlt,
                    }} />
                  )}

                  {/* Bulle / contenu */}
                  <div style={{ maxWidth: msg.role === 'user' ? '70%' : '86%', position: 'relative' }}>
                    {msg.role === 'user' ? (
                      <div style={{
                        background: c.userBubble,
                        color: c.text,
                        padding: '10px 16px',
                        borderRadius: '18px 4px 18px 18px',
                        fontSize: 14, lineHeight: 1.65,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }}>
                        {msg.text}
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: c.text }}>
                        <MarkdownMessage content={msg.text} />
                      </div>
                    )}

                    {/* Bouton copier (visible au hover via CSS) */}
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(msg.text, idx)}
                      style={{
                        bottom: -26,
                        [msg.role === 'user' ? 'right' : 'left']: 0,
                        background: c.surfaceAlt,
                        color: c.muted,
                        border: `1px solid ${c.border}`,
                      }}
                    >
                      {copiedIdx === idx
                        ? <><FiCheck size={11} style={{ color: '#009688' }} /> Copié</>
                        : <><FiCopy size={11} /> Copier</>
                      }
                    </button>
                  </div>
                </div>
              );
            })}

            {/* ── Typing indicator : visible tant que status === 'loading' ── */}
            {isLoading && (
              <div className="msg-enter" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <img src={wagan} alt="Wagan" style={{
                  width: 28, height: 28, borderRadius: 8,
                  objectFit: 'cover', flexShrink: 0, marginTop: 2,
                  background: c.surfaceAlt,
                }} />
                <div style={{
                  padding: '10px 16px',
                  borderRadius: '4px 18px 18px 18px',
                  background: c.surfaceAlt,
                  border: `1px solid ${c.border}`,
                }}>
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Zone input ── */}
        <div style={{
          flexShrink: 0,
          padding: '12px 16px 16px',
          borderTop: `1px solid ${c.border}`,
          background: c.bg,
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            <div
              className="chat-input-wrap"
              style={{
                background: c.inputBg,
                border: `1px solid ${c.border}`,
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'box-shadow 0.15s',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Envoie un message…"
                rows={1}
                className="scrollbar-thin"
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', outline: 'none', resize: 'none',
                  padding: '14px 16px 8px',
                  fontSize: 14, lineHeight: 1.6,
                  color: c.text, minHeight: 50, maxHeight: 180,
                  display: 'block', fontFamily: 'inherit',
                }}
              />

              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 10px 10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <button
                    className={`toolbar-btn${isDark ? ' dark' : ''}`}
                    style={{ color: c.muted }}
                    title="Ajouter un lien"
                  >
                    <IoLink size={17} />
                  </button>
                  <button
                    className={`toolbar-btn${isDark ? ' dark' : ''}`}
                    style={{ color: c.muted }}
                    title="Joindre un fichier"
                  >
                    <MdOutlineAttachFile size={17} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {input.length > 0 && (
                    <span style={{ fontSize: 11, color: c.muted }}>{input.length}</span>
                  )}
                  <button
                    className={`send-btn ${input.trim() && !isLoading ? 'active' : 'inactive'}`}
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    style={
                      !input.trim() || isLoading
                        ? { background: c.surfaceAlt, color: c.muted }
                        : {}
                    }
                  >
                    <LuSendHorizontal size={15} />
                  </button>
                </div>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: c.muted, marginTop: 8 }}>
              Wagan peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      </main>

      {/* Modal */}
      <AddAssistantModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        assistantsDisponibles={ASSISTANTS}
      />
    </div>
  );
}
