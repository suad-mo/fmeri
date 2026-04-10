import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { OrgService } from '../../../core/services/org.service';
import {
  Zaposlenik,
  KATEGORIJA_NAZIV,
  KategorijaZaposlenog,
  VRSTA_UGOVORA_NAZIV,
  VrstaUgovora,
} from '../../../core/models/org.models';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-zaposlenici',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './zaposlenici.component.html',
  styleUrl: './zaposlenici.component.scss',
})
export class ZaposleniciComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  zaposlenici = signal<Zaposlenik[]>([]);
  isLoading = signal(true);
  pretraga = signal('');

  jeAdmin = computed(
    () => this.authService.currentUser()?.role.includes('admin') ?? false,
  );

  readonly apiUrl = 'http://localhost:3000/uploads/slike';

  kolone = computed(() => {
    if (this.jeAdmin()) {
      return [
        'zaposlenik',
        'kontakt',
        'organizacija',
        'radnoMjesto',
        'ugovor',
        'akcije',
      ];
    } else {
      return ['zaposlenik', 'kontakt', 'organizacija', 'radnoMjesto', 'ugovor'];
    }
  });

  filtrirani = computed(() => {
    const p = this.pretraga().toLowerCase();
    if (!p) return this.zaposlenici();
    return this.zaposlenici().filter(
      (z) =>
        `${z.ime} ${z.prezime}`.toLowerCase().includes(p) ||
        z.sluzbeniEmail?.toLowerCase().includes(p) ||
        z.organizacionaJedinica?.naziv.toLowerCase().includes(p) ||
        z.radnoMjesto?.naziv.toLowerCase().includes(p),
    );
  });

  ngOnInit() {
    this.ucitaj();
  }

  ucitaj() {
    this.isLoading.set(true);
    this.orgService.getZaposlenici().subscribe({
      next: (data) => {
        this.zaposlenici.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getKategorijaNaziv(k: string): string {
    return KATEGORIJA_NAZIV[k as KategorijaZaposlenog] ?? k;
  }

  getVrstaUgovoraNaziv(v: string): string {
    return VRSTA_UGOVORA_NAZIV[v as VrstaUgovora] ?? v;
  }

  uredi(zaposlenik?: Zaposlenik) {
    import('./dialogs/zaposlenik-dialog.component').then(
      ({ ZaposlenikDialogComponent }) => {
        const ref = this.dialog.open(ZaposlenikDialogComponent, {
          width: '600px',
          data: { zaposlenik },
        });
        ref.afterClosed().subscribe((r) => {
          if (r) this.ucitaj();
        });
      },
    );
  }

  dodjelaRM(zaposlenik: Zaposlenik) {
    import('./dialogs/dodjela-zaposlenik-dialog.component').then(
      ({ DodjelaZaposlenikDialogComponent }) => {
        const ref = this.dialog.open(DodjelaZaposlenikDialogComponent, {
          width: '550px',
          data: { zaposlenik },
        });
        ref.afterClosed().subscribe((r) => {
          if (r) this.ucitaj();
        });
      },
    );
  }

  obrisi(zaposlenik: Zaposlenik) {
    if (!confirm(`Deaktivirati "${zaposlenik.ime} ${zaposlenik.prezime}"?`))
      return;
    this.orgService
      .deleteZaposlenik(zaposlenik._id)
      .subscribe(() => this.ucitaj());
  }
}
