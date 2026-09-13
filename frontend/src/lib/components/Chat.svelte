<script lang="ts">
  import { tick } from 'svelte';
  import { Send, X, MessageSquareMore } from 'lucide-svelte';
  import api from '../services/api';

  type ChatMessage = { id: number | string; sender: 'user' | 'ai'; text: string };
  type QuickReply = { id: string; label: string };

  let isOpen = false;
  let messages: ChatMessage[] = [];
  let inputValue = '';
  let sessionId: string | null = null;
  let quickReplies: QuickReply[] = [];
  let isLoading = false;
  let messagesEnd: HTMLDivElement;

  // Scroll ke pesan terakhir setiap kali daftar pesan berubah
  $: if (messages.length) {
    tick().then(() => messagesEnd?.scrollIntoView({ behavior: 'smooth' }));
  }

  async function createNewSession() {
    try {
      const response = await api.post('/chat/sessions', { session_title: 'Chat baru' });
      sessionId = response.data.id;
      messages = [
        {
          id: Date.now(),
          sender: 'ai',
          text: 'Halo! Saya asisten FinSense. Pilih topik yang ingin kamu tanyakan:',
        },
      ];
      quickReplies = [
        { id: 'catat', label: '🎤 Catat Transaksi (Suara)' },
        { id: 'lihat_transaksi', label: '📋 Lihat Transaksi' },
        { id: 'stok', label: '📦 Manajemen Stok' },
        { id: 'hutang', label: '💰 Hutang/Piutang' },
        { id: 'tips', label: '💡 Tips UMKM' },
      ];
    } catch (error) {
      console.error('Gagal membuat session chat:', error);
    }
  }

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen && !sessionId) createNewSession();
  }

  async function sendMessageToBackend(message: string) {
    if (!sessionId) return;
    isLoading = true;
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, { message });
      const assistantMsg = response.data.assistantMessage;
      messages = [...messages, { id: assistantMsg.id, sender: 'ai', text: assistantMsg.content }];
      quickReplies = response.data.quickReplies || [];
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
      messages = [
        ...messages,
        { id: Date.now() + 999, sender: 'ai', text: 'Maaf, terjadi kesalahan. Silakan coba lagi.' },
      ];
    } finally {
      isLoading = false;
    }
  }

  async function onSend() {
    if (inputValue.trim() === '' || isLoading) return;
    const userMessageText = inputValue.trim();
    messages = [...messages, { id: Date.now(), sender: 'user', text: userMessageText }];
    inputValue = '';
    quickReplies = [];
    await sendMessageToBackend(userMessageText);
  }

  function onQuickReply(reply: QuickReply) {
    inputValue = reply.label;
    onSend();
  }
</script>

{#if isOpen}
  <div
    class="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 w-[calc(100vw-2rem)] sm:w-96 md:w-[28rem] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
  >
    <!-- Header -->
    <div class="bg-sky-950 px-4 py-3 flex justify-between items-center text-white">
      <span class="font-bold text-sm tracking-wide flex items-center gap-2">FinSense AI Support</span>
      <button on:click={toggleChat} class="hover:bg-sky-800 p-1 rounded-full transition cursor-pointer">
        <X size={22} />
      </button>
    </div>

    <!-- Messages Area -->
    <div class="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3 text-sm min-h-[300px] max-h-[calc(80vh-130px)]">
      {#each messages as n (n.id)}
        <div
          class="p-3 max-w-[85%] shadow-sm break-words {n.sender === 'user'
            ? 'self-end bg-sky-950 text-white rounded-t-xl rounded-bl-xl rounded-br-xl'
            : 'self-start bg-gray-200 text-sky-950 rounded-tr-xl rounded-br-xl rounded-bl-xl'}"
        >
          <span>{@html n.text}</span>
        </div>
      {/each}
      {#if isLoading}
        <div class="self-start bg-gray-200 text-sky-950 p-3 rounded-xl">Mengetik...</div>
      {/if}
      <div bind:this={messagesEnd}></div>
    </div>

    <!-- Quick Replies -->
    {#if quickReplies.length > 0}
      <div class="px-3 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-2">
        {#each quickReplies as reply, idx (idx)}
          <button
            on:click={() => onQuickReply(reply)}
            class="bg-gray-100 hover:bg-gray-200 text-sky-950 text-xs py-1.5 px-3 rounded-full transition cursor-pointer"
          >
            {reply.label}
          </button>
        {/each}
      </div>
    {/if}

    <!-- Input Box -->
    <div class="p-3 bg-white border-t border-gray-200 flex gap-2 items-center">
      <input
        type="text"
        bind:value={inputValue}
        on:keydown={(e) => e.key === 'Enter' && onSend()}
        placeholder="Ketik pesan..."
        disabled={isLoading}
        class="flex-1 px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-sky-950 text-sm"
      />
      <button
        on:click={onSend}
        disabled={isLoading}
        class="bg-sky-950 text-white p-2 rounded-full hover:bg-sky-800 transition disabled:opacity-50 cursor-pointer"
      >
        <Send size={20} />
      </button>
    </div>
  </div>
{/if}

<!-- Floating Button -->
<button
  on:click={toggleChat}
  class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 rounded-full shadow-xl transition-all duration-300 z-50 flex items-center justify-center cursor-pointer {isOpen
    ? 'bg-red-500 hover:bg-red-600 rotate-90 scale-90 md:hidden text-white'
    : 'bg-sky-950 hover:bg-sky-800 hover:-translate-y-1 text-white'}"
>
  {#if isOpen}
    <X size={24} />
  {:else}
    <MessageSquareMore size={24} />
  {/if}
</button>
