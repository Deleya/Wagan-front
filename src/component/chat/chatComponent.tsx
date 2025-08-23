import { useState } from 'react';
import wagan from '../../assets/image/wagan.png';
import profil_img from '../../assets/image/profil-img.png';
import { useAppDispatch, useAppSelector } from '../../page/hooks/hooks.tsx';

import { sendMessageToBot } from '../../page/chat/chatSlice.tsx';
import { AiOutlineSend } from 'react-icons/ai';
import ousmaneImg from '../../assets/image/IA_ousmane.png';
import kalikaImg from '../../assets/image/Kalika_Ia.png';
import ChatHistory from './ChatHistory.tsx';
import ChatNavbar from './ChatNavbar.tsx';
import MarkdownMessage from './MarkdownMessage'
import AddAssistantModal from './AddAssistantModal.tsx';
import { useNavigate } from 'react-router-dom';
import { IoLink } from "react-icons/io5";
import { MdOutlineAttachFile } from "react-icons/md";
import { FiCopy, FiEdit } from 'react-icons/fi';
import { IoMdArrowRoundBack } from "react-icons/io";
import { TailChase } from 'ldrs/react'
import 'ldrs/react/TailChase.css'
// Default values shown
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
    const navigate = useNavigate();

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Redirection ou autre action après la connexion
        navigate('/');
    };

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    interface HandleCopyFn {
        (text: string, index: number): void;
    }

    const handleCopy: HandleCopyFn = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
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
                    <button
                        onClick={() => navigate('/')}
                        className="rounded-full text-lg shadow  transition duration-300 cursor-pointer"
                        style={{ color: isDark ? '#FFF' : '#fff', }}
                    >
                        <IoMdArrowRoundBack />
                    </button>
                    <div className="flex md:flex-row items-center gap-25 mb-5">
                        <div className="flex items-center gap-2 md:gap-4 ">
                            <img src={wagan} className="w-12 h-12  rounded-full  p-1 " alt="Wagan Logo" style={{ backgroundColor: isDark ? '  #f3f3f3' : ' #141414', }} />
                            <h3 className="text-lg font-bold text-[#009688] font-inter cursor-pointer" onClick={handleSubmit}>WA<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009688] via-[#FF9800BF] to-[#F44336]">GAN</span></h3>
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



                {/* Main Chat Area avec un padding à gauche pour la sidebar */}
                <main className="flex-1 flex flex-col items-center ml-0 md:ml-64 transition-all duration-300 pb-1">

                    {/* Navbar */}
                    <div className='flex items-center justify-center' style={{ backgroundColor: isDark ? '#141414' : '#fff', padding: '10px', borderBottom: isDark ? '1px solid #383838' : '1px solid #4241414D', width: '100%' }}>
                        <button
                            className={` z-50 md:hidden text-gray-800 bg-white p-2 rounded-full shadow transition duration-300 cursor-pointer
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
                        <ChatNavbar />
                    </div>
                    <div className="w-full max-w-4xl ">
                        {messages.length === 0 && (
                            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4 mt-15 " style={{ color: isDark ? '#fff' : '#4d4c4c', }}>
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
                                            maxWidth: msg.role === 'user' ? "70%" : "85%",
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            marginBottom: msg.role === 'user' ? '1rem' : '1.5rem',
                                            backgroundColor: msg.role === 'user'
                                                ? (isDark ? '#a1d8d2ff' : '#a1d8d2ff')
                                                : 'transparent',
                                            color: msg.role === 'user'
                                                ? '#000'
                                                : (isDark ? '#fff' : '#000'),
                                            border: msg.role === 'user'
                                                ? ''
                                                : '1px solid #4241414D',
                                            position: 'relative',
                                        }}
                                    >
                                        <MarkdownMessage content={msg.text} />

                                        {msg.role === 'user' && (
                                            <div className="flex gap-2 absolute right-2 top-12">
                                                <button
                                                    onClick={() => handleCopy(msg.text, idx)}
                                                    className="text-gray-400 text-lg rounded cursor-pointer"
                                                >
                                                    {copiedIndex === idx ? (
                                                        <p className="bg-gray-300 px-1 py-1 rounded text-sm text-black">
                                                            Copié!
                                                        </p>
                                                    ) : (
                                                        <FiCopy />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === 'user' && (
                                        <img src={profil_img} className="w-7 h-7 rounded-full" alt="User profile" />
                                    )}
                                </div>
                            ))}


                            {status === 'loading' && (
                                <div className="text-center text-gray-400">

                                    <TailChase
                                        size="40"
                                        speed="1.75"
                                        color={isDark ? '#009688' : '#FF9800'}
                                    /></div>
                            )}
                        </div>
                        <div className="w-full px-4  sticky bottom-2">
                            <div
                                className=" items-center w-full max-w-3xl px-4 py-2 rounded-2xl"
                                style={{
                                    backgroundColor: isDark ? '#2a2a2a' : '#f3f3f3',
                                    color: isDark ? '#fff' : '#000',
                                    border: isDark ? '' : '1px solid #4241414D',
                                }}
                            >

                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Démarrez une conversation..."
                                    className={`w-full border-0 rounded-[20px]  px-4 py-2 focus:outline-none resize-none scrollbar-thin
                                    } ${input.trim() === '' ? 'h-[9vh]' : 'h-[12vh]'}`}

                                    rows={1}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <div className='flex items-center justify-between'>
                                    <div className="flex items-center gap-2">
                                        <button

                                            className={`cursor-pointer hover:text-gray-700 transition duration-200`}
                                            style={{ color: isDark ? '#fff' : '#000', }}

                                        >
                                            <IoLink size={20} />
                                        </button>
                                        <button
                                            className=" cursor-pointer hover:text-gray-700 transition duration-200 "
                                            style={{ color: isDark ? '#fff' : '#000', }}
                                        >
                                            <MdOutlineAttachFile size={20} />
                                        </button>

                                    </div>

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
