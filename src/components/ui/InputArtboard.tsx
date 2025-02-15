// components/InputArtboard.jsx
import React from "react";

const InputArtboard = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      {/* 배경 이미지 오버레이 */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage: "url('https://example.com/your-image.jpg')", // 원하는 이미지 URL로 변경하세요.
        }}
      ></div>
      {/* 실제 콘텐츠 영역 (회색 카드) */}
      <div className="relative bg-gray-200 p-6 rounded-xl shadow-lg w-fit h-fit">
        <div className="p-4 space-y-4">
          <label className="input input-bordered flex items-center gap-2">
            이름
            <input type="text" className="grow" placeholder="Daisy" />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            Email
            <input type="text" className="grow" placeholder="daisy@site.com" />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <input type="text" className="grow" placeholder="Search" />
            <kbd className="kbd kbd-sm">⌘</kbd>
            <kbd className="kbd kbd-sm">K</kbd>
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <input type="text" className="grow" placeholder="Search" />
            <span className="badge badge-info">선택사항</span>
          </label>
          <div className="flex justify-center">
            <button className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg py-1">
              Responsive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArtboard;
