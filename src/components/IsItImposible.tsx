import PopInComponent from "./animations/PopInComponent"
import Link from "next/link"

export default function IsItImposible() {
    return(
    <>      {/* 3) 내 업체도 될까? / 무료상담 (검은 배경 바) */}
        <section className="bg-gray-100 flex flex-row items-center justify-center gap-36 px-6 py-36 sm:p-8">
            <PopInComponent>
                <div className="font-bold text-base sm:text-lg">
                    내 업체도 될까?
                </div>
            </PopInComponent>
            <Link href="/estimate">
            <PopInComponent>
                <span className="bg-white text-gray-500 px-4 py-2 rounded-md cursor-pointer text-sm sm:text-base border">
                비용 보러가기
                </span>

            </PopInComponent>
            </Link>
        </section>
    </>
    )
}