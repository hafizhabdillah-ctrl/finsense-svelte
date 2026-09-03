require('dotenv').config();

// 1. Lacak pemanggilan process.exit()
const originalExit = process.exit;
process.exit = function (code) {
  console.log(`\n========================================`);
  console.log(`[PEMICU DITEMUKAN] process.exit(${code}) dipanggil!`);
  console.trace('Lokasi file pemicu:');
  console.log(`========================================\n`);
  originalExit.apply(process, arguments);
};

const app = require('./src/app');
const PORT = process.env.PORT || 5000;

// 2. Jalankan server & pantau status handle
const server = app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
  console.log(`[DEBUG] Active handles: ${process._getActiveHandles().length}`);
});

// 3. Lacak jika server ditutup secara tidak sengaja
server.on('close', () => {
  console.log('\n❌ [DEBUG] Server HTTP ditutup oleh server.close()!');
  console.trace('Lokasi pemicu server.close:');
});

server.on('error', (err) => {
  console.error('\n❌ [DEBUG] Server Error:', err);
});