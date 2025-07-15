// component/chat/AssistantListModal.tsx
import type { FC } from 'react';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { addAssistant } from '../../page/chat/assistantSlice.ts';




interface Props {
  isOpen: boolean;
  onClose: () => void;
  assistantsDisponibles: { name: string; role: string; image: string }[];
}



const AssistantListModal: FC<Props> = ({ isOpen, onClose, assistantsDisponibles })=> {
  const dispatch = useAppDispatch();
  const assistants = useAppSelector((state) => state.assistant.assistants);
  const isDark = useAppSelector((state) => state.theme.darkMode)
  if (!isOpen) return null;

  const handleAdd = (assistant: any) => {
    const exists = assistants.find((a) => a.name === assistant.name && a.role === assistant.role);
    if (!exists) {
      dispatch(addAssistant(assistant));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className=" relative p-2 rounded-xl w-full max-w-md text-center"  style={{ backgroundColor: isDark ? ' #f3f3f3' : ' #141414', color: isDark ? '#000' : ' #fff', }}>
        <div className="grid grid-cols-2 gap-4">
          {assistantsDisponibles.map((assistant, index) => (
            <div
              key={index}
              onClick={() => handleAdd(assistant)}
              className="cursor-pointer px-4 py-3  rounded "
            >
              <img src={assistant.image} alt={assistant.name} className="w-48 h-48 mx-auto rounded-md mb-2" />
              <p className="font-bold ">{assistant.name}</p>
              <p className="text-sm ">{assistant.role}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="absolute top-0 right-0  px-2  cursor-pointer mr-1 mt-1 bg-red-500 text-white rounded"
        >
         X
        </button>
      </div>
    </div>
  );
};

export default AssistantListModal;
