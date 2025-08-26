import { useState } from 'react'; // 🔴 à ajouter
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { removeAssistant } from '../../page/chat/assistantSlice.ts';
import { IoIosChatboxes } from "react-icons/io";
import { TbLibraryPhoto } from "react-icons/tb";
import { HistoryOutlined, CloseOutlined } from '@ant-design/icons';

function ChatHistory() {
    const isDark = useAppSelector((state) => state.theme.darkMode);
    const assistants = useAppSelector((state) => state.assistant.assistants);
    const dispatch = useAppDispatch();

    const [selectedAssistant, setSelectedAssistant] = useState<string | null>(
        assistants.length > 0 ? assistants[0].name : null
    );

    const handleSelect = (name: string) => {
        setSelectedAssistant(name);
        // Ici, vous pouvez ajouter une logique pour charger l'historique de chat de l'assistant sélectionné
        // Par exemple, en dispatchant une action ou en naviguant vers une page de chat
    };

    return (
        <div className="flex-1 overflow-y-auto space-y-2 mt-5">
            {assistants.map((a, index) => (
                <div
                    key={index}
                    onClick={() => handleSelect(a.name)} 
                    className="flex justify-between items-center space-x-2 p-3 rounded-lg cursor-pointer"
                    style={{
                        border: a.name === selectedAssistant
                            ? `2px solid #009688` 
                            : isDark
                            ? '1px solid #333'
                            : '1px solid #ccc',
                        backgroundColor: a.name === selectedAssistant
                            ? (isDark ? '#222' : '#f0f0f0') 
                            : 'transparent',
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <img src={a.image} className="w-10 h-10 rounded-lg" />
                        <div>
                            <p className="font-bold">{a.name}</p>
                            <p className="text-sm" style={{ color: isDark ? '#FFFFFF' : '#000000' }}>{a.role}</p>
                        </div>
                    </div>

                    {assistants.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // empêche le clic de sélectionner l’assistant
                                dispatch(removeAssistant(a));
                                if (a.name === selectedAssistant) {
                                    // si on supprime l’assistant actif, on sélectionne un autre
                                    const remaining = assistants.filter(as => as.name !== a.name);
                                    setSelectedAssistant(remaining[0]?.name || null);
                                }
                            }}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                            <CloseOutlined />
                        </button>
                    )}
                </div>
            ))}

            <div className="space-y-4 mt-7">
                <button className="flex items-center gap-2 text-sm cursor-pointer">
                    <IoIosChatboxes /> Nouvelle discussion
                </button>
                <button className="flex items-center gap-2 text-sm cursor-pointer">
                    <HistoryOutlined /> Historique
                </button>
                <button className="flex items-center gap-2 text-sm cursor-pointer">
                    <TbLibraryPhoto /> Bibliothèque
                </button>
            </div>
        </div>
    );
}

export default ChatHistory;
