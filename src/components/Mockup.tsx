// 예: React/Next.js 컴포넌트

interface MockupProps {
    lightSrc: string;  // 밝은 테마에서 쓸 이미지
    darkSrc: string;   // 어두운 테마에서 쓸 이미지
    Src: string;
    alt?: string;
    className?: string; // 추가적인 Tailwind 클래스
  }
  
  // Flowbite Mockup 컨테이너
  export default function Mockup({
    lightSrc,
    darkSrc,
    Src,
    alt = "",
    className = "",
  }: MockupProps) {
    return (
    <div
        className={`
          shadow-45deg relative mx-auto border-gray-800 dark:border-gray-800
          bg-gray-800 border-[14px] rounded-[2.5rem]
          h-[600px] w-[300px] ${className}
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
            {/* 원본 이미지만 보여주는 예 (light/dark 분기 사용 시 아래 예시처럼 교체) */}
                <img
                    src={Src}
                    alt={alt}
                    // ▽ 핵심: object-none + object-top + absolute + max-w-none (이미지 하단만 잘림)
                    // className="absolute top-0 left-0 w-full h-auto"
                    // 이미지가 전혀 잘리지 않고 스크롤로 볼 수 있음. width 만 맞추고 스크롤로 전환시켜버림
                    className="block w-full h-auto"
                />
        
                {/* 아래처럼 라이트/다크 모드를 분리해서 쓰고 싶다면
                <img
                    src={lightSrc}
                    alt={alt}
                    className="dark:hidden absolute top-0 left-0 object-none object-top max-w-none"
                />
        
                <img
                    src={darkSrc}
                    alt={alt}
                    className="hidden dark:block absolute top-0 left-0 object-none object-top max-w-none"
                />
                */}
                {/* 하단 중앙의 움직이는 화살표 */}
                <div className="absolute bottom-6 w-full flex justify-center">
                    {/* 필요하다면 다른 섹션(#next-section)으로 스크롤 이동할 수 있게 a/link 처리 */}
                    <a

                    className="text-gray-500 animate-bounce"
                    >
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
  }
  