import React, {
  useEffect,
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
  Store,
  Truck,
  RefreshCcw
} from 'lucide-react';

import {
  CoffeeMenuItem
} from '../types';


/* =========================================================
   API
   ========================================================= */

const API_BASE_URL =
  'https://arume-coffee-api-2.diyanaxl.workers.dev';


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
   SHIPPING RATE TYPE
   ========================================================= */

interface ShippingRate {

  id: number;

  min_distance: number;

  max_distance: number;

  fee: number;

  active: boolean;
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

  onClose

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
     DELIVERY MODE
     ========================================================= */

  const [
    deliveryEnabled,
    setDeliveryEnabled
  ] =
    useState(
      false
    );


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
    shippingRates,
    setShippingRates
  ] =
    useState<ShippingRate[]>(
      []
    );


  const [
    shippingLoading,
    setShippingLoading
  ] =
    useState(
      false
    );


  const [
    shippingError,
    setShippingError
  ] =
    useState(
      ''
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
     CHECKOUT LOADING
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
     LOAD SHIPPING RATES
     ========================================================= */

  const loadShippingRates =
    async () => {

      setShippingLoading(
        true
      );


      setShippingError(
        ''
      );


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/shipping`
          );


        const result =
          await response.json();


        if (
          !response.ok
        ) {

          throw new Error(
            result?.message ||
            'Gagal mengambil tarif ongkir.'
          );
        }


        const rawRates =
          result?.data
            ?.shipping_rates ||

          result?.data
            ?.rates ||

          result?.shipping_rates ||

          result?.rates ||

          [];


        const normalizedRates:
          ShippingRate[] =
            Array.isArray(
              rawRates
            )
              ? rawRates
                  .map(
                    (
                      rate:
                      any
                    ) => ({
                      id:
                        Number(
                          rate.id
                        ),

                      min_distance:
                        Number(
                          rate.min_distance
                        ),

                      max_distance:
                        Number(
                          rate.max_distance
                        ),

                      fee:
                        Number(
                          rate.fee
                        ),

                      active:
                        rate.active !==
                        false
                    })
                  )
                  .filter(
                    rate =>
                      Number.isFinite(
                        rate.min_distance
                      ) &&
                      Number.isFinite(
                        rate.max_distance
                      ) &&
                      Number.isFinite(
                        rate.fee
                      ) &&
                      rate.active
                  )
                  .sort(
                    (
                      a,
                      b
                    ) =>
                      a.max_distance -
                      b.max_distance
                  )
              : [];


        setShippingRates(
          normalizedRates
        );


      } catch (
        error
      ) {

        console.error(
          'Load shipping rates error:',
          error
        );


        setShippingRates(
          []
        );


        setShippingError(
          'Tarif ongkir belum dapat dimuat.'
        );


      } finally {

        setShippingLoading(
          false
        );

      }
    };


  useEffect(
    () => {

      loadShippingRates();

    },
    []
  );


  /* =========================================================
     RESET LOCATION IF DELIVERY OFF
     ========================================================= */

  const selectPickup =
    () => {

      setDeliveryEnabled(
        false
      );


      setCustomerLatitude(
        null
      );


      setCustomerLongitude(
        null
      );


      setDistanceKm(
        null
      );


      setShippingFee(
        0
      );


      setDeliveryAvailable(
        true
      );
    };


  const selectDelivery =
    () => {

      setDeliveryEnabled(
        true
      );


      setDeliveryAvailable(
        true
      );
    };


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
        ) ** 2 +

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
        ) ** 2;


      const c =

        2 *

        Math.atan2(

          Math.sqrt(
            a
          ),

          Math.sqrt(
            1 -
            a
          )

        );


      return (
        earthRadius *
        c
      );
    };


  /* =========================================================
     FIND SHIPPING FEE
     ========================================================= */

  const calculateShippingFee =
    (
      distance: number
    ) => {

      const sortedRates =
        [
          ...shippingRates
        ].sort(
          (
            a,
            b
          ) =>
            Number(
              a.max_distance
            ) -
            Number(
              b.max_distance
            )
        );


      /*
       * Kita urutkan max_distance.
       *
       * Contoh:
       * 0 - 2
       * 2 - 5
       *
       * Jarak tepat 2 KM
       * akan mengambil rate pertama.
       */

      const matchedRate =
        sortedRates.find(
          rate => {

            const min =
              Number(
                rate.min_distance
              );


            const max =
              Number(
                rate.max_distance
              );


            return (
              distance >=
              min
            ) &&
            (
              distance <=
              max
            );
          }
        );


      if (
        !matchedRate
      ) {

        return null;
      }


      return Number(
        matchedRate.fee
      );
    };


  /* =========================================================
     GET CUSTOMER LOCATION
     ========================================================= */

  const handleGetLocation =
    () => {

      if (
        !deliveryEnabled
      ) {

        return;
      }


      if (
        shippingRates.length ===
        0
      ) {

        alert(
          'Tarif ongkir belum tersedia. Silakan coba refresh tarif terlebih dahulu.'
        );

        return;
      }


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
                100
              ) /
              100;


            setDistanceKm(
              roundedDistance
            );


            const fee =
              calculateShippingFee(
                roundedDistance
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


            let message =
              'Lokasi tidak dapat diakses. Pastikan izin lokasi browser sudah aktif.';


            if (
              error.code ===
              error.PERMISSION_DENIED
            ) {

              message =
                'Izin lokasi ditolak. Silakan aktifkan izin lokasi pada browser lalu coba lagi.';
            }


            if (
              error.code ===
              error.POSITION_UNAVAILABLE
            ) {

              message =
                'Lokasi saat ini tidak dapat ditemukan. Silakan coba kembali.';
            }


            if (
              error.code ===
              error.TIMEOUT
            ) {

              message =
                'Pencarian lokasi terlalu lama. Silakan coba kembali.';
            }


            alert(
              message
            );

          },


          {

            enableHighAccuracy:
              true,

            timeout:
              10000,

            maximumAge:
              30000

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

    Number(
      item.price
    ) *
    quantity;


  const activeShippingFee =

    deliveryEnabled &&
    distanceKm !== null &&
    deliveryAvailable

      ? shippingFee

      : 0;


  /*
   * Ini hanya ESTIMASI tampilan.
   *
   * Backend tetap menghitung ulang
   * harga produk + ongkir.
   */

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
         CUSTOMER VALIDATION
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
         DELIVERY VALIDATION
         ===================================================== */

      if (
        deliveryEnabled
      ) {


        if (
          !deliveryAddress.trim()
        ) {

          alert(
            'Mohon isi alamat pengiriman terlebih dahulu.'
          );

          return;
        }


        if (
          customerLatitude ===
            null ||
          customerLongitude ===
            null
        ) {

          alert(
            'Mohon tekan "Gunakan Lokasi Saya" untuk menghitung jarak dan ongkir.'
          );

          return;
        }


        if (
          distanceKm ===
            null
        ) {

          alert(
            'Jarak pengiriman belum tersedia. Silakan cek lokasi terlebih dahulu.'
          );

          return;
        }


        if (
          !deliveryAvailable
        ) {

          alert(
            'Lokasi pengiriman berada di luar jangkauan Arume Coffee.'
          );

          return;
        }

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
         GENERATE IDEMPOTENCY ID
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
           STEP 1 - CREATE ORDER
           =================================================== */

        const orderResponse =

          await fetch(

            `${API_BASE_URL}/api/orders`,

            {

              method:
                'POST',


              headers: {

                'Content-Type':
                  'application/json'

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
                      null

                  },


                  /* =========================================
                     DELIVERY

                     TIDAK mengirim shipping_fee.
                     TIDAK mengirim distance_km.

                     Backend menghitung ulang.
                     ========================================= */

                  delivery:

                    deliveryEnabled

                      ? {

                          enabled:
                            true,


                          type:
                            'delivery',


                          address:
                            deliveryAddress
                              .trim(),


                          latitude:
                            customerLatitude,


                          longitude:
                            customerLongitude

                        }

                      : {

                          enabled:
                            false,


                          type:
                            'pickup'

                        },


                  /* =========================================
                     ITEMS
                     ========================================= */

                  items: [

                    {

                      product_id:
                        item.id,


                      quantity:
                        quantity

                    }

                  ],


                  /* =========================================
                     NOTES
                     ========================================= */

                  notes:

                    `${iceLevel}, ${sugarLevel}${
                      notes.trim()

                        ? ` - ${notes.trim()}`

                        : ''
                    }`

                })

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
           CHECK HTTP ERROR
           =================================================== */

        if (
          !orderResponse.ok
        ) {

          throw new Error(

            orderResult
              ?.message ||

            orderResult
              ?.error ||

            orderResult
              ?.details ||

            'Gagal membuat pesanan.'

          );

        }


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


        /* ===================================================
           TRUSTED TOTAL FROM BACKEND
           =================================================== */

        const backendTotal =

          Number(

            orderResult?.data
              ?.total_amount ??

            orderResult
              ?.total_amount ??

            0

          );


        const backendShippingFee =

          Number(

            orderResult?.data
              ?.shipping_fee ??

            orderResult
              ?.shipping_fee ??

            0

          );


        console.log(
          'Order siap digunakan:',
          {
            orderNumber,
            backendTotal,
            backendShippingFee
          }
        );


        /* ===================================================
           STEP 2 - CREATE XENDIT PAYMENT
           =================================================== */

        const paymentResponse =

          await fetch(

            `${API_BASE_URL}/api/payment/create`,

            {

              method:
                'POST',


              headers: {

                'Content-Type':
                  'application/json'

              },


              body:
                JSON.stringify({

                  /*
                   * Nominal TIDAK dikirim.
                   *
                   * Backend payment.js akan
                   * mengambil orders.total_amount.
                   */

                  order_number:
                    orderNumber

                })

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


        if (
          !paymentResponse.ok
        ) {

          throw new Error(

            paymentResult
              ?.message ||

            paymentResult
              ?.error ||

            'Gagal membuat pembayaran Xendit.'

          );

        }


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
            ?.payment_url ||

          paymentResult
            ?.payment
            ?.redirect_url ||

          paymentResult
            ?.payment
            ?.payment_link_url;


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


        /* ===================================================
           RESET IDEMPOTENCY ONLY AFTER PAYMENT CREATED
           =================================================== */

        checkoutIdRef.current =
          null;


        /* ===================================================
           REDIRECT
           =================================================== */

        window.location.href =
          paymentUrl;


      } catch (
        error:
        any
      ) {


        console.error(
          'Checkout Xendit error:',
          error
        );


        /*
         * checkoutIdRef sengaja TIDAK
         * direset kalau error.
         *
         * Retry menggunakan checkout_id
         * yang sama sehingga tidak
         * membuat order duplicate.
         */

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

                type="text"

                placeholder="Nama Lengkap *"

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

                type="email"

                placeholder="Email (Opsional)"

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

              type="tel"

              placeholder="Nomor WhatsApp (Opsional)"

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


          {/* DELIVERY MODE */}

          <div

            className="
              space-y-4
              pt-3
              border-t
              border-[#2a2018]
            "

          >


            <div>

              <span

                className="
                  text-xs
                  font-bold
                  text-[#d4af37]
                  uppercase
                  tracking-wider
                "

              >

                Metode Pengambilan

              </span>


              <p
                className="
                  text-xs
                  text-[#8e8072]
                  mt-1
                "
              >

                Pilih ambil sendiri atau dikirim ke lokasi Anda.

              </p>

            </div>


            {/* MODE BUTTONS */}

            <div
              className="
                grid
                grid-cols-2
                gap-3
              "
            >


              <button

                type="button"

                onClick={
                  selectPickup
                }

                disabled={
                  loading
                }

                className={`
                  rounded-2xl
                  p-4
                  border
                  transition-all
                  text-left
                  ${
                    !deliveryEnabled
                      ? 'border-[#d4af37] bg-[#d4af37]/10'
                      : 'border-[#382d24] bg-[#18120d]'
                  }
                `}

              >

                <Store
                  className={`
                    w-5
                    h-5
                    mb-2
                    ${
                      !deliveryEnabled
                        ? 'text-[#d4af37]'
                        : 'text-[#8e8072]'
                    }
                  `}
                />


                <p
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Ambil Sendiri
                </p>


                <p
                  className="
                    text-[11px]
                    text-[#8e8072]
                    mt-1
                  "
                >
                  Tanpa ongkir
                </p>

              </button>


              <button

                type="button"

                onClick={
                  selectDelivery
                }

                disabled={
                  loading
                }

                className={`
                  rounded-2xl
                  p-4
                  border
                  transition-all
                  text-left
                  ${
                    deliveryEnabled
                      ? 'border-[#d4af37] bg-[#d4af37]/10'
                      : 'border-[#382d24] bg-[#18120d]'
                  }
                `}

              >

                <Truck
                  className={`
                    w-5
                    h-5
                    mb-2
                    ${
                      deliveryEnabled
                        ? 'text-[#d4af37]'
                        : 'text-[#8e8072]'
                    }
                  `}
                />


                <p
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Delivery
                </p>


                <p
                  className="
                    text-[11px]
                    text-[#8e8072]
                    mt-1
                  "
                >
                  Ongkir berdasarkan jarak
                </p>

              </button>


            </div>


            {/* PICKUP INFO */}

            {
              !deliveryEnabled && (

                <div
                  className="
                    rounded-xl
                    bg-[#18120d]
                    border
                    border-[#30261e]
                    p-3.5
                  "
                >

                  <div
                    className="
                      flex
                      gap-3
                      items-start
                    "
                  >

                    <Store
                      className="
                        w-4
                        h-4
                        text-[#d4af37]
                        mt-0.5
                        shrink-0
                      "
                    />


                    <div>

                      <p
                        className="
                          text-xs
                          text-white
                          font-semibold
                        "
                      >
                        {storeLocation.name}
                      </p>


                      <p
                        className="
                          text-[11px]
                          text-[#8e8072]
                          mt-1
                          leading-relaxed
                        "
                      >
                        {storeLocation.address}
                      </p>

                    </div>

                  </div>

                </div>

              )
            }


            {/* DELIVERY FORM */}

            {
              deliveryEnabled && (

                <div
                  className="
                    space-y-3
                  "
                >


                  <textarea

                    placeholder="Alamat lengkap pengiriman *"

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
                      3
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


                  {
                    shippingError && (

                      <div
                        className="
                          rounded-xl
                          bg-red-950/20
                          border
                          border-red-500/20
                          p-3
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-red-300
                          "
                        >
                          {shippingError}
                        </p>


                        <button

                          type="button"

                          onClick={
                            loadShippingRates
                          }

                          disabled={
                            shippingLoading
                          }

                          className="
                            mt-2
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            text-[#d4af37]
                            font-semibold
                          "

                        >

                          <RefreshCcw
                            className={`
                              w-3.5
                              h-3.5
                              ${
                                shippingLoading
                                  ? 'animate-spin'
                                  : ''
                              }
                            `}
                          />

                          Coba Lagi

                        </button>

                      </div>

                    )
                  }


                  <button

                    type="button"

                    onClick={
                      handleGetLocation
                    }

                    disabled={
                      loading ||
                      locationLoading ||
                      shippingLoading ||
                      shippingRates.length ===
                        0
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

                        : shippingLoading

                          ? (

                            <>

                              <Loader2
                                className="
                                  w-4
                                  h-4
                                  animate-spin
                                "
                              />

                              Memuat ongkir...

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

                              {
                                distanceKm !==
                                null
                                  ? 'Perbarui Lokasi Saya'
                                  : 'Gunakan Lokasi Saya'
                              }

                            </>

                          )
                    }


                  </button>


                  {/* LOCATION RESULT */}

                  {
                    distanceKm !==
                    null && (

                      <div

                        className="
                          bg-[#18120d]
                          rounded-xl
                          border
                          border-[#d4af37]/20
                          p-3.5
                          space-y-2.5
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
                            Jarak estimasi
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

                              <>

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
                                    Estimasi ongkir
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


                                <p
                                  className="
                                    text-[10px]
                                    text-[#6f6358]
                                    leading-relaxed
                                    pt-1
                                  "
                                >
                                  Total final akan diverifikasi kembali oleh server saat pesanan dibuat.
                                </p>

                              </>

                            )

                            : (

                              <div
                                className="
                                  rounded-lg
                                  bg-red-950/20
                                  border
                                  border-red-500/20
                                  p-2.5
                                "
                              >

                                <p

                                  className="
                                    text-xs
                                    text-red-400
                                    font-semibold
                                  "

                                >

                                  Lokasi berada di luar jangkauan pengiriman.

                                </p>


                                <button

                                  type="button"

                                  onClick={
                                    selectPickup
                                  }

                                  className="
                                    text-xs
                                    text-[#d4af37]
                                    font-semibold
                                    mt-2
                                  "

                                >

                                  Ganti ke Ambil Sendiri

                                </button>

                              </div>

                            )
                        }


                      </div>

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

                type="button"

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

                type="button"

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
                  value="Es Normal"
                >
                  Es Normal
                </option>

                <option
                  value="Less Ice"
                >
                  Less Ice
                </option>

                <option
                  value="No Ice"
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
                  value="Gula Normal"
                >
                  Normal
                </option>

                <option
                  value="Less Sugar"
                >
                  Less Sugar
                </option>

                <option
                  value="Extra Sweet"
                >
                  Extra Sweet
                </option>

                <option
                  value="No Sugar"
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

              type="text"

              placeholder="Contoh: Pisahkan es"

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
                deliveryEnabled && (

                  <div>

                    Ongkir{' '}

                    {
                      distanceKm ===
                      null

                        ? 'Belum dihitung'

                        : deliveryAvailable

                          ? formattedShippingFee

                          : 'Di luar jangkauan'
                    }

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

              {
                deliveryEnabled
                  ? 'Estimasi Total'
                  : 'Total Bayar'
              }

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

            type="button"

            onClick={
              handleCheckoutXendit
            }

            disabled={
              loading ||
              (
                deliveryEnabled &&
                !deliveryAvailable
              )
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
