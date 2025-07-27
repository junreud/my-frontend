import React from 'react';
import Image from 'next/image';
import styles from './Mockup.module.css';

interface MockupProps {
    src: string;
    alt?: string;
    className?: string; // 추가적인 Tailwind 클래스
}

const Mockup: React.FC<MockupProps> = ({ src, alt = "", className = "" }) => {
    return (
        <div
            className={`
                shadow-45deg relative mx-auto border-gray-800 dark:border-gray-800
                bg-gray-800 border-[14px] rounded-[2.5rem]
                h-[600px] w-[300px] ${className}
                cursor-pointer
                ${styles.springPhone}
            `}
        >
            {/* 테두리 장식들... */}
            <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

            {/* 실제 화면(스마트폰 안쪽) */}
            <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800 relative">
                <div className="w-full h-full overflow-y-scroll">
                    <Image
                        src={src}
                        alt={alt}
                        layout="responsive"
                        width={272}
                        height={572}
                        className="block w-full h-auto"
                    />

                    {/* 하단 중앙의 움직이는 화살표 */}
                    <div className="absolute bottom-6 w-full flex justify-center">
                        <a className="text-gray-500 animate-bounce">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 z-[1000]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={4}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mockup;