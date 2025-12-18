// src/components/home/CategoryHero.jsx
import React from "react";

const CategoryHero = ({ title, image }) => {
  if (!title) return null;

  return (
    <section className="w-full">
      <div
        className="w-full h-[260px] md:h-[360px] lg:h-[460px] bg-center bg-cover relative"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-wide">
            {title}
          </h1>
          {/* <button className="mt-4 px-5 py-2 rounded-full border border-white/80 bg-white/10 text-sm backdrop-blur hover:bg-white/20 transition">
            Theo dõi
          </button> */}
        </div>
      </div>
    </section>
  );
};

export default CategoryHero;
