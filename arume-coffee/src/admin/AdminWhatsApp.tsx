// src/admin/AdminWhatsApp.tsx

import React, {
  useEffect,
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
    | 'received'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed';
};


type ApiConversation = {
  id: string;
  customer_name?: string | null;
  phone_number: string;
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count?: number | null;
};


type ApiMessage = {
  id: string;
  whatsapp_message_id?: string | null;
  phone_number: string;

  direction:
    | 'incoming'
    | 'outgoing';

  message_text?: string | null;

  status?:
    | 'received'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed';

  created_at: string;
};


type WhatsAppHealth = {
  configured: boolean;
  loading: boolean;
};


/* =========================================================
   API
   ========================================================= */

const API_BASE_URL =
  'https://arume-coffee-api-2.diyanaxl.workers.dev';


/* =========================================================
   NORMALIZE CONVERSATION
   ========================================================= */

const normalizeConversation = (
  item: ApiConversation
): Conversation => ({

  id:
    String(
      item.id
    ),

  customerName:
    String(
      item.customer_name ||
      item.phone_number ||
      'Customer'
    ),

  phone:
    String(
      item.phone_number ||
      ''
    ),

  lastMessage:
    String(
      item.last_message ||
      ''
    ),

  lastMessageAt:
    String(
      item.last_message_at ||
      ''
    ),

  unread:
    Number(
      item.unread_count ||
      0
    )

});


/* =========================================================
   NORMALIZE MESSAGE
   ========================================================= */

const normalizeMessage = (
  item: ApiMessage
): ChatMessage => ({

  id:
    String(
      item.id ||
      item.whatsapp_message_id ||
      crypto.randomUUID()
    ),

  direction:
    item.direction,

  message:
    String(
      item.message_text ||
      ''
    ),

  createdAt:
    String(
      item.created_at ||
      ''
    ),

  status:
    item.status

});


/* =========================================================
   FORMAT TIME
   ========================================================= */

const formatTime = (
  value: string
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
  value: string
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
      []
    );


  const [
    messages,
    setMessages
  ] =
    useState<
      Record<
        string,
        ChatMessage[]
      >
    >(
      {}
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


  const [
    sending,
    setSending
  ] =
    useState(
      false
    );


  const [
    loadingMessages,
    setLoadingMessages
  ] =
    useState(
      false
    );


  const [
    error,
    setError
  ] =
    useState(
      ''
    );


  const [
    whatsappHealth,
    setWhatsAppHealth
  ] =
    useState<WhatsAppHealth>({
      configured:
        false,

      loading:
        true
    });


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
     API HELPERS
     ========================================================= */

  const getAdminHeaders =
    (
      includeJson =
        false
    ) => {

      const headers:
        Record<string, string> = {

          'X-ADMIN-SECRET':
            secret

        };


      if (
        includeJson
      ) {

        headers[
          'Content-Type'
        ] =
          'application/json';
      }


      return headers;
    };


  const getErrorMessage =
    (
      result:
        any,

      fallback:
        string
    ) => {

      return (
        result?.message ||
        result?.error ||
        result?.details ||
        fallback
      );
    };


  /* =========================================================
     LOAD WHATSAPP HEALTH
     ========================================================= */

  const loadWhatsAppHealth =
    async () => {

      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/health`
          );


        const result =
          await response.json();


        const configured =
          Boolean(
            result?.data?.whatsapp_configured ??
            result?.whatsapp_configured
          );


        setWhatsAppHealth({
          configured,

          loading:
            false
        });

      } catch (
        err
      ) {

        console.error(
          'WhatsApp health error:',
          err
        );


        setWhatsAppHealth({
          configured:
            false,

          loading:
            false
        });
      }
    };


  /* =========================================================
     LOAD CONVERSATIONS
     ========================================================= */

  const loadConversations =
    async (
      silent =
        false
    ) => {

      if (
        !secret
      ) {

        return;
      }


      if (
        !silent
      ) {

        setRefreshing(
          true
        );
      }


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/whatsapp/conversations`,
            {
              headers:
                getAdminHeaders()
            }
          );


        const result =
          await response.json();


        if (
          !response.ok
        ) {

          throw new Error(
            getErrorMessage(
              result,
              'Gagal mengambil percakapan WhatsApp.'
            )
          );
        }


        const rawConversations =
          result?.data?.conversations ||
          result?.conversations ||
          [];


        const normalized =
          Array.isArray(
            rawConversations
          )
            ? rawConversations.map(
                (
                  item:
                    ApiConversation
                ) =>
                  normalizeConversation(
                    item
                  )
              )
            : [];


        setConversations(
          normalized
        );


        setError(
          ''
        );


        setSelectedConversationId(
          current => {

            if (
              !current
            ) {

              return current;
            }


            const stillExists =
              normalized.some(
                item =>
                  item.id ===
                  current
              );


            return stillExists
              ? current
              : null;
          }
        );


      } catch (
        err:
          any
      ) {

        console.error(
          'Load WhatsApp conversations error:',
          err
        );


        if (
          !silent
        ) {

          setError(
            err?.message ||
            'Gagal mengambil percakapan WhatsApp.'
          );
        }


      } finally {

        if (
          !silent
        ) {

          setRefreshing(
            false
          );
        }
      }
    };


  /* =========================================================
     LOAD MESSAGES
     ========================================================= */

  const loadMessages =
    async (
      conversation:
        Conversation,

      silent =
        false
    ) => {

      if (
        !secret ||
        !conversation?.phone
      ) {

        return;
      }


      if (
        !silent
      ) {

        setLoadingMessages(
          true
        );
      }


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/whatsapp/conversations/${encodeURIComponent(
              conversation.phone
            )}/messages`,
            {
              headers:
                getAdminHeaders()
            }
          );


        const result =
          await response.json();


        if (
          !response.ok
        ) {

          throw new Error(
            getErrorMessage(
              result,
              'Gagal mengambil pesan WhatsApp.'
            )
          );
        }


        const rawMessages =
          result?.data?.messages ||
          result?.messages ||
          [];


        const normalized =
          Array.isArray(
            rawMessages
          )
            ? rawMessages.map(
                (
                  item:
                    ApiMessage
                ) =>
                  normalizeMessage(
                    item
                  )
              )
            : [];


        setMessages(
          current => ({
            ...current,

            [
              conversation.id
            ]:
              normalized
          })
        );


        setError(
          ''
        );


      } catch (
        err:
          any
      ) {

        console.error(
          'Load WhatsApp messages error:',
          err
        );


        if (
          !silent
        ) {

          setError(
            err?.message ||
            'Gagal mengambil pesan WhatsApp.'
          );
        }


      } finally {

        if (
          !silent
        ) {

          setLoadingMessages(
            false
          );
        }
      }
    };


  /* =========================================================
     MARK READ
     ========================================================= */

  const markConversationRead =
    async (
      conversation:
        Conversation
    ) => {

      if (
        !secret ||
        !conversation?.phone
      ) {

        return;
      }


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/whatsapp/conversations/${encodeURIComponent(
              conversation.phone
            )}/read`,
            {
              method:
                'PATCH',

              headers:
                getAdminHeaders()
            }
          );


        if (
          !response.ok
        ) {

          const result =
            await response.json();


          throw new Error(
            getErrorMessage(
              result,
              'Gagal menandai pesan sebagai dibaca.'
            )
          );
        }


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


      } catch (
        err
      ) {

        console.error(
          'Mark WhatsApp read error:',
          err
        );
      }
    };


  /* =========================================================
     SELECT CONVERSATION
     ========================================================= */

  const selectConversation =
    async (
      conversation:
        Conversation
    ) => {

      setSelectedConversationId(
        conversation.id
      );


      setMessageInput(
        ''
      );


      await Promise.all([
        loadMessages(
          conversation
        ),

        markConversationRead(
          conversation
        )
      ]);
    };


  /* =========================================================
     AUTO SELECT FIRST CONVERSATION
     ========================================================= */

  useEffect(
    () => {

      if (
        selectedConversationId ||
        conversations.length ===
        0
      ) {

        return;
      }


      const firstConversation =
        conversations[0];


      setSelectedConversationId(
        firstConversation.id
      );


      void loadMessages(
        firstConversation,
        true
      );


      void markConversationRead(
        firstConversation
      );

    },
    [
      conversations,
      selectedConversationId
    ]
  );


  /* =========================================================
     REFRESH
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

        await Promise.all([
          loadConversations(
            true
          ),

          loadWhatsAppHealth()
        ]);


        if (
          selectedConversation
        ) {

          await loadMessages(
            selectedConversation,
            true
          );
        }


        setError(
          ''
        );


      } catch (
        err:
          any
      ) {

        setError(
          err?.message ||
          'Gagal refresh WhatsApp.'
        );


      } finally {

        setRefreshing(
          false
        );
      }
    };


  /* =========================================================
     SEND MESSAGE
     ========================================================= */

  const handleSendMessage =
    async () => {

      const normalized =
        messageInput
          .trim();


      if (
        !normalized ||
        !selectedConversation ||
        sending
      ) {

        return;
      }


      setSending(
        true
      );


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/whatsapp/send`,
            {
              method:
                'POST',

              headers:
                getAdminHeaders(
                  true
                ),

              body:
                JSON.stringify({

                  phone_number:
                    selectedConversation.phone,

                  message_text:
                    normalized

                })
            }
          );


        const result =
          await response.json();


        if (
          !response.ok
        ) {

          throw new Error(
            getErrorMessage(
              result,
              'Gagal mengirim pesan WhatsApp.'
            )
          );
        }


        setMessageInput(
          ''
        );


        await Promise.all([
          loadMessages(
            selectedConversation,
            true
          ),

          loadConversations(
            true
          )
        ]);


        setError(
          ''
        );


      } catch (
        err:
          any
      ) {

        console.error(
          'Send WhatsApp message error:',
          err
        );


        const errorMessage =
          err?.message ||
          'Gagal mengirim pesan WhatsApp.';


        setError(
          errorMessage
        );


        window.alert(
          errorMessage
        );


      } finally {

        setSending(
          false
        );
      }
    };


  /* =========================================================
     INITIAL LOAD + CONVERSATION POLLING
     ========================================================= */

  useEffect(
    () => {

      if (
        !secret
      ) {

        return;
      }


      void loadConversations();

      void loadWhatsAppHealth();


      const timer =
        window.setInterval(
          () => {

            void loadConversations(
              true
            );

            void loadWhatsAppHealth();

          },
          5000
        );


      return () => {

        window.clearInterval(
          timer
        );
      };

    },
    [
      secret
    ]
  );


  /* =========================================================
     MESSAGE POLLING
     ========================================================= */

  useEffect(
    () => {

      if (
        !selectedConversation
      ) {

        return;
      }


      const conversation =
        selectedConversation;


      void loadMessages(
        conversation,
        true
      );


      const timer =
        window.setInterval(
          () => {

            void loadMessages(
              conversation,
              true
            );

          },
          3000
        );


      return () => {

        window.clearInterval(
          timer
        );
      };

    },
    [
      selectedConversation?.id,
      selectedConversation?.phone
    ]
  );


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
            className={`
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              px-4
              py-2.5
              text-sm

              ${
                whatsappHealth.loading
                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
                  : whatsappHealth.configured
                    ? 'border-green-500/30 bg-green-950/20 text-green-300'
                    : 'border-red-500/30 bg-red-950/20 text-red-300'
              }
            `}
          >

            <span
              className={`
                w-2
                h-2
                rounded-full

                ${
                  whatsappHealth.loading
                    ? 'bg-amber-400'
                    : whatsappHealth.configured
                      ? 'bg-green-400'
                      : 'bg-red-400'
                }
              `}
            />


            {
              whatsappHealth.loading
                ? 'Mengecek WhatsApp...'
                : whatsappHealth.configured
                  ? 'WhatsApp Meta Terhubung'
                  : 'WhatsApp Meta Belum Terhubung'
            }

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


      {
        error &&
        (
          <div
            className="
              mb-4
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


          {/* LEFT */}

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

                  placeholder="Cari customer..."

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


            {/* TITLE */}

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

              {
                filteredConversations.length ===
                0
                  ? (

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

                        {
                          whatsappHealth.loading
                            ? 'Sedang mengecek koneksi WhatsApp Meta.'
                            : whatsappHealth.configured
                              ? 'Belum ada pesan customer yang masuk.'
                              : 'WhatsApp Meta belum terhubung ke backend.'
                        }

                      </p>

                    </div>

                  )
                  : (

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
                              void selectConversation(
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
                                    {
                                      formatTime(
                                        conversation.lastMessageAt
                                      )
                                    }
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


                                  {
                                    conversation.unread >
                                    0 &&
                                    (

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

                                    )
                                  }

                                </div>

                              </div>

                            </div>

                          </button>

                        );
                      }
                    )

                  )
              }

            </div>

          </aside>


          {/* RIGHT CHAT */}

          <div
            className="
              min-w-0
              flex
              flex-col
              bg-[#0b0806]
            "
          >

            {
              !selectedConversation
                ? (

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
                        Pilih percakapan customer untuk membaca dan
                        membalas pesan WhatsApp dari admin Arume Coffee.
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
                          className={`
                            flex
                            items-center
                            justify-center
                            gap-2

                            ${
                              whatsappHealth.loading
                                ? 'text-amber-300'
                                : whatsappHealth.configured
                                  ? 'text-green-300'
                                  : 'text-red-300'
                            }
                          `}
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

                            {
                              whatsappHealth.loading
                                ? 'Mengecek koneksi WhatsApp'
                                : whatsappHealth.configured
                                  ? 'WhatsApp Meta aktif'
                                  : 'WhatsApp Meta belum aktif'
                            }

                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                )
                : (

                  <>

                    {/* CHAT HEADER */}

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

                        onClick={
                          handleRefresh
                        }

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


                    {/* MESSAGES */}

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

                      {
                        loadingMessages
                          ? (

                            <div
                              className="
                                h-full
                                min-h-[360px]
                                flex
                                items-center
                                justify-center
                              "
                            >

                              <RefreshCcw
                                className="
                                  w-6
                                  h-6
                                  text-[#d4af37]
                                  animate-spin
                                "
                              />

                            </div>

                          )

                          : currentMessages.length ===
                            0
                            ? (

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

                            )
                            : (

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
                                            {
                                              formatChatDate(
                                                message.createdAt
                                              )
                                            }{' '}
                                            {
                                              formatTime(
                                                message.createdAt
                                              )
                                            }
                                          </span>


                                          {
                                            outgoing &&
                                            (

                                              <CheckCheck
                                                className={`
                                                  w-3.5
                                                  h-3.5

                                                  ${
                                                    message.status ===
                                                    'failed'
                                                      ? 'text-red-400'
                                                      : message.status ===
                                                        'read'
                                                        ? 'text-blue-400'
                                                        : 'text-[#d4af37]'
                                                  }
                                                `}
                                              />

                                            )
                                          }

                                        </div>

                                      </div>

                                    </div>

                                  );
                                }
                              )

                            )
                      }

                    </div>


                    {/* INPUT */}

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

                                void handleSendMessage();
                              }
                            }
                          }

                          placeholder="Tulis pesan..."

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

                          onClick={() =>
                            void handleSendMessage()
                          }

                          disabled={
                            !messageInput.trim() ||
                            sending
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

                          {
                            sending
                              ? (

                                <RefreshCcw
                                  className="
                                    w-5
                                    h-5
                                    animate-spin
                                  "
                                />

                              )
                              : (

                                <Send
                                  className="
                                    w-5
                                    h-5
                                  "
                                />

                              )
                          }

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

                )
            }

          </div>

        </div>

      </div>

    </section>

  );
}
