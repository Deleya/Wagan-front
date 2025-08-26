import type { FC } from 'react';
import { useAppSelector } from '../../page/hooks/hooks';
interface Props {
  name: string;
  role: string;
  image: string;
  description: string;
  onClick?: () => void; // 👈 Ajouter cette ligne
}
const AssistantCard: FC<Props> = ({ name, role, image, description, onClick }) => {

  const isDark = useAppSelector((state) => state.theme.darkMode);

  return (
      <div className="relative md:w-[16%] w-[25%] h-32  flex flex-col items-center justify-between p-4 transition-transform duration-300 ">
        <div
            onClick={onClick}
            className="rounded-lg bg-black/40  cursor-pointer hover:scale-105 transition-transform group"
        >
          <img src={image} className="w-45 h-48 object-cover opacity-80 " alt={name} />
          <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <p className="text-white text-sm text-center">{description}</p>
          </div>

        </div>
        <div className="mt-2 text-center" color={isDark ? '#fff' : '#1e1e1e'}>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-xs">{role}</p>
        </div>
      </div>
  );
}

export default AssistantCard;