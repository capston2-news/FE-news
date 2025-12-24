import React from 'react';

const ArticleCard = ({ image, title, description }) => {
    const [a, setA] = useState();
    return (
        <div className="flex items-start space-x-4 py-4">
            <img
                src={image}
                alt={title}
                className="w-44 h-28 object-cover"
            />
            <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{title}</h4>
                {description && (
                    <p className="text-gray-600">{description}</p>
                )}
            </div>
        </div>
    );
};

export default ArticleCard;
