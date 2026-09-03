<script lang="ts">
  import MainLayout from '../../lib/components/Layout/MainLayout.svelte';

  let dummyStats = [
    { label: 'Total Penjualan', value: 'Rp 0', color: 'bg-blue-500' },
    { label: 'Total Transaksi', value: '0', color: 'bg-green-500' },
    { label: 'Stok Produk', value: '0', color: 'bg-purple-500' },
    { label: 'Hutang Pelanggan', value: 'Rp 0', color: 'bg-red-500' },
  ];
</script>

<MainLayout>
  <div>
    <h1 class="text-xl md:text-2xl font-bold">
      Ringkasan Penjualan Hari Ini
    </h1>
    <p class="mx-2 mb-4 md:mb-6 text-gray-500 text-sm md:text-base">
      {new Date().toLocaleDateString('id-ID')}
    </p>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {#each dummyStats as stat (stat.label)}
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <p class="text-gray-600 text-sm mb-2">{stat.label}</p>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">{stat.value}</h3>
        </div>
      {/each}
    </div>

    <!-- Placeholder untuk charts dan tables -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold mb-4">Grafik Penjualan</h2>
        <div class="h-64 bg-gray-100 rounded flex items-center justify-center">
          <p class="text-gray-500">Chart akan ditampilkan di sini</p>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold mb-4">Stok Teratas</h2>
        <div class="space-y-3">
          {#each Array(5) as _, i}
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span class="text-sm font-medium">Produk {i + 1}</span>
              <span class="text-sm text-gray-600">0 pcs</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</MainLayout>
