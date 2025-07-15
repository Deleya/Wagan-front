import { useState } from 'react';
import wagan from '../../assets/image/wagan.png';
import profil_img from '../../assets/image/profil-img.png';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';

import { sendMessageToBot } from '../../page/chat/chatSlice.tsx';
import { AiOutlineSend } from 'react-icons/ai';
import { FaPlus } from "react-icons/fa6";
import ousmaneImg from '../../assets/image/ousaman.png';
import kalikaImg from '../../assets/image/kalika.png';
import ChatHistory from './ChatHistory.tsx';
import ChatNavbar from './ChatNavbar.tsx';
import MarkdownMessage from './MarkdownMessage'
import AddAssistantModal from './AddAssistantModal.tsx';

import { BouncyArc } from 'ldrs/react'
import 'ldrs/react/BouncyArc.css'

const assistantsDisponibles = [
    {
        name: 'Ousmane',
        role: 'Data et AI Coach',
        image: ousmaneImg,
    },
    {
        name: 'Kalika',
        role: 'Bug Finder',
        image: kalikaImg,
    },

];
function ChatComponent() {
    const [input, setInput] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    // Utilisation des hooks personnalisés pour le dispatch et le sélecteur
    const dispatch = useAppDispatch();
    const isDark = useAppSelector((state) => state.theme.darkMode)
    const assistantsActifs = useAppSelector((state) => state.assistant.assistants);
    const allAdded = assistantsActifs.length >= assistantsDisponibles.length;
    const { messages, status } = useAppSelector((state) => state.chat);
    const handleSend = () => {
        if (input.trim()) {
            dispatch(sendMessageToBot(input));
            setInput('');
        }
    };

    return (
        <>
            <div className={` min-h-screen flex transition-all duration-300 font-sans`} style={{ backgroundColor: isDark ? ' #1e1e1e' : ' #fff', }}>

                {/* Sidebar fixée */}
                <aside
                    className={` flex flex-col p-2 md:p-4 fixed h-full top-0 transition-all duration-300 
                ${isSidebarOpen ? 'left-0 pointer-events-auto' : '-left-full '} md:left-0 w-64 z-40`}
                    style={{ backgroundColor: isDark ? ' #141414' : '#f3f3f3', color: isDark ? '#fff' : '#000', }}
                >
                    <div className="flex md:flex-row items-center gap-25 mb-5">
                        <div className="flex items-center gap-2 md:gap-4 ">
                            <img src={wagan} className="w-10 h-10 md:w-10 md:h-11 rounded-full" alt="Wagan Logo" />
                            <h3 className="text-lg font-bold text-[#009688] font-inter">WA<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009688] via-[#FF9800BF] to-[#F44336]">GAN</span></h3>
                        </div>
                        {/* bouton croix */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="  p-1 cursor-pointer"
                            >
                                ✖
                            </button>
                        </div>
                    </div>
                    <div>
                        <p
                            onClick={() => {
                                if (!allAdded) setModalOpen(true);
                            }}
                            className={`text-md cursor-pointer transition 
                            ${allAdded ? 'text-gray-400 cursor-not-allowed' : ''}
                            `}
                        >
                            <span className="mr-1 text-lg">+</span>
                            Ajouter un nouvel assistant
                        </p>



                    </div>
                    <ChatHistory />
                </aside>

                {/* Bouton toggle pour mobile */}
                <button
                    className={`absolute top-3 left-4 z-50 md:hidden text-gray-800 bg-white p-2 rounded-full shadow transition duration-300 cursor-pointer
                  ${isSidebarOpen ? 'hidden' : 'block'}`}
                    onClick={() => setSidebarOpen(true)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isSidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>


                {/* Main Chat Area avec un padding à gauche pour la sidebar */}
                <main className="flex-1 flex flex-col items-center ml-0 md:ml-64 transition-all duration-300 pb-1">

                    {/* Navbar */}
                    <ChatNavbar />
                    <div className="w-full max-w-4xl mt-4">
                        {messages.length === 0 && (
                            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4" style={{ color: isDark ? '#fff' : '#4d4c4c', }}>
                                Comment puis-je t’assister ?
                            </h1>
                        )}

                        <div className="rounded-lg p-4 max-h-[70vh] overflow-y-auto space-y-4 scrollbar-hide">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
                                >
                                    {msg.role !== 'user' && (
                                        <img src={wagan} className="w-7 h-7 rounded-full" alt="Wagan Logo" />
                                    )}

                                    <div
                                        style={{
                                            maxWidth: '60%',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            backgroundColor: msg.role === 'user'
                                                ? (isDark ? '#1e3a8a' : '#bfdbfe')
                                                : (isDark ? 'transparent' : 'transparent'),
                                            color: msg.role === 'user'
                                                ? (isDark ? '#fff' : '#000')
                                                : (isDark ? '#fff' : '#000'),
                                            textAlign: msg.role === 'user' ? 'right' : 'left',
                                        }}
                                    >
                                        <MarkdownMessage content={msg.text} />
                                    </div>

                                    {msg.role === 'user' && (
                                        <img src={profil_img} className="w-7 h-7 rounded-full" alt="User profile" />
                                    )}
                                </div>
                            ))}

                            {status === 'loading' && (
                                <div className="text-center text-gray-400">
                                    <BouncyArc
                                        size="70"
                                        speed="1.65"
                                        color="black"
                                    /></div>
                            )}
                        </div>
                        <div className="flex justify-center mt-10 px-4">
                            <div
                                className=" items-center w-full max-w-3xl px-4 py-2 rounded-2xl"
                                style={{
                                    backgroundColor: isDark ? '#2a2a2a' : '#f3f3f3',
                                    color: isDark ? '#fff' : '#000',
                                }}
                            >

                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Démarrez une conversation..."
                                    className={`w-full border-0 rounded-[20px]  px-4 py-2 focus:outline-none resize-none 
                                    } ${input.trim() === '' ? 'h-[9vh]' : 'h-[11vh]'}`}

                                    rows={1}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <div className='flex items-center justify-between'>
                                    <button
                                        className=" cursor-pointer "
                                        style={{ color: isDark ? '#fff' : '#000', marginRight: '10px' }}
                                    >
                                        <FaPlus size={20} />
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={input.trim() === ''}
                                        className={`p-2 rounded-full transition duration-100  ${input.trim() === ''
                                            ? 'text-gray-400 bg-gray-200'
                                            : 'text-white bg-[#009688] cursor-pointer'
                                            }`}
                                    >
                                        <AiOutlineSend size={20} />
                                    </button>

                                </div>
                            </div>

                        </div>
                    </div>
                </main>
                <AddAssistantModal
                    isOpen={isModalOpen} onClose={() =>
                        setModalOpen(false)}
                    assistantsDisponibles={assistantsDisponibles}
                />
            </div>

        </>
    );
}

export default ChatComponent;