import { useNavigate } from "react-router-dom";

const Section = ({ id, title, image, summary }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/article/${id}`);
    };

    return (
        <article className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition shadow-sm group">
            <div className="flex flex-col h-full">
                {/* Image */}
                {image && (
                    <div className="relative overflow-hidden h-48 bg-gray-100">
                        <img
                            onClick={handleClick}
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3
                        onClick={handleClick}
                        className="font-bold text-base text-gray-900 leading-tight mb-2 cursor-pointer
                                   group-hover:text-red-600 transition-colors duration-200 line-clamp-3"
                    >
                        {title}
                    </h3>

                    {summary && (
                        <p
                            onClick={handleClick}
                            className="text-sm text-gray-600 leading-relaxed cursor-pointer flex-grow mb-2 line-clamp-2"
                        >
                            {summary}
                        </p>
                    )}

                    <span className="text-xs text-gray-500">2 phút trước</span>
                </div>
            </div>
        </article>
    );
};

export default Section;
