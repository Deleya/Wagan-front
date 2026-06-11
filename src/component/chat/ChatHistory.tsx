import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { removeAssistant } from '../../page/chat/assistantSlice.ts';
import { IoIosChatboxes } from 'react-icons/io';
import { HistoryOutlined } from '@ant-design/icons';
import { TbLibraryPhoto } from 'react-icons/tb';
import { RiCloseLine } from 'react-icons/ri';

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
  const dispatch   = useAppDispatch();

  const [selected, setSelected] = useState<string | null>(assistants[0]?.name ?? null);

  const text   = isDark ? '#ececec' : '#111';
  const muted  = isDark ? '#666'    : '#999';
  const border = isDark ? '#222'    : '#ebebeb';
  const active = isDark ? '#1e1e1e' : '#eaf4f3';
  const activeBorder = '#009688';

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
                onClick={() => setSelected(a.name)}
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
                      if (a.name === selected) {
                        const rest = assistants.filter(x => x.name !== a.name);
                        setSelected(rest[0]?.name ?? null);
                      }
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
          className={`nav-btn${isDark ? ' dark' : ''}`}
          style={{ color: muted }}
          onMouseEnter={e => (e.currentTarget.style.color = text)}
          onMouseLeave={e => (e.currentTarget.style.color = muted)}
        >
          {icon}
          <span style={{ fontSize: 13 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}
