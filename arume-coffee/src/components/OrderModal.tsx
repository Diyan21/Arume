import React, {
  useRef,
  useState
} from 'react';

import {
  X,
  Plus,
  Minus,
  CreditCard,
  Loader2,
  MapPin,
} from 'lucide-react';

import {
  CoffeeMenuItem
} from '../types';


/* =========================================================
   STORE LOCATION TYPE
   ========================================================= */

interface StoreLocation {

  name: string;

  address: string;

  latitude: number;

  longitude: number;

  postalCode: string;
}


/* =========================================================
   PROPS
   ========================================================= */

interface OrderModalProps {

  item:
    CoffeeMenuItem | null;

  storeLocation:
    StoreLocation;

  onClose:
    () => void;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export const OrderModal:
React.FC<OrderModalProps> = ({

  item,

  storeLocation,

  onClose,

}) => {


  /* =========================================================
     ORDER CUSTOMIZATION
     ========================================================= */

  const [
    quantity,
    setQuantity
  ] =
    useState(
      1
    );


  const [
    iceLevel,
    setIceLevel
  ] =
    useState(
      'Es Normal'
    );


  const [
    sugarLevel,
    setSugarLevel
  ] =
    useState(
      'Gula Normal'
    );


  const [
    notes,
    setNotes
  ] =
    useState(
      ''
    );


  /* =========================================================
     CUSTOMER DATA
     ========================================================= */

  const [
    customerName,
    setCustomerName
  ] =
    useState(
      ''
    );


  const [
    customerEmail,
    setCustomerEmail
  ] =
    useState(
      ''
    );


  const [
    customerPhone,
    setCustomerPhone
  ] =
    useState(
      ''
    );


  /* =========================================================
     OPTIONAL DELIVERY
     ========================================================= */

  const [
    deliveryAddress,
    setDeliveryAddress
  ] =
    useState(
      ''
    );


  const [
    customerLatitude,
    setCustomerLatitude
  ] =
    useState<number | null>(
      null
    );


  const [
    customerLongitude,
    setCustomerLongitude
  ] =
    useState<number | null>(
      null
    );


  const [
    distanceKm,
    setDistanceKm
  ] =
    useState<number | null>(
      null
    );


  const [
    shippingFee,
    setShippingFee
  ] =
    useState(
      0
    );


  const [
    locationLoading,
    setLocationLoading
  ] =
    useState(
      false
    );


  const [
    deliveryAvailable,
    setDeliveryAvailable
  ] =
    useState(
      true
    );


  /* =========================================================
     LOADING
     ========================================================= */

  const [
    loading,
    setLoading
  ] =
    useState(
      false
    );


  /* =========================================================
     CHECKOUT IDEMPOTENCY
     ========================================================= */

  const checkoutIdRef =
    useRef<string | null>(
      null
    );


  /* =========================================================
     DISTANCE CALCULATOR
     HAVERSINE
     ========================================================= */

  const calculateDistance =
    (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {

      const earthRadius =
        6371;


      const toRadians =
        (
          degree: number
        ) =>

          degree *
          (
            Math.PI /
            180
          );


      const latitudeDistance =
        toRadians(
          lat2 -
          lat1
        );


      const longitudeDistance =
        toRadians(
          lon2 -
          lon1
        );


      const a =

        Math.sin(
          latitudeDistance /
          2
        ) *

        Math.sin(
          latitudeDistance /
          2
        ) +

        Math.cos(
          toRadians(
            lat1
          )
        ) *

        Math.cos(
          toRadians(
            lat2
          )
        ) *

        Math.sin(
          longitudeDistance /
          2
        ) *

        Math.sin(
          longitudeDistance /
          2
        );


      const c =

        2 *

        Math.atan2(

          Math.sqrt(
            a
          ),

          Math.sqrt(
            1 - a
          )

        );


      return (
        earthRadius *
        c
      );
    };


  /* =========================================================
     SHIPPING FEE
     ========================================================= */

  const calculateShippingFee =
    (
      distance: number
    ) => {

      if (
        distance <=
        2
      ) {

        return 5000;
      }


      if (
        distance <=
        5
      ) {

        return 10000;
      }


      if (
        distance <=
        8
      ) {

        return 15000;
      }


      if (
        distance <=
        12
      ) {

        return 20000;
      }


      return null;
    };


  /* =========================================================
     GET CUSTOMER LOCATION
     ========================================================= */

  const handleGetLocation =
    () => {

      if (
        !navigator.geolocation
      ) {

        alert(
          'Browser Anda tidak mendukung fitur lokasi.'
        );

        return;
      }


      setLocationLoading(
        true
      );


      navigator.geolocation
        .getCurrentPosition(

          (
            position
          ) => {

            const latitude =
              position
                .coords
                .latitude;


            const longitude =
              position
                .coords
                .longitude;


            setCustomerLatitude(
              latitude
            );


            setCustomerLongitude(
              longitude
            );


            const distance =
              calculateDistance(

                storeLocation
                  .latitude,

                storeLocation
                  .longitude,

                latitude,

                longitude

              );


            const roundedDistance =

              Math.round(
                distance *
                10
              ) /
              10;


            setDistanceKm(
              roundedDistance
            );


            const fee =
              calculateShippingFee(
                distance
              );


            if (
              fee ===
              null
            ) {

              setShippingFee(
                0
              );


              setDeliveryAvailable(
                false
              );

            } else {

              setShippingFee(
                fee
              );


              setDeliveryAvailable(
                true
              );

            }


            setLocationLoading(
              false
            );

          },


          (
            error
          ) => {

            console.error(
              'Location error:',
              error
            );


            setLocationLoading(
              false
            );


            alert(
              'Lokasi tidak dapat diakses. Pastikan izin lokasi browser sudah aktif.'
            );

          },


          {

            enableHighAccuracy:
              true,

            timeout:
              10000,

            maximumAge:
              30000,

          }

        );
    };


  /* =========================================================
     ITEM NULL
     ========================================================= */

  if (
    !item
  ) {

    return null;
  }


  /* =========================================================
     PRICE
     ========================================================= */

  const subtotal =

    item.price *
    quantity;


  /*
   * Ongkir hanya ditambahkan
   * jika lokasi customer sudah dicek
   * dan masih dalam jangkauan.
   */

  const activeShippingFee =

    distanceKm !== null &&
    deliveryAvailable

      ? shippingFee

      : 0;


  const totalPrice =

    subtotal +
    activeShippingFee;


  const formattedSubtotal =

    `Rp${subtotal.toLocaleString(
      'id-ID'
    )}`;


  const formattedShippingFee =

    `Rp${activeShippingFee.toLocaleString(
      'id-ID'
    )}`;


  const formattedTotalPrice =

    `Rp${totalPrice.toLocaleString(
      'id-ID'
    )}`;


  /* =========================================================
     CHECKOUT XENDIT
     ========================================================= */

  const handleCheckoutXendit =
    async () => {


      /* =====================================================
         VALIDATE CUSTOMER NAME
         ===================================================== */

      if (
        !customerName.trim()
      ) {

        alert(
          'Mohon isi nama Anda terlebih dahulu.'
        );

        return;
      }


      /* =====================================================
         OPTIONAL DELIVERY VALIDATION
         ===================================================== */

      /*
       * Delivery tidak wajib.
       *
       * Tapi kalau customer sudah
       * meminta cek lokasi dan ternyata
       * di luar jangkauan, jangan gunakan
       * delivery tersebut.
       */

      if (
        distanceKm !== null &&
        !deliveryAvailable
      ) {

        alert(
          'Lokasi pengiriman berada di luar jangkauan. Silakan checkout tanpa pengiriman atau hubungi Arume Coffee.'
        );

        return;
      }


      /* =====================================================
         ANTI DOUBLE CLICK
         ===================================================== */

      if (
        loading
      ) {

        return;
      }


      /* =====================================================
         GENERATE CHECKOUT ID
         ===================================================== */

      if (
        !checkoutIdRef.current
      ) {

        checkoutIdRef.current =
          crypto.randomUUID();
      }


      const checkoutId =
        checkoutIdRef.current;


      setLoading(
        true
      );


      try {


        /* ===================================================
           STEP 1
           CREATE ORDER
           =================================================== */

        const orderResponse =

          await fetch(

            'https://arume-coffee-api-2.diyanaxl.workers.dev/api/orders',

            {

              method:
                'POST',


              headers: {

                'Content-Type':
                  'application/json',

              },


              body:
                JSON.stringify({


                  checkout_id:
                    checkoutId,


                  customer: {

                    name:
                      customerName
                        .trim(),


                    email:
                      customerEmail
                        .trim() ||
                      null,


                    phone:
                      customerPhone
                        .trim() ||
                      null,

                  },


                  /* =========================================
                     OPTIONAL DELIVERY
                     ========================================= */

                  delivery:

                    customerLatitude !== null &&
                    customerLongitude !== null &&
                    deliveryAvailable

                      ? {

                          address:

                            deliveryAddress
                              .trim() ||
                            null,


                          latitude:
                            customerLatitude,


                          longitude:
                            customerLongitude,


                          distance_km:
                            distanceKm,


                          /*
                           * HANYA INFORMASI FRONTEND.
                           *
                           * Backend nantinya harus
                           * menghitung ulang sendiri.
                           */

                          shipping_fee:
                            activeShippingFee,

                        }

                      : null,


                  /* =========================================
                     ITEMS
                     ========================================= */

                  items: [

                    {

                      product_id:
                        item.id,


                      quantity:
                        quantity,

                    },

                  ],


                  /* =========================================
                     NOTES
                     ========================================= */

                  notes:

                    `${iceLevel}, ${sugarLevel}${
                      notes.trim()

                        ? ` - ${notes.trim()}`

                        : ''
                    }`,

                }),

            }

          );


        /* ===================================================
           PARSE ORDER RESPONSE
           =================================================== */

        let orderResult:
          any;


        try {

          orderResult =
            await orderResponse
              .json();

        } catch {

          throw new Error(
            'Response dari server order tidak valid.'
          );

        }


        console.log(

          'Create order response:',

          orderResult

        );


        /* ===================================================
           ORDER NUMBER
           =================================================== */

        const orderNumber =

          orderResult?.data
            ?.order_number ||

          orderResult?.data
            ?.order
            ?.order_number ||

          orderResult?.data
            ?.existing_order
            ?.order_number ||

          orderResult?.data
            ?.existingOrder
            ?.order_number ||

          orderResult
            ?.order_number ||

          orderResult
            ?.order
            ?.order_number ||

          orderResult
            ?.existing_order
            ?.order_number ||

          orderResult
            ?.existingOrder
            ?.order_number;


        /* ===================================================
           VALIDATE ORDER
           =================================================== */

        if (
          !orderNumber
        ) {

          console.error(

            'Order number tidak ditemukan:',

            orderResult

          );


          throw new Error(

            orderResult
              ?.message ||

            orderResult
              ?.error ||

            'Gagal membuat pesanan.'

          );

        }


        console.log(

          'Order siap digunakan:',

          orderNumber

        );


        /* ===================================================
           STEP 2
           CREATE / REUSE XENDIT PAYMENT
           =================================================== */

        const paymentResponse =

          await fetch(

            'https://arume-coffee-api-2.diyanaxl.workers.dev/api/payment/create',

            {

              method:
                'POST',


              headers: {

                'Content-Type':
                  'application/json',

              },


              body:
                JSON.stringify({

                  order_number:
                    orderNumber,

                }),

            }

          );


        /* ===================================================
           PARSE PAYMENT RESPONSE
           =================================================== */

        let paymentResult:
          any;


        try {

          paymentResult =
            await paymentResponse
              .json();

        } catch {

          throw new Error(
            'Response dari server pembayaran tidak valid.'
          );

        }


        console.log(

          'Create Xendit payment response:',

          paymentResult

        );


        /* ===================================================
           PAYMENT URL
           =================================================== */

        const paymentUrl =

          paymentResult?.data
            ?.redirect_url ||

          paymentResult?.data
            ?.payment_link_url ||

          paymentResult?.data
            ?.payment_url ||

          paymentResult?.data
            ?.payment
            ?.redirect_url ||

          paymentResult?.data
            ?.payment
            ?.payment_link_url ||

          paymentResult?.data
            ?.payment
            ?.payment_url ||

          paymentResult
            ?.redirect_url ||

          paymentResult
            ?.payment_link_url ||

          paymentResult
            ?.payment_url;


        /* ===================================================
           VALIDATE PAYMENT URL
           =================================================== */

        if (
          !paymentUrl
        ) {

          console.error(

            'Payment URL tidak ditemukan:',

            paymentResult

          );


          throw new Error(

            paymentResult
              ?.message ||

            paymentResult
              ?.error ||

            'Gagal membuat pembayaran Xendit.'

          );

        }


        console.log(

          'Redirect ke Xendit:',

          paymentUrl

        );


        /* ===================================================
           RESET CHECKOUT ID
           =================================================== */

        checkoutIdRef.current =
          null;


        /* ===================================================
           REDIRECT
           =================================================== */

        window.location.href =
          paymentUrl;


      } catch (
        error: any
      ) {


        console.error(

          'Checkout Xendit error:',

          error

        );


        alert(

          'Gagal melanjutkan pembayaran: ' +

          (
            error?.message ||
            'Terjadi kesalahan pada server.'
          )

        );


      } finally {


        setLoading(
          false
        );

      }

    };


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div

      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-4
        bg-black/80
        backdrop-blur-md
        animate-in
        fade-in
        duration-300
      "

    >


      <div

        className="
          glass-card
          max-w-lg
          w-full
          rounded-3xl
          overflow-hidden
          border
          border-[#d4af37]/40
          shadow-2xl
          relative
          animate-in
          zoom-in-95
          duration-300
        "

      >


        {/* CLOSE */}

        <button

          onClick={
            onClose
          }

          disabled={
            loading
          }

          className="
            absolute
            top-4
            right-4
            z-20
            w-9
            h-9
            rounded-full
            bg-black/60
            border
            border-[#d4af37]/30
            text-white
            flex
            items-center
            justify-center
            hover:bg-[#d4af37]
            hover:text-black
            transition-colors
            disabled:opacity-40
          "

        >

          <X
            className="
              w-5
              h-5
            "
          />

        </button>


        {/* HEADER */}

        <div

          className="
            relative
            h-48
            sm:h-56
            overflow-hidden
          "

        >


          <img

            src={
              item.image
            }

            alt={
              item.name
            }

            className="
              w-full
              h-full
              object-cover
            "

            referrerPolicy="
              no-referrer
            "

          />


          <div

            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-[#120e0b]
              via-[#120e0b]/40
              to-transparent
            "

          />


          <div

            className="
              absolute
              bottom-4
              left-6
              right-6
              flex
              items-end
              justify-between
              gap-4
            "

          >


            <div>


              <span

                className="
                  text-xs
                  px-2.5
                  py-1
                  rounded-md
                  bg-[#d4af37]
                  text-black
                  font-bold
                  uppercase
                  tracking-wider
                  mb-1
                  inline-block
                "

              >

                {item.category}

              </span>


              <h3

                className="
                  font-display
                  text-2xl
                  font-bold
                  text-white
                "

              >

                {item.name}

              </h3>


            </div>


            <div
              className="
                text-right
              "
            >


              <span

                className="
                  text-xs
                  text-[#a09080]
                  block
                "

              >

                Harga Satuan

              </span>


              <span

                className="
                  font-display
                  text-2xl
                  font-bold
                  gold-gradient-text
                "

              >

                {item.formattedPrice}

              </span>


            </div>


          </div>


        </div>


        {/* BODY */}

        <div

          className="
            p-6
            space-y-5
            max-h-[60vh]
            overflow-y-auto
          "

        >


          <p

            className="
              text-sm
              text-[#c2b4a3]
              font-light
              leading-relaxed
            "

          >

            {item.description}

          </p>


          {/* CUSTOMER */}

          <div

            className="
              space-y-3
              pt-2
              border-t
              border-[#2a2018]
            "

          >


            <span

              className="
                text-xs
                font-bold
                text-[#d4af37]
                uppercase
                tracking-wider
                block
              "

            >

              Informasi Pemesan

            </span>


            <div

              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-3
              "

            >


              <input

                type="
                  text
                "

                placeholder="
                  Nama Lengkap *
                "

                value={
                  customerName
                }

                onChange={
                  (
                    e
                  ) =>

                    setCustomerName(
                      e.target.value
                    )
                }

                disabled={
                  loading
                }

                className="
                  w-full
                  bg-[#18120d]
                  border
                  border-[#d4af37]/30
                  rounded-xl
                  px-3.5
                  py-2
                  text-sm
                  text-white
                  placeholder-[#605448]
                  focus:outline-none
                  focus:border-[#d4af37]
                  disabled:opacity-50
                "

              />


              <input

                type="
                  email
                "

                placeholder="
                  Email (Opsional)
                "

                value={
                  customerEmail
                }

                onChange={
                  (
                    e
                  ) =>

                    setCustomerEmail(
                      e.target.value
                    )
                }

                disabled={
                  loading
                }

                className="
                  w-full
                  bg-[#18120d]
                  border
                  border-[#d4af37]/30
                  rounded-xl
                  px-3.5
                  py-2
                  text-sm
                  text-white
                  placeholder-[#605448]
                  focus:outline-none
                  focus:border-[#d4af37]
                  disabled:opacity-50
                "

              />


            </div>


            <input

              type="
                tel
              "

              placeholder="
                Nomor WhatsApp (Opsional)
              "

              value={
                customerPhone
              }

              onChange={
                (
                  e
                ) =>

                  setCustomerPhone(
                    e.target.value
                  )
              }

              disabled={
                loading
              }

              className="
                w-full
                bg-[#18120d]
                border
                border-[#d4af37]/30
                rounded-xl
                px-3.5
                py-2
                text-sm
                text-white
                placeholder-[#605448]
                focus:outline-none
                focus:border-[#d4af37]
                disabled:opacity-50
              "

            />


          </div>


          {/* OPTIONAL DELIVERY */}

          <div

            className="
              space-y-3
              pt-3
              border-t
              border-[#2a2018]
            "

          >


            <div

              className="
                flex
                items-center
                justify-between
                gap-3
              "

            >


              <span

                className="
                  text-xs
                  font-bold
                  text-[#d4af37]
                  uppercase
                  tracking-wider
                "

              >

                Pengiriman

              </span>


              <span

                className="
                  text-[10px]
                  text-[#8e8072]
                  uppercase
                "

              >

                Opsional

              </span>


            </div>


            <textarea

              placeholder="
                Alamat pengiriman (Opsional)
              "

              value={
                deliveryAddress
              }

              onChange={
                (
                  e
                ) =>

                  setDeliveryAddress(
                    e.target.value
                  )
              }

              disabled={
                loading
              }

              rows={
                2
              }

              className="
                w-full
                bg-[#18120d]
                border
                border-[#d4af37]/30
                rounded-xl
                px-3.5
                py-2.5
                text-sm
                text-white
                placeholder-[#605448]
                focus:outline-none
                focus:border-[#d4af37]
                resize-none
                disabled:opacity-50
              "

            />


            <button

              type="
                button
              "

              onClick={
                handleGetLocation
              }

              disabled={
                loading ||
                locationLoading
              }

              className="
                w-full
                py-2.5
                rounded-xl
                border
                border-[#d4af37]/40
                bg-[#251c14]
                text-[#d4af37]
                text-sm
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                hover:border-[#d4af37]
                transition-colors
                disabled:opacity-50
              "

            >


              {
                locationLoading

                  ? (

                    <>

                      <Loader2
                        className="
                          w-4
                          h-4
                          animate-spin
                        "
                      />

                      Mengecek lokasi...

                    </>

                  )

                  : (

                    <>

                      <MapPin
                        className="
                          w-4
                          h-4
                        "
                      />

                      Gunakan Lokasi Saya

                    </>

                  )
              }


            </button>


            {

              distanceKm !== null && (

                <div

                  className="
                    bg-[#18120d]
                    rounded-xl
                    border
                    border-[#d4af37]/20
                    p-3
                    space-y-2
                  "

                >


                  <div

                    className="
                      flex
                      justify-between
                      gap-3
                      text-xs
                    "

                  >

                    <span
                      className="
                        text-[#8e8072]
                      "
                    >

                      Jarak

                    </span>


                    <span
                      className="
                        text-white
                        font-semibold
                      "
                    >

                      {distanceKm} km

                    </span>


                  </div>


                  {

                    deliveryAvailable

                      ? (

                        <div

                          className="
                            flex
                            justify-between
                            gap-3
                            text-xs
                          "

                        >

                          <span
                            className="
                              text-[#8e8072]
                            "
                          >

                            Ongkir

                          </span>


                          <span

                            className="
                              text-[#d4af37]
                              font-bold
                            "

                          >

                            {formattedShippingFee}

                          </span>


                        </div>

                      )

                      : (

                        <p

                          className="
                            text-xs
                            text-red-400
                            font-semibold
                          "

                        >

                          Lokasi di luar jangkauan pengiriman.

                        </p>

                      )

                  }


                </div>

              )

            }


          </div>


          {/* QUANTITY */}

          <div

            className="
              flex
              items-center
              justify-between
              p-3.5
              rounded-2xl
              glass-panel
              border
              border-[#d4af37]/20
            "

          >


            <span

              className="
                text-sm
                font-semibold
                text-white
              "

            >

              Jumlah Pesanan

            </span>


            <div

              className="
                flex
                items-center
                gap-3
              "

            >


              <button

                type="
                  button
                "

                onClick={
                  () =>

                    setQuantity(

                      Math.max(
                        1,
                        quantity -
                        1
                      )

                    )
                }

                disabled={
                  loading
                }

                className="
                  w-8
                  h-8
                  rounded-lg
                  bg-[#251c14]
                  border
                  border-[#d4af37]/30
                  text-white
                  flex
                  items-center
                  justify-center
                "

              >

                <Minus
                  className="
                    w-4
                    h-4
                  "
                />

              </button>


              <span

                className="
                  font-bold
                  text-lg
                  text-white
                  min-w-[20px]
                  text-center
                "

              >

                {quantity}

              </span>


              <button

                type="
                  button
                "

                onClick={
                  () =>

                    setQuantity(
                      quantity +
                      1
                    )
                }

                disabled={
                  loading
                }

                className="
                  w-8
                  h-8
                  rounded-lg
                  bg-[#251c14]
                  border
                  border-[#d4af37]/30
                  text-white
                  flex
                  items-center
                  justify-center
                "

              >

                <Plus
                  className="
                    w-4
                    h-4
                  "
                />

              </button>


            </div>


          </div>


          {/* ICE + SUGAR */}

          <div

            className="
              grid
              grid-cols-2
              gap-3
            "

          >


            <div>


              <label

                className="
                  block
                  text-xs
                  font-semibold
                  text-[#b8a898]
                  uppercase
                  mb-1.5
                "

              >

                Level Es

              </label>


              <select

                value={
                  iceLevel
                }

                onChange={
                  (
                    e
                  ) =>

                    setIceLevel(
                      e.target.value
                    )
                }

                disabled={
                  loading
                }

                className="
                  w-full
                  bg-[#18120d]
                  border
                  border-[#d4af37]/30
                  rounded-xl
                  px-3
                  py-2
                  text-sm
                  text-white
                "

              >

                <option
                  value="
                    Es Normal
                  "
                >
                  Es Normal
                </option>

                <option
                  value="
                    Less Ice
                  "
                >
                  Less Ice
                </option>

                <option
                  value="
                    No Ice
                  "
                >
                  No Ice
                </option>

              </select>


            </div>


            <div>


              <label

                className="
                  block
                  text-xs
                  font-semibold
                  text-[#b8a898]
                  uppercase
                  mb-1.5
                "

              >

                Level Gula

              </label>


              <select

                value={
                  sugarLevel
                }

                onChange={
                  (
                    e
                  ) =>

                    setSugarLevel(
                      e.target.value
                    )
                }

                disabled={
                  loading
                }

                className="
                  w-full
                  bg-[#18120d]
                  border
                  border-[#d4af37]/30
                  rounded-xl
                  px-3
                  py-2
                  text-sm
                  text-white
                "

              >

                <option
                  value="
                    Gula Normal
                  "
                >
                  Normal
                </option>

                <option
                  value="
                    Less Sugar
                  "
                >
                  Less Sugar
                </option>

                <option
                  value="
                    Extra Sweet
                  "
                >
                  Extra Sweet
                </option>

                <option
                  value="
                    No Sugar
                  "
                >
                  No Sugar
                </option>

              </select>


            </div>


          </div>


          {/* NOTES */}

          <div>


            <label

              className="
                block
                text-xs
                font-semibold
                text-[#b8a898]
                uppercase
                mb-1.5
              "

            >

              Catatan Pesanan

            </label>


            <input

              type="
                text
              "

              placeholder="
                Contoh: Pisahkan es
              "

              value={
                notes
              }

              onChange={
                (
                  e
                ) =>

                  setNotes(
                    e.target.value
                  )
              }

              disabled={
                loading
              }

              className="
                w-full
                bg-[#18120d]
                border
                border-[#d4af37]/30
                rounded-xl
                px-3.5
                py-2
                text-sm
                text-white
                placeholder-[#605448]
              "

            />


          </div>


        </div>


        {/* FOOTER */}

        <div

          className="
            p-6
            border-t
            border-[#2a2018]
            bg-[#120d09]/90
            flex
            items-center
            justify-between
            gap-4
          "

        >


          <div>


            <div

              className="
                text-[11px]
                text-[#8e8072]
                space-y-0.5
                mb-1
              "

            >


              <div>

                Produk{' '}

                {formattedSubtotal}

              </div>


              {

                activeShippingFee >
                0 && (

                  <div>

                    Ongkir{' '}

                    {formattedShippingFee}

                  </div>

                )

              }


            </div>


            <span

              className="
                text-[11px]
                text-[#8e8072]
                uppercase
                block
              "

            >

              Total Bayar

            </span>


            <span

              className="
                font-display
                text-2xl
                font-bold
                gold-gradient-text
              "

            >

              {formattedTotalPrice}

            </span>


          </div>


          <button

            type="
              button
            "

            onClick={
              handleCheckoutXendit
            }

            disabled={
              loading
            }

            className="
              gold-gradient-btn
              px-6
              py-3
              rounded-xl
              font-bold
              text-sm
              flex
              items-center
              gap-2
              shadow-lg
              disabled:opacity-50
              disabled:cursor-not-allowed
            "

          >


            {

              loading

                ? (

                  <>

                    <Loader2
                      className="
                        w-4
                        h-4
                        text-black
                        animate-spin
                      "
                    />

                    <span>
                      Memproses...
                    </span>

                  </>

                )

                : (

                  <>

                    <CreditCard
                      className="
                        w-4
                        h-4
                        text-black
                      "
                    />

                    <span>
                      Bayar Sekarang
                    </span>

                  </>

                )

            }


          </button>


        </div>


      </div>


    </div>

  );

};
