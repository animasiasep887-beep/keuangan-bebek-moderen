import type {
  Kandang,
  PopulasiBebek,
  PakanItem,
  PencatatanHarian,
  KodeAkun,
  TransaksiKeuangan,
  AsetTetap,
  HutangPiutang,
} from '../types';

export const INITIAL_KANDANG: Kandang[] = [
  { id: 'k-1', namaKandang: 'Kandang Alpha (Utama)', kapasitas: 1000, status: 'AKTIF', catatan: 'Bebek umur 28 minggu, masa puncak lay' },
  { id: 'k-2', namaKandang: 'Kandang Beta (Timur)', kapasitas: 800, status: 'AKTIF', catatan: 'Bebek umur 34 minggu, performa stabil' },
  { id: 'k-3', namaKandang: 'Kandang Gamma (Barat)', kapasitas: 700, status: 'AKTIF', catatan: 'Bebek umur 42 minggu, pakan standar' },
];

export const INITIAL_POPULASI: PopulasiBebek[] = [
  {
    id: 'pop-1',
    kandangId: 'k-1',
    kodeBatch: 'BATCH-2026-A1',
    tglMasuk: '2026-01-15',
    jumlahAwal: 1000,
    jumlahSaatIni: 985,
    hargaBeliPerEkor: 75000,
    umurMinggu: 28,
    status: 'PRODUKTIF',
  },
  {
    id: 'pop-2',
    kandangId: 'k-2',
    kodeBatch: 'BATCH-2025-B2',
    tglMasuk: '2025-11-10',
    jumlahAwal: 800,
    jumlahSaatIni: 778,
    hargaBeliPerEkor: 72000,
    umurMinggu: 34,
    status: 'PRODUKTIF',
  },
  {
    id: 'pop-3',
    kandangId: 'k-3',
    kodeBatch: 'BATCH-2025-C1',
    tglMasuk: '2025-08-01',
    jumlahAwal: 700,
    jumlahSaatIni: 672,
    hargaBeliPerEkor: 70000,
    umurMinggu: 42,
    status: 'PRODUKTIF',
  },
];

export const INITIAL_PAKAN: PakanItem[] = [
  { id: 'pak-1', namaPakan: 'Konsentrat Bebek Petelur Super (K-99)', merk: 'Cargill / Japfa', stokKg: 1250, hargaPerKg: 8200, minStokKg: 300 },
  { id: 'pak-2', namaPakan: 'Dedak Padi Super Halus', merk: 'Lokal Premium', stokKg: 800, hargaPerKg: 4500, minStokKg: 200 },
  { id: 'pak-3', namaPakan: 'Jagung Giling Kering', merk: 'Petani Lokal', stokKg: 1500, hargaPerKg: 6200, minStokKg: 400 },
];

export const INITIAL_KODE_AKUN: KodeAkun[] = [
  // Assets (100-199)
  { id: '101', kode: '101', nama: 'Kas Utama Peternakan', tipe: 'ASSET', saldoNormal: 'DEBIT' },
  { id: '102', kode: '102', nama: 'Bank BCA Operational', tipe: 'ASSET', saldoNormal: 'DEBIT' },
  { id: '103', kode: '103', nama: 'Piutang Pengepul Telur', tipe: 'ASSET', saldoNormal: 'DEBIT' },
  { id: '104', kode: '104', nama: 'Persediaan Pakan & Obat', tipe: 'ASSET', saldoNormal: 'DEBIT' },
  { id: '105', kode: '105', nama: 'Persediaan Telur Siap Jual', tipe: 'ASSET', saldoNormal: 'DEBIT' },
  { id: '120', kode: '120', nama: 'Aset Biologis - Populasi Bebek Layer', tipe: 'ASSET', saldoNormal: 'DEBIT' },
  { id: '121', kode: '121', nama: 'Akumulasi Penyusutan Bebek Layer', tipe: 'ASSET', saldoNormal: 'KREDIT' },
  { id: '130', kode: '130', nama: 'Aset Tetap - Bangunan Kandang', tipe: 'ASSET', saldoNormal: 'DEBIT' },
  { id: '131', kode: '131', nama: 'Akumulasi Penyusutan Kandang', tipe: 'ASSET', saldoNormal: 'KREDIT' },
  { id: '132', kode: '132', nama: 'Aset Tetap - Peralatan & Mesin', tipe: 'ASSET', saldoNormal: 'DEBIT' },

  // Liabilities (200-299)
  { id: '201', kode: '201', nama: 'Hutang Dagang Supplier Pakan', tipe: 'LIABILITY', saldoNormal: 'KREDIT' },
  { id: '202', kode: '202', nama: 'Hutang Bank / Modal Usaha', tipe: 'LIABILITY', saldoNormal: 'KREDIT' },

  // Equity (300-399)
  { id: '301', kode: '301', nama: 'Modal Pemilik Peternakan', tipe: 'EQUITY', saldoNormal: 'KREDIT' },
  { id: '302', kode: '302', nama: 'Laba Ditahan', tipe: 'EQUITY', saldoNormal: 'KREDIT' },

  // Revenue (400-499)
  { id: '401', kode: '401', nama: 'Pendapatan Penjualan Telur Grade A', tipe: 'REVENUE', saldoNormal: 'KREDIT' },
  { id: '402', kode: '402', nama: 'Pendapatan Penjualan Telur Grade B (Retak)', tipe: 'REVENUE', saldoNormal: 'KREDIT' },
  { id: '403', kode: '403', nama: 'Pendapatan Penjualan Bebek Afkir', tipe: 'REVENUE', saldoNormal: 'KREDIT' },
  { id: '404', kode: '404', nama: 'Pendapatan Penjualan Pupuk Kandang (Kohe)', tipe: 'REVENUE', saldoNormal: 'KREDIT' },

  // Expenses (500-599)
  { id: '501', kode: '501', nama: 'Beban Pakan Bebek Harian', tipe: 'EXPENSE', saldoNormal: 'DEBIT' },
  { id: '502', kode: '502', nama: 'Beban Obat, Vaksin & Vitamin', tipe: 'EXPENSE', saldoNormal: 'DEBIT' },
  { id: '503', kode: '503', nama: 'Beban Gaji Anak Kandang & Pengelola', tipe: 'EXPENSE', saldoNormal: 'DEBIT' },
  { id: '504', kode: '504', nama: 'Beban Penyusutan Bebek & Kandang', tipe: 'EXPENSE', saldoNormal: 'DEBIT' },
  { id: '505', kode: '505', nama: 'Beban Listrik, Air & Maintenance', tipe: 'EXPENSE', saldoNormal: 'DEBIT' },
  { id: '506', kode: '506', nama: 'Beban Kerugian Kematian Bebek', tipe: 'EXPENSE', saldoNormal: 'DEBIT' },
];

export const INITIAL_ASET: AsetTetap[] = [
  {
    id: 'ast-1',
    namaAset: 'Bangunan Kandang Bambu Modern (3 Unit)',
    kategori: 'KANDANG',
    nilaiPerolehan: 150000000,
    akumulasiPenyusutan: 25000000,
    nilaiBuku: 125000000,
    tglPerolehan: '2024-06-01',
    masaManfaatBulan: 60,
    penyusutanBulanan: 2500000,
  },
  {
    id: 'ast-2',
    namaAset: 'Populasi 2,435 Ekor Bebek Petelur Layer',
    kategori: 'BIOLOGIS_BEBEK',
    nilaiPerolehan: 178250000,
    akumulasiPenyusutan: 32000000,
    nilaiBuku: 146250000,
    tglPerolehan: '2025-10-01',
    masaManfaatBulan: 18,
    penyusutanBulanan: 9902700,
  },
  {
    id: 'ast-3',
    namaAset: 'Mesin Pembuat Pakan & Tempat Minum Otomatis',
    kategori: 'PERALATAN',
    nilaiPerolehan: 35000000,
    akumulasiPenyusutan: 7000000,
    nilaiBuku: 28000000,
    tglPerolehan: '2025-02-15',
    masaManfaatBulan: 36,
    penyusutanBulanan: 972200,
  },
];

export const INITIAL_HUTANG_PIUTANG: HutangPiutang[] = [
  {
    id: 'hp-1',
    jenis: 'PIUTANG',
    namaKontak: 'Pak Haji Rohman (Pengepul Telur Malang)',
    noHp: '0812-3456-7890',
    deskripsi: 'Penjualan 10 tray telur Grade A (3.000 butir)',
    nominalTotal: 7200000,
    sisaNominal: 4200000,
    tglJatuhTempo: '2026-08-25',
    status: 'BELUM_LUNAS',
  },
  {
    id: 'hp-2',
    jenis: 'HUTANG',
    namaKontak: 'PT Poultry Feed Nusantara',
    noHp: '0811-9876-5432',
    deskripsi: 'Pembelian 2 Ton Konsentrat K-99',
    nominalTotal: 16400000,
    sisaNominal: 8200000,
    tglJatuhTempo: '2026-08-30',
    status: 'BELUM_LUNAS',
  },
];

// Helper to generate 30 days of past logs leading up to 2026-08-20
export const generateInitialPencatatanHarian = (): PencatatanHarian[] => {
  const logs: PencatatanHarian[] = [];
  const baseDate = new Date('2026-08-20');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Total ducks ~2,435 across 3 coops
    const totalDucks = 2435;
    // Vary HDP between 86.5% and 91.2%
    const variation = (Math.sin(i * 0.5) * 2) + ((i % 3) * 0.8);
    const hdp = Math.min(92, Math.max(85, 88.5 + variation));
    
    const totalEggsHarvested = Math.round(totalDucks * (hdp / 100));
    const telurRetak = Math.round(totalEggsHarvested * 0.025); // ~2.5% retak
    const telurRusak = Math.round(totalEggsHarvested * 0.005); // ~0.5% rusak
    const telurUtuh = totalEggsHarvested - telurRetak - telurRusak;

    // Weight per egg ~65g -> total kg
    const totalBeratKg = Number(((totalEggsHarvested * 65) / 1000).toFixed(1));

    // Feed consumption ~150g per duck -> ~365 kg total
    const pakanKg = Math.round(totalDucks * 0.15);
    const fcr = Number((pakanKg / totalBeratKg).toFixed(2));

    const bebekMati = (i % 7 === 0) ? 1 : 0;
    const bebekAfkir = (i === 12) ? 5 : 0;

    logs.push({
      id: `log-${30 - i}`,
      tanggal: dateStr,
      kandangId: 'k-1',
      populasiId: 'pop-1',
      telurUtuh,
      telurRetak,
      telurRusak,
      totalBeratTelurKg: totalBeratKg,
      bebekMati,
      bebekAfkir,
      pakanKg,
      pakanId: 'pak-1',
      hdpPercentage: Number(hdp.toFixed(1)),
      fcr,
      catatan: i === 0 ? 'Kondisi kandang bersih, bebek sangat aktif, pakan dilahap habis' : undefined,
      createdBy: 'Pak Budi (Anak Kandang)',
    });
  }

  return logs;
};

export const generateInitialFinancialTransactions = (): TransaksiKeuangan[] => {
  const transactions: TransaksiKeuangan[] = [
    {
      id: 'trx-1',
      tanggal: '2026-08-01',
      noRef: 'TRX-20260801-01',
      deskripsi: 'Penjualan Telur Grade A (20 Tray / 6,000 Butir) ke Pengepul Malang',
      totalNominal: 14400000,
      tipeTransaksi: 'PENDAPATAN',
      kategoriPendapatan: 'TELUR_GRADE_A',
      createdBy: 'Owner',
      items: [
        { akunId: '101', debit: 14400000, kredit: 0 },
        { akunId: '401', debit: 0, kredit: 14400000 },
      ],
    },
    {
      id: 'trx-2',
      tanggal: '2026-08-03',
      noRef: 'TRX-20260803-02',
      deskripsi: 'Pembelian Konsentrat Pakan Bebek K-99 (1.5 Ton)',
      totalNominal: 12300000,
      tipeTransaksi: 'PENGELUARAN',
      kategoriPengeluaran: 'PAKAN',
      createdBy: 'Owner',
      items: [
        { akunId: '501', debit: 12300000, kredit: 0 },
        { akunId: '101', debit: 0, kredit: 12300000 },
      ],
    },
    {
      id: 'trx-3',
      tanggal: '2026-08-05',
      noRef: 'TRX-20260805-03',
      deskripsi: 'Penjualan Pupuk Kandang Kohe Bebek (100 Karung)',
      totalNominal: 1500000,
      tipeTransaksi: 'PENDAPATAN',
      kategoriPendapatan: 'PUPUK_KANDANG',
      createdBy: 'Owner',
      items: [
        { akunId: '101', debit: 1500000, kredit: 0 },
        { akunId: '404', debit: 0, kredit: 1500000 },
      ],
    },
    {
      id: 'trx-4',
      tanggal: '2026-08-10',
      noRef: 'TRX-20260810-04',
      deskripsi: 'Pembayaran Gaji 2 Orang Anak Kandang Bulan Agustus',
      totalNominal: 5000000,
      tipeTransaksi: 'PENGELUARAN',
      kategoriPengeluaran: 'GAJI',
      createdBy: 'Owner',
      items: [
        { akunId: '503', debit: 5000000, kredit: 0 },
        { akunId: '101', debit: 0, kredit: 5000000 },
      ],
    },
    {
      id: 'trx-5',
      tanggal: '2026-08-15',
      noRef: 'TRX-20260815-05',
      deskripsi: 'Penjualan Telur Retak Grade B & Bebek Afkir 5 Ekor',
      totalNominal: 1850000,
      tipeTransaksi: 'PENDAPATAN',
      kategoriPendapatan: 'TELUR_GRADE_B',
      createdBy: 'Owner',
      items: [
        { akunId: '101', debit: 1850000, kredit: 0 },
        { akunId: '402', debit: 0, kredit: 1600000 },
        { akunId: '403', debit: 0, kredit: 250000 },
      ],
    },
    {
      id: 'trx-6',
      tanggal: '2026-08-18',
      noRef: 'TRX-20260818-06',
      deskripsi: 'Pembelian Obat, Vaksin ND, & Vitamin Egg-Stimulant',
      totalNominal: 850000,
      tipeTransaksi: 'PENGELUARAN',
      kategoriPengeluaran: 'OBAT_VAKSIN',
      createdBy: 'Owner',
      items: [
        { akunId: '502', debit: 850000, kredit: 0 },
        { akunId: '101', debit: 0, kredit: 850000 },
      ],
    },
    {
      id: 'trx-7',
      tanggal: '2026-08-20',
      noRef: 'TRX-20260820-07',
      deskripsi: 'Penjualan Telur Grade A Harian (18 Tray / 5,400 Butir)',
      totalNominal: 12960000,
      tipeTransaksi: 'PENDAPATAN',
      kategoriPendapatan: 'TELUR_GRADE_A',
      createdBy: 'Owner',
      items: [
        { akunId: '101', debit: 12960000, kredit: 0 },
        { akunId: '401', debit: 0, kredit: 12960000 },
      ],
    },
  ];

  return transactions;
};
