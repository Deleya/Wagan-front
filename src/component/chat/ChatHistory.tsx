import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { removeAssistant, setSelectedAssistant } from '../../page/chat/assistantSlice.ts';
import { clearMessages, clearHistory } from '../../page/chat/chatSlice.tsx';
import { IoIosChatboxes } from 'react-icons/io';
import { HistoryOutlined } from '@ant-design/icons';
import { TbLibraryPhoto } from 'react-icons/tb';
import { RiCloseLine } from 'react-icons/ri';
import { message, Drawer, Button, Empty } from 'antd';

const getAssistantDisplay = (assistant: { name: string; role: string }) => {
  const normalizedName = assistant.name.toLowerCase().trim();

  if (normalizedName === 'ousmane') {
    return {
      name: 'Analyse de donnees',
      role: "Analyse de donnees et developpement d'application",
    };
  }

  if (normalizedName === 'kalika') {
    return {
      name: 'Dev',
      role: "Developpement d'application",
    };
  }

  return assistant;
};

export default function ChatHistory() {
  const isDark     = useAppSelector(s => s.theme.darkMode);
  const assistants = useAppSelector(s => s.assistant.assistants);
  const selected   = useAppSelector(s => s.assistant.selectedAssistant);
  const dispatch   = useAppDispatch();

  const text   = isDark ? '#ececec' : '#111';
  const muted  = isDark ? '#666'    : '#999';
  const border = isDark ? '#222'    : '#ebebeb';
  const active = isDark ? '#1e1e1e' : '#eaf4f3';
  const activeBorder = '#009688';

  const [historyOpen, setHistoryOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const savedHistory = useAppSelector(s => s.chat.savedHistory);

  const handleNavClick = (label: string) => {
    if (label === 'Nouvelle discussion') {
      if (selected) {
        dispatch(clearMessages(selected));
        message.success(`Nouvelle discussion démarrée avec ${selected}`);
      }
    } else if (label === 'Historique') {
      setHistoryOpen(true);
    } else if (label === 'Bibliothèque') {
      setLibraryOpen(true);
    }
  };

  const navItems = [
    { icon: <IoIosChatboxes size={14} />, label: 'Nouvelle discussion' },
    { icon: <HistoryOutlined style={{ fontSize: 13 }} />, label: 'Historique' },
    { icon: <TbLibraryPhoto size={14} />, label: 'Bibliothèque' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── Assistants ── */}
      {assistants.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: muted,
            padding: '0 10px', marginBottom: 6,
          }}>
            Assistants
          </p>

          {assistants.map((a, i) => {
            const displayAssistant = getAssistantDisplay(a);
            const isActive = a.name === selected;
            return (
              <div
                key={i}
                className={`assistant-card${isDark ? ' dark' : ''}`}
                onClick={() => dispatch(setSelectedAssistant(a.name))}
                style={{
                  background: isActive ? active : 'transparent',
                  border: `1px solid ${isActive ? activeBorder : 'transparent'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <img
                      src={a.image}
                    alt={displayAssistant.name}
                    style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 500,
                      color: isActive ? '#009688' : text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {displayAssistant.name}
                    </p>
                    <p style={{
                      fontSize: 11, color: muted,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {displayAssistant.role}
                    </p>
                  </div>
                </div>

                {assistants.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      dispatch(removeAssistant(a));
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: 6,
                      border: 'none', background: 'none',
                      cursor: 'pointer', color: muted, flexShrink: 0,
                      opacity: 0, transition: 'opacity 0.15s',
                    }}
                    className="remove-btn"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
                      (e.currentTarget as HTMLElement).style.color = '#ef4444';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'none';
                      (e.currentTarget as HTMLElement).style.color = muted;
                    }}
                  >
                    <RiCloseLine size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Séparateur ── */}
      <div style={{ height: 1, background: border, margin: '0 10px 12px' }} />

      {/* ── Navigation ── */}
      <p style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: muted,
        padding: '0 10px', marginBottom: 6,
      }}>
        Navigation
      </p>

      {navItems.map(({ icon, label }) => (
        <button
          key={label}
          onClick={() => handleNavClick(label)}
          className={`nav-btn${isDark ? ' dark' : ''}`}
          style={{ color: muted }}
          onMouseEnter={e => (e.currentTarget.style.color = text)}
          onMouseLeave={e => (e.currentTarget.style.color = muted)}
        >
          {icon}
          <span style={{ fontSize: 13 }}>{label}</span>
        </button>
      ))}

      {/* ── Drawer Historique ── */}
      <Drawer
        title="Historique des discussions"
        placement="left"
        onClose={() => setHistoryOpen(false)}
        open={historyOpen}
        styles={{ header: { background: isDark ? '#1a1a1a' : '#fff' }, body: { background: isDark ? '#111' : '#fafafa' } }}
      >
        {savedHistory.length === 0 ? (
          <Empty description="Aucun historique pour le moment" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {savedHistory.map(session => (
              <div key={session.id} style={{ 
                padding: 12, background: isDark ? '#1e1e1e' : '#fff', 
                borderRadius: 8, border: `1px solid ${border}` 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: '#009688', fontSize: 13 }}>{session.assistantName}</span>
                  <span style={{ fontSize: 11, color: muted }}>{session.date}</span>
                </div>
                <p style={{ fontSize: 13, color: text, margin: 0, opacity: 0.8 }}>
                  {session.preview}
                </p>
                <div style={{ fontSize: 11, color: muted, marginTop: 8 }}>
                  {session.messages.length} message(s)
                </div>
              </div>
            ))}
            <Button danger onClick={() => dispatch(clearHistory())} style={{ marginTop: 16 }}>
              Effacer tout l'historique
            </Button>
          </div>
        )}
      </Drawer>

      {/* ── Drawer Bibliothèque ── */}
      <Drawer
        title="Bibliothèque des fichiers"
        placement="left"
        onClose={() => setLibraryOpen(false)}
        open={libraryOpen}
        styles={{ header: { background: isDark ? '#1a1a1a' : '#fff' }, body: { background: isDark ? '#111' : '#fafafa' } }}
      >
        <Empty description="Aucun fichier sauvegardé. Vos pièces jointes (fichiers, liens) apparaîtront ici." />
      </Drawer>
    </div>
  );
}
