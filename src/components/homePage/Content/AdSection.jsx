import React from 'react';
import img from '../../../../public/banner.png';

const AdSection = ({ loading = false }) => {
    return (
        <div className="space-y-6 mt-5">
            {/* Quảng cáo lớn trên cùng */}
            {loading ? (
                <div className="w-full h-[400px] bg-gray-200 rounded animate-pulse" aria-hidden="true" />
            ) : (
                <img
                    src={img}
                    alt="Quảng cáo"
                    className="w-full h-[400px] object-cover"
                />
            )}

        </div>
    );
};

export default AdSection;