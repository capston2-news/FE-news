import React from "react";

function NoInformation() {
    return (
        <>
            <div className="flex flex-col items-center justify-center text-center py-12 md:py-16 px-6">
                {/* Thay thế div này bằng thẻ img của bạn nếu có ảnh cụ thể */}
                <div className="p-3 bg-slate-100 rounded-full mb-5 shadow-sm flex justify-center">
                    <img
                        src="https://ik.imagekit.io/tvlk/image/imageResource/2017/11/06/1509969696508-63e4a83e52864cf123f6cc7a9ee356fd.png?tr=dpr-2,q-75,w-90"
                        alt=""/>
                    <div><h2 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy giao dịch</h2>
                        <p className="text-gray-500 leading-relaxed max-w-md">
                            Không tìm thấy giao dịch nào phù hợp với lựa chọn của bạn. Vui lòng thử lại với bộ lọc khác
                            hoặc
                            đặt lại bộ lọc.
                        </p></div>
                </div>
            </div>
        </>
    )
}

export default NoInformation;