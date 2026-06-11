import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { toggleDarkMode } from '../../page/chat/darkModeSlice.ts';
import logo_bakeli from '../../assets/image/logo-bakeli.png';
import profil_img  from '../../assets/image/profil-img.png';
import { Moon, Sun } from 'lucide-react';

export default function ChatNavbar() {
  const isDark   = useAppSelector(s => s.theme.darkMode);
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const border = isDark ? '#222' : '#ebebeb';
  const bg     = isDark ? '#1a1a1a' : '#f0f0f0';
  const text   = isDark ? '#ccc' : '#555';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

      {/* Logo Bakeli */}
      <img src={logo_bakeli} alt="Bakeli" style={{ height: 32, width: 'auto', opacity: 0.85 }} />

      {/* Séparateur */}
      <div style={{ width: 1, height: 20, background: border }} />

      {/* Toggle dark/light */}
      <button
        className="theme-toggle"
        onClick={() => dispatch(toggleDarkMode())}
        style={{ background: bg, color: text, border: `1px solid ${border}` }}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark
          ? <Sun  size={13} style={{ color: '#FF9800' }} />
          : <Moon size={13} style={{ color: '#009688' }} />
        }
        <span style={{ fontSize: 12 }}>{isDark ? 'Clair' : 'Sombre'}</span>
      </button>

      {/* Séparateur */}
      <div style={{ width: 1, height: 20, background: border }} />

      {/* Avatar */}
      <img
        src={profil_img}
        alt="Profil"
        style={{
          width: 32, height: 32, borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${border}`,
        }}
      />
    </div>
  );
}
