import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { TransaksiKeuangan, PencatatanHarian, AsetTetap, HutangPiutang } from '../types';

export const formatIDR = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const ExportService = {
  // Export Laporan Laba Rugi (PDF)
  exportLabaRugiPDF: (
    startDate: string,
    endDate: string,
    revenueItems: { nama: string; total: number }[],
    expenseItems: { nama: string; total: number }[],
    totalRevenue: number,
    totalExpense: number,
    netProfit: number
  ) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(251, 191, 36); // Amber-400
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PETERNAKAN BEBEK PETELUR', 14, 16);

    doc.setTextColor(243, 244, 246);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`LAPORAN LABA RUGI (PROFIT & LOSS)`, 14, 25);
    doc.setFontSize(9);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 30);

    // Revenue Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PENDAPATAN OPERASIONAL', 14, 45);

    const revenueRows = revenueItems.map((item) => [item.nama, formatIDR(item.total)]);
    revenueRows.push(['TOTAL PENDAPATAN', formatIDR(totalRevenue)]);

    autoTable(doc, {
      startY: 48,
      head: [['Kategori Pendapatan', 'Jumlah (IDR)']],
      body: revenueRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [240, 253, 244], textColor: [6, 95, 70], fontStyle: 'bold' },
    });

    // Expenses Section
    // @ts-expect-error - autoTable attaches lastAutoTable
    const lastY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 100;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. PENGELUARAN / BEBAN OPERASIONAL', 14, lastY);

    const expenseRows = expenseItems.map((item) => [item.nama, formatIDR(item.total)]);
    expenseRows.push(['TOTAL PENGELUARAN', formatIDR(totalExpense)]);

    autoTable(doc, {
      startY: lastY + 3,
      head: [['Kategori Pengeluaran', 'Jumlah (IDR)']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
    });

    // Net Profit Banner
    // @ts-expect-error - autoTable attaches lastAutoTable
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 180;
    doc.setFillColor(netProfit >= 0 ? 236 : 254, netProfit >= 0 ? 253 : 242, netProfit >= 0 ? 245 : 242);
    doc.rect(14, finalY, 182, 20, 'F');
    doc.setDrawColor(netProfit >= 0 ? 16 : 239, netProfit >= 0 ? 185 : 68, netProfit >= 0 ? 129 : 68);
    doc.rect(14, finalY, 182, 20, 'S');

    doc.setTextColor(netProfit >= 0 ? 6 : 153, netProfit >= 0 ? 95 : 27, netProfit >= 0 ? 70 : 27);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `LABA / (RUGI) BERSIH PERIODE INI: ${formatIDR(netProfit)}`,
      20,
      finalY + 13
    );

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Dicetak secara otomatis pada: ${new Date().toLocaleString('id-ID')}`, 14, 285);

    doc.save(`Laporan_Laba_Rugi_${startDate}_${endDate}.pdf`);
  },

  // Export Rapi Multi-Sheet Excel Workbook
  exportLaporanLengkapExcel: (
    trxs: TransaksiKeuangan[],
    logs: PencatatanHarian[],
    asetList: AsetTetap[],
    hpList: HutangPiutang[]
  ) => {
    const workbook = XLSX.utils.book_new();

    // -------------------------------------------------------------
    // SHEET 1: RINGKASAN LABA RUGI & KEUANGAN
    // -------------------------------------------------------------
    const totalPendapatan = trxs
      .filter((t) => t.tipeTransaksi === 'PENDAPATAN')
      .reduce((acc, t) => acc + t.totalNominal, 0);

    const totalPengeluaran = trxs
      .filter((t) => t.tipeTransaksi === 'PENGELUARAN')
      .reduce((acc, t) => acc + t.totalNominal, 0);

    const labaRugiBersih = totalPendapatan - totalPengeluaran;

    const ringkasanData = [
      ['LAPORAN KEUANGAN PETERNAKAN BEBEK PETELUR'],
      ['Tanggal Cetak:', new Date().toLocaleString('id-ID')],
      [],
      ['1. RINGKASAN LABA / RUGI'],
      ['Keterangan', 'Nominal (IDR)'],
      ['Total Pendapatan (Penjualan Telur/Afkir/Kohe)', totalPendapatan],
      ['Total Pengeluaran (Pakan/Obat/Gaji/Operasional)', totalPengeluaran],
      ['LABA / (RUGI) BERSIH', labaRugiBersih],
      [],
      ['2. RINGKASAN KAS & kewajiban'],
      ['Kategori', 'Nominal (IDR)'],
      ['Saldo Kas / Arus Kas Bersih', totalPendapatan - totalPengeluaran],
      [
        'Total Piutang (Tagihan Pengepul Belum Lunas)',
        hpList.filter((h) => h.jenis === 'PIUTANG' && h.status === 'BELUM_LUNAS').reduce((a, b) => a + b.sisaNominal, 0),
      ],
      [
        'Total Hutang (Kewajiban Supplier Belum Lunas)',
        hpList.filter((h) => h.jenis === 'HUTANG' && h.status === 'BELUM_LUNAS').reduce((a, b) => a + b.sisaNominal, 0),
      ],
    ];

    const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanData);
    wsRingkasan['!cols'] = [{ wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, wsRingkasan, 'Ringkasan Keuangan');

    // -------------------------------------------------------------
    // SHEET 2: JURNAL TRANSAKSI KEUANGAN
    // -------------------------------------------------------------
    const journalRows = trxs.map((t, idx) => ({
      No: idx + 1,
      Tanggal: t.tanggal,
      'No Referensi': t.noRef,
      Deskripsi: t.deskripsi,
      Tipe: t.tipeTransaksi,
      'Kategori Akun': t.kategoriPendapatan || t.kategoriPengeluaran || '-',
      'Nominal (IDR)': t.totalNominal,
      Pembuat: t.createdBy,
    }));

    const wsJournal = XLSX.utils.json_to_sheet(
      journalRows.length > 0
        ? journalRows
        : [
            {
              No: '-',
              Tanggal: '-',
              'No Referensi': '-',
              Deskripsi: 'Belum ada transaksi. Silakan input pada modul Keuangan.',
              Tipe: '-',
              'Kategori Akun': '-',
              'Nominal (IDR)': 0,
              Pembuat: '-',
            },
          ]
    );
    wsJournal['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 20 },
      { wch: 45 },
      { wch: 15 },
      { wch: 20 },
      { wch: 18 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsJournal, 'Jurnal Keuangan');

    // -------------------------------------------------------------
    // SHEET 3: RIWAYAT PANEN TELUR HARIAN
    // -------------------------------------------------------------
    const harvestRows = logs.map((log, idx) => ({
      No: idx + 1,
      Tanggal: log.tanggal,
      'Telur Utuh (Grade A)': log.telurUtuh,
      'Telur Retak (Grade B)': log.telurRetak,
      'Telur Rusak': log.telurRusak,
      'Total Butir': log.telurUtuh + log.telurRetak + log.telurRusak,
      'Berat Total (Kg)': log.totalBeratTelurKg,
      'Hen-Day Prod (%)': log.hdpPercentage,
      'Pakan Konsumsi (Kg)': log.pakanKg,
      FCR: log.fcr,
      'Bebek Mati': log.bebekMati,
      'Bebek Afkir': log.bebekAfkir,
      Catatan: log.catatan || '-',
    }));

    const wsHarvest = XLSX.utils.json_to_sheet(
      harvestRows.length > 0
        ? harvestRows
        : [
            {
              No: '-',
              Tanggal: '-',
              'Telur Utuh (Grade A)': 0,
              'Telur Retak (Grade B)': 0,
              'Telur Rusak': 0,
              'Total Butir': 0,
              'Berat Total (Kg)': 0,
              'Hen-Day Prod (%)': 0,
              'Pakan Konsumsi (Kg)': 0,
              FCR: 0,
              'Bebek Mati': 0,
              'Bebek Afkir': 0,
              Catatan: 'Belum ada data panen harian.',
            },
          ]
    );
    wsHarvest['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 14 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 8 },
      { wch: 12 },
      { wch: 12 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsHarvest, 'Panen Harian');

    // -------------------------------------------------------------
    // SHEET 4: ASET & HUTANG PIUTANG
    // -------------------------------------------------------------
    const asetRows = asetList.map((a, idx) => ({
      No: idx + 1,
      'Nama Aset': a.namaAset,
      Kategori: a.kategori,
      'Nilai Perolehan (IDR)': a.nilaiPerolehan,
      'Akumulasi Penyusutan (IDR)': a.akumulasiPenyusutan,
      'Nilai Buku (IDR)': a.nilaiBuku,
      'Penyusutan Bulanan (IDR)': a.penyusutanBulanan,
    }));

    const wsAset = XLSX.utils.json_to_sheet(
      asetRows.length > 0
        ? asetRows
        : [
            {
              No: '-',
              'Nama Aset': 'Belum ada aset terdaftar.',
              Kategori: '-',
              'Nilai Perolehan (IDR)': 0,
              'Akumulasi Penyusutan (IDR)': 0,
              'Nilai Buku (IDR)': 0,
              'Penyusutan Bulanan (IDR)': 0,
            },
          ]
    );
    wsAset['!cols'] = [
      { wch: 5 },
      { wch: 35 },
      { wch: 18 },
      { wch: 20 },
      { wch: 22 },
      { wch: 18 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsAset, 'Aset & Amortisasi');

    // Download File
    const filename = `Laporan_Keuangan_Peternakan_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  },

  // Export Financial Ledger to Excel (Legacy alias)
  exportKeuanganExcel: (trxs: TransaksiKeuangan[]) => {
    ExportService.exportLaporanLengkapExcel(trxs, [], [], []);
  },
};
