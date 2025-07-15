import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';
import { removeAssistant } from '../../page/chat/assistantSlice.ts';
import { IoIosChatboxes } from "react-icons/io";
import { TbLibraryPhoto } from "react-icons/tb";
import { HistoryOutlined, CloseOutlined } from '@ant-design/icons';

function ChatHistory() {
    const isDark = useAppSelector((state) => state.theme.darkMode);
    const assistants = useAppSelector((state) => state.assistant.assistants);
    const dispatch = useAppDispatch();

    return (
        <div className="flex-1 overflow-y-auto space-y-2 mt-5">
            {assistants.map((a, index) => (
                <div
                    key={index}
                    className="flex justify-between items-center space-x-2 p-3 rounded-lg"
                    style={{
                        border: isDark ? '1px solid #fff' : '1px solid #000',
                        
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <img src={a.image} className="w-10 h-10 rounded-lg" />
                        <div>
                            <p className="font-bold">{a.name}</p>
                            <p className="text-sm" style={{ color: isDark ? '#FFFFFF' : '#000000' }}>{a.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => dispatch(removeAssistant(a))}
                        className="text-white   cursor-pointer font-bold text-[10px] bg-[#F44336] rounded-full w-4 h-4 flex items-center justify-center"
                    > 
                        <CloseOutlined />
                    </button>
                </div>
            ))}

            <div className="space-y-4 mt-7">
                <button className="flex items-center gap-2 text-sm hover:text-orange-400">
                    <IoIosChatboxes /> Nouvelle discussion
                </button>
                <button className="flex items-center gap-2 text-sm hover:text-orange-400">
                    <HistoryOutlined /> Historique
                </button>
                <button className="flex items-center gap-2 text-sm hover:text-orange-400">
                    <TbLibraryPhoto /> Bibliothèque
                </button>
            </div>
        </div>
    );
}

export default ChatHistory;