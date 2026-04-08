import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgTemplateOutlet } from '@angular/common';
// import { SlicePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrgService } from '../../../core/services/org.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  Organ, OrganStruktura, VRSTA_ORGANA_NAZIV, VrstaOrgana,
  KATEGORIJA_NAZIV, KategorijaZaposlenog,
  OsnovnaJedinicaDetalji, UnutrasnjaJedinicaDetalji, RadnoMjestoDetalji,
} from '../../../core/models/org.models';
import { RmRowComponent } from './components/rm-row/rm-row.component';
import { OojListaComponent } from './components/ooj-lista/ooj-lista.component';

@Component({
  selector: 'app-organ-detalji',
  standalone: true,
  imports: [
    RmRowComponent, OojListaComponent,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatDividerModule, MatExpansionModule, MatDialogModule,
  ],
  templateUrl: './organ-detalji.component.html',
  styleUrl: './organ-detalji.component.scss',
})
export class OrganDetaljiComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrgService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  struktura = signal<OrganStruktura | null>(null);
  isLoading = signal(true);

  readonly apiUrl = 'http://localhost:3000/uploads/slike';

  jeAdmin = computed(() =>
    this.authService.currentUser()?.role.includes('admin') ?? false
  );

  ngOnInit() {
    const organId = this.route.snapshot.paramMap.get('organId');
    if (!organId) {
      this.router.navigate(['/organi']);
      return;
    }
    this.ucitaj(organId);
  }

  ucitaj(organId?: string) {
    const id = organId ?? this.route.snapshot.paramMap.get('organId');
    if (!id) return;
    this.isLoading.set(true);
    this.orgService.getOrganStruktura(id).subscribe({
      next: (data) => {
        this.struktura.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  reload() {
    this.ucitaj();
  }

  getVrstaNaziv(vrsta: string): string {
    return VRSTA_ORGANA_NAZIV[vrsta as VrstaOrgana] ?? vrsta;
  }

  getKategorijaNaziv(k: string): string {
    return KATEGORIJA_NAZIV[k as KategorijaZaposlenog] ?? k;
  }

  getBrojIzvrsilacaUkupno(s: OrganStruktura): number {
    let ukupno = s.radnaMjesta.reduce((sum, rm) => sum + rm.brojIzvrsilaca, 0);
    for (const ooj of s.osnovneJedinice) {
      ukupno += ooj.radnaMjesta.reduce((sum, rm) => sum + rm.brojIzvrsilaca, 0);
      for (const uoj of ooj.unutrasnje) {
        ukupno += uoj.radnaMjesta.reduce((sum, rm) => sum + rm.brojIzvrsilaca, 0);
      }
    }
    return ukupno;
  }

  getBrojRMuOOJ(ooj: OsnovnaJedinicaDetalji): number {
    return ooj.radnaMjesta.length +
      ooj.unutrasnje.reduce((s, u) => s + u.radnaMjesta.length, 0);
  }

  nazad() {
    this.router.navigate(['/organi']);
  }

  // ── Dialozi — samo admin ───────────────────────────────
  urediOrgan(organ: Organ) {
    if (!this.jeAdmin()) return;
    import('../../admin/organi/dialogs/organ-dialog.component').then(
      ({ OrganDialogComponent }) => {
        const ref = this.dialog.open(OrganDialogComponent, {
          width: '600px', data: { organ },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  dodajOOJ() {
    if (!this.jeAdmin()) return;
    const organ = this.struktura()?.organ;
    if (!organ) return;
    import('../../admin/organi/dialogs/organ-jedinica-dialog.component').then(
      ({ OrganJedinicaDialogComponent }) => {
        const ref = this.dialog.open(OrganJedinicaDialogComponent, {
          width: '540px',
          data: { organId: organ._id, nivo: 'osnovna' },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  dodajUOJ(ooj: OsnovnaJedinicaDetalji) {
    if (!this.jeAdmin()) return;
    const organ = this.struktura()?.organ;
    if (!organ) return;
    import('../../admin/organi/dialogs/organ-jedinica-dialog.component').then(
      ({ OrganJedinicaDialogComponent }) => {
        const ref = this.dialog.open(OrganJedinicaDialogComponent, {
          width: '540px',
          data: { organId: organ._id, roditelj: ooj, nivo: 'unutrasnja' },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  urediJedinicu(jedinica: OsnovnaJedinicaDetalji) {
    if (!this.jeAdmin()) return;
    const organ = this.struktura()?.organ;
    if (!organ) return;
    import('../../admin/organi/dialogs/organ-jedinica-dialog.component').then(
      ({ OrganJedinicaDialogComponent }) => {
        const ref = this.dialog.open(OrganJedinicaDialogComponent, {
          width: '540px',
          data: { organId: organ._id, jedinica, nivo: 'osnovna' },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  dodajRM(jedinica?: OsnovnaJedinicaDetalji | UnutrasnjaJedinicaDetalji, event?: Event) {
    if (!this.jeAdmin()) return;
    event?.stopPropagation();
    const organ = this.struktura()?.organ;
    if (!organ) return;
    import('../../admin/organi/dialogs/organ-rm-dialog.component').then(
      ({ OrganRmDialogComponent }) => {
        const ref = this.dialog.open(OrganRmDialogComponent, {
          width: '560px',
          data: { organId: organ._id, organNaziv: organ.naziv, jedinica },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  premjestiRM(rm: RadnoMjestoDetalji) {
    const organ = this.struktura()?.organ;
    if (!organ) return;
    import('../../admin/organi/dialogs/premjesti-rm-dialog.component').then(
      ({ PremjestiRmDialogComponent }) => {
        const ref = this.dialog.open(PremjestiRmDialogComponent, {
          width: '480px',
          data: { rm, organId: organ._id },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  obrisiRM(rm: RadnoMjestoDetalji) {
    if (!this.jeAdmin()) return;
    if (!confirm(`Deaktivirati "${rm.naziv}"?`)) return;
    this.orgService.deleteRadnoMjesto(rm._id).subscribe(() => this.reload());
  }

  dodjelaZaposlenik(rm: RadnoMjestoDetalji, event: Event) {
    if (!this.jeAdmin()) return;
    event.stopPropagation();
    const organ = this.struktura()?.organ;
    if (!organ) return;
    import('../../admin/organi/dialogs/dodjela-rm-zaposlenik-dialog.component').then(
      ({ DodjelaRmZaposlenikDialogComponent }) => {
        const ref = this.dialog.open(DodjelaRmZaposlenikDialogComponent, {
          width: '500px',
          data: { rm, organId: organ._id },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  // Zamjena za dodjelaZaposlenik koja prima samo RM (bez DOM eventa)
onDodijeli(rm: RadnoMjestoDetalji) {
  this.dodjelaZaposlenik(rm, new MouseEvent('click'));
}
}
