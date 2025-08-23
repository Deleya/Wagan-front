import logo_bakeli from '../../assets/image/logo-bakeli.png';
import profil_img from '../../assets/image/profil-img.png';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { toggleDarkMode } from '../../page/chat/darkModeSlice.ts';
import { Switch, Space } from 'antd';
import { Moon, Sun } from 'lucide-react';
function ChatNavbar() {
    const isDark = useAppSelector(state => state.theme.darkMode);
    const dispatch = useAppDispatch();

    // Applique la classe dark sur <html> quand isDark change
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        // <nav className="w-full h-14 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between z-30 bg-white dark:bg-gray-800">
        <nav style={{ width: '100%' }} className="flex sticky top-0 items-center justify-between z-30">
            <div className="flex items-center h-full px-4  ">
                <img src={logo_bakeli} className="w-13 h-13 " alt="logo bakeli" />
            </div>
            <div className='flex items-center justify-center h-full text-lg font-bold' style={{ color: isDark ? '#fff' : '#000' }}>
                <div className=" flex items-center justify-center h-full">
                    <Space direction="vertical">
                        <Switch
            checkedChildren={<Sun className="text-[#FF9800] mt-[2px]" size={18} />}
            unCheckedChildren={<Moon className="text-[#009988]" size={18} />}
            defaultChecked={isDark}
            onChange={() => dispatch(toggleDarkMode())}
            style={{
              backgroundColor: isDark ? '#FFFFFF' : '#000000', color: isDark ? '#009688' : '#FF9800BF'
            }}
          />
                    </Space>
                </div>

                <div className="flex items-center h-full px-4 justify-end">
                    <img src={profil_img} className="w-12 h-12 rounded-full bg-gray-300 p-1" alt="Profil" />
                </div>
            </div>
        </nav>
    );
}

export default ChatNavbar;