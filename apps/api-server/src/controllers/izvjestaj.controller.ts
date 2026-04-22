import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import {
  Organ,
  OrganizacionaJedinica,
  RadnoMjesto,
  Zaposlenik,
} from '@nx-fmeri/api-org';
import { getErrorMessage } from '../helpers/error.helper';
import path from 'path';

// Helper funkcija — dodaj na vrh fajla ili unutar getPopunjenostPodaci
const skrati = (tekst: string, maxChars: number): string => {
  return tekst.length > maxChars
    ? tekst.substring(0, maxChars - 3) + '...'
    : tekst;
};

// ── Helper — dohvati popunjenost za sve organe ────────
const getPopunjenostPodaci = async () => {
  const organi = await Organ.find({ aktivan: true })
    .sort({ redoslijed: 1 })
    .lean();

  return Promise.all(
    organi.map(async (organ) => {
      const jedinice = await OrganizacionaJedinica.find({
        organ: organ._id,
        aktivna: true,
      }).lean();

      const radnaMjesta = await RadnoMjesto.find({
        organizacionaJedinica: { $in: jedinice.map((j) => j._id) },
        aktivno: true,
      }).lean();

      const zaposlenici = await Zaposlenik.find({
        organ: organ._id,
        aktivan: true,
      })
        .select('radnoMjesto')
        .lean();

      const rmSaBrojem = radnaMjesta.map((rm) => {
        const popunjeno = zaposlenici.filter(
          (z) => z.radnoMjesto?.toString() === rm._id.toString(),
        ).length;
        return {
          ...rm,
          popunjeno,
          upraznjeno: Math.max(0, rm.brojIzvrsilaca - popunjeno),
        };
      });

      const ukupnoRM = rmSaBrojem.reduce((s, rm) => s + rm.brojIzvrsilaca, 0);
      const ukupnoPopunjeno = rmSaBrojem.reduce((s, rm) => s + rm.popunjeno, 0);

      const poJedinicama = jedinice
        .map((j) => {
          const rmJ = rmSaBrojem.filter(
            (rm) => rm.organizacionaJedinica?.toString() === j._id.toString(),
          );
          const ukupno = rmJ.reduce((s, rm) => s + rm.brojIzvrsilaca, 0);
          const popunjeno = rmJ.reduce((s, rm) => s + rm.popunjeno, 0);
          return {
            naziv: j.naziv,
            tip: j.tip,
            nivoJedinice: j.nivoJedinice,
            ukupnoRM: ukupno,
            popunjeno,
            upraznjeno: Math.max(0, ukupno - popunjeno),
            posto: ukupno > 0 ? Math.round((popunjeno / ukupno) * 100) : 0,
          };
        })
        .filter((j) => j.ukupnoRM > 0);

      return {
        naziv: organ.naziv,
        skraceniNaziv: organ.skraceniNaziv,
        vrstaOrgana: organ.vrstaOrgana,
        ukupnoRM,
        popunjeno: ukupnoPopunjeno,
        upraznjeno: Math.max(0, ukupnoRM - ukupnoPopunjeno),
        posto:
          ukupnoRM > 0 ? Math.round((ukupnoPopunjeno / ukupnoRM) * 100) : 0,
        poJedinicama,
      };
    }),
  );
};

// ── GET /api/izvjestaj/popunjenost/pdf ────────────────
export const popunjenostPDF = async (req: Request, res: Response) => {
  try {
    const podaci = await getPopunjenostPodaci();
    const datum = new Date().toLocaleDateString('bs-BA');

    // const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="popunjenost-${datum}.pdf"`,
    );

    // Na početku popunjenostPDF funkcije, prije doc.pipe(res):
    // const fontsDir = path.join(__dirname, '../assets/fonts');

    // const fontsDir = path.resolve('apps/api-server/src/assets/fonts');

    const fontsDir =
      process.env['NODE_ENV'] === 'production'
        ? path.join(process.cwd(), 'assets/fonts')
        : path.resolve('apps/api-server/src/assets/fonts');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    doc.registerFont('Regular', path.join(fontsDir, 'DejaVuSans.ttf'));
    doc.registerFont('Bold', path.join(fontsDir, 'DejaVuSans-Bold.ttf'));

    doc.pipe(res);

    // ── Naslov ──────────────────────────────────────
    doc
      .fontSize(18)
      .font('Bold')
      .text('Izvještaj o popunjenosti radnih mjesta', { align: 'center' });

    doc
      .fontSize(10)
      .font('Regular')
      .fillColor('#666')
      .text(
        `Federalno ministarstvo energije, rudarstva i industrije — ${datum}`,
        { align: 'center' },
      );

    doc.moveDown(1.5);

    // ── Sumarni podaci ──────────────────────────────
    const ukupnoRM = podaci.reduce((s, o) => s + o.ukupnoRM, 0);
    const ukupnoPop = podaci.reduce((s, o) => s + o.popunjeno, 0);
    const ukupnoUpr = ukupnoRM - ukupnoPop;
    const posto = ukupnoRM > 0 ? Math.round((ukupnoPop / ukupnoRM) * 100) : 0;

    doc
      .fontSize(11)
      .font('Bold')
      .fillColor('#000')
      .text('Sumarni pregled sistema', { underline: true });
    doc.moveDown(0.5);

    const sumCol = 120;
    doc.fontSize(10).font('Regular').fillColor('#333');
    doc.text(`Ukupno radnih mjesta:`, 40, doc.y, {
      continued: true,
      width: sumCol,
    });
    doc.font('Bold').text(`${ukupnoRM}`);
    doc
      .font('Regular')
      .text(`Popunjeno:`, 40, doc.y, { continued: true, width: sumCol });
    doc.font('Bold').fillColor('#38a169').text(`${ukupnoPop}`);
    doc
      .font('Regular')
      .fillColor('#333')
      .text(`Upražnjeno:`, 40, doc.y, { continued: true, width: sumCol });
    doc.font('Bold').fillColor('#e53e3e').text(`${ukupnoUpr}`);
    doc
      .font('Regular')
      .fillColor('#333')
      .text(`Popunjenost:`, 40, doc.y, { continued: true, width: sumCol });
    doc
      .font('Bold')
      .fillColor(posto >= 80 ? '#38a169' : posto >= 50 ? '#d69e2e' : '#e53e3e')
      .text(`${posto}%`);

    doc.fillColor('#000').moveDown(1.5);

    // ── Po organima ─────────────────────────────────
    for (const organ of podaci) {
      if (organ.ukupnoRM === 0) continue;

      // Nova stranica ako nema mjesta
      if (doc.y > 700) doc.addPage();

      // Organ header — sivi pravokutnik
      const headerY = doc.y;
      // doc.rect(40, headerY, 515, 28).fill('#e8edf2');
      doc.rect(40, headerY, 515, 26).fill('#e8edf2');
      const organNaziv = organ.skraceniNaziv
        ? `${organ.naziv} (${organ.skraceniNaziv})`
        : organ.naziv;

      // Organ header — manji font da stane u jedan red
      doc
        .fontSize(9)
        .font('Bold')
        .fillColor('#1a202c')
        .text(organNaziv, 46, headerY + 9, {
          width: 295,
          lineBreak: false,
          ellipsis: true,
        });

      // Stats desno — podigni malo
      doc
        .fontSize(8.5)
        .font('Regular')
        .fillColor('#4a5568')
        .text(
          `${organ.ukupnoRM} RM  |  ${organ.popunjeno} pop.  |  ${organ.upraznjeno} upr.  |  ${organ.posto}%`,
          345,
          headerY + 9,
          { width: 205, align: 'right', lineBreak: false },
        );

      // doc.y = headerY + 36;
      doc.y = headerY + 34;

      // Tabela header
      const colX = [46, 310, 365, 420, 475];
      const colW = [260, 52, 52, 52, 60];
      const thY = doc.y;

      doc.rect(40, thY, 515, 18).fill('#f7fafc');

      doc.fontSize(7.5).font('Bold').fillColor('#718096');
      doc.text('Org. jedinica', colX[0], thY + 5, {
        width: colW[0],
        lineBreak: false,
      });
      doc.text('Ukupno', colX[1], thY + 5, {
        width: colW[1],
        align: 'right',
        lineBreak: false,
      });
      doc.text('Pop.', colX[2], thY + 5, {
        width: colW[2],
        align: 'right',
        lineBreak: false,
      });
      doc.text('Upr.', colX[3], thY + 5, {
        width: colW[3],
        align: 'right',
        lineBreak: false,
      });
      doc.text('%', colX[4], thY + 5, {
        width: colW[4],
        align: 'right',
        lineBreak: false,
      });

      doc.y = thY + 22;

      // Jedinice redovi
      for (const j of organ.poJedinicama) {
        if (doc.y > 750) {
          doc.addPage();
        }

        const rowY = doc.y;
        const isUnutrasnja = j.nivoJedinice === 'unutrasnja';

        // Alternativna pozadina za unutrašnje
        if (isUnutrasnja) {
          doc.rect(40, rowY, 515, 16).fill('#fafafa');
        }

        const nazivIndent = isUnutrasnja ? colX[0] + 10 : colX[0];
        const nazivWidth = isUnutrasnja ? colW[0] - 10 : colW[0];
        const prefix = isUnutrasnja ? '↳ ' : '';

        doc
          .fontSize(8)
          .font(isUnutrasnja ? 'Regular' : 'Bold')
          .fillColor('#2d3748')
          .text(
            `${prefix}${skrati(j.naziv, isUnutrasnja ? 52 : 58)}`,
            nazivIndent,
            rowY + 4,
            { width: nazivWidth, lineBreak: false },
          );

        doc
          .font('Regular')
          .fillColor('#2d3748')
          .text(`${j.ukupnoRM}`, colX[1], rowY + 4, {
            width: colW[1],
            align: 'right',
            lineBreak: false,
          });

        doc.fillColor('#38a169').text(`${j.popunjeno}`, colX[2], rowY + 4, {
          width: colW[2],
          align: 'right',
          lineBreak: false,
        });

        doc
          .fillColor(j.upraznjeno > 0 ? '#e53e3e' : '#718096')
          .text(`${j.upraznjeno}`, colX[3], rowY + 4, {
            width: colW[3],
            align: 'right',
            lineBreak: false,
          });

        const postoColor =
          j.posto >= 80 ? '#38a169' : j.posto >= 50 ? '#d69e2e' : '#e53e3e';
        doc.fillColor(postoColor).text(`${j.posto}%`, colX[4], rowY + 4, {
          width: colW[4],
          align: 'right',
          lineBreak: false,
        });

        // Separator linija
        // Separator linija — promijeni rowY + 16 u rowY + 20
        doc
          .moveTo(40, rowY + 20)
          .lineTo(555, rowY + 20)
          .strokeColor('#e2e8f0')
          .lineWidth(0.5)
          .stroke();

        doc.y = rowY + 20; //18;
      }

      // doc.moveDown(1.2);
      // Razmak između organa — osim nakon zadnjeg
      if (organ !== podaci[podaci.length - 1]) {
        doc.moveDown(1.2);
      }
    }

    // ── Footer ──────────────────────────────────────
    doc
      .fontSize(8)
      .fillColor('#999')
      .text(
        `Generisano: ${new Date().toLocaleString('bs-BA')}`,
        40,
        doc.page.height - 40,
        { align: 'center', width: 515 },
      );

    // Ukloni zadnju stranicu ako je prazna
    const pageRange = doc.bufferedPageRange();
    if (pageRange.count > 1) {
      // Provjeri da li je zadnja stranica prazna
      if (doc.y < 100) {
        // Ne možemo ukloniti stranicu u pdfkitu
        // Umjesto toga, footer stavi na predzadnju stranicu
      }
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/izvjestaj/popunjenost/excel ──────────────
export const popunjenostExcel = async (req: Request, res: Response) => {
  try {
    const podaci = await getPopunjenostPodaci();
    const datum = new Date().toLocaleDateString('bs-BA');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FMERI HR System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Popunjenost', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // Kolone
    sheet.columns = [
      { header: 'Organ', key: 'organ', width: 35 },
      { header: 'Org. jedinica', key: 'jedinica', width: 45 },
      { header: 'Tip', key: 'tip', width: 14 },
      { header: 'Nivo', key: 'nivo', width: 12 },
      { header: 'Ukupno RM', key: 'ukupno', width: 12 },
      { header: 'Popunjeno', key: 'popunjeno', width: 12 },
      { header: 'Upražnjeno', key: 'upraznjeno', width: 12 },
      { header: 'Popunjenost %', key: 'posto', width: 14 },
    ];

    // Header stil
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A5568' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });
    sheet.getRow(1).height = 22;

    // Podaci
    for (const organ of podaci) {
      if (organ.ukupnoRM === 0) continue;

      // Organ sumarni red
      const organRow = sheet.addRow({
        organ: organ.naziv,
        jedinica: '',
        tip: organ.vrstaOrgana,
        nivo: 'organ',
        ukupno: organ.ukupnoRM,
        popunjeno: organ.popunjeno,
        upraznjeno: organ.upraznjeno,
        posto: organ.posto,
      });

      organRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF7FAFC' },
        };
      });

      // Jedinice
      for (const j of organ.poJedinicama) {
        const indent =
          j.nivoJedinice === 'unutrasnja' ? `    ↳ ${j.naziv}` : j.naziv;
        const row = sheet.addRow({
          organ: '',
          jedinica: indent,
          tip: j.tip,
          nivo: j.nivoJedinice,
          ukupno: j.ukupnoRM,
          popunjeno: j.popunjeno,
          upraznjeno: j.upraznjeno,
          posto: j.posto,
        });

        // Boja % kolone
        const postoCell = row.getCell('posto');
        postoCell.font = {
          bold: true,
          color: {
            argb:
              j.posto >= 80
                ? 'FF38A169'
                : j.posto >= 50
                  ? 'FFD69E2E'
                  : 'FFE53E3E',
          },
        };

        // Crvena za upražnjeno
        if (j.upraznjeno > 0) {
          row.getCell('upraznjeno').font = {
            color: { argb: 'FFE53E3E' },
          };
        }
      }

      // Prazni red između organa
      sheet.addRow({});
    }

    // Freeze header
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="popunjenost-${datum}.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── Helper — sistematizacija podaci ──────────────────
const getSistematizacijaPodaci = async () => {
  const REDOSLIJED = [
    'Federalno ministarstvo energije, rudarstva i industrije',
    'Kabinet ministra',
    'Sektor energije',
    'Odsjek za elektroenergetiku',
    'Odsjek za tečne energente, plin i termoenergetiku',
    'Odsjek za razvoj',
    'Sektor rudarstva',
    'Odsjek za rudarstvo',
    'Odsjek za geologiju',
    'Sektor industrije',
    'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
    'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
    'Odsjek za analizu i praćenje stanja u privredi',
    'Odsjek za razvoj i unapređenje privrede',
    'Sektor za pravne, finansijske i opće poslove',
    'Odsjek za pravne poslove i radne odnose',
    'Odsjek za finansijsko-računovodstvene poslove',
    'Odsjek za opće poslove',
    'Pisarnica',
    'Zavod za mjeriteljstvo',
    'Centar za mjeriteljstvo Mostar',
    'Centar za mjeriteljstvo Sarajevo',
    'Centar za mjeriteljstvo Tuzla',
    'Federalna direkcija za namjensku industriju',
  ];

  const radnaMjesta = await RadnoMjesto.find({ aktivno: true })
    .populate('organizacionaJedinica', 'naziv tip')
    .lean();

  const rezultat = await Promise.all(
    radnaMjesta.map(async (rm) => {
      const popunjeno = await Zaposlenik.countDocuments({
        radnoMjesto: rm._id,
        aktivan: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ojNaziv = (rm.organizacionaJedinica as any)?.naziv ?? 'Ostalo';
      return {
        naziv: rm.naziv,
        ojNaziv,
        kategorijaZaposlenog: rm.kategorijaZaposlenog,
        platniRazred: rm.platniRazred,
        koeficijent: rm.koeficijent,
        brojIzvrsilaca: rm.brojIzvrsilaca,
        popunjeno,
        upraznjeno: Math.max(0, rm.brojIzvrsilaca - popunjeno),
        status:
          popunjeno >= rm.brojIzvrsilaca
            ? 'popunjeno'
            : popunjeno > 0
              ? 'djelimicno'
              : 'slobodno',
      };
    }),
  );

  rezultat.sort((a, b) => {
    const aIdx = REDOSLIJED.indexOf(a.ojNaziv);
    const bIdx = REDOSLIJED.indexOf(b.ojNaziv);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  // Grupiraj po OJ
  const grupe = new Map<string, typeof rezultat>();
  for (const rm of rezultat) {
    if (!grupe.has(rm.ojNaziv)) grupe.set(rm.ojNaziv, []);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    grupe.get(rm.ojNaziv)!.push(rm);
  }

  return { stavke: rezultat, grupe };
};

// ── GET /api/izvjestaj/sistematizacija/pdf ────────────
export const sistematizacijaPDF = async (req: Request, res: Response) => {
  try {
    const { stavke, grupe } = await getSistematizacijaPodaci();
    const datum = new Date().toLocaleDateString('bs-BA');
    const fontsDir = path.resolve('apps/api-server/src/assets/fonts');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sistematizacija-${datum}.pdf"`,
    );
    doc.pipe(res);

    doc.registerFont('Regular', path.join(fontsDir, 'DejaVuSans.ttf'));
    doc.registerFont('Bold', path.join(fontsDir, 'DejaVuSans-Bold.ttf'));

    // Naslov
    doc
      .fontSize(16)
      .font('Bold')
      .text('Sistematizacija radnih mjesta', { align: 'center' });
    doc
      .fontSize(9)
      .font('Regular')
      .fillColor('#666')
      .text(
        `Federalno ministarstvo energije, rudarstva i industrije — ${datum}`,
        { align: 'center' },
      );
    doc.moveDown(1);

    // Sumarno
    const ukupno = stavke.reduce((s, i) => s + i.brojIzvrsilaca, 0);
    const popunjeno = stavke.reduce((s, i) => s + i.popunjeno, 0);
    const posto = ukupno > 0 ? Math.round((popunjeno / ukupno) * 100) : 0;

    doc.fontSize(9).font('Regular').fillColor('#333');
    doc
      .text(`Ukupno radnih mjesta: `, { continued: true })
      .font('Bold')
      .text(`${stavke.length}`);
    doc
      .font('Regular')
      .text(`Ukupno izvršilaca: `, { continued: true })
      .font('Bold')
      .text(`${ukupno}`);
    doc
      .font('Regular')
      .text(`Popunjeno: `, { continued: true })
      .font('Bold')
      .fillColor('#38a169')
      .text(`${popunjeno}`);
    doc
      .fillColor('#333')
      .font('Regular')
      .text(`Popunjenost: `, { continued: true })
      .font('Bold')
      .fillColor(posto >= 80 ? '#38a169' : posto >= 50 ? '#d69e2e' : '#e53e3e')
      .text(`${posto}%`);
    doc.fillColor('#000').moveDown(1);

    // Po grupama
    for (const [ojNaziv, rmLista] of grupe) {
      if (doc.y > 680) doc.addPage();

      // Grupa header
      const gy = doc.y;
      doc.rect(40, gy, 515, 22).fill('#e8edf2');
      doc
        .fontSize(9)
        .font('Bold')
        .fillColor('#1a202c')
        .text(ojNaziv, 46, gy + 6, {
          width: 360,
          lineBreak: false,
          ellipsis: true,
        });
      doc
        .fontSize(8)
        .font('Regular')
        .fillColor('#4a5568')
        .text(`${rmLista.length} RM`, 460, gy + 7, {
          width: 90,
          align: 'right',
          lineBreak: false,
        });
      doc.y = gy + 28;

      // Tabela header
      const thY = doc.y;
      doc.rect(40, thY, 515, 16).fill('#f7fafc');
      doc.fontSize(7).font('Bold').fillColor('#718096');
      doc.text('Naziv radnog mjesta', 46, thY + 4, {
        width: 220,
        lineBreak: false,
      });
      doc.text('Kategorija', 270, thY + 4, { width: 110, lineBreak: false });
      doc.text('Razred', 385, thY + 4, {
        width: 40,
        align: 'center',
        lineBreak: false,
      });
      doc.text('Koef.', 428, thY + 4, {
        width: 35,
        align: 'center',
        lineBreak: false,
      });
      doc.text('Izvrš.', 466, thY + 4, {
        width: 35,
        align: 'center',
        lineBreak: false,
      });
      doc.text('Status', 504, thY + 4, {
        width: 50,
        align: 'right',
        lineBreak: false,
      });
      doc.y = thY + 18;

      // Redovi
      for (const rm of rmLista) {
        if (doc.y > 750) doc.addPage();
        const rowY = doc.y;

        const skratiKat = (k: string) => {
          if (k === 'izabrani_duznosnik') return 'Izabrani duž.';
          if (k === 'rukovodeci_drzavni_sluzbenik') return 'Rukovodeći DS';
          if (k === 'ostali_drzavni_sluzbenik') return 'Drž. službenik';
          if (k === 'namjestenik') return 'Namještenik';
          return k;
        };

        doc
          .fontSize(7.5)
          .font('Regular')
          .fillColor('#2d3748')
          .text(skrati(rm.naziv, 42), 46, rowY + 3, {
            width: 220,
            lineBreak: false,
          });
        doc
          .fillColor('#718096')
          .text(skratiKat(rm.kategorijaZaposlenog), 270, rowY + 3, {
            width: 110,
            lineBreak: false,
          });
        doc.fillColor('#667eea').text(rm.platniRazred, 385, rowY + 3, {
          width: 40,
          align: 'center',
          lineBreak: false,
        });
        doc.fillColor('#718096').text(`${rm.koeficijent}`, 428, rowY + 3, {
          width: 35,
          align: 'center',
          lineBreak: false,
        });
        doc
          .fillColor(rm.popunjeno >= rm.brojIzvrsilaca ? '#38a169' : '#e53e3e')
          .text(`${rm.popunjeno}/${rm.brojIzvrsilaca}`, 466, rowY + 3, {
            width: 35,
            align: 'center',
            lineBreak: false,
          });

        const statusTekst =
          rm.status === 'popunjeno'
            ? 'Popunjeno'
            : rm.status === 'djelimicno'
              ? 'Djelimično'
              : 'Slobodno';
        const statusBoja =
          rm.status === 'popunjeno'
            ? '#38a169'
            : rm.status === 'djelimicno'
              ? '#d69e2e'
              : '#e53e3e';
        doc
          .fillColor(statusBoja)
          .font('Bold')
          .text(statusTekst, 504, rowY + 3, {
            width: 50,
            align: 'right',
            lineBreak: false,
          });

        doc
          .moveTo(40, rowY + 16)
          .lineTo(555, rowY + 16)
          .strokeColor('#e2e8f0')
          .lineWidth(0.5)
          .stroke();
        doc.y = rowY + 18;
      }

      if (grupe.size > 1) doc.moveDown(0.8);
    }

    // Footer
    doc
      .fontSize(7)
      .fillColor('#999')
      .text(
        `Generisano: ${new Date().toLocaleString('bs-BA')}`,
        40,
        doc.page.height - 35,
        { align: 'center', width: 515 },
      );

    doc.end();
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/izvjestaj/sistematizacija/excel ──────────
export const sistematizacijaExcel = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { stavke, grupe } = await getSistematizacijaPodaci();
    const datum = new Date().toLocaleDateString('bs-BA');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FMERI HR System';
    const sheet = workbook.addWorksheet('Sistematizacija', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    sheet.columns = [
      { header: 'Org. jedinica', key: 'oj', width: 35 },
      { header: 'Naziv radnog mjesta', key: 'naziv', width: 45 },
      { header: 'Kategorija', key: 'kategorija', width: 22 },
      { header: 'Razred', key: 'razred', width: 10 },
      { header: 'Koeficijent', key: 'koef', width: 12 },
      { header: 'Br. izvršilaca', key: 'ukupno', width: 14 },
      { header: 'Popunjeno', key: 'popunjeno', width: 12 },
      { header: 'Upražnjeno', key: 'upraznjeno', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    // Header stil
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A5568' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    sheet.getRow(1).height = 22;

    const katNaziv = (k: string) => {
      if (k === 'izabrani_duznosnik') return 'Izabrani dužnosnik';
      if (k === 'rukovodeci_drzavni_sluzbenik')
        return 'Rukovodeći drž. službenik';
      if (k === 'ostali_drzavni_sluzbenik') return 'Državni službenik';
      if (k === 'namjestenik') return 'Namještenik';
      return k;
    };

    const statusNaziv = (s: string) =>
      s === 'popunjeno'
        ? 'Popunjeno'
        : s === 'djelimicno'
          ? 'Djelimično'
          : 'Slobodno';

    for (const [ojNaziv, rmLista] of grupe) {
      // OJ header red
      const ojRow = sheet.addRow({
        oj: ojNaziv,
        naziv: '',
        kategorija: '',
        razred: '',
        koef: '',
        ukupno: rmLista.reduce((s, r) => s + r.brojIzvrsilaca, 0),
        popunjeno: rmLista.reduce((s, r) => s + r.popunjeno, 0),
        upraznjeno: rmLista.reduce((s, r) => s + r.upraznjeno, 0),
        status: '',
      });
      ojRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8EDF2' },
        };
      });

      for (const rm of rmLista) {
        const row = sheet.addRow({
          oj: '',
          naziv: rm.naziv,
          kategorija: katNaziv(rm.kategorijaZaposlenog),
          razred: rm.platniRazred,
          koef: rm.koeficijent,
          ukupno: rm.brojIzvrsilaca,
          popunjeno: rm.popunjeno,
          upraznjeno: rm.upraznjeno,
          status: statusNaziv(rm.status),
        });

        const statusCell = row.getCell('status');
        statusCell.font = {
          bold: true,
          color: {
            argb:
              rm.status === 'popunjeno'
                ? 'FF38A169'
                : rm.status === 'djelimicno'
                  ? 'FFD69E2E'
                  : 'FFE53E3E',
          },
        };

        if (rm.upraznjeno > 0) {
          row.getCell('upraznjeno').font = { color: { argb: 'FFE53E3E' } };
        }
        row.getCell('popunjeno').font = {
          color: { argb: rm.popunjeno > 0 ? 'FF38A169' : 'FF718096' },
        };
      }

      sheet.addRow({});
    }

    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sistematizacija-${datum}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/izvjestaj/pregled ────────────────────────
export const getPregledStrukture = async (req: Request, res: Response) => {
  try {
    const { organi: organiParam, saJedinicama } = req.query;

    // Dohvati tražene organe ili sve
    const organFilter = organiParam
      ? { _id: { $in: (organiParam as string).split(',') }, aktivan: true }
      : { aktivan: true };

    const organi = await Organ.find(organFilter).sort({ redoslijed: 1 }).lean();

    const prikaziJedinice = saJedinicama !== 'false';

    const rezultat = await Promise.all(
      organi.map(async (organ) => {
        const jedinice = await OrganizacionaJedinica.find({
          organ: organ._id,
          aktivna: true,
        })
          .sort({ nivoJedinice: 1, redoslijed: 1 })
          .lean();

        // Helper — RM sa popunjenošću
        const rmSaPopunjenoscu = async (jedinicaId: string) => {
          const radnaMjesta = await RadnoMjesto.find({
            organizacionaJedinica: jedinicaId,
            aktivno: true,
          }).lean();

          return Promise.all(
            radnaMjesta.map(async (rm) => {
              const popunjeno = await Zaposlenik.countDocuments({
                radnoMjesto: rm._id,
                aktivan: true,
              });
              return {
                _id: rm._id,
                naziv: rm.naziv,
                kategorijaZaposlenog: rm.kategorijaZaposlenog,
                platniRazred: rm.platniRazred,
                koeficijent: rm.koeficijent,
                brojIzvrsilaca: rm.brojIzvrsilaca,
                popunjeno,
                upraznjeno: Math.max(0, rm.brojIzvrsilaca - popunjeno),
                status:
                  popunjeno >= rm.brojIzvrsilaca
                    ? 'popunjeno'
                    : popunjeno > 0
                      ? 'djelimicno'
                      : 'slobodno',
              };
            }),
          );
        };

        // Osnovna jedinica organa (ministarstvo/zavod/direkcija)
        const organJedinica = jedinice.find((j) =>
          ['ministarstvo', 'zavod', 'direkcija', 'uprava'].includes(j.tip),
        );

        // RM direktno u organu
        const direktnaRM = organJedinica
          ? await rmSaPopunjenoscu(organJedinica._id.toString())
          : [];

        // OOJ
        const osnovneJedinice = jedinice.filter(
          (j) =>
            j.nivoJedinice === 'osnovna' &&
            !['ministarstvo', 'zavod', 'direkcija', 'uprava'].includes(j.tip),
        );

        // UOJ
        const unutrasnje = jedinice.filter(
          (j) => j.nivoJedinice === 'unutrasnja',
        );

        const oojSaStrukturom = await Promise.all(
          osnovneJedinice.map(async (ooj) => {
            const rmOOJ = await rmSaPopunjenoscu(ooj._id.toString());

            const uojZaOvu = prikaziJedinice
              ? unutrasnje.filter(
                  (u) =>
                    u.nadredjenaJedinica?.toString() === ooj._id.toString(),
                )
              : [];

            const uojSaRM = await Promise.all(
              uojZaOvu.map(async (uoj) => {
                const rmUOJ = await rmSaPopunjenoscu(uoj._id.toString());
                const ukupno = rmUOJ.reduce((s, r) => s + r.brojIzvrsilaca, 0);
                const pop = rmUOJ.reduce((s, r) => s + r.popunjeno, 0);
                return {
                  _id: uoj._id,
                  naziv: uoj.naziv,
                  tip: uoj.tip,
                  radnaMjesta: rmUOJ,
                  ukupnoRM: ukupno,
                  popunjeno: pop,
                  upraznjeno: Math.max(0, ukupno - pop),
                  posto: ukupno > 0 ? Math.round((pop / ukupno) * 100) : 0,
                };
              }),
            );

            const rmSve = [...rmOOJ, ...uojSaRM.flatMap((u) => u.radnaMjesta)];
            const ukupno = rmSve.reduce((s, r) => s + r.brojIzvrsilaca, 0);
            const pop = rmSve.reduce((s, r) => s + r.popunjeno, 0);

            return {
              _id: ooj._id,
              naziv: ooj.naziv,
              tip: ooj.tip,
              direktnaRM: rmOOJ,
              unutrasnje: uojSaRM,
              ukupnoRM: ukupno,
              popunjeno: pop,
              upraznjeno: Math.max(0, ukupno - pop),
              posto: ukupno > 0 ? Math.round((pop / ukupno) * 100) : 0,
            };
          }),
        );

        // Sumarno za organ
        const svaRM = [
          ...direktnaRM,
          ...oojSaStrukturom.flatMap((ooj) => [
            ...ooj.direktnaRM,
            ...ooj.unutrasnje.flatMap((u) => u.radnaMjesta),
          ]),
        ];
        const ukupnoRM = svaRM.reduce((s, r) => s + r.brojIzvrsilaca, 0);
        const ukupnoPop = svaRM.reduce((s, r) => s + r.popunjeno, 0);

        return {
          organId: organ._id,
          naziv: organ.naziv,
          skraceniNaziv: organ.skraceniNaziv,
          vrstaOrgana: organ.vrstaOrgana,
          direktnaRM,
          osnovneJedinice: oojSaStrukturom,
          ukupnoRM,
          popunjeno: ukupnoPop,
          upraznjeno: Math.max(0, ukupnoRM - ukupnoPop),
          posto: ukupnoRM > 0 ? Math.round((ukupnoPop / ukupnoRM) * 100) : 0,
        };
      }),
    );

    return res.json(rezultat);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/izvjestaj/pregled/pdf ────────────────────
export const pregledPDF = async (req: Request, res: Response) => {
  try {
    const { organi: organiParam, saJedinicama } = req.query;
    const prikaziJedinice = saJedinicama !== 'false';
    const datum = new Date().toLocaleDateString('bs-BA');
    const fontsDir = path.resolve('apps/api-server/src/assets/fonts');

    // Dohvati podatke kroz isti endpoint logiku
    const organFilter = organiParam
      ? { _id: { $in: (organiParam as string).split(',') }, aktivan: true }
      : { aktivan: true };

    const organi = await Organ.find(organFilter).sort({ redoslijed: 1 }).lean();

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pregled-strukture-${datum}.pdf"`,
    );
    doc.pipe(res);

    doc.registerFont('Regular', path.join(fontsDir, 'DejaVuSans.ttf'));
    doc.registerFont('Bold', path.join(fontsDir, 'DejaVuSans-Bold.ttf'));

    // Naslov
    doc
      .fontSize(16)
      .font('Bold')
      .text('Pregled organizacijske strukture', { align: 'center' });
    doc
      .fontSize(9)
      .font('Regular')
      .fillColor('#666')
      .text(`Sistematizacija i popunjenost po organima uprave — ${datum}`, {
        align: 'center',
      });
    doc.moveDown(1.5);

    for (const organ of organi) {
      if (doc.y > 680) doc.addPage();

      const jedinice = await OrganizacionaJedinica.find({
        organ: organ._id,
        aktivna: true,
      })
        .sort({ nivoJedinice: 1, redoslijed: 1 })
        .lean();

      const rmSaPopunjenoscu = async (jedinicaId: string) => {
        const rms = await RadnoMjesto.find({
          organizacionaJedinica: jedinicaId,
          aktivno: true,
        }).lean();
        return Promise.all(
          rms.map(async (rm) => {
            const pop = await Zaposlenik.countDocuments({
              radnoMjesto: rm._id,
              aktivan: true,
            });
            return {
              ...rm,
              popunjeno: pop,
              upraznjeno: Math.max(0, rm.brojIzvrsilaca - pop),
            };
          }),
        );
      };

      const organJedinica = jedinice.find((j) =>
        ['ministarstvo', 'zavod', 'direkcija', 'uprava'].includes(j.tip),
      );
      const direktnaRM = organJedinica
        ? await rmSaPopunjenoscu(organJedinica._id.toString())
        : [];
      const osnovne = jedinice.filter(
        (j) =>
          j.nivoJedinice === 'osnovna' &&
          !['ministarstvo', 'zavod', 'direkcija', 'uprava'].includes(j.tip),
      );
      const unutrasnje = jedinice.filter(
        (j) => j.nivoJedinice === 'unutrasnja',
      );

      // Izračunaj ukupno za organ
      let ukupnoRM = direktnaRM.reduce((s, r) => s + r.brojIzvrsilaca, 0);
      let ukupnoPop = direktnaRM.reduce((s, r) => s + r.popunjeno, 0);

      // Organ header
      const ohY = doc.y;
      doc.rect(40, ohY, 515, 26).fill('#e8edf2');
      const organNaziv = organ.skraceniNaziv
        ? `${organ.naziv} (${organ.skraceniNaziv})`
        : organ.naziv;
      doc
        .fontSize(10)
        .font('Bold')
        .fillColor('#1a202c')
        .text(organNaziv, 46, ohY + 8, {
          width: 300,
          lineBreak: false,
          ellipsis: true,
        });
      doc.y = ohY + 32;

      // Helper za crtanje RM reda
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const crtajRM = (rm: any, indent = 0) => {
        if (doc.y > 750) doc.addPage();
        const rowY = doc.y;
        doc
          .fontSize(7.5)
          .font('Regular')
          .fillColor('#2d3748')
          .text(skrati(rm.naziv, 45), 46 + indent, rowY + 3, {
            width: 240 - indent,
            lineBreak: false,
          });
        doc.fillColor('#667eea').text(rm.platniRazred, 295, rowY + 3, {
          width: 30,
          align: 'center',
          lineBreak: false,
        });
        doc
          .fillColor(rm.popunjeno >= rm.brojIzvrsilaca ? '#38a169' : '#e53e3e')
          .text(`${rm.popunjeno}/${rm.brojIzvrsilaca}`, 330, rowY + 3, {
            width: 40,
            align: 'center',
            lineBreak: false,
          });
        const st =
          rm.popunjeno >= rm.brojIzvrsilaca
            ? 'Popunjeno'
            : rm.popunjeno > 0
              ? 'Djelimično'
              : 'Slobodno';
        const stBoja =
          rm.popunjeno >= rm.brojIzvrsilaca
            ? '#38a169'
            : rm.popunjeno > 0
              ? '#d69e2e'
              : '#e53e3e';
        doc
          .fillColor(stBoja)
          .font('Bold')
          .text(st, 375, rowY + 3, {
            width: 60,
            align: 'right',
            lineBreak: false,
          });
        doc
          .moveTo(40, rowY + 16)
          .lineTo(555, rowY + 16)
          .strokeColor('#e2e8f0')
          .lineWidth(0.5)
          .stroke();
        doc.y = rowY + 18;
      };

      // Direktna RM
      if (direktnaRM.length > 0) {
        doc
          .fontSize(7)
          .font('Bold')
          .fillColor('#718096')
          .text('DIREKTNO U ORGANU', 46, doc.y, { lineBreak: false });
        doc.y += 14;
        direktnaRM.forEach((rm) => crtajRM(rm));
      }

      // OOJ
      for (const ooj of osnovne) {
        if (doc.y > 720) doc.addPage();

        const rmOOJ = await rmSaPopunjenoscu(ooj._id.toString());
        const uojZaOvu = prikaziJedinice
          ? unutrasnje.filter(
              (u) => u.nadredjenaJedinica?.toString() === ooj._id.toString(),
            )
          : [];

        const rmSve = [...rmOOJ];
        for (const uoj of uojZaOvu) {
          const rmUOJ = await rmSaPopunjenoscu(uoj._id.toString());
          rmSve.push(...rmUOJ);
        }

        ukupnoRM += rmSve.reduce((s, r) => s + r.brojIzvrsilaca, 0);
        ukupnoPop += rmSve.reduce((s, r) => s + r.popunjeno, 0);

        // OOJ header
        const oojY = doc.y;
        doc.rect(46, oojY, 509, 18).fill('#f0f4ff');
        doc
          .fontSize(8)
          .font('Bold')
          .fillColor('#4a5568')
          .text(skrati(ooj.naziv, 55), 52, oojY + 5, {
            width: 300,
            lineBreak: false,
            ellipsis: true,
          });
        doc.y = oojY + 22;

        rmOOJ.forEach((rm) => crtajRM(rm));

        for (const uoj of uojZaOvu) {
          if (doc.y > 720) doc.addPage();
          const rmUOJ = await rmSaPopunjenoscu(uoj._id.toString());

          // UOJ header
          const uojY = doc.y;
          doc
            .fontSize(7.5)
            .font('Bold')
            .fillColor('#718096')
            .text(`↳ ${skrati(uoj.naziv, 50)}`, 58, uojY, {
              width: 280,
              lineBreak: false,
            });
          doc.y = uojY + 14;
          rmUOJ.forEach((rm) => crtajRM(rm, 12));
        }
      }

      // Organ summary
      const posto = ukupnoRM > 0 ? Math.round((ukupnoPop / ukupnoRM) * 100) : 0;
      doc
        .fontSize(8)
        .font('Bold')
        .fillColor('#4a5568')
        .text(
          `Ukupno: ${ukupnoRM} RM | Popunjeno: ${ukupnoPop} | Popunjenost: ${posto}%`,
          46,
          doc.y,
          { lineBreak: false },
        );
      doc.moveDown(1.5);
    }

    doc
      .fontSize(7)
      .fillColor('#999')
      .text(
        `Generisano: ${new Date().toLocaleString('bs-BA')}`,
        40,
        doc.page.height - 35,
        { align: 'center', width: 515 },
      );
    doc.end();
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/izvjestaj/pregled/excel ──────────────────
export const pregledExcel = async (req: Request, res: Response) => {
  try {
    const { organi: organiParam, saJedinicama } = req.query;
    const prikaziJedinice = saJedinicama !== 'false';
    const datum = new Date().toLocaleDateString('bs-BA');

    const organFilter = organiParam
      ? { _id: { $in: (organiParam as string).split(',') }, aktivan: true }
      : { aktivan: true };

    const organi = await Organ.find(organFilter).sort({ redoslijed: 1 }).lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FMERI HR System';
    const sheet = workbook.addWorksheet('Pregled strukture', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    sheet.columns = [
      { header: 'Organ', key: 'organ', width: 30 },
      { header: 'OOJ', key: 'ooj', width: 30 },
      { header: 'UOJ', key: 'uoj', width: 25 },
      { header: 'Naziv radnog mjesta', key: 'naziv', width: 40 },
      { header: 'Kategorija', key: 'kategorija', width: 20 },
      { header: 'Razred', key: 'razred', width: 10 },
      { header: 'Koef.', key: 'koef', width: 8 },
      { header: 'Br. izvrš.', key: 'ukupno', width: 10 },
      { header: 'Popunjeno', key: 'popunjeno', width: 11 },
      { header: 'Upražnjeno', key: 'upraznjeno', width: 12 },
      { header: 'Status', key: 'status', width: 13 },
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A5568' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    sheet.getRow(1).height = 22;

    const katNaziv = (k: string) => {
      const map: Record<string, string> = {
        izabrani_duznosnik: 'Izabrani dužnosnik',
        rukovodeci_drzavni_sluzbenik: 'Rukovodeći drž. sl.',
        ostali_drzavni_sluzbenik: 'Državni službenik',
        namjestenik: 'Namještenik',
      };
      return map[k] ?? k;
    };

    const stNaziv = (s: string) =>
      s === 'popunjeno'
        ? 'Popunjeno'
        : s === 'djelimicno'
          ? 'Djelimično'
          : 'Slobodno';

    const rmSaPopunjenoscu = async (jedinicaId: string) => {
      const rms = await RadnoMjesto.find({
        organizacionaJedinica: jedinicaId,
        aktivno: true,
      }).lean();
      return Promise.all(
        rms.map(async (rm) => {
          const pop = await Zaposlenik.countDocuments({
            radnoMjesto: rm._id,
            aktivan: true,
          });
          return {
            ...rm,
            popunjeno: pop,
            upraznjeno: Math.max(0, rm.brojIzvrsilaca - pop),
            status:
              pop >= rm.brojIzvrsilaca
                ? 'popunjeno'
                : pop > 0
                  ? 'djelimicno'
                  : 'slobodno',
          };
        }),
      );
    };

    const dodajRM = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rm: any,
      organNaziv: string,
      oojNaziv = '',
      uojNaziv = '',
    ) => {
      const row = sheet.addRow({
        organ: organNaziv,
        ooj: oojNaziv,
        uoj: uojNaziv,
        naziv: rm.naziv,
        kategorija: katNaziv(rm.kategorijaZaposlenog),
        razred: rm.platniRazred,
        koef: rm.koeficijent,
        ukupno: rm.brojIzvrsilaca,
        popunjeno: rm.popunjeno,
        upraznjeno: rm.upraznjeno,
        status: stNaziv(rm.status),
      });
      const stCell = row.getCell('status');
      stCell.font = {
        bold: true,
        color: {
          argb:
            rm.status === 'popunjeno'
              ? 'FF38A169'
              : rm.status === 'djelimicno'
                ? 'FFD69E2E'
                : 'FFE53E3E',
        },
      };
      if (rm.upraznjeno > 0)
        row.getCell('upraznjeno').font = { color: { argb: 'FFE53E3E' } };
      if (rm.popunjeno > 0)
        row.getCell('popunjeno').font = { color: { argb: 'FF38A169' } };
    };

    for (const organ of organi) {
      const jedinice = await OrganizacionaJedinica.find({
        organ: organ._id,
        aktivna: true,
      })
        .sort({ nivoJedinice: 1, redoslijed: 1 })
        .lean();

      const organJedinica = jedinice.find((j) =>
        ['ministarstvo', 'zavod', 'direkcija', 'uprava'].includes(j.tip),
      );
      const direktnaRM = organJedinica
        ? await rmSaPopunjenoscu(organJedinica._id.toString())
        : [];
      const osnovne = jedinice.filter(
        (j) =>
          j.nivoJedinice === 'osnovna' &&
          !['ministarstvo', 'zavod', 'direkcija', 'uprava'].includes(j.tip),
      );
      const unutrasnje = jedinice.filter(
        (j) => j.nivoJedinice === 'unutrasnja',
      );

      direktnaRM.forEach((rm) => dodajRM(rm, organ.naziv));

      for (const ooj of osnovne) {
        const rmOOJ = await rmSaPopunjenoscu(ooj._id.toString());
        rmOOJ.forEach((rm) => dodajRM(rm, organ.naziv, ooj.naziv));

        if (prikaziJedinice) {
          const uojZaOvu = unutrasnje.filter(
            (u) => u.nadredjenaJedinica?.toString() === ooj._id.toString(),
          );
          for (const uoj of uojZaOvu) {
            const rmUOJ = await rmSaPopunjenoscu(uoj._id.toString());
            rmUOJ.forEach((rm) =>
              dodajRM(rm, organ.naziv, ooj.naziv, uoj.naziv),
            );
          }
        }
      }
      sheet.addRow({});
    }

    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pregled-strukture-${datum}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
