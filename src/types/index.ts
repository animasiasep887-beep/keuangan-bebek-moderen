export type TipeAkun = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type SaldoNormal = 'DEBIT' | 'KREDIT';
export type StatusKandang = 'AKTIF' | 'ISTIRAHAT' | 'PERAWATAN';
export type StatusPopulasi = 'PRODUKTIF' | 'AFKIR' | 'PEMBESARAN';
export type JenisHutangPiutang = 'HUTANG' | 'PIUTANG';
export type StatusHutangPiutang = 'LUNAS' | 'BELUM_LUNAS';

export interface Kandang {
  id: string;
  namaKandang: string;
  kapasitas: number;
  status: StatusKandang;
  catatan?: string;
}

export interface PopulasiBebek {
  id: string;
  kandangId: string;
  kodeBatch: string;
  tglMasuk: string;
  jumlahAwal: number;
  jumlahSaatIni: number;
  hargaBeliPerEkor: number;
  umurMinggu: number;
  status: StatusPopulasi;
}

export interface PakanItem {
  id: string;
  namaPakan: string;
  merk: string;
  stokKg: number;
  hargaPerKg: number;
  minStokKg: number;
}

export interface PencatatanHarian {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kandangId: string;
  populasiId: string;
  komoditas?: KomoditasTernak;

  // Bebek & Ayam Petelur fields
  telurUtuh: number; // Grade A
  telurRetak: number; // Grade B
  telurRusak: number;
  totalBeratTelurKg: number;
  bebekMati: number; // Mortalitas harian ekor
  bebekAfkir: number;
  hdpPercentage: number; // Hen-Day Production %
  bobotRataTelurGram?: number;

  // Pakan umum
  pakanKg: number;
  pakanId: string;
  fcr: number; // Feed Conversion Ratio

  // Broiler (Ayam Pedaging) fields
  umurHari?: number; // Hari ke-1 s/d ke-35
  mortalitasDoc?: number;
  bobotRataEkorGram?: number;
  totalBobotPanenKg?: number;
  indeksPerforma?: number; // IP Broiler: (Daya Hidup % x Bobot Rata-rata kg) / (FCR x Umur hari) * 100
  adgGram?: number; // Average Daily Gain

  // Sapi (Perah & Potong) fields
  susuPagiLiter?: number;
  susuSoreLiter?: number;
  totalSusuLiter?: number;
  bobotSapiKg?: number;
  adgSapiKg?: number;
  pakanHijauanKg?: number;
  pakanKonsentratKg?: number;
  catatanKesehatan?: string; // Vaksin / IB / Calving / Laktasi

  // Lele (Akuakultur) fields
  tebarBenihEkor?: number;
  ukuranSamplingGram?: number;
  samplingIsiPerKg?: number; // misal isi 8-10 ekor/kg
  bobotPanenIkanKg?: number;
  survivalRate?: number; // SR %
  pakanPeletKg?: number;
  kondisiAir?: string; // Normal / Hijau / Keruh / Kuras

  catatan?: string;
  createdBy: string;
}

export interface KodeAkun {
  id: string;
  kode: string; // e.g. "101", "401"
  nama: string;
  tipe: TipeAkun;
  saldoNormal: SaldoNormal;
}

export interface JurnalItem {
  akunId: string;
  debit: number;
  kredit: number;
}

export interface TransaksiKeuangan {
  id: string;
  tanggal: string; // YYYY-MM-DD
  noRef: string;
  deskripsi: string;
  totalNominal: number;
  tipeTransaksi: 'PENDAPATAN' | 'PENGELUARAN' | 'JURNAL_UMUM';
  kategoriPendapatan?: string;
  kategoriPengeluaran?: string;
  pencatatanHarianId?: string;
  items: JurnalItem[];
  createdBy: string;
}

export interface AsetTetap {
  id: string;
  namaAset: string;
  kategori: 'KANDANG' | 'PERALATAN' | 'BIOLOGIS_BEBEK' | 'KENDARAAN' | 'LAINNYA';
  nilaiPerolehan: number;
  akumulasiPenyusutan: number;
  nilaiBuku: number;
  tglPerolehan: string;
  masaManfaatBulan: number;
  penyusutanBulanan: number;
}

export interface HutangPiutang {
  id: string;
  jenis: JenisHutangPiutang;
  namaKontak: string;
  noHp?: string;
  deskripsi: string;
  nominalTotal: number;
  sisaNominal: number;
  tglJatuhTempo: string;
  status: StatusHutangPiutang;
}

export type KomoditasTernak = 'BEBEK_PETELUR' | 'AYAM_PETELUR' | 'AYAM_PEDAGING' | 'SAPI' | 'LELE';

export interface KomoditasConfig {
  id: KomoditasTernak;
  nama: string;
  subjudul: string;
  icon: string;
  satuanProduksiUtama: string;
  labelProduksiUtama: string;
  labelPopulasi: string;
  satuanPopulasi: string;
  labelKandang: string;
  deskripsi: string;
  warnaTema: string;
}

export const KOMODITAS_LIST: Record<KomoditasTernak, KomoditasConfig> = {
  BEBEK_PETELUR: {
    id: 'BEBEK_PETELUR',
    nama: 'Bebek Petelur',
    subjudul: 'Produksi Telur & Akuntansi',
    icon: '🦆',
    satuanProduksiUtama: 'Butir',
    labelProduksiUtama: 'Produksi Telur',
    labelPopulasi: 'Bebek Produktif',
    satuanPopulasi: 'Ekor',
    labelKandang: 'Kandang Bebek',
    deskripsi: 'Manajemen Hen-Day Production (HDP), FCR pakan, telur grade A/B, dan bebek afkir.',
    warnaTema: 'amber',
  },
  AYAM_PETELUR: {
    id: 'AYAM_PETELUR',
    nama: 'Ayam Petelur (Layer)',
    subjudul: 'Telur Ayam Ras / Kampung',
    icon: '🐔',
    satuanProduksiUtama: 'Butir',
    labelProduksiUtama: 'Produksi Telur',
    labelPopulasi: 'Ayam Layer',
    satuanPopulasi: 'Ekor',
    labelKandang: 'Kandang Baterai / Closed House',
    deskripsi: 'Monitoring puncak produksi layer, pakan konsentrat, vaksinasi, dan rasio sortasi.',
    warnaTema: 'orange',
  },
  AYAM_PEDAGING: {
    id: 'AYAM_PEDAGING',
    nama: 'Ayam Pedaging (Broiler)',
    subjudul: 'Penggemukan & Panen Daging',
    icon: '🍗',
    satuanProduksiUtama: 'Kg',
    labelProduksiUtama: 'Bobot Panen Daging',
    labelPopulasi: 'Populasi Broiler',
    satuanPopulasi: 'Ekor',
    labelKandang: 'Kandang Postal / Tunnel',
    deskripsi: 'Pencatatan siklus panen (30-35 hari), mortalitas DOC, pertambahan bobot harian (ADG), dan indeks performa.',
    warnaTema: 'red',
  },
  SAPI: {
    id: 'SAPI',
    nama: 'Sapi (Perah & Potong)',
    subjudul: 'Susu Segar & Penggemukan',
    icon: '🐄',
    satuanProduksiUtama: 'Liter / Kg',
    labelProduksiUtama: 'Produksi Susu / Bobot',
    labelPopulasi: 'Ekor Sapi',
    satuanPopulasi: 'Ekor',
    labelKandang: 'Kandang Sapi',
    deskripsi: 'Pencatatan produksi liter susu per hari, calving date, siklus pakan hijauan/konsentrat, dan bobot timbang.',
    warnaTema: 'emerald',
  },
  LELE: {
    id: 'LELE',
    nama: 'Budidaya Ikan Lele',
    subjudul: 'Akuakultur & Kolam Bioflok',
    icon: '🐟',
    satuanProduksiUtama: 'Kg',
    labelProduksiUtama: 'Hasil Panen Ikan',
    labelPopulasi: 'Bibit / Ikan Tebar',
    satuanPopulasi: 'Ekor',
    labelKandang: 'Kolam Terpal / Bioflok',
    deskripsi: 'Manajemen tebar benih, sampling ukuran per kg, pemberian pelet, dan panen total.',
    warnaTema: 'cyan',
  },
};

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  farmName: string;
  role: 'OWNER' | 'PETERNAN_PRO' | 'ADMIN';
  plan: 'PREMIUM' | 'ENTERPRISE' | 'STARTER';
  createdAt: string;
  avatarUrl?: string;
  isGoogleAuth?: boolean;
  activeCommodity?: KomoditasTernak;
  enabledCommodities?: KomoditasTernak[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface FarmMetricsSummary {
  saldoKas: number;
  labaRugiMtd: number;
  hdpHariIni: number;
  totalPopulasiHidup: number;
  totalTelurHariIni: number;
  totalPakanKgHariIni: number;
  fcrAverage: number;
  totalPiutang: number;
  totalHutang: number;

  // Multi-Commodity Adaptations
  activeCommodity?: KomoditasTernak;
  labelProduksiUtama?: string;
  nilaiProduksiHariIni?: number | string;
  satuanProduksiUtama?: string;
  labelEfisiensi?: string;
  nilaiEfisiensi?: number | string;
  labelPopulasi?: string;
  labelKandang?: string;

  // Specific Sector Indicators
  // Broiler
  rataBobotBroilerKg?: number;
  indeksPerformaRata?: number;
  dayaHidupPersen?: number;
  // Sapi
  totalSusuHariIniLiter?: number;
  rataBobotSapiKg?: number;
  totalPakanHijauanKg?: number;
  totalPakanKonsentratKg?: number;
  // Lele
  biomassaIkanKg?: number;
  survivalRateRata?: number;
  samplingIsiPerKgRata?: number;
}


