import wagan from '../../assets/image/wagan.png';
import { Switch, Space } from 'antd';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks';
import { toggleDarkMode } from '../../page/chat/darkModeSlice';

export default function Header() {
  const isDark = useAppSelector((state) => state.theme.darkMode);
  const dispatch = useAppDispatch();

  return (
    <header className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2 md:gap-4 ">
            <img src={wagan} className="w-10 h-10 md:w-10 md:h-11 rounded-full" alt="Wagan Logo"/>
            <h3 className="text-lg font-bold text-[#009688] font-inter">WA<span
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#009688] via-[#FF9800BF] to-[#F44336]">GAN</span>
            </h3>
        </div>
        <div className="flex items-center gap-2">
            <Space direction="vertical">
                <Switch
                    checkedChildren={<Sun className=" text-[#FF9800] text-center mt-[2px]" size={18}/>}
                    unCheckedChildren={<Moon className="text-[#009988]" size={18}/>}
                    defaultChecked={isDark}
                    onChange={() => dispatch(toggleDarkMode())}
              />
          </Space>
      </div>
    </header>
  );
}