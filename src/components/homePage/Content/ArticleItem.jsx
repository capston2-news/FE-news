import React from 'react';

const ArticleItem = ({ title, image, excerpt, tag, href }) => {
  return (
    <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition" role="article">
      {image ? (
        <div className="w-full h-44 bg-gray-100 overflow-hidden">
          <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.style.display='none'}} />
        </div>
      ) : (
        <div className="w-full h-44 bg-gray-200 animate-pulse rounded" aria-hidden="true" />
      )}
      <div className="p-4">
        {tag && <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">{tag}</span>}
        <h3 className="mt-2 font-semibold text-gray-900 text-lg leading-tight">
          {href ? (
            <a href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{title}</a>
          ) : (
            title
          )}
        </h3>
        {excerpt && <p className="mt-2 text-sm text-gray-600">{excerpt}</p>}
      </div>
    </article>
  );
};

export default ArticleItem;