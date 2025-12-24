import React from 'react';

const ArticleItem = ({ title, image }) => {
    return (
        <article className="flex items-start gap-3 pb-4 group">
            {image && (
                <div className="relative overflow-hidden rounded flex-shrink-0 w-28 h-20 bg-gray-100">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 leading-tight group-hover:text-red-600 transition cursor-pointer line-clamp-2">
                    {title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">1 giờ trước</p>
            </div>
        </article>
    );
};

export default ArticleItem;