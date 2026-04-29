import type { FC } from 'react';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { addAssistant } from '../../page/chat/assistantSlice.ts';
import { RiCloseLine } from 'react-icons/ri';

interface Assistant { name: string; role: string; image: string; }
interface Props {
  isOpen: boolean;
  onClose: () => void;
  assistantsDisponibles: Assistant[];
}

const AddAssistantModal: FC<Props> = ({ isOpen, onClose, assistantsDisponibles }) => {
  const dispatch   = useAppDispatch();
  const assistants = useAppSelector(s => s.assistant.assistants);
  const isDark     = useAppSelector(s => s.theme.darkMode);

  if (!isOpen) return null;

  const bg     = isDark ? '#161616' : '#ffffff';
  const border = isDark ? '#222'    : '#ebebeb';
  const text   = isDark ? '#ececec' : '#111';
  const muted  = isDark ? '#666'    : '#999';
  const cardHover = isDark ? '#1e1e1e' : '#f7f7f7';

  const handleAdd = (a: Assistant) => {
    if (!assistants.find(x => x.name === a.name)) dispatch(addAssistant(a));
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 360,
          background: bg, border: `1px solid ${border}`,
          borderRadius: 18, padding: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: text, marginBottom: 4 }}>
              Choisir un assistant
            </h3>
            <p style={{ fontSize: 12, color: muted }}>
              Sélectionne l'assistant à ajouter à ta session
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 8,
              border: 'none', cursor: 'pointer',
              background: isDark ? '#222' : '#f0f0f0',
              color: muted, flexShrink: 0,
            }}
          >
            <RiCloseLine size={15} />
          </button>
        </div>

        {/* Liste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {assistantsDisponibles.map((a, i) => {
            const alreadyAdded = !!assistants.find(x => x.name === a.name);
            return (
              <button
                key={i}
                onClick={() => !alreadyAdded && handleAdd(a)}
                disabled={alreadyAdded}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: 'transparent',
                  cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                  opacity: alreadyAdded ? 0.45 : 1,
                  textAlign: 'left',
                  transition: 'background 0.12s',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  if (!alreadyAdded) (e.currentTarget as HTMLElement).style.background = cardHover;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <img
                  src={a.image} alt={a.name}
                  style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: text }}>{a.name}</p>
                  <p style={{ fontSize: 11, color: muted }}>{a.role}</p>
                </div>
                {alreadyAdded && (
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(0,150,136,0.12)', color: '#009688',
                    flexShrink: 0,
                  }}>
                    Actif
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AddAssistantModal;
