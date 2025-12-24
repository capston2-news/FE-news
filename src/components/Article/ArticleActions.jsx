import React from 'react';

const ArticleActions = () => {
    const [a, setA] = useState();
    return (
        <div className="flex justify-between items-center my-6">
            {/* Left side: Back and Save buttons */}
            <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <button className="flex items-center space-x-2 p-2 px-3 rounded-full border border-gray-300 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">Lưu</span>
                </button>
            </div>

            {/* Right side: Share buttons */}
            <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
                        <path d="M18.375 2.25c-1.031 0-1.921.68-2.228 1.603l-4.225 1.517a.625.625 0 00-.374 0L7.853 3.853A2.25 2.25 0 005.625 2.25h-.146c-1.026 0-1.906.678-2.224 1.602l-.32 1.01a.75.75 0 00-.71.51l-1.97 7.371a.75.75 0 00.108.643l.427.75c.677 1.208 1.986 1.933 3.398 1.933h.146c.866 0 1.68-.31 2.302-.863l.666-.622a.75.75 0 011.154 0l.666.622a2.25 2.25 0 002.302.863h.146c1.412 0 2.72-.725 3.398-1.933l.427-.75a.75.75 0 00.108-.643l-1.97-7.371a.75.75 0 00-.71-.51l-.32-1.01A2.25 2.25 0 0018.529 2.25h-.154z" />
                    </svg>
                </button>
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5V6.75m18 0H4.5m18 0a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6.75m18 0V4.5A2.25 2.25 0 0019.5 2.25h-15A2.25 2.25 0 002.25 4.5v2.25m18 0L12 12m0 0l-9.75-5.25" />
                    </svg>
                </button>
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.244 4.243a4.5 4.5 0 01-6.364-6.364l1.432-1.432m2.828-2.828l4.244-4.243a4.5 4.5 0 016.364 6.364l-1.432 1.432m-6.364 1.432l-1.432-1.432" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ArticleActions;