import React, { useState } from 'react';
import { COFFEE_MENU } from '../data/coffeeData';
import {
  Coffee,
  Star,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { CoffeeMenuItem } from '../types';

interface MenuSectionProps {
  onSelectMenu: (item: CoffeeMenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  onSelectMenu,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Signature', 'Specialty', 'Classics'];

  const filteredMenu =
    activeCategory === 'All'
      ? COFFEE_MENU
      : COFFEE_MENU.filter(
          (item) => item.category === activeCategory
        );

  const coffeeBeans = [
    { top: '8%', left: '3%', rotate: '-25deg', scale: 0.85 },
    { top: '20%', left: '8%', rotate: '18deg', scale: 0.65 },
    { top: '44%', left: '4%', rotate: '32deg', scale: 0.75 },
    { top: '73%', left: '9%', rotate: '-18deg', scale: 0.65 },

    { top: '10%', right: '4%', rotate: '20deg', scale: 0.8 },
    { top: '30%', right: '9%', rotate: '-18deg', scale: 0.65 },
    { top: '56%', right: '4%', rotate: '28deg', scale: 0.75 },
    { top: '80%', right: '9%', rotate: '-28deg', scale: 0.65 },
  ];

  return (
    <section
      id="menu"
      className="
        py-20
        sm:py-24
        relative
        overflow-hidden
        bg-gradient-to-b
        from-[#f2e8da]
        via-[#fbf7f1]
        to-[#fbf7f1]
      "
    >
      {/* GOLD AMBIENT */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[800px]
          h-[350px]
          bg-[#d4af37]/10
          rounded-full
          blur-[170px]
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          w-80
          h-80
          bg-[#8b5a2b]/8
          rounded-full
          blur-[140px]
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          top-1/3
          right-0
          w-80
          h-80
          bg-[#d4af37]/8
          rounded-full
          blur-[140px]
          pointer-events-none
        "
      />

      {/* COFFEE BEANS SAMAR */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {coffeeBeans.map((bean, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: bean.top,
              left: 'left' in bean ? bean.left : undefined,
              right: 'right' in bean ? bean.right : undefined,
              transform: `rotate(${bean.rotate}) scale(${bean.scale})`,
            }}
          >
            <div
              className="
                relative
                w-10
                h-16
                rounded-[50%]
                bg-[#70452d]/[0.055]
                border
                border-[#70452d]/[0.07]
              "
            >
              <div
                className="
                  absolute
                  left-1/2
                  top-[8%]
                  -translate-x-1/2
                  w-[1px]
                  h-[84%]
                  bg-[#70452d]/15
                  rotate-12
                  rounded-full
                "
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          relative
          z-10
        "
      >
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-14">

          {/* BADGE */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-white/60
              backdrop-blur-md
              border
              border-[#d4af37]/30
              mb-5
              shadow-sm
            "
          >
            <Coffee className="w-4 h-4 text-[#b8860b]" />

            <span
              className="
                text-[11px]
                sm:text-xs
                font-extrabold
                text-[#b8860b]
                tracking-[0.16em]
                uppercase
              "
            >
              Pilihan Rasa Terbaik
            </span>
          </div>

          {/* TITLE */}
          <h2
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-black
              tracking-tight
              text-[#2d1b12]
              leading-tight
              mb-4
            "
          >
            Menu Kopi{' '}
            <span className="text-[#b8860b]">
              ARUME
            </span>
          </h2>

          {/* GOLD DIVIDER */}
          <div
            className="
              w-20
              h-[2px]
              mx-auto
              mb-5
              bg-gradient-to-r
              from-transparent
              via-[#d4af37]
              to-transparent
            "
          />

          {/* SUBTITLE */}
          <p
            className="
              text-[#6d5844]
              text-sm
              sm:text-base
              lg:text-lg
              font-medium
              leading-relaxed
            "
          >
            Temukan racikan Arumeya favoritmu dengan perpaduan
            rasa, aroma, dan kehangatan khas ARUME Coffee.
          </p>

          {/* CATEGORY FILTER */}
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-2.5
              mt-8
            "
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-5
                  py-2.5
                  rounded-full
                  text-xs
                  sm:text-sm
                  font-bold
                  border
                  transition-all
                  duration-300
                  ${
                    activeCategory === cat
                      ? `
                        bg-[#b8860b]
                        text-white
                        border-[#b8860b]
                        shadow-[0_8px_20px_rgba(184,134,11,0.18)]
                        scale-[1.03]
                      `
                      : `
                        bg-white/60
                        text-[#6d5844]
                        border-[#d9c4a3]
                        hover:bg-[#fff8ef]
                        hover:text-[#b8860b]
                        hover:border-[#d4af37]
                      `
                  }
                `}
              >
                {cat === 'All' ? 'Semua Menu' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* MENU GRID */}
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-7
          "
        >
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className="
                rounded-[1.75rem]
                overflow-hidden
                flex
                flex-col
                justify-between
                group
                relative
                bg-[#fffdf9]
                border
                border-[#d9c4a3]
                shadow-[0_12px_35px_rgba(92,58,28,0.08)]
                transition-all
                duration-300
                hover:-translate-y-1.5
                hover:border-[#d4af37]/70
                hover:shadow-[0_20px_45px_rgba(184,134,11,0.14)]
              "
            >
              {/* BEST SELLER */}
              {item.isBestSeller && (
                <div
                  className="
                    absolute
                    top-4
                    right-4
                    z-20
                    flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-full
                    bg-gradient-to-r
                    from-[#d4af37]
                    to-[#b8860b]
                    text-[#211409]
                    text-[10px]
                    font-black
                    tracking-wide
                    shadow-lg
                  "
                >
                  <Sparkles className="w-3 h-3 fill-[#211409]" />
                  <span>BEST SELLER</span>
                </div>
              )}

              <div>
                {/* IMAGE */}
                <div
                  className="
                    relative
                    h-60
                    sm:h-64
                    overflow-hidden
                    bg-[#efe2cf]
                  "
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      w-full
                      h-full
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-105
                    "
                    referrerPolicy="no-referrer"
                  />

                  {/* IMAGE GRADIENT */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/40
                      via-transparent
                      to-transparent
                    "
                  />

                  {/* RATING */}
                  <div
                    className="
                      absolute
                      bottom-4
                      left-4
                      flex
                      items-center
                      gap-1.5
                      px-3
                      py-1.5
                      rounded-full
                      bg-white/90
                      backdrop-blur-md
                      border
                      border-white/60
                      shadow-md
                    "
                  >
                    <Star
                      className="
                        w-3.5
                        h-3.5
                        text-[#b8860b]
                        fill-[#d4af37]
                      "
                    />

                    <span
                      className="
                        text-xs
                        font-black
                        text-[#2d1b12]
                      "
                    >
                      {item.rating}
                    </span>

                    <span
                      className="
                        text-[10px]
                        text-[#806c58]
                        font-medium
                      "
                    >
                      ({item.reviewsCount})
                    </span>
                  </div>
                </div>

                {/* BODY */}
                <div className="p-6">

                  {/* TITLE */}
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      mb-3
                    "
                  >
                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-[#fff3df]
                        border
                        border-[#d4af37]/30
                        flex
                        items-center
                        justify-center
                        shrink-0
                        transition-all
                        duration-300
                        group-hover:bg-[#ffedcc]
                      "
                    >
                      <Coffee className="w-5 h-5 text-[#b8860b]" />
                    </div>

                    <h3
                      className="
                        text-xl
                        sm:text-2xl
                        font-black
                        tracking-tight
                        leading-tight
                        text-[#2d1b12]
                        transition-colors
                        duration-300
                        group-hover:text-[#b8860b]
                      "
                    >
                      {item.name}
                    </h3>
                  </div>

                  {/* DESCRIPTION */}
                  <p
                    className="
                      text-sm
                      text-[#705d49]
                      font-medium
                      leading-relaxed
                      line-clamp-2
                      mb-4
                    "
                  >
                    {item.description}
                  </p>

                  {/* TAGS */}
                  {item.tags && (
                    <div
                      className="
                        flex
                        flex-wrap
                        gap-1.5
                        mb-2
                      "
                    >
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="
                            text-[10px]
                            font-bold
                            px-2.5
                            py-1
                            rounded-full
                            bg-[#fff4e2]
                            text-[#9b7000]
                            border
                            border-[#d4af37]/20
                          "
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER */}
              <div
                className="
                  px-6
                  pb-6
                  pt-5
                  border-t
                  border-[#e5d5be]
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                {/* PRICE */}
                <div>
                  <span
                    className="
                      text-[10px]
                      text-[#8e7863]
                      uppercase
                      tracking-[0.12em]
                      font-bold
                      block
                      mb-0.5
                    "
                  >
                    Harga
                  </span>

                  <span
                    className="
                      text-xl
                      sm:text-2xl
                      font-black
                      text-[#b8860b]
                    "
                  >
                    {item.formattedPrice}
                  </span>
                </div>

                {/* ORDER BUTTON */}
                <button
                  onClick={() => onSelectMenu(item)}
                  className="
                    bg-gradient-to-r
                    from-[#c99c22]
                    via-[#d8af3d]
                    to-[#b8860b]
                    hover:brightness-105
                    px-5
                    py-3
                    rounded-xl
                    text-xs
                    sm:text-sm
                    font-black
                    text-[#211409]
                    flex
                    items-center
                    gap-2
                    shadow-[0_8px_22px_rgba(184,134,11,0.18)]
                    hover:-translate-y-0.5
                    transition-all
                    duration-300
                    group/btn
                  "
                >
                  <ShoppingBag
                    className="
                      w-4
                      h-4
                      group-hover/btn:scale-110
                      transition-transform
                    "
                  />

                  <span>Pesan</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
