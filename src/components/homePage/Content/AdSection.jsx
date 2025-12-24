import React from 'react';

const AdSection = () => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
            {/* Use public asset by URL to avoid importing from /public */}
            <img
                src="/banner.png"
                alt="Quảng cáo"
                className="w-full h-auto object-cover"
            />
        </div>
    );
};

export default AdSection;