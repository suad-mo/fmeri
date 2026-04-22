import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { OrgService } from '../../../core/services/org.service';
import {
  Organ,
  OrganStruktura,
  VRSTA_ORGANA_NAZIV,
  VrstaOrgana,
  KATEGORIJA_NAZIV,
  KategorijaZaposlenog,
  OsnovnaJedinicaDetalji,
  RadnoMjestoDetalji,
  UnutrasnjaJedinicaDetalji,
} from '../../../core/models/org.models';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PremjestiRmDialogComponent } from './dialogs/premjesti-rm-dialog.component';
import { NgTemplateOutlet } from '@angular/common';
import { OrganDialogComponent } from './dialogs/organ-dialog.component';
import { OrganJedinicaDialogComponent } from './dialogs/organ-jedinica-dialog.component';
import { OrganRmDialogComponent } from './dialogs/organ-rm-dialog.component';
import { DodjelaRmZaposlenikDialogComponent } from './dialogs/dodjela-rm-zaposlenik-dialog.component';
import { environment } from '../../../../environments/environment.production';
// import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-organi',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatExpansionModule,
    MatDialogModule,
    NgTemplateOutlet,
    // SlicePipe
  ],
  templateUrl: './organi.component.html',
  styleUrl: './organi.component.scss',
})
export class OrganiComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  organi = signal<Organ[]>([]);
  odabranaStruktura = signal<OrganStruktura | null>(null);
  odabraniOrgan = signal<Organ | null>(null);
  isLoading = signal(true);
  strukturaLoading = signal(false);

  readonly apiUrl = environment.uploadsUrl;

  ngOnInit() {
    this.orgService.getOrgani().subscribe({
      next: (data) => {
        this.organi.set(data);
        this.isLoading.set(false);
        // Automatski učitaj prvi organ
        if (data.length > 0) {
          this.otvoriStrukuturu(data[0]);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  otvoriStrukuturu(organ: Organ) {
    this.odabraniOrgan.set(organ);
    this.strukturaLoading.set(true);
    this.odabranaStruktura.set(null);

    this.orgService.getOrganStruktura(organ._id).subscribe({
      next: (data) => {
        this.odabranaStruktura.set(data);
        this.strukturaLoading.set(false);
      },
      error: () => this.strukturaLoading.set(false),
    });
  }

  getVrstaNaziv(vrsta: string): string {
    return VRSTA_ORGANA_NAZIV[vrsta as VrstaOrgana] ?? vrsta;
  }

  getKategorijaNaziv(k: string): string {
    return KATEGORIJA_NAZIV[k as KategorijaZaposlenog] ?? k;
  }

  getBrojIzvrsilacaUkupno(struktura: OrganStruktura): number {
    let ukupno = struktura.radnaMjesta.reduce(
      (s, rm) => s + rm.brojIzvrsilaca,
      0,
    );
    for (const ooj of struktura.osnovneJedinice) {
      ukupno += ooj.radnaMjesta.reduce((s, rm) => s + rm.brojIzvrsilaca, 0);
      for (const uoj of ooj.unutrasnje) {
        ukupno += uoj.radnaMjesta.reduce((s, rm) => s + rm.brojIzvrsilaca, 0);
      }
    }
    return ukupno;
  }

  // organi.component.ts
  getBrojRMuOOJ(ooj: OsnovnaJedinicaDetalji): number {
    return (
      ooj.radnaMjesta.length +
      ooj.unutrasnje.reduce((s, u) => s + u.radnaMjesta.length, 0)
    );
  }

  premjestiRM(rm: RadnoMjestoDetalji) {
    const organ = this.odabraniOrgan();
    if (!organ) return;

    const ref = this.dialog.open(PremjestiRmDialogComponent, {
      width: '480px',
      data: { rm, organId: organ._id },
    });

    ref.afterClosed().subscribe((rezultat) => {
      if (rezultat) this.otvoriStrukuturu(organ);
    });
  }

  obrisiRM(rm: RadnoMjestoDetalji) {
    if (!confirm(`Deaktivirati "${rm.naziv}"?`)) return;
    const organ = this.odabraniOrgan();
    if (!organ) return;
    this.orgService.deleteRadnoMjesto(rm._id).subscribe(() => {
      this.otvoriStrukuturu(organ);
    });
  }

  // U klasi dodaj metode:

noviOrgan() {
  const ref = this.dialog.open(OrganDialogComponent, {
    width: '600px',
    data: {},
  });
  ref.afterClosed().subscribe(r => { if (r) this.ngOnInit(); });
}

urediOrgan(organ: Organ, event: Event) {
  event.stopPropagation();
  const ref = this.dialog.open(OrganDialogComponent, {
    width: '600px',
    data: { organ },
  });
  ref.afterClosed().subscribe(r => { if (r) this.ngOnInit(); });
}

dodajOOJ(event: Event) {
  event.stopPropagation();
  const organ = this.odabraniOrgan();
  if (!organ) return;
  const ref = this.dialog.open(OrganJedinicaDialogComponent, {
    width: '540px',
    data: { organId: organ._id, nivo: 'osnovna' },
  });
  ref.afterClosed().subscribe(r => { if (r) this.otvoriStrukuturu(organ); });
}

dodajUOJ(ooj: OsnovnaJedinicaDetalji, event: Event) {
  event.stopPropagation();
  const organ = this.odabraniOrgan();
  if (!organ) return;
  const ref = this.dialog.open(OrganJedinicaDialogComponent, {
    width: '540px',
    data: { organId: organ._id, roditelj: ooj, nivo: 'unutrasnja' },
  });
  ref.afterClosed().subscribe(r => { if (r) this.otvoriStrukuturu(organ); });
}

urediJedinicu(jedinica: OsnovnaJedinicaDetalji, event: Event) {
  event.stopPropagation();
  const organ = this.odabraniOrgan();
  if (!organ) return;
  const ref = this.dialog.open(OrganJedinicaDialogComponent, {
    width: '540px',
    data: { organId: organ._id, jedinica, nivo: 'osnovna' },
  });
  ref.afterClosed().subscribe(r => { if (r) this.otvoriStrukuturu(organ); });
}

dodajRM(jedinica?: OsnovnaJedinicaDetalji | UnutrasnjaJedinicaDetalji, event?: Event) {
  event?.stopPropagation();
  const organ = this.odabraniOrgan();
  if (!organ) return;
  const ref = this.dialog.open(OrganRmDialogComponent, {
    width: '560px',
    data: { organId: organ._id, organNaziv: organ.naziv, jedinica },
  });
  ref.afterClosed().subscribe(r => { if (r) this.otvoriStrukuturu(organ); });
}

dodjelaZaposlenik(rm: RadnoMjestoDetalji, event: Event) {
  event.stopPropagation();
  const organ = this.odabraniOrgan();
  if (!organ) return;
  const ref = this.dialog.open(DodjelaRmZaposlenikDialogComponent, {
    width: '500px',
    data: { rm, organId: organ._id },
  });
  ref.afterClosed().subscribe(r => { if (r) this.otvoriStrukuturu(organ); });
}
}
