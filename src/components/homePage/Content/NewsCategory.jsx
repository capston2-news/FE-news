import React from 'react';
import ArticleItem from "./ArticleItem.jsx";
import AdBank from "./AdBank.jsx";
import ScheduleFootball from "./ScheduleFootball.jsx";

const adComponents = {
    AdBank: <AdBank />,
    ScheduleFootball: <ScheduleFootball />
};

const NewsCategory = ({ title, categories, mainArticle, bulletPoints, adComponent }) => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
            {/* Header */}
            <div className="border-b-4 border-red-600 p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 6).map((cat, index) => (
                        <a 
                            key={index}
                            href="#" 
                            className="text-sm text-gray-600 hover:text-red-600 transition font-medium"
                        >
                            {cat}
                            {index < 5 && <span className="mx-2 text-gray-300">|</span>}
                        </a>
                    ))}
                </div>
            </div>

            {/* Main Article */}
            <div className="p-4 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <img
                            src={mainArticle.image}
                            alt={mainArticle.headline}
                            className="w-full h-64 object-cover rounded"
                        />
                    </div>
                    <div className="md:col-span-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-3 hover:text-red-600 cursor-pointer transition">
                                {mainArticle.headline}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                {mainArticle.summary}
                            </p>
                        </div>
                        <span className="text-xs text-gray-500">2 phút trước</span>
                    </div>
                </div>
            </div>

            {/* Sub Article */}
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-base text-gray-900 leading-tight mb-2 hover:text-red-600 cursor-pointer transition">
                    {mainArticle.subHeadline}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {mainArticle.subSummary}
                </p>
                <p className="text-xs text-gray-500 mt-2">1 giờ trước</p>
            </div>

            {/* Bullet Points */}
            <div className="p-4 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bulletPoints.map((point, index) => (
                        <a 
                            key={index}
                            href="#" 
                            className="text-sm text-gray-700 hover:text-red-600 transition leading-relaxed"
                        >
                            • {point}
                        </a>
                    ))}
                </div>
            </div>

            {/* Ad Component */}
            {adComponent && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    {adComponents[adComponent]}
                </div>
            )}
        </div>
    );
};

export default NewsCategory;