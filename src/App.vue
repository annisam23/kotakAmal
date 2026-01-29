<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// --- STATE MANAGEMENT ---
const transactions = ref([]);
const isModalOpen = ref(false);
const currentType = ref('income');
const form = ref({ amount: null, note: '' });

// Load data saat aplikasi dibuka
onMounted(() => {
  const saved = localStorage.getItem('kotak_amal_data');
  if (saved) transactions.value = JSON.parse(saved);
});

// Simpan data otomatis setiap ada perubahan
watch(transactions, (newVal) => {
  localStorage.setItem('kotak_amal_data', JSON.stringify(newVal));
}, { deep: true });

// --- COMPUTED PROPERTIES ---
const totals = computed(() => {
  return transactions.value.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expense += t.amount;
    acc.balance = acc.income - acc.expense;
    return acc;
  }, { income: 0, expense: 0, balance: 0 });
});

const lastUpdateDate = computed(() => {
  if (transactions.value.length === 0) return '-';
  const last = transactions.value[0];
  return formatDate(last.date);
});

// --- HELPER METHODS ---
const formatCurrency = (val) => {
  return 'Rp ' + (val || 0).toLocaleString('id-ID');
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const openModal = (type) => {
  currentType.value = type;
  form.value = { amount: null, note: '' };
  isModalOpen.value = true;
};

const submitTransaction = () => {
  if (!form.value.amount || form.value.amount <= 0) {
    alert("Masukkan jumlah yang valid");
    return;
  }
  
  transactions.value.unshift({
    id: Date.now(),
    type: currentType.value,
    amount: form.value.amount,
    // UBAH BARIS DI BAWAH INI:
    note: form.value.note || '', 
    date: new Date().toISOString(),
    author: form.value.author || 'Anonim'
  });
  
  isModalOpen.value = false;
};

const clearHistory = () => {
  if (confirm("Hapus semua riwayat transaksi?")) {
    transactions.value = [];
  }
};
</script>

<template>
  <div class="app-wrapper">
    <div class="container">
      <header class="main-header">
        <h1>🕌 Kotak Amal Masjid Baitusolihin</h1>
        <p>Pencatatan Dana Infaq & Sedekah</p>
      </header>

      <section class="balance-card">
        <span class="label">Saldo Saat Ini</span>
        <h2 class="amount main-blue">{{ formatCurrency(totals.balance) }}</h2>
        <span class="update-text">Terakhir diperbarui: {{ lastUpdateDate }}</span>
      </section>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="label">Total Pemasukan</span>
          <div class="amount income-text">{{ formatCurrency(totals.income) }}</div>
        </div>
        <div class="stat-item">
          <span class="label">Total Pengeluaran</span>
          <div class="amount expense-text">{{ formatCurrency(totals.expense) }}</div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-income" @click="openModal('income')">
          <span class="icon">＋</span> Tambah Dana
        </button>
        <button class="btn btn-expense" @click="openModal('expense')">
          <span class="icon">－</span> Kurangi Dana
        </button>
      </div>

      <section class="history">
        <div class="history-header">
          <h3>📋 Riwayat Transaksi</h3>
          <button v-if="transactions.length > 0" class="btn-clear" @click="clearHistory">Hapus Semua</button>
        </div>

        <div v-if="transactions.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>Belum ada transaksi</p>
        </div>

        <div v-else class="transaction-list">
          <div v-for="t in transactions" :key="t.id" :class="['t-item', t.type]">
         <div class="t-info">
          <span v-if="t.note" class="t-note">{{ t.note }}</span>
          
          <div class="t-meta">
            <div class="t-date">{{ formatDate(t.date) }}</div>
            
            <div class="t-author">
              <span class="label-pencatat">Penginput:</span>
              <span class="nama-pencatat">{{ t.author }}</span>
            </div>
          </div>
        </div>
            <div :class="['t-amount', t.type === 'income' ? 'income-text' : 'expense-text']">
              {{ t.type === 'income' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
            </div>
          </div>
        </div>
      </section>
    </div>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <h3>{{ currentType === 'income' ? 'Tambah Pemasukan' : 'Catat Pengeluaran' }}</h3>
          
         <div class="form-group">
          <label>Jumlah (Rp)</label>
          <input 
            type="text" 
            :value="form.amount ? form.amount.toLocaleString('id-ID') : ''" 
            @input="e => form.amount = Number(e.target.value.replace(/\D/g, ''))"
            placeholder="0" 
            autofocus
          >
        </div>

          <div class="form-group">
            <label>Keterangan</label>
            <input type="text" v-model="form.note" placeholder="Contoh: Infaq Jumat">
          </div>
          
          <div class="form-group">
            <label>Nama Petugas / Donatur</label>
            <input 
              type="text" 
              v-model="form.author" 
              placeholder="Masukkan nama"
              class="form-input"
            >
          </div>

          <div class="modal-btns">
            <button class="btn-secondary" @click="isModalOpen = false">Batal</button>
            <button class="btn-primary" @click="submitTransaction">Simpan</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Reset & Base */
.app-wrapper {
  background: linear-gradient(180deg, #6a82fb 0%);
  min-height: 100vh;
  padding: 20px 0;
  font-family: 'Inter', sans-serif;
}

.container {
  max-width: 450px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 90vh;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

/* Header */
.main-header {
  background: linear-gradient(135deg, #4e54c8, #8f94fb);
  color: white;
  padding: 40px 20px;
  text-align: center;
}
.main-header h1 { font-size: 22px; margin-bottom: 5px; }
.main-header p { font-size: 14px; opacity: 0.8; }

/* Cards */
.balance-card {
  background: white;
  margin: -30px 20px 20px;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}
.label { color: #888; font-size: 13px; display: block; margin-bottom: 10px; }
.amount { font-weight: 800; font-size: 38px; }
.main-blue { color: #4e54c8; }
.update-text { font-size: 11px; color: #aaa; margin-top: 10px; display: block; }

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 0 20px;
}
.stat-item {
  background: #fff;
  padding: 15px;
  border-radius: 15px;
  text-align: center;
}
.income-text { color: #27ae60; font-weight: bold; }
.expense-text { color: #e74c3c; font-weight: bold; }

/* Buttons */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 20px;
}
.btn {
  border: none;
  padding: 15px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s;
}
.btn:active { transform: scale(0.95); }
.btn-income { background-color: #1abc9c; }
.btn-expense { background-color: #ff5e57; }

/* History */
.history { padding: 10px 20px; }
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.btn-clear {
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.t-item {
  background: white;
  padding: 15px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-left: 5px solid #ddd;
}
.t-item.income { border-left-color: #1abc9c; }
.t-item.expense { border-left-color: #ff5e57; }
.t-info { display: flex; flex-direction: column; }
.t-note { font-weight: 600; font-size: 14px; }
.t-date { font-size: 11px; color: #aaa; }
.t-meta {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-top: 8px; /* Tambah jarak antara Judul dan Tanggal */
  display: flex;
  flex-direction: column;
}

/* Container Utama */
.t-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  text-align: left;        
  gap: 4px;
  flex: 1;
}

.t-note {
  font-weight: 700;
  font-size: 15px;
  color: #2d3436;
  margin-bottom: 2px;
}

/* Container Tanggal & Penginput */
.t-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  gap: 6px; 
}

.t-date {
  font-size: 11px;
  color: #95a5a6;
}

/* Badge Penginput */
.t-author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  background: #f1f3f5;
  padding: 4px 10px;
  border-radius: 6px;
  width: fit-content; 
  border: 1px solid #e9ecef;
}

/* Warna label & nama */
.t-author span:first-child { color: #868e96; }
.t-author span:last-child { color: #4e54c8; font-weight: 600; }
.empty-state {
  text-align: center;
  padding: 40px;
  color: #ccc;
}
.empty-icon { font-size: 50px; margin-bottom: 10px; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-content {
  background: white;
  width: 90%;
  max-width: 350px;
  padding: 25px;
  border-radius: 20px;
}
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-size: 12px; margin-bottom: 5px; color: #666; }
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}
.modal-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}
.stats-grid .amount {
  font-size: 18px; 
  font-weight: 700;
}


.stats-grid .label {
  font-size: 11px;
  margin-bottom: 5px;
}

.btn-primary { background: #4e54c8; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; }
.btn-secondary { background: #eee; border: none; padding: 10px; border-radius: 8px; cursor: pointer; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.btn-clear {
  /* Ubah background menjadi merah */
  background: #ef4444; 
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-clear:hover {
  background: #dc2626; 
}
</style>

