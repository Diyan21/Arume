// src/admin/AdminWhatsApp.tsx

import React, {
  useMemo,
  useState
} from 'react';

import {
  CheckCheck,
  Clock3,
  MessageCircle,
  MoreVertical,
  Phone,
  RefreshCcw,
  Search,
  Send,
  UserRound
} from 'lucide-react';


/* =========================================================
   TYPES
   ========================================================= */

type AdminWhatsAppProps = {
  secret: string;
};


type Conversation = {
  id: string;
  customerName: string;
  phone: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
};


type ChatMessage = {
  id: string;
  direction:
    | 'incoming'
    | 'outgoing';

  message: string;

  createdAt: string;

  status?:
    | 'sent'
    | 'delivered'
    | 'read';
};


/* =========================================================
   PLACEHOLDER DATA

   Nanti bagian ini dihapus setelah backend
   WhatsApp + Supabase sudah tersambung.
   ========================================================= */

const PLACEHOLDER_CONVERSATIONS:
  Conversation[] = [];


const PLACEHOLDER_MESSAGES:
  Record<
    string,
    ChatMessage[]
  > = {};


/* =========================================================
   FORMAT TIME
   ========================================================= */

const formatTime = (
  value:
    string
) => {

  if (
    !value
  ) {

    return '';
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return '';
  }


  return new Intl.DateTimeFormat(
    'id-ID',
    {
      hour:
        '2-digit',

      minute:
        '2-digit'
    }
  ).format(
    date
  );
};


/* =========================================================
   FORMAT DATE
   ========================================================= */

const formatChatDate = (
  value:
    string
) => {

  if (
    !value
  ) {

    return '';
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return '';
  }


  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day:
        'numeric',

      month:
        'short',

      year:
        'numeric'
    }
  ).format(
    date
  );
};


/* =========================================================
   COMPONENT
   ========================================================= */

export function AdminWhatsApp({
  secret
}: AdminWhatsAppProps) {


  /* =========================================================
     STATE
     ========================================================= */

  const [
    conversations,
    setConversations
  ] =
    useState<Conversation[]>(
      PLACEHOLDER_CONVERSATIONS
    );


  const [
    messages
  ] =
    useState<
      Record<
        string,
        ChatMessage[]
      >
    >(
      PLACEHOLDER_MESSAGES
    );


  const [
    selectedConversationId,
    setSelectedConversationId
  ] =
    useState<string | null>(
      null
    );


  const [
    search,
    setSearch
  ] =
    useState(
      ''
    );


  const [
    messageInput,
    setMessageInput
  ] =
    useState(
      ''
    );


  const [
    refreshing,
    setRefreshing
  ] =
    useState(
      false
    );


  /* =========================================================
     CURRENT CONVERSATION
     ========================================================= */

  const selectedConversation =
    useMemo(
      () => {

        return conversations.find(
          conversation =>
            conversation.id ===
            selectedConversationId
        ) || null;

      },
      [
        conversations,
        selectedConversationId
      ]
    );


  /* =========================================================
     CURRENT MESSAGES
     ========================================================= */

  const currentMessages =
    selectedConversationId
      ? messages[
          selectedConversationId
        ] || []
      : [];


  /* =========================================================
     FILTER CONVERSATIONS
     ========================================================= */

  const filteredConversations =
    useMemo(
      () => {

        const keyword =
          search
            .trim()
            .toLowerCase();


        if (
          !keyword
        ) {

          return conversations;
        }


        return conversations.filter(
          conversation => {

            return (
              conversation.customerName
                .toLowerCase()
                .includes(
                  keyword
                ) ||

              conversation.phone
                .toLowerCase()
                .includes(
                  keyword
                ) ||

              conversation.lastMessage
                .toLowerCase()
                .includes(
                  keyword
                )
            );

          }
        );

      },
      [
        conversations,
        search
      ]
    );


  /* =========================================================
     SELECT CONVERSATION
     ========================================================= */

  const selectConversation =
    (
      conversation:
        Conversation
    ) => {

      setSelectedConversationId(
        conversation.id
      );


      /*
       * Untuk sementara kita nol-kan unread
       * secara lokal.
       *
       * Nanti backend akan update status read.
       */

      setConversations(
        current =>
          current.map(
            item =>
              item.id ===
              conversation.id
                ? {
                    ...item,
                    unread:
                      0
                  }
                : item
          )
      );
    };


  /* =========================================================
     REFRESH

     Belum hit API.
     Nanti akan diganti load conversations dari Worker.
     ========================================================= */

  const handleRefresh =
    async () => {

      if (
        refreshing
      ) {

        return;
      }


      setRefreshing(
        true
      );


      try {

        /*
         * Placeholder.
         *
         * Nanti:
         *
         * GET /api/admin/whatsapp/conversations
         *
         * headers:
         * X-ADMIN-SECRET: secret
         */

        await new Promise(
          resolve =>
            window.setTimeout(
              resolve,
              500
            )
        );


        console.log(
          'WhatsApp refresh placeholder',
          {
            authenticated:
              Boolean(
                secret
              )
          }
        );


      } finally {

        setRefreshing(
          false
        );
      }
    };


  /* =========================================================
     SEND MESSAGE

     Sengaja belum mengirim ke Meta.
     Backend belum tersedia.
     ========================================================= */

  const handleSendMessage =
    () => {

      const normalized =
        messageInput
          .trim();


      if (
        !normalized ||
        !selectedConversation
      ) {

        return;
      }


      window.alert(
        'Backend WhatsApp belum tersambung. Setelah webhook dan Cloud API selesai dibuat, tombol Kirim akan aktif.'
      );
    };


  /* =========================================================
     UI
     ========================================================= */

  return (

    <section>


      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
          mb-6
        "
      >

        <div>

          <h2
            className="
              text-3xl
              font-bold
            "
          >
            WhatsApp
          </h2>


          <p
            className="
              text-[#ad9f91]
              mt-1
            "
          >
            Inbox WhatsApp customer Arume Coffee.
          </p>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-amber-500/30
              bg-amber-950/20
              px-4
              py-2.5
              text-sm
              text-amber-300
            "
          >

            <span
              className="
                w-2
                h-2
                rounded-full
                bg-amber-400
              "
            />

            Menunggu Meta

          </div>


          <button
            type="button"

            onClick={
              handleRefresh
            }

            disabled={
              refreshing
            }

            className="
              w-11
              h-11
              rounded-xl
              border
              border-[#3b3026]
              bg-[#17110d]
              flex
              items-center
              justify-center
              hover:border-[#d4af37]
              disabled:opacity-50
              transition
            "
          >

            <RefreshCcw
              className={`
                w-4
                h-4

                ${
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              `}
            />

          </button>

        </div>

      </div>


      {/* =====================================================
          MAIN INBOX
          ===================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-[#302820]
          bg-[#13100d]
          overflow-hidden
          min-h-[620px]
        "
      >

        <div
          className="
            grid
            md:grid-cols-[330px_1fr]
            min-h-[620px]
          "
        >


          {/* =================================================
              LEFT SIDEBAR
              ================================================= */}

          <aside
            className="
              border-b
              md:border-b-0
              md:border-r
              border-[#302820]
              bg-[#100c09]
            "
          >


            {/* SEARCH */}

            <div
              className="
                p-4
                border-b
                border-[#302820]
              "
            >

              <div
                className="
                  relative
                "
              >

                <Search
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-[#6f6257]
                  "
                />


                <input
                  type="text"

                  value={
                    search
                  }

                  onChange={
                    event =>
                      setSearch(
                        event.target.value
                      )
                  }

                  placeholder="
                    Cari customer...
                  "

                  className="
                    w-full
                    h-11
                    rounded-xl
                    border
                    border-[#382e25]
                    bg-[#0a0806]
                    pl-10
                    pr-4
                    text-sm
                    text-[#f3ece2]
                    placeholder:text-[#625548]
                    outline-none
                    focus:border-[#d4af37]
                    transition
                  "
                />

              </div>

            </div>


            {/* CONVERSATION TITLE */}

            <div
              className="
                px-4
                pt-4
                pb-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    font-bold
                    text-[#8f8377]
                  "
                >
                  Percakapan
                </p>


                <span
                  className="
                    text-xs
                    text-[#625548]
                  "
                >
                  {filteredConversations.length}
                </span>

              </div>

            </div>


            {/* CONVERSATIONS */}

            <div
              className="
                max-h-[500px]
                overflow-y-auto
              "
            >

              {filteredConversations.length ===
              0 ? (

                <div
                  className="
                    px-6
                    py-16
                    text-center
                  "
                >

                  <div
                    className="
                      w-12
                      h-12
                      mx-auto
                      rounded-xl
                      border
                      border-[#302820]
                      bg-[#17110d]
                      flex
                      items-center
                      justify-center
                      mb-4
                    "
                  >

                    <MessageCircle
                      className="
                        w-6
                        h-6
                        text-[#625548]
                      "
                    />

                  </div>


                  <p
                    className="
                      text-sm
                      font-bold
                      text-[#ad9f91]
                    "
                  >
                    Belum ada chat
                  </p>


                  <p
                    className="
                      text-xs
                      leading-5
                      text-[#6f6257]
                      mt-2
                    "
                  >
                    Pesan customer akan muncul
                    setelah webhook Meta aktif.
                  </p>

                </div>

              ) : (

                filteredConversations.map(
                  conversation => {

                    const active =
                      selectedConversationId ===
                      conversation.id;


                    return (

                      <button
                        key={
                          conversation.id
                        }

                        type="button"

                        onClick={() =>
                          selectConversation(
                            conversation
                          )
                        }

                        className={`
                          w-full
                          px-4
                          py-4
                          border-b
                          border-[#282018]
                          text-left
                          transition

                          ${
                            active
                              ? 'bg-[#21180f]'
                              : 'hover:bg-[#17110d]'
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            gap-3
                          "
                        >

                          {/* AVATAR */}

                          <div
                            className="
                              w-11
                              h-11
                              rounded-full
                              shrink-0
                              bg-[#d4af37]/10
                              border
                              border-[#d4af37]/20
                              flex
                              items-center
                              justify-center
                            "
                          >

                            <UserRound
                              className="
                                w-5
                                h-5
                                text-[#d4af37]
                              "
                            />

                          </div>


                          <div
                            className="
                              flex-1
                              min-w-0
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-2
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  font-bold
                                  truncate
                                "
                              >
                                {conversation.customerName}
                              </p>


                              <span
                                className="
                                  text-[10px]
                                  text-[#6f6257]
                                  shrink-0
                                "
                              >
                                {formatTime(
                                  conversation.lastMessageAt
                                )}
                              </span>

                            </div>


                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                mt-1
                              "
                            >

                              <p
                                className="
                                  flex-1
                                  min-w-0
                                  text-xs
                                  text-[#8f8377]
                                  truncate
                                "
                              >
                                {conversation.lastMessage}
                              </p>


                              {conversation.unread >
                              0 && (

                                <span
                                  className="
                                    min-w-5
                                    h-5
                                    px-1.5
                                    rounded-full
                                    bg-[#d4af37]
                                    text-black
                                    text-[10px]
                                    font-bold
                                    flex
                                    items-center
                                    justify-center
                                  "
                                >
                                  {conversation.unread}
                                </span>

                              )}

                            </div>

                          </div>

                        </div>

                      </button>

                    );
                  }
                )

              )}

            </div>

          </aside>


          {/* =================================================
              RIGHT CHAT
              ================================================= */}

          <div
            className="
              min-w-0
              flex
              flex-col
              bg-[#0b0806]
            "
          >

            {!selectedConversation ? (

              /* ===============================================
                 EMPTY CHAT
                 =============================================== */

              <div
                className="
                  flex-1
                  min-h-[500px]
                  flex
                  items-center
                  justify-center
                  p-8
                  text-center
                "
              >

                <div
                  className="
                    max-w-md
                  "
                >

                  <div
                    className="
                      w-20
                      h-20
                      mx-auto
                      rounded-3xl
                      border
                      border-[#d4af37]/20
                      bg-[#d4af37]/10
                      flex
                      items-center
                      justify-center
                      mb-6
                    "
                  >

                    <MessageCircle
                      className="
                        w-10
                        h-10
                        text-[#d4af37]
                      "
                    />

                  </div>


                  <h3
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    WhatsApp Inbox
                  </h3>


                  <p
                    className="
                      text-sm
                      leading-6
                      text-[#8f8377]
                      mt-3
                    "
                  >
                    Chat customer Arume Coffee
                    akan muncul di sini setelah
                    WhatsApp Cloud API dan webhook
                    tersambung.
                  </p>


                  <div
                    className="
                      mt-6
                      rounded-xl
                      border
                      border-[#302820]
                      bg-[#13100d]
                      p-4
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-amber-300
                      "
                    >

                      <Clock3
                        className="
                          w-4
                          h-4
                        "
                      />

                      <span
                        className="
                          text-sm
                          font-bold
                        "
                      >
                        Menunggu aktivasi Meta
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            ) : (

              <>
                {/* =============================================
                    CHAT HEADER
                    ============================================= */}

                <div
                  className="
                    min-h-[72px]
                    px-4
                    sm:px-5
                    border-b
                    border-[#302820]
                    bg-[#100c09]
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      min-w-0
                    "
                  >

                    <div
                      className="
                        w-11
                        h-11
                        rounded-full
                        shrink-0
                        bg-[#d4af37]/10
                        border
                        border-[#d4af37]/20
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <UserRound
                        className="
                          w-5
                          h-5
                          text-[#d4af37]
                        "
                      />

                    </div>


                    <div
                      className="
                        min-w-0
                      "
                    >

                      <p
                        className="
                          font-bold
                          truncate
                        "
                      >
                        {
                          selectedConversation.customerName
                        }
                      </p>


                      <div
                        className="
                          flex
                          items-center
                          gap-1.5
                          mt-1
                          text-xs
                          text-[#817468]
                        "
                      >

                        <Phone
                          className="
                            w-3
                            h-3
                          "
                        />

                        <span
                          className="
                            truncate
                          "
                        >
                          {
                            selectedConversation.phone
                          }
                        </span>

                      </div>

                    </div>

                  </div>


                  <button
                    type="button"

                    className="
                      w-10
                      h-10
                      rounded-xl
                      border
                      border-[#302820]
                      flex
                      items-center
                      justify-center
                      text-[#8f8377]
                      hover:text-[#d4af37]
                      hover:border-[#d4af37]/40
                      transition
                    "
                  >

                    <MoreVertical
                      className="
                        w-5
                        h-5
                      "
                    />

                  </button>

                </div>


                {/* =============================================
                    MESSAGES
                    ============================================= */}

                <div
                  className="
                    flex-1
                    min-h-[420px]
                    overflow-y-auto
                    px-4
                    sm:px-6
                    py-6
                    space-y-4
                  "
                >

                  {currentMessages.length ===
                  0 ? (

                    <div
                      className="
                        h-full
                        min-h-[360px]
                        flex
                        items-center
                        justify-center
                        text-center
                      "
                    >

                      <div>

                        <MessageCircle
                          className="
                            w-8
                            h-8
                            mx-auto
                            text-[#625548]
                            mb-3
                          "
                        />

                        <p
                          className="
                            text-sm
                            text-[#817468]
                          "
                        >
                          Belum ada pesan.
                        </p>

                      </div>

                    </div>

                  ) : (

                    currentMessages.map(
                      message => {

                        const outgoing =
                          message.direction ===
                          'outgoing';


                        return (

                          <div
                            key={
                              message.id
                            }

                            className={`
                              flex

                              ${
                                outgoing
                                  ? 'justify-end'
                                  : 'justify-start'
                              }
                            `}
                          >

                            <div
                              className={`
                                max-w-[85%]
                                sm:max-w-[70%]
                                rounded-2xl
                                px-4
                                py-3
                                border
                                shadow-sm

                                ${
                                  outgoing
                                    ? 'bg-[#2b2414] border-[#d4af37]/20'
                                    : 'bg-[#17110d] border-[#302820]'
                                }
                              `}
                            >

                              <p
                                className="
                                  text-sm
                                  leading-6
                                  whitespace-pre-wrap
                                  break-words
                                "
                              >
                                {message.message}
                              </p>


                              <div
                                className="
                                  flex
                                  items-center
                                  justify-end
                                  gap-1
                                  mt-2
                                "
                              >

                                <span
                                  className="
                                    text-[10px]
                                    text-[#6f6257]
                                  "
                                >
                                  {formatChatDate(
                                    message.createdAt
                                  )}{' '}
                                  {formatTime(
                                    message.createdAt
                                  )}
                                </span>


                                {outgoing && (

                                  <CheckCheck
                                    className="
                                      w-3.5
                                      h-3.5
                                      text-[#d4af37]
                                    "
                                  />

                                )}

                              </div>

                            </div>

                          </div>

                        );
                      }
                    )

                  )}

                </div>


                {/* =============================================
                    INPUT
                    ============================================= */}

                <div
                  className="
                    border-t
                    border-[#302820]
                    bg-[#100c09]
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-end
                      gap-3
                    "
                  >

                    <textarea
                      rows={
                        1
                      }

                      value={
                        messageInput
                      }

                      onChange={
                        event =>
                          setMessageInput(
                            event.target.value
                          )
                      }

                      onKeyDown={
                        event => {

                          if (
                            event.key ===
                              'Enter' &&
                            !event.shiftKey
                          ) {

                            event.preventDefault();

                            handleSendMessage();
                          }
                        }
                      }

                      placeholder="
                        Tulis pesan...
                      "

                      className="
                        flex-1
                        min-w-0
                        min-h-12
                        max-h-32
                        resize-none
                        rounded-xl
                        border
                        border-[#382e25]
                        bg-[#0a0806]
                        px-4
                        py-3
                        text-sm
                        text-[#f3ece2]
                        placeholder:text-[#625548]
                        outline-none
                        focus:border-[#d4af37]
                        transition
                      "
                    />


                    <button
                      type="button"

                      onClick={
                        handleSendMessage
                      }

                      disabled={
                        !messageInput.trim()
                      }

                      className="
                        w-12
                        h-12
                        shrink-0
                        rounded-xl
                        bg-[#d4af37]
                        text-black
                        flex
                        items-center
                        justify-center
                        hover:bg-[#e2c256]
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        transition
                      "
                    >

                      <Send
                        className="
                          w-5
                          h-5
                        "
                      />

                    </button>

                  </div>


                  <p
                    className="
                      text-[10px]
                      text-[#625548]
                      mt-2
                    "
                  >
                    Enter untuk kirim • Shift + Enter untuk baris baru
                  </p>

                </div>

              </>

            )}

          </div>

        </div>

      </div>

    </section>

  );
}
