import React, {
  useState
} from 'react';

import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';

import {
  supabase
} from '../lib/supabase';


interface CustomerAuthProps {
  open: boolean;
  onClose: () => void;
}


export const CustomerAuth:
React.FC<CustomerAuthProps> = ({
  open,
  onClose
}) => {

  /* =========================================================
     MODE
     ========================================================= */

  const [
    mode,
    setMode
  ] =
    useState<
      'login' |
      'register'
    >(
      'login'
    );


  /* =========================================================
     FORM STATE
     ========================================================= */

  const [
    fullName,
    setFullName
  ] =
    useState(
      ''
    );


  const [
    email,
    setEmail
  ] =
    useState(
      ''
    );


  const [
    phone,
    setPhone
  ] =
    useState(
      ''
    );


  const [
    address,
    setAddress
  ] =
    useState(
      ''
    );


  const [
    password,
    setPassword
  ] =
    useState(
      ''
    );


  /* =========================================================
     UI STATE
     ========================================================= */

  const [
    loading,
    setLoading
  ] =
    useState(
      false
    );


  const [
    message,
    setMessage
  ] =
    useState(
      ''
    );


  const [
    error,
    setError
  ] =
    useState(
      ''
    );


  /* =========================================================
     RESET FEEDBACK
     ========================================================= */

  const resetFeedback =
    () => {

      setMessage(
        ''
      );

      setError(
        ''
      );
    };


  /* =========================================================
     LOGIN
     ========================================================= */

  const handleLogin =
  async () => {

    resetFeedback();


    if (
      !email.trim() ||
      !password.trim()
    ) {

      setError(
        'Email dan password wajib diisi.'
      );

      return;
    }


    setLoading(
      true
    );


    try {

      const {
        error:
          loginError
      } =
        await supabase
          .auth
          .signInWithPassword({

            email:
              email
                .trim()
                .toLowerCase(),

            password:
              password

          });


      if (
        loginError
      ) {

        throw loginError;
      }


      setMessage(
        'Login berhasil.'
      );


      setTimeout(
        () => {

          onClose();

        },
        600
      );


    } catch (
      err:
        any
    ) {

      console.error(
        'Login error:',
        err
      );


      setError(
        err?.message ||
        'Login gagal.'
      );


    } finally {

      setLoading(
        false
      );

    }
  };


  /* =========================================================
     REGISTER
     ========================================================= */

  const handleRegister =
  async () => {

    resetFeedback();


    /* =======================================================
       VALIDATION
       ======================================================= */

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !password.trim()
    ) {

      setError(
        'Semua data wajib diisi.'
      );

      return;
    }


    if (
      password.length <
      6
    ) {

      setError(
        'Password minimal 6 karakter.'
      );

      return;
    }


    setLoading(
      true
    );


    try {

      /* =====================================================
         CREATE CUSTOMER IN SUPABASE AUTH
         ===================================================== */

      const {
        data,
        error:
          registerError
      } =
        await supabase
          .auth
          .signUp({

            email:
              email
                .trim()
                .toLowerCase(),

            password:
              password,

            options: {

              data: {

                full_name:
                  fullName.trim(),

                phone:
                  phone.trim(),

                address:
                  address.trim()

              }

            }

          });


      if (
        registerError
      ) {

        throw registerError;
      }


      if (
        !data.user
      ) {

        throw new Error(
          'User tidak berhasil dibuat.'
        );
      }


      /* =====================================================
         REGISTER SUCCESS
         ===================================================== */

      if (
        data.session
      ) {

        setMessage(
          'Pendaftaran berhasil. Selamat datang di Arume Coffee!'
        );


        setTimeout(
          () => {

            onClose();

          },
          1000
        );

      } else {

        /*
         * Kalau Email Confirmation Supabase aktif,
         * session belum diberikan sampai customer
         * melakukan konfirmasi email.
         */

        setMessage(
          'Pendaftaran berhasil. Silakan cek email untuk konfirmasi akun.'
        );

      }


      /* =====================================================
         CLEAR REGISTER DATA
         ===================================================== */

      setFullName(
        ''
      );

      setPhone(
        ''
      );

      setAddress(
        ''
      );

      setPassword(
        ''
      );


    } catch (
      err:
        any
    ) {

      console.error(
        'Register error:',
        err
      );


      let errorMessage =
        err?.message ||
        'Pendaftaran gagal.';


      if (
        errorMessage
          .toLowerCase()
          .includes(
            'already registered'
          )
      ) {

        errorMessage =
          'Email ini sudah terdaftar. Silakan masuk menggunakan akun kamu.';
      }


      setError(
        errorMessage
      );


    } finally {

      setLoading(
        false
      );

    }
  };


  /* =========================================================
     FORM SUBMIT
     ========================================================= */

  const handleSubmit =
  async (
    e:
      React.FormEvent
  ) => {

    e.preventDefault();


    /* LOGIN */

    if (
      mode ===
      'login'
    ) {

      await handleLogin();

      return;
    }


    /* REGISTER */

    await handleRegister();
  };


  /* =========================================================
     DON'T RENDER WHEN CLOSED
     ========================================================= */

  if (
    !open
  ) {

    return null;
  }


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div
      className="
        fixed
        inset-0
        z-[120]
        bg-black/80
        backdrop-blur-md
        flex
        items-center
        justify-center
        px-4
      "
    >

      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-[#d4af37]/30
          bg-[#120e0b]
          shadow-2xl
          shadow-black/70
          overflow-hidden
        "
      >

        {/* ===================================================
            HEADER
            =================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
            border-[#2a2018]
          "
        >

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-[#d4af37]
                font-bold
              "
            >
              Arume Coffee
            </p>

            <h2
              className="
                text-2xl
                font-bold
                text-white
                mt-1
              "
            >
              {
                mode ===
                'login'
                  ? 'Masuk Akun'
                  : 'Daftar Akun'
              }
            </h2>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              loading
            }
            className="
              w-9
              h-9
              rounded-full
              border
              border-[#d4af37]/30
              bg-[#1c1510]
              flex
              items-center
              justify-center
              text-[#d4af37]
              hover:bg-[#d4af37]
              hover:text-black
              transition
            "
          >

            <X
              className="
                w-5
                h-5
              "
            />

          </button>

        </div>


        {/* ===================================================
            FORM
            =================================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            p-6
            space-y-4
          "
        >

          {/* =================================================
              REGISTER ONLY FIELDS
              ================================================= */}

          {
            mode ===
            'register' && (

              <>

                {/* NAME */}

                <div
                  className="
                    relative
                  "
                >

                  <User
                    className="
                      absolute
                      left-3
                      top-3
                      w-4
                      h-4
                      text-[#8e8072]
                    "
                  />

                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={
                      fullName
                    }
                    onChange={
                      e =>
                        setFullName(
                          e.target.value
                        )
                    }
                    disabled={
                      loading
                    }
                    autoComplete="name"
                    className="
                      w-full
                      pl-10
                      pr-4
                      py-2.5
                      rounded-xl
                      bg-[#18120d]
                      border
                      border-[#d4af37]/30
                      text-white
                      placeholder-[#6f6358]
                      focus:outline-none
                      focus:border-[#d4af37]
                    "
                  />

                </div>


                {/* PHONE */}

                <div
                  className="
                    relative
                  "
                >

                  <Phone
                    className="
                      absolute
                      left-3
                      top-3
                      w-4
                      h-4
                      text-[#8e8072]
                    "
                  />

                  <input
                    type="tel"
                    placeholder="Nomor WhatsApp"
                    value={
                      phone
                    }
                    onChange={
                      e =>
                        setPhone(
                          e.target.value
                        )
                    }
                    disabled={
                      loading
                    }
                    autoComplete="tel"
                    className="
                      w-full
                      pl-10
                      pr-4
                      py-2.5
                      rounded-xl
                      bg-[#18120d]
                      border
                      border-[#d4af37]/30
                      text-white
                      placeholder-[#6f6358]
                      focus:outline-none
                      focus:border-[#d4af37]
                    "
                  />

                </div>


                {/* ADDRESS */}

                <div
                  className="
                    relative
                  "
                >

                  <MapPin
                    className="
                      absolute
                      left-3
                      top-3
                      w-4
                      h-4
                      text-[#8e8072]
                    "
                  />

                  <textarea
                    placeholder="Alamat"
                    value={
                      address
                    }
                    onChange={
                      e =>
                        setAddress(
                          e.target.value
                        )
                    }
                    disabled={
                      loading
                    }
                    rows={
                      3
                    }
                    autoComplete="street-address"
                    className="
                      w-full
                      pl-10
                      pr-4
                      py-2.5
                      rounded-xl
                      bg-[#18120d]
                      border
                      border-[#d4af37]/30
                      text-white
                      placeholder-[#6f6358]
                      focus:outline-none
                      focus:border-[#d4af37]
                      resize-none
                    "
                  />

                </div>

              </>

            )
          }


          {/* =================================================
              EMAIL
              ================================================= */}

          <div
            className="
              relative
            "
          >

            <Mail
              className="
                absolute
                left-3
                top-3
                w-4
                h-4
                text-[#8e8072]
              "
            />

            <input
              type="email"
              placeholder="Email"
              value={
                email
              }
              onChange={
                e =>
                  setEmail(
                    e.target.value
                  )
              }
              disabled={
                loading
              }
              autoComplete="email"
              className="
                w-full
                pl-10
                pr-4
                py-2.5
                rounded-xl
                bg-[#18120d]
                border
                border-[#d4af37]/30
                text-white
                placeholder-[#6f6358]
                focus:outline-none
                focus:border-[#d4af37]
              "
            />

          </div>


          {/* =================================================
              PASSWORD
              ================================================= */}

          <div
            className="
              relative
            "
          >

            <Lock
              className="
                absolute
                left-3
                top-3
                w-4
                h-4
                text-[#8e8072]
              "
            />

            <input
              type="password"
              placeholder="Password"
              value={
                password
              }
              onChange={
                e =>
                  setPassword(
                    e.target.value
                  )
              }
              disabled={
                loading
              }
              autoComplete={
                mode ===
                'login'
                  ? 'current-password'
                  : 'new-password'
              }
              className="
                w-full
                pl-10
                pr-4
                py-2.5
                rounded-xl
                bg-[#18120d]
                border
                border-[#d4af37]/30
                text-white
                placeholder-[#6f6358]
                focus:outline-none
                focus:border-[#d4af37]
              "
            />

          </div>


          {/* =================================================
              ERROR
              ================================================= */}

          {
            error && (

              <div
                className="
                  rounded-xl
                  border
                  border-red-500/30
                  bg-red-950/20
                  px-4
                  py-3
                  text-sm
                  text-red-300
                "
              >
                {error}
              </div>

            )
          }


          {/* =================================================
              SUCCESS
              ================================================= */}

          {
            message && (

              <div
                className="
                  rounded-xl
                  border
                  border-emerald-500/30
                  bg-emerald-950/20
                  px-4
                  py-3
                  text-sm
                  text-emerald-300
                "
              >
                {message}
              </div>

            )
          }


          {/* =================================================
              SUBMIT
              ================================================= */}

          <button
            type="submit"
            disabled={
              loading
            }
            className="
              w-full
              py-3
              rounded-xl
              bg-[#d4af37]
              hover:bg-[#e3c45b]
              text-black
              font-bold
              transition
              flex
              items-center
              justify-center
              gap-2
              disabled:opacity-50
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
                        animate-spin
                      "
                    />

                    Memproses...

                  </>

                )
                : mode ===
                  'login'
                    ? 'Masuk'
                    : 'Daftar'
            }

          </button>


          {/* =================================================
              CHANGE MODE
              ================================================= */}

          <button
            type="button"
            onClick={
              () => {

                resetFeedback();

                setMode(
                  mode ===
                  'login'
                    ? 'register'
                    : 'login'
                );

              }
            }
            disabled={
              loading
            }
            className="
              w-full
              text-sm
              text-[#b8a898]
              hover:text-[#d4af37]
              transition
            "
          >

            {
              mode ===
              'login'
                ? 'Belum punya akun? Daftar'
                : 'Sudah punya akun? Masuk'
            }

          </button>

        </form>

      </div>

    </div>
  );
};
