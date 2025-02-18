export default function HomepageSection() {
    return (
      <section className="bg-gray-50 py-12">
        {/* 배경색, 상하 패딩 */}
        <div className="max-w-5xl mx-auto px-4 text-center py-10">
          {/* 가운데 정렬, 최대 폭 설정 */}
          <h2 className="text-4xl text-gray-700 font-semibold">
            돈만 나가는 광고는 그만!<br/>
            {/* <p className="text-sm"><br/></p> */}
            이제 돈 벌어주는 마케팅을 시작하세요.
          </h2>
          <p className="text-lg text-gray-600 mt-4">
            소상공인 맞춤 마케팅서비스 - 효과는 극대화, 비용은 최적화
          </p>
        </div>
      </section>
    );
  }
  