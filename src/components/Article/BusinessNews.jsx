import React from 'react';

const BusinessNews = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Kinh doanh</h2>
            <div className="flex items-center space-x-4">
                <img src="https://via.placeholder.com/150" alt="Gold bars" className="w-28 h-20 object-cover rounded-md" />
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 leading-tight">Vàng miếng gần 144 triệu đồng một lượng</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Các thương hiệu bán ra vàng miếng tại 143.8 triệu đồng một lượng,tăng 800.000 đồng so với cuối tuần trước và cùng chiều đi lên với giá thế giới.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                        29 trước | Kinh doanh
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessNews;