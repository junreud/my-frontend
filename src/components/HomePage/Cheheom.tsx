export default function Cheheom() {
    return (
        <>
      {/* 4) 블로그 체험단/기자단 */}
      <section className="px-6 py-8 mb-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          블로그 체험단/기자단
        </h2>
        {/* 모바일: 한 줄씩, 데스크톱: 좌 비디오 / 우 목록 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 비디오 자리 */}
          <div className="w-full sm:w-40 h-40 bg-gray-200 flex items-center justify-center">
            비디오
          </div>
          {/* 정보 목록 */}
          <ul className="flex-1 space-y-2 text-sm sm:text-base">
            <li>소비자가 궁금한 정보 해결 V</li>
            <li>블로그 상위노출을 통한 유입 V</li>
            <li>블로그리뷰 접수 V</li>
            <li>건 수 계약 가능!</li>
          </ul>
        </div>
      </section>
    </>

    )
    }