import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Clock,
  MapPin,
  Coffee,
  Send,
  Sparkles,
} from 'lucide-react';

import { CONTACT_INFO, COFFEE_MENU } from '../data/coffeeData';

export const ContactSection: React.FC = () => {
  const getElegantMenuName = (name: string) => {
    const lower = name.toLowerCase();

    if (lower.includes('aren')) {
      return 'Arumeya Aren Latte';
    }

    if (lower.includes('butterscotch')) {
      return 'Arumeya Butterscotch';
    }

    if (lower.includes('hazelnut')) {
      return 'Arumeya Hazelnut Latte';
    }

    if (lower.includes('banana')) {
      return 'Arumeya Banana Latte';
    }

    if (lower.includes('americano')) {
      return 'Arumeya Americano';
    }

    return name;
  };

  const [selectedCoffee, setSelectedCoffee] = useState(
    getElegantMenuName(COFFEE_MENU[0].name)
  );

  const [quantity, setQuantity] = useState(1);
  const [iceLevel, setIceLevel] = useState('Es Normal');
  const [sugarLevel, setSugarLevel] = useState('Gula Normal');
  const [notes, setNotes] = useState('');

  const handleSendCustomOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const message =
      `Halo ARUME Coffee! Saya mau pesan:%0A%0A` +
      `- *${selectedCoffee}* (${quantity}x)%0A` +
      `- Opsi: ${iceLevel}, ${sugarLevel}` +
      `${notes ? `%0A- Catatan: ${notes}` : ''}` +
      `%0A%0AMohon diproses ya. Terima kasih!`;

    const separator = CONTACT_INFO.whatsappUrl.includes('?') ? '&' : '?';

    window.open(
      `${CONTACT_INFO.whatsappUrl}${separator}text=${message}`,
      '_blank'
    );
  };

  const coffeeBeans = [
    { top: '8%', left: '3%', rotate: '-25deg', scale: 0.9 },
    { top: '17%', left: '9%', rotate: '20deg', scale: 0.7 },
    { top: '29%', left: '4%', rotate: '35deg', scale: 0.8 },
    { top: '43%', left: '11%', rotate: '-15deg', scale: 0.65 },
    { top: '62%', left: '5%', rotate: '22deg', scale: 0.85 },
    { top: '78%', left: '10%', rotate: '-28deg', scale: 0.7 },

    { top: '10%', right: '4%', rotate: '20deg', scale: 0.85 },
    { top: '21%', right: '10%', rotate: '-18deg', scale: 0.7 },
    { top: '34%', right: '5%', rotate: '30deg', scale: 0.8 },
    { top: '51%', right: '11%', rotate: '-25deg', scale: 0.65 },
    { top: '68%', right: '5%', rotate: '15deg', scale: 0.85 },
    { top: '82%', right: '10%', rotate: '-30deg', scale: 0.7 },
  ];

  return (
    <section
      id="contact"
      className="
        py-20
        sm:py-24
        relative
        overflow-hidden
        bg-gradient-to-b
        from-[#fbf7f1]
        via-[#f6efe5]
        to-[#eee0cd]
      "
    >
      {/* BACKGROUND AMBIENT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-[#d4af37]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#8b5a2b]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#d4af37]/8 rounded-full blur-[150px] pointer-events-none" />

      {/* COFFEE BEANS DECORATION */}
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
                w-11
                h-16
                rounded-[50%]
                bg-[#70452d]/[0.06]
                border
                border-[#70452d]/[0.08]
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">

          {/* Badge */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-white/55
              backdrop-blur-md
              border
              border-[#d4af37]/30
              mb-5
              shadow-sm
            "
          >
            <MessageCircle className="w-4 h-4 text-[#16a34a]" />

            <span
              className="
                text-[11px]
                sm:text-xs
                font-extrabold
                text-[#16863d]
                tracking-[0.16em]
                uppercase
              "
            >
              Layanan Pesanan Cepat
            </span>
          </div>

          {/* Heading */}
          <h2
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-black
              tracking-tight
              leading-[1.08]
              text-[#2d1b12]
              mb-4
            "
          >
            Pesan Kopi Favoritmu
            <span className="block mt-1 text-[#b8860b]">
              Langsung via WhatsApp
            </span>
          </h2>

          {/* Gold Divider */}
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

          <p
            className="
              text-[#6f5a46]
              text-sm
              sm:text-base
              font-medium
              leading-relaxed
              max-w-2xl
              mx-auto
            "
          >
            Pilih varian Arumeya favoritmu, atur level es dan tingkat manis,
            lalu kirim pesanan langsung ke tim ARUME Coffee.
          </p>

        </div>

        {/* MAIN CARD */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-[#d4af37]/25
            bg-[#fffaf3]/90
            backdrop-blur-xl
            p-6
            sm:p-10
            lg:p-12
            shadow-[0_25px_70px_rgba(75,45,20,0.14)]
          "
        >
          {/* Gold Top Line */}
          <div
            className="
              absolute
              top-0
              left-[12%]
              right-[12%]
              h-[2px]
              bg-gradient-to-r
              from-transparent
              via-[#d4af37]
              to-transparent
            "
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">

            {/* LEFT INFO */}
            <div
              className="
                lg:col-span-5
                flex
                flex-col
                justify-center
                border-b
                lg:border-b-0
                lg:border-r
                border-[#d8c4a7]
                pb-8
                lg:pb-0
                lg:pr-10
              "
            >

              {/* WhatsApp Icon */}
              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-[#ecfdf3]
                  border
                  border-[#22c55e]/25
                  flex
                  items-center
                  justify-center
                  mb-6
                  shadow-[0_12px_30px_rgba(34,197,94,0.10)]
                "
              >
                <MessageCircle className="w-8 h-8 text-[#16a34a]" />
              </div>

              <span
                className="
                  text-[11px]
                  font-extrabold
                  tracking-[0.18em]
                  uppercase
                  text-[#b8860b]
                  mb-2
                "
              >
                Direct Order
              </span>

              <h3
                className="
                  text-2xl
                  sm:text-3xl
                  font-black
                  tracking-tight
                  text-[#2d1b12]
                  mb-3
                "
              >
                ARUME Direct WhatsApp
              </h3>

              <p
                className="
                  text-sm
                  sm:text-base
                  text-[#705d49]
                  font-medium
                  leading-relaxed
                  mb-6
                "
              >
                Terhubung langsung dengan tim barista untuk pemesanan,
                informasi menu, dan kebutuhan delivery.
              </p>

              {/* Phone Box */}
              <div
                className="
                  p-4
                  rounded-2xl
                  bg-[#fff7eb]
                  border
                  border-[#d9c4a3]
                  mb-6
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-[#f6ead7]
                    border
                    border-[#d4af37]/20
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Phone className="w-5 h-5 text-[#b8860b]" />
                </div>

                <div>
                  <span
                    className="
                      text-[10px]
                      text-[#8d7863]
                      font-bold
                      tracking-wider
                      uppercase
                      block
                    "
                  >
                    Nomor WhatsApp
                  </span>

                  <span
                    className="
                      text-lg
                      sm:text-xl
                      font-black
                      text-[#2d1b12]
                      tracking-wide
                    "
                  >
                    {CONTACT_INFO.phoneDisplay}
                  </span>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href={CONTACT_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-full
                  py-3.5
                  px-6
                  rounded-2xl
                  bg-[#16a34a]
                  hover:bg-[#15803d]
                  text-white
                  font-extrabold
                  text-sm
                  sm:text-base
                  flex
                  items-center
                  justify-center
                  gap-3
                  shadow-[0_14px_30px_rgba(22,163,74,0.20)]
                  hover:-translate-y-0.5
                  transition-all
                  duration-300
                  group
                "
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Chat via WhatsApp</span>
              </a>

              {/* INFO */}
              <div className="mt-7 space-y-3 pt-6 border-t border-[#d8c4a7]">

                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#705d49]">
                  <Clock className="w-4 h-4 text-[#b8860b] shrink-0" />
                  <span className="font-medium">
                    {CONTACT_INFO.openingHours}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#705d49]">
                  <MapPin className="w-4 h-4 text-[#b8860b] shrink-0" />
                  <span className="font-medium">
                    {CONTACT_INFO.address}
                  </span>
                </div>

              </div>
            </div>

            {/* RIGHT ORDER FORM */}
            <div className="lg:col-span-7">

              <div
                className="
                  h-full
                  bg-white/55
                  border
                  border-[#d9c4a3]
                  p-5
                  sm:p-7
                  rounded-[1.75rem]
                  shadow-[0_10px_30px_rgba(75,45,20,0.06)]
                "
              >

                {/* Form Heading */}
                <div className="flex items-center gap-3 mb-7">

                  <div
                    className="
                      w-12
                      h-12
                      rounded-xl
                      bg-[#fff2dc]
                      border
                      border-[#d4af37]/25
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Coffee className="w-6 h-6 text-[#b8860b]" />
                  </div>

                  <div>
                    <h4
                      className="
                        text-xl
                        sm:text-2xl
                        font-black
                        tracking-tight
                        text-[#2d1b12]
                      "
                    >
                      Pesan Arumeya
                    </h4>

                    <p className="text-xs sm:text-sm text-[#86715d] font-medium mt-0.5">
                      Atur pesanan sesuai selera kamu
                    </p>
                  </div>

                </div>

                <form
                  onSubmit={handleSendCustomOrder}
                  className="space-y-5"
                >

                  {/* Coffee Select */}
                  <div>
                    <label
                      className="
                        block
                        text-[11px]
                        sm:text-xs
                        font-extrabold
                        text-[#5d4733]
                        tracking-[0.08em]
                        uppercase
                        mb-2
                      "
                    >
                      Pilih Varian Arumeya
                    </label>

                    <select
                      value={selectedCoffee}
                      onChange={(e) => setSelectedCoffee(e.target.value)}
                      className="
                        w-full
                        bg-[#fffaf3]
                        border
                        border-[#d7bd95]
                        rounded-xl
                        px-4
                        py-3.5
                        text-sm
                        font-semibold
                        text-[#2d1b12]
                        focus:outline-none
                        focus:border-[#b8860b]
                        focus:ring-2
                        focus:ring-[#d4af37]/15
                        transition-all
                      "
                    >
                      {COFFEE_MENU.map((item) => {
                        const elegantName = getElegantMenuName(item.name);

                        return (
                          <option
                            key={item.id}
                            value={elegantName}
                          >
                            {elegantName} — {item.formattedPrice}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                    {/* Quantity */}
                    <div>
                      <label
                        className="
                          block
                          text-[11px]
                          font-extrabold
                          text-[#5d4733]
                          uppercase
                          mb-2
                        "
                      >
                        Jumlah
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              parseInt(e.target.value) || 1
                            )
                          )
                        }
                        className="
                          w-full
                          bg-[#fffaf3]
                          border
                          border-[#d7bd95]
                          rounded-xl
                          px-4
                          py-3
                          text-sm
                          font-semibold
                          text-[#2d1b12]
                          focus:outline-none
                          focus:border-[#b8860b]
                        "
                      />
                    </div>

                    {/* Ice */}
                    <div>
                      <label
                        className="
                          block
                          text-[11px]
                          font-extrabold
                          text-[#5d4733]
                          uppercase
                          mb-2
                        "
                      >
                        Level Es
                      </label>

                      <select
                        value={iceLevel}
                        onChange={(e) =>
                          setIceLevel(e.target.value)
                        }
                        className="
                          w-full
                          bg-[#fffaf3]
                          border
                          border-[#d7bd95]
                          rounded-xl
                          px-3
                          py-3
                          text-sm
                          font-semibold
                          text-[#2d1b12]
                          focus:outline-none
                          focus:border-[#b8860b]
                        "
                      >
                        <option value="Es Normal">
                          Es Normal
                        </option>

                        <option value="Sedikit Es (Less Ice)">
                          Less Ice
                        </option>

                        <option value="Tanpa Es (No Ice)">
                          No Ice
                        </option>
                      </select>
                    </div>

                    {/* Sugar */}
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        className="
                          block
                          text-[11px]
                          font-extrabold
                          text-[#5d4733]
                          uppercase
                          mb-2
                        "
                      >
                        Tingkat Manis
                      </label>

                      <select
                        value={sugarLevel}
                        onChange={(e) =>
                          setSugarLevel(e.target.value)
                        }
                        className="
                          w-full
                          bg-[#fffaf3]
                          border
                          border-[#d7bd95]
                          rounded-xl
                          px-3
                          py-3
                          text-sm
                          font-semibold
                          text-[#2d1b12]
                          focus:outline-none
                          focus:border-[#b8860b]
                        "
                      >
                        <option value="Gula Normal">
                          Normal
                        </option>

                        <option value="Less Sugar">
                          Less Sugar
                        </option>

                        <option value="Extra Sweet">
                          Extra Sweet
                        </option>

                        <option value="Tanpa Gula">
                          No Sugar
                        </option>
                      </select>
                    </div>

                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      className="
                        block
                        text-[11px]
                        font-extrabold
                        text-[#5d4733]
                        uppercase
                        mb-2
                      "
                    >
                      Catatan Tambahan
                    </label>

                    <input
                      type="text"
                      placeholder="Contoh: titip di pos satpam / extra espresso shot"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="
                        w-full
                        bg-[#fffaf3]
                        border
                        border-[#d7bd95]
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-[#2d1b12]
                        placeholder-[#aa947d]
                        focus:outline-none
                        focus:border-[#b8860b]
                      "
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="
                      w-full
                      bg-gradient-to-r
                      from-[#c79a22]
                      via-[#d8af3d]
                      to-[#b8860b]
                      hover:brightness-105
                      py-3.5
                      rounded-xl
                      font-extrabold
                      text-sm
                      text-[#211409]
                      flex
                      items-center
                      justify-center
                      gap-2
                      shadow-[0_12px_28px_rgba(184,134,11,0.18)]
                      hover:-translate-y-0.5
                      transition-all
                      duration-300
                    "
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      Kirim Pesanan ke WhatsApp
                    </span>
                  </button>

                </form>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
