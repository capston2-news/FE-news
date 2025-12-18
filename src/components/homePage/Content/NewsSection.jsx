import React, { useEffect, useState } from 'react';

const NewsSection = ({ articles = [] }) => {

  // hero: first article
  const hero = articles[0];
  const featured = articles.slice(1, 4); // three cards

  return (
    <div className="space-y-6">
      {/* Hero */}
      {hero && (
          <section role="region" aria-labelledby="hero-heading" className="relative bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="w-full h-[320px] sm:h-[360px] md:h-[420px] relative">
              <div className="absolute inset-0 bg-gray-100" aria-hidden="true" />
              <img
                src={hero.images}
                alt={hero.title}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-6 left-4 right-4 text-white">
                <div className="inline-block bg-white/10 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">Tin nổi bật</div>
                <h2 id="hero-heading" className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow">{hero.title}</h2>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/95">{hero.content?.slice(0, 180) || hero.summary || ''}</p>
                <div className="mt-4">
                  <button aria-label={`Đọc tiếp: ${hero.title}`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Đọc tiếp</button>
                </div>
              </div>
            </div>
          </section>
        )}
      {/* Featured grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featured.map((art, idx) => (
          <article key={idx} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition" role="article" aria-label={art.title} tabIndex={0}>
            {art.images ? (
              <div className="w-full h-40 bg-gray-100 overflow-hidden">
                <img src={art.images} alt={art.title} loading="lazy" className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.style.display='none'}} />
              </div>
            ) : (
              <div className="w-full h-40 bg-gray-200 animate-pulse rounded" aria-hidden="true" />
            )}
            <div className="p-4">
              <div className="text-sm text-gray-500">{art.category || 'Tin'}</div>
              <h3 className="mt-2 font-semibold text-gray-900 text-lg group-hover:text-blue-600">{art.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{art.content?.slice(0, 120) || ''}</p>
              <div className="mt-3">
                <a href={`#`} className="text-blue-600 font-semibold inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded">Đọc thêm →</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <hr className="w-full h-px my-4 bg-gray-200 border-0" />

      {/* Secondary list: render next articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.slice(4, 10).map((a, i) => (
          <article key={i} className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm">
            {a.images ? (
              <div className="w-full h-40 bg-gray-100 overflow-hidden">
                <img src={a.images} alt={a.title} loading="lazy" className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.style.display='none'}} />
              </div>
            ) : (
              <div className="w-full h-40 bg-gray-200 animate-pulse rounded" aria-hidden="true" />
            )}
            <div className="p-4">
              <div className="text-sm text-gray-500">{a.category || 'Tin'}</div>
              <h4 className="mt-2 font-semibold text-gray-900">{a.title}</h4>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;