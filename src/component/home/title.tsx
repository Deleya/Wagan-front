import {  useAppSelector } from '../../page/hooks/hooks.tsx';
import ImageBienvenu from '../../assets/image/image-bienvenu.png';
import Path3 from '../../assets/image/Path3.png';
export default function Title() {
    const isDark = useAppSelector((state) => state.theme.darkMode)
    return (
        <div className="text-center  ">
            <div className="relative flex justify-center items-center mb-5">
                <h2 className="text-5xl font-bold mt-20 " style={{color: isDark ? '#fff': '#1e1e1e'}}>Bienvenue</h2>
                <img
                    src={ImageBienvenu}
                    alt="Bienvenue"
                    className="w-26 h-37 ml-3"
                />
                <img
                    src={Path3}
                    alt="Bienvenue"
                    className="absolute right-[64%] xl:right-[34%] lg:right-[29%] md:right-[23%] hidden md:block bottom-[72%] w-16 h-24 "
                />
            </div>
            <p className="md:text-4xl sm:text-3xl text-2xl flex flex-wrap font-bold text-center text-[#009688] justify-center items-center gap-2 ">Choisissez
                votre
                <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#009688]  to-[#FF9800BF]">IA </span>

                <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800BF] via-[#FF9800BF] to-[#F44336]"> compagnon </span>
            </p>
        </div>
    );
}