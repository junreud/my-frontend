// 예: React/Next.js

interface MockupProps {
    lightSrc: string;  // 밝은 테마에서 쓸 이미지
    darkSrc: string;   // 어두운 테마에서 쓸 이미지
    alt?: string;
    className?: string; // 추가적인 Tailwind 클래스
  }
  
  // Flowbite Mockup 컨테이너
  export default function Mockup({
    lightSrc,
    darkSrc,
    alt = "",
    className = "",
  }: MockupProps) {
    return (
      <div
        className={`relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] ${className}`}
      >
        <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800">
          {/* 라이트 모드용 */}
          <img
            src={lightSrc}
            className="dark:hidden w-[272px] h-[572px]"
            alt={alt}
          />
          {/* 다크 모드용 */}
          <img
            src={darkSrc}
            className="hidden dark:block w-[272px] h-[572px]"
            alt={alt}
          />
        </div>
      </div>
    );
  }
  