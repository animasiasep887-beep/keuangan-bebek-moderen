import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { TransaksiKeuangan, PencatatanHarian, AsetTetap, HutangPiutang, User } from '../types';

export const formatIDR = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const ExportService = {
  // -------------------------------------------------------------
  // 1. LAPORAN LABA RUGI EKSEKUTIF (PDF RESMI & DETAIL)
  // -------------------------------------------------------------
  exportLabaRugiPDF: (params: {
    startDate: string;
    endDate: string;
    revenueItems: { nama: string; total: number }[];
    expenseItems: { nama: string; total: number }[];
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    currentUser?: User | null;
    logs?: PencatatanHarian[];
  }) => {
    const {
      startDate,
      endDate,
      revenueItems,
      expenseItems,
      totalRevenue,
      totalExpense,
      netProfit,
      currentUser,
      logs = [],
    } = params;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const farmName = currentUser?.farmName || 'PETERNAKAN BEBEK PETELUR PRO';
    const ownerName = currentUser?.name || 'Pemilik Peternakan';
    const phone = currentUser?.phone || '-';
    const docNo = `RPT-LR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // === HEADER KOP RESMI ===
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 42, 'F');

    // Golden Accent Line
    doc.setFillColor(245, 158, 11); // Amber-500
    doc.rect(0, 42, 210, 2, 'F');

    // Brand Title
    doc.setTextColor(251, 191, 36); // Amber-400
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(farmName.toUpperCase(), 14, 14);

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN LABA RUGI OPERASIONAL (PROFIT & LOSS STATEMENT)', 14, 22);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pemilik: ${ownerName} | Kontak WA: ${phone}`, 14, 29);
    doc.text(`Periode: ${startDate} s/d ${endDate} | No. Dokumen: ${docNo}`, 14, 35);

    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 145, 35);

    // === KPI HIGHLIGHT CARDS ===
    const filteredLogs = logs.filter((l) => l.tanggal >= startDate && l.tanggal <= endDate);
    const totalEggsPeriod = filteredLogs.reduce(
      (acc, l) => acc + (l.telurUtuh + l.telurRetak + l.telurRusak),
      0
    );
    const avgHdpPeriod =
      filteredLogs.length > 0
        ? (filteredLogs.reduce((acc, l) => acc + l.hdpPercentage, 0) / filteredLogs.length).toFixed(1)
        : '0';

    // 4 Summary Boxes
    const cardY = 48;
    const cardW = 42;
    const cardH = 17;
    const cards = [
      { label: 'PRODUKSI TELUR', val: `${totalEggsPeriod.toLocaleString('id-ID')} Butir`, bg: [248, 250, 252], text: [15, 23, 42] },
      { label: 'RATA-RATA HDP', val: `${avgHdpPeriod}%`, bg: [254, 243, 199], text: [146, 64, 14] },
      { label: 'TOTAL PENDAPATAN', val: formatIDR(totalRevenue), bg: [236, 253, 245], text: [6, 95, 70] },
      { label: 'LABA BERSIH', val: formatIDR(netProfit), bg: netProfit >= 0 ? [236, 253, 245] : [254, 242, 242], text: netProfit >= 0 ? [6, 95, 70] : [153, 27, 27] },
    ];

    cards.forEach((c, idx) => {
      const cx = 14 + idx * (cardW + 4.5);
      doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
      doc.roundedRect(cx, cardY, cardW, cardH, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(cx, cardY, cardW, cardH, 2, 2, 'S');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, cx + 3, cardY + 5);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(c.text[0], c.text[1], c.text[2]);
      doc.text(c.val, cx + 3, cardY + 12);
    });

    // === SECTION 1: PENDAPATAN OPERASIONAL ===
    let currentY = cardY + cardH + 8;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PENDAPATAN OPERASIONAL (PENJUALAN HASIL TERNAK)', 14, currentY);

    const revenueRows = revenueItems.map((item) => [item.nama, formatIDR(item.total)]);
    revenueRows.push(['TOTAL PENDAPATAN OPERASIONAL', formatIDR(totalRevenue)]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Rincian Kategori Pendapatan', 'Total (IDR)']],
      body: revenueRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      footStyles: { fillColor: [240, 253, 244], textColor: [6, 95, 70], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 52, halign: 'right' },
      },
    });

    // === SECTION 2: PENGELUARAN / BEBAN OPERASIONAL ===
    // @ts-expect-error - autoTable attaches lastAutoTable
    currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : currentY + 45;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('2. PENGELUARAN & BIAYA OPERASIONAL KANDANG', 14, currentY);

    const expenseRows = expenseItems.map((item) => [item.nama, formatIDR(item.total)]);
    expenseRows.push(['TOTAL BIAYA OPERASIONAL', formatIDR(totalExpense)]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Rincian Kategori Pengeluaran', 'Total (IDR)']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      footStyles: { fillColor: [254, 242, 242], textColor: [153, 27, 27], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 52, halign: 'right' },
      },
    });

    // === SECTION 3: BANNER LABA / RUGI BERSIH ===
    // @ts-expect-error - autoTable attaches lastAutoTable
    const netBannerY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : currentY + 50;
    const isProfit = netProfit >= 0;

    doc.setFillColor(isProfit ? 236 : 254, isProfit ? 253 : 242, isProfit ? 245 : 242);
    doc.roundedRect(14, netBannerY, 182, 18, 3, 3, 'F');
    doc.setDrawColor(isProfit ? 16 : 239, isProfit ? 185 : 68, isProfit ? 129 : 68);
    doc.setLineWidth(0.6);
    doc.roundedRect(14, netBannerY, 182, 18, 3, 3, 'S');

    doc.setTextColor(isProfit ? 6 : 153, isProfit ? 95 : 27, isProfit ? 70 : 27);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      isProfit
        ? `LABA BERSIH OPERASIONAL: ${formatIDR(netProfit)}`
        : `DEFISIT / RUGI BERSIH OPERASIONAL: ${formatIDR(netProfit)}`,
      20,
      netBannerY + 8
    );

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Margin Keuntungan: ${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}% dari Total Pendapatan Kotor`,
      20,
      netBannerY + 14
    );

    // === SECTION 4: TANDA TANGAN & PENGESAHAN RESMI ===
    const signY = netBannerY + 28;
    if (signY < 250) {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');

      // Left: Disiapkan oleh
      doc.text('Dibuat & Diverifikasi oleh:', 25, signY);
      doc.text('Petugas / Pengelola Kandang', 25, signY + 5);
      doc.line(25, signY + 24, 75, signY + 24);
      doc.text(`( ${ownerName} )`, 25, signY + 28);

      // Right: Disetujui oleh
      doc.text('Disetujui untuk Laporan Resmi:', 135, signY);
      doc.text('Pemilik Peternakan (Owner)', 135, signY + 5);
      doc.line(135, signY + 24, 185, signY + 24);
      doc.text(`( ${ownerName} )`, 135, signY + 28);

      // Digital Stamp Badge
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(88, signY + 3, 34, 18, 2, 2, 'S');
      doc.setTextColor(217, 119, 6);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('TERVERIFIKASI SISTEM', 91, signY + 10);
      doc.text('BEBEKJAYA PRO SIM', 92, signY + 15);
    }

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Laporan Resmi PRATAMA BISNIS GRUP • ${farmName} • Dicetak Otomatis dari BebekJaya PRO SIM`,
      14,
      287
    );

    doc.save(`Laporan_Laba_Rugi_${farmName.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`);
  },

  // -------------------------------------------------------------
  // 2. LAPORAN EKSEKUTIF MULTI-HALAMAN SUPER LENGKAP (PDF)
  // -------------------------------------------------------------
  exportLaporanEksekutifLengkapPDF: (params: {
    startDate: string;
    endDate: string;
    currentUser?: User | null;
    transactions: TransaksiKeuangan[];
    logs: PencatatanHarian[];
    asetList: AsetTetap[];
    hpList: HutangPiutang[];
  }) => {
    const {
      startDate,
      endDate,
      currentUser,
      transactions,
      logs,
      asetList,
      hpList,
    } = params;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const farmName = currentUser?.farmName || 'PETERNAKAN BEBEK PETELUR PRO';
    const ownerName = currentUser?.name || 'Pemilik Peternakan';
    const phone = currentUser?.phone || '-';

    // Page 1: Kop Surat & Executive Summary
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 42, 'F');
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 42, 210, 2, 'F');

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(farmName.toUpperCase(), 14, 14);

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BUKU LAPORAN KEUANGAN & PANEN HARIAN TERPADU', 14, 22);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pemilik: ${ownerName} | Kontak: ${phone}`, 14, 29);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 35);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 145, 35);

    // Financial Calculation
    const filteredTrxs = transactions.filter((t) => t.tanggal >= startDate && t.tanggal <= endDate);
    const totalPendapatan = filteredTrxs
      .filter((t) => t.tipeTransaksi === 'PENDAPATAN')
      .reduce((acc, t) => acc + t.totalNominal, 0);
    const totalPengeluaran = filteredTrxs
      .filter((t) => t.tipeTransaksi === 'PENGELUARAN')
      .reduce((acc, t) => acc + t.totalNominal, 0);
    const labaBersih = totalPendapatan - totalPengeluaran;

    // Harvest Calculation
    const filteredLogs = logs.filter((l) => l.tanggal >= startDate && l.tanggal <= endDate);
    const totalTelurUtuh = filteredLogs.reduce((acc, l) => acc + l.telurUtuh, 0);
    const totalTelurRetak = filteredLogs.reduce((acc, l) => acc + l.telurRetak, 0);
    const totalTelurAll = totalTelurUtuh + totalTelurRetak;
    const avgHdp =
      filteredLogs.length > 0
        ? (filteredLogs.reduce((acc, l) => acc + l.hdpPercentage, 0) / filteredLogs.length).toFixed(1)
        : '0';

    // Summary Table 1: Financial & Production KPI
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. RINGKASAN EKSEKUTIF KINERJA KANDANG & KEUANGAN', 14, 52);

    const kpiRows = [
      ['Total Butir Telur Dihasilkan', `${totalTelurAll.toLocaleString('id-ID')} Butir (${totalTelurUtuh} Utuh / ${totalTelurRetak} Retak)`],
      ['Tingkat Produktivitas Hen-Day (HDP)', `${avgHdp}% Rata-rata`],
      ['Total Pendapatan Penjualan Telur & Hasil Ternak', formatIDR(totalPendapatan)],
      ['Total Beban Operasional & Pakan Bebek', formatIDR(totalPengeluaran)],
      ['Laba / (Rugi) Bersih Periode Berjalan', formatIDR(labaBersih)],
      [
        'Total Piutang Pengepul / Pembeli Telur',
        formatIDR(hpList.filter((h) => h.jenis === 'PIUTANG' && h.status === 'BELUM_LUNAS').reduce((a, b) => a + b.sisaNominal, 0)),
      ],
      [
        'Total Hutang Supplier Pakan & Operasional',
        formatIDR(hpList.filter((h) => h.jenis === 'HUTANG' && h.status === 'BELUM_LUNAS').reduce((a, b) => a + b.sisaNominal, 0)),
      ],
      [
        'Nilai Buku Aset Tetap & Kandang',
        formatIDR(asetList.reduce((a, b) => a + (b.nilaiBuku || b.nilaiPerolehan), 0)),
      ],
    ];

    autoTable(doc, {
      startY: 55,
      head: [['Indikator Kinerja Utama (KPI)', 'Status / Nilai Riil']],
      body: kpiRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 82, fontStyle: 'bold' } },
    });

    // Table 2: Daily Harvest Logs
    // @ts-expect-error - autoTable attaches lastAutoTable
    const harvestY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 120;
    doc.text('2. CATATAN PANEN TELUR HARIAN TERPERINCI', 14, harvestY);

    const harvestRows = filteredLogs.slice(0, 15).map((l) => [
      l.tanggal,
      l.telurUtuh.toLocaleString('id-ID'),
      l.telurRetak.toLocaleString('id-ID'),
      (l.telurUtuh + l.telurRetak).toLocaleString('id-ID'),
      `${l.totalBeratTelurKg} Kg`,
      `${l.hdpPercentage}%`,
      `${l.pakanKg} Kg`,
      l.createdBy || 'Peternak',
    ]);

    autoTable(doc, {
      startY: harvestY + 3,
      head: [['Tanggal', 'Utuh', 'Retak', 'Total', 'Kg', 'HDP %', 'Pakan', 'Pencatat']],
      body:
        harvestRows.length > 0
          ? harvestRows
          : [['-', '0', '0', '0', '0 Kg', '0%', '0 Kg', 'Belum ada catatan panen di periode ini']],
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
    });

    // Table 3: Financial Transactions Ledger
    // @ts-expect-error - autoTable attaches lastAutoTable
    const trxY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 180;
    doc.text('3. JURNAL ARUS KAS & TRANSAKSI TERBARU', 14, trxY);

    const trxRows = filteredTrxs.slice(0, 12).map((t) => [
      t.tanggal,
      t.noRef,
      t.deskripsi,
      t.tipeTransaksi === 'PENDAPATAN' ? '+' : '-',
      formatIDR(t.totalNominal),
    ]);

    autoTable(doc, {
      startY: trxY + 3,
      head: [['Tanggal', 'No Ref', 'Deskripsi Transaksi', 'Tipe', 'Nominal']],
      body:
        trxRows.length > 0
          ? trxRows
          : [['-', '-', 'Belum ada transaksi di periode ini', '-', 'Rp 0']],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 32 },
        2: { cellWidth: 78 },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 35, halign: 'right' },
      },
    });

    // Footer Signature
    // @ts-expect-error - autoTable attaches lastAutoTable
    const finalSignY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 240;
    if (finalSignY < 265) {
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Petugas Kandang:', 30, finalSignY);
      doc.line(30, finalSignY + 16, 75, finalSignY + 16);
      doc.text(`( ${ownerName} )`, 30, finalSignY + 20);

      doc.text('Pemilik Peternakan:', 135, finalSignY);
      doc.line(135, finalSignY + 16, 180, finalSignY + 16);
      doc.text(`( ${ownerName} )`, 135, finalSignY + 20);
    }

    doc.save(`Laporan_Eksekutif_${farmName.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`);
  },

  // -------------------------------------------------------------
  // 3. BUKU KERJA EXCEL 6-SHEET MULTI-MODUL LENGKAP
  // -------------------------------------------------------------
  exportLaporanLengkapExcel: (
    trxs: TransaksiKeuangan[],
    logs: PencatatanHarian[],
    asetList: AsetTetap[],
    hpList: HutangPiutang[],
    currentUser?: User | null
  ) => {
    const workbook = XLSX.utils.book_new();
    const farmName = currentUser?.farmName || 'Peternakan Bebek Petelur Modern';
    const ownerName = currentUser?.name || 'Peternak';

    // SHEET 1: RINGKASAN EKSEKUTIF & KPI
    const totalPendapatan = trxs
      .filter((t) => t.tipeTransaksi === 'PENDAPATAN')
      .reduce((acc, t) => acc + t.totalNominal, 0);
    const totalPengeluaran = trxs
      .filter((t) => t.tipeTransaksi === 'PENGELUARAN')
      .reduce((acc, t) => acc + t.totalNominal, 0);
    const labaBersih = totalPendapatan - totalPengeluaran;

    const totalButirTelur = logs.reduce(
      (acc, l) => acc + (l.telurUtuh + l.telurRetak + l.telurRusak),
      0
    );
    const avgHdp =
      logs.length > 0
        ? (logs.reduce((acc, l) => acc + l.hdpPercentage, 0) / logs.length).toFixed(1)
        : '0';

    const ringkasanData = [
      ['BUKU LAPORAN KEUANGAN & OPERASIONAL PETERNAKAN BEBEK'],
      ['Nama Peternakan:', farmName],
      ['Nama Pemilik:', ownerName],
      ['Tanggal Cetak:', new Date().toLocaleString('id-ID')],
      [],
      ['1. INDIKATOR KINERJA KEUANGAN (IDR)'],
      ['Total Pendapatan Penjualan Telur & Lainnya', totalPendapatan],
      ['Total Pengeluaran & Beban Operasional', totalPengeluaran],
      ['Laba / (Rugi) Bersih', labaBersih],
      ['Margin Keuntungan Kotor', totalPendapatan > 0 ? `${((labaBersih / totalPendapatan) * 100).toFixed(1)}%` : '0%'],
      [],
      ['2. INDIKATOR KINERJA PRODUKSI TELUR'],
      ['Total Produksi Telur (Butir)', totalButirTelur],
      ['Rata-rata Hen-Day Production (HDP %)', `${avgHdp}%`],
      ['Total Hari Tercatat', logs.length],
      [],
      ['3. POSISI KAS, PIUTANG & HUTANG (IDR)'],
      ['Saldo Kas / Arus Kas Bersih', totalPendapatan - totalPengeluaran],
      [
        'Total Piutang Pengepul Belum Lunas',
        hpList.filter((h) => h.jenis === 'PIUTANG' && h.status === 'BELUM_LUNAS').reduce((a, b) => a + b.sisaNominal, 0),
      ],
      [
        'Total Hutang Usaha Belum Lunas',
        hpList.filter((h) => h.jenis === 'HUTANG' && h.status === 'BELUM_LUNAS').reduce((a, b) => a + b.sisaNominal, 0),
      ],
    ];

    const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanData);
    wsRingkasan['!cols'] = [{ wch: 45 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, wsRingkasan, 'Ringkasan Eksekutif');

    // SHEET 2: JURNAL TRANSAKSI KEUANGAN
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
        : [{ No: '-', Tanggal: '-', 'No Referensi': '-', Deskripsi: 'Belum ada transaksi', Tipe: '-', 'Kategori Akun': '-', 'Nominal (IDR)': 0, Pembuat: '-' }]
    );
    wsJournal['!cols'] = [
      { wch: 6 },
      { wch: 13 },
      { wch: 22 },
      { wch: 40 },
      { wch: 15 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsJournal, 'Jurnal Keuangan');

    // SHEET 3: RIWAYAT PANEN TELUR HARIAN
    const harvestRows = logs.map((log, idx) => ({
      No: idx + 1,
      Tanggal: log.tanggal,
      'Telur Utuh (Grade A)': log.telurUtuh,
      'Telur Retak (Grade B)': log.telurRetak,
      'Telur Rusak': log.telurRusak,
      'Total Butir': log.telurUtuh + log.telurRetak + log.telurRusak,
      'Total Berat (Kg)': log.totalBeratTelurKg,
      'Hen-Day Production (%)': log.hdpPercentage,
      'Konsumsi Pakan (Kg)': log.pakanKg,
      FCR: log.fcr,
      'Kematian Bebek': log.bebekMati,
      'Bebek Afkir': log.bebekAfkir,
      Pencatat: log.createdBy || '-',
      Catatan: log.catatan || '-',
    }));

    const wsHarvest = XLSX.utils.json_to_sheet(
      harvestRows.length > 0
        ? harvestRows
        : [{ No: '-', Tanggal: '-', 'Telur Utuh (Grade A)': 0, 'Telur Retak (Grade B)': 0, 'Telur Rusak': 0, 'Total Butir': 0, 'Total Berat (Kg)': 0, 'Hen-Day Production (%)': 0, 'Konsumsi Pakan (Kg)': 0, FCR: 0, 'Kematian Bebek': 0, 'Bebek Afkir': 0, Pencatat: '-', Catatan: '-' }]
    );
    wsHarvest['!cols'] = [
      { wch: 6 },
      { wch: 13 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 22 },
      { wch: 18 },
      { wch: 8 },
      { wch: 14 },
      { wch: 12 },
      { wch: 18 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsHarvest, 'Panen Harian & HDP');

    // SHEET 4: BUKU HUTANG & PIUTANG
    const hpRows = hpList.map((hp, idx) => ({
      No: idx + 1,
      Jenis: hp.jenis,
      Pihak: hp.namaKontak,
      'No. WhatsApp': hp.noHp || '-',
      Deskripsi: hp.deskripsi,
      'Nominal Total (IDR)': hp.nominalTotal,
      'Sisa Tagihan (IDR)': hp.sisaNominal,
      'Jatuh Tempo': hp.tglJatuhTempo,
      Status: hp.status,
    }));

    const wsHp = XLSX.utils.json_to_sheet(
      hpRows.length > 0
        ? hpRows
        : [{ No: '-', Jenis: '-', Pihak: '-', 'No. WhatsApp': '-', Deskripsi: 'Belum ada piutang/hutang', 'Nominal Total (IDR)': 0, 'Sisa Tagihan (IDR)': 0, 'Jatuh Tempo': '-', Status: '-' }]
    );
    wsHp['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 25 },
      { wch: 18 },
      { wch: 35 },
      { wch: 20 },
      { wch: 20 },
      { wch: 14 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsHp, 'Hutang & Piutang');

    // SHEET 5: DAFTAR ASET TETAP & INVENTARIS
    const asetRows = asetList.map((a, idx) => ({
      No: idx + 1,
      'Nama Aset / Kandang': a.namaAset,
      Kategori: a.kategori,
      'Nilai Perolehan (IDR)': a.nilaiPerolehan,
      'Akumulasi Penyusutan (IDR)': a.akumulasiPenyusutan,
      'Nilai Buku Saat Ini (IDR)': a.nilaiBuku,
      'Penyusutan per Bulan (IDR)': a.penyusutanBulanan,
    }));

    const wsAset = XLSX.utils.json_to_sheet(
      asetRows.length > 0
        ? asetRows
        : [{ No: '-', 'Nama Aset / Kandang': 'Belum ada aset terdaftar', Kategori: '-', 'Nilai Perolehan (IDR)': 0, 'Akumulasi Penyusutan (IDR)': 0, 'Nilai Buku Saat Ini (IDR)': 0, 'Penyusutan per Bulan (IDR)': 0 }]
    );
    wsAset['!cols'] = [
      { wch: 6 },
      { wch: 35 },
      { wch: 18 },
      { wch: 22 },
      { wch: 25 },
      { wch: 22 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsAset, 'Aset & Inventaris');

    const filename = `Laporan_Lengkap_${farmName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  },

  // Legacy alias
  exportKeuanganExcel: (trxs: TransaksiKeuangan[]) => {
    ExportService.exportLaporanLengkapExcel(trxs, [], [], []);
  },
};
