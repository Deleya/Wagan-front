// components/ThemeWrapper.tsx
import { ConfigProvider, theme } from 'antd';
import { useAppSelector } from '../../page/hooks/hooks';

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const isDark = useAppSelector(state => state.theme.darkMode);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeWrapper;
