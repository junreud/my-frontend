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
          {/* 블로그 체험 이미지 */}
          <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center rounded-lg border border-blue-200 overflow-hidden">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-sm text-blue-700 font-medium">블로그 체험</div>
              <div className="text-xs text-blue-600">마케팅</div>
            </div>
          </div>
          {/* 정보 목록 */}
          <ul className="flex-1 space-y-2 text-sm sm:text-base">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              소비자가 궁금한 정보 해결 V
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              블로그 상위노출을 통한 유입 V
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              블로그리뷰 접수 V
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">💡</span>
              <span className="font-semibold text-blue-600">건 수 계약 가능!</span>
            </li>
          </ul>
        </div>
      </section>
    </>

    )
    }