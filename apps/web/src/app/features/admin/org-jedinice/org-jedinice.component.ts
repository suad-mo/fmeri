import { Component, inject, signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrgService } from '../../../core/services/org.service';
import {
  JedinicaDetalji,
  KATEGORIJA_NAZIV,
  KategorijaZaposlenog,
  OrganizacionaJedinica,
  TipJedinice,
} from '../../../core/models/org.models';
import { OrgJedinicaDialogComponent } from './dialogs/org-jedinica-dialog.component';
import { OrgTreeNodeComponent } from './org-tree-node.component';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '../../../../environments/environment.production';
// import { MatDivider } from "@angular/material/divider";

@Component({
  selector: 'app-org-jedinice',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    OrgTreeNodeComponent,
    MatDividerModule,
    // MatDivider
  ],
  templateUrl: './org-jedinice.component.html',
  styleUrl: './org-jedinice.component.scss',
})
export class OrgJediniceComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  stablo = signal<OrganizacionaJedinica[]>([]);
  // novo
  odabranaJedinica = signal<JedinicaDetalji | null>(null);
  panelOtvoren = signal(false);
  panelLoading = signal(false);
  // Ne mjenja se
  jedinicePlana = signal<OrganizacionaJedinica[]>([]);
  isLoading = signal(true);
  // novo
  readonly apiUrl = environment.uploadsUrl;

  // ngOnInit() {
  //   this.ucitaj();
  // }
  //izmjenjeno
  // ngOnInit() {
  //   this.orgService.getStablo().subscribe((data) => {
  //     this.stablo.set(data);
  //   });
  // }

  ngOnInit() {
    this.isLoading.set(true);
    this.orgService.getStablo().subscribe({
      next: (data) => {
        this.stablo.set(data);
        this.jedinicePlana.set(this.flattenTree(data));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // dodano
  otvoriDetalje(jedinica: OrganizacionaJedinica) {
    this.panelOtvoren.set(true);
    this.panelLoading.set(true);
    this.odabranaJedinica.set(null);

    this.orgService.getJedinicaDetalji(jedinica._id).subscribe({
      next: (data) => {
        this.odabranaJedinica.set(data);
        this.panelLoading.set(false);
      },
      error: () => this.panelLoading.set(false),
    });
  }

  zatvoriPanel() {
    this.panelOtvoren.set(false);
    this.odabranaJedinica.set(null);
  }

  getKategorijaNaziv(k: string): string {
    return KATEGORIJA_NAZIV[k as KategorijaZaposlenog] ?? k;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPopunjenostPostotak(rm: any): number {
    return rm.brojIzvrsilaca > 0
      ? Math.round((rm.zaposlenici.length / rm.brojIzvrsilaca) * 100)
      : 0;
  }

  // Ostale postojeće metode za CRUD...

  ucitaj() {
    this.isLoading.set(true);
    this.orgService.getStablo().subscribe({
      next: (data) => {
        this.stablo.set(data);
        this.jedinicePlana.set(this.flattenTree(data));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private flattenTree(nodes: OrganizacionaJedinica[]): OrganizacionaJedinica[] {
    const result: OrganizacionaJedinica[] = [];
    const traverse = (items: OrganizacionaJedinica[]) => {
      for (const item of items) {
        result.push(item);
        if (item.djeca?.length) traverse(item.djeca);
      }
    };
    traverse(nodes);
    return result;
  }

  otvoriDijalog(jedinica?: OrganizacionaJedinica) {
    const ref = this.dialog.open(OrgJedinicaDialogComponent, {
      width: '520px',
      data: { jedinica, sve: this.jedinicePlana() },
    });
    ref.afterClosed().subscribe((rezultat) => {
      if (rezultat) this.ucitaj();
    });
  }

  obrisi(id: string) {
    if (!confirm('Deaktivirati ovu organizacionu jedinicu?')) return;
    this.orgService.deleteJedinica(id).subscribe(() => this.ucitaj());
  }

  dodajPodredjenuJedinicu(event: {
    roditelj: OrganizacionaJedinica;
    dozvoljeneTipove: TipJedinice[];
  }) {
    const ref = this.dialog.open(OrgJedinicaDialogComponent, {
      width: '520px',
      data: {
        jedinica: undefined,
        sve: this.jedinicePlana(),
        roditelj: event.roditelj,
        dozvoljeneTipove: event.dozvoljeneTipove,
      },
    });
    ref.afterClosed().subscribe((rezultat) => {
      if (rezultat) this.ucitaj();
    });
  }

  dodajRadnoMjesto(jedinica: OrganizacionaJedinica) {
    import('../radna-mjesta/dialogs/radno-mjesto-dialog.component').then(
      ({ RadnoMjestoDialogComponent }) => {
        const ref = this.dialog.open(RadnoMjestoDialogComponent, {
          width: '520px',
          data: {
            mjesto: undefined,
            defaultJedinica: jedinica,
          },
        });
        ref.afterClosed().subscribe((rezultat) => {
          if (rezultat) this.ucitaj();
        });
      },
    );
  }
}
