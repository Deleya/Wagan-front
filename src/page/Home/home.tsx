import Header from '../../component/home/header.js';
import Title from '../../component/home/title.js';
import AssistantCard from '../../component/home/AssistantCard.tsx';
import { useNavigate } from 'react-router-dom';
import ousmane from '../../assets/image/IA_ousmane.png';
import kalika from '../../assets/image/Kalika_Ia.png';
import Path4 from '../../assets/image/path4.png';
import Path2 from '../../assets/image/path2.png';
import { useAppDispatch, useAppSelector } from '../hooks/hooks.tsx';
import { addAssistant } from '../chat/assistantSlice.ts';


const Home = () => {
    const navigate = useNavigate();
    const isDark = useAppSelector((state) => state.theme.darkMode);

    const dispatch = useAppDispatch();



    const handleSelectIA = (name: string, role: string, image: string) => {
        dispatch(addAssistant({ name, role, image }));
        navigate('/chat');
    };



    return (
        <div className="relative min-h-screen transition duration-700 font-sans overflow-hidden"
            style={{
                backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3',
                color: isDark ? '#fff' : '#000'
            }}
        >
            <Header />
            <Title />

            {/* Paths décoratifs positionnés */}
            <img
                src={Path4}
                alt="Path4"
                className="absolute w-24 sm:w-30 md:w-40 top-[40%] lg:left-[15%] md:left-[3%] hidden sm:block left-[5%]  z-0"
            />
            <img
                src={Path2}
                alt="Path2"
                className="absolute w-24 sm:w-35 md:w-48 top-[65%] right-[15%] lg:right-[15%] md:right-[10%] sm:right-[2%] hidden sm:block z-0"
            />


            {/* Assistants */}
            <div className="relative flex justify-center flex-wrap gap-10 mt-10 z-10">
                <AssistantCard
                    name="Ousmane"
                    role="Data et AI Coach"
                    image={ousmane}
                    description="Le Data & AI Coach t'aide à mieux comprendre les données et à exploiter l'IA efficacement."
                    onClick={() => handleSelectIA("Ousmane", "Data et AI Coach", ousmane)}
                />
                <AssistantCard
                    name="Kalika"
                    role="Bug Finder"
                    image={kalika}
                    description="Le Bug Finder t'aide à corriger et comprendre les erreurs dans ton code."
                    onClick={() => handleSelectIA("Kalika", "Bug Finder", kalika)}
                />
            </div>
        </div>
    );
};

export default Home;
