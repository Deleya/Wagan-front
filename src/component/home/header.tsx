import wagan from '../../assets/image/wagan.png';
import { Switch, Space, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks';
import { toggleDarkMode } from '../../page/chat/darkModeSlice';
import { logout } from '../../page/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

export default function Header() {
  const isDark = useAppSelector((state) => state.theme.darkMode);
  const { isAuthenticated, isAdmin } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      dispatch(logout());
      navigate('/');
    } else if (e.key === 'dashboard') {
      navigate('/admin/dashboard');
    }
  };

  const items: MenuProps['items'] = [
    ...(isAdmin ? [{ key: 'dashboard', label: 'Dashboard Admin' }] : []),
    { key: 'logout', label: 'Se déconnecter', danger: true },
  ];

  return (
    <header className="flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={() => navigate('/')}>
        <img src={wagan} className="w-10 h-10 md:w-10 md:h-11 rounded-full" alt="Wagan Logo" />
        <h3 className="text-lg font-bold text-[#009688] font-inter">WA<span
          className="text-transparent bg-clip-text bg-gradient-to-r from-[#009688] via-[#FF9800BF] to-[#F44336]">GAN</span>
        </h3>
      </div>
      <div className="flex items-center gap-4">
        <Space direction="vertical">
          <Switch
            checkedChildren={<Sun className="text-[#FF9800] mt-[2px]" size={18} />}
            unCheckedChildren={<Moon className="text-[#009988]" size={18} />}
            defaultChecked={isDark}
            onChange={() => dispatch(toggleDarkMode())}
            style={{
              backgroundColor: isDark ? '#f3f3f3' : '#000000', color: isDark ? '#009688' : '#FF9800BF'
            }}
          />
        </Space>

        {isAuthenticated ? (
          <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer text-[#009688] hover:opacity-80 transition bg-white/10 px-3 py-1.5 rounded-full">
              <FaUserCircle size={22} />
              <span className="font-semibold text-sm hidden sm:inline">Mon Compte</span>
            </div>
          </Dropdown>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-[#009688] hover:bg-[#007A6E] transition shadow-md"
          >
            Se connecter
          </button>
        )}
      </div>
    </header>
  );
}