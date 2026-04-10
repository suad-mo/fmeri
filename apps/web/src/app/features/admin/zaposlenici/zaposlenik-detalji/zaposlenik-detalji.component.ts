import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { OrgService } from '../../../../core/services/org.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  Zaposlenik,
  KATEGORIJA_NAZIV, KategorijaZaposlenog,
  VRSTA_UGOVORA_NAZIV, VrstaUgovora,
} from '../../../../core/models/org.models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-zaposlenik-detalji',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatDialogModule, MatDividerModule,
  ],
  templateUrl: './zaposlenik-detalji.component.html',
  styleUrl: './zaposlenik-detalji.component.scss',
})
export class ZaposlenikDetaljiComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrgService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  zaposlenik = signal<Zaposlenik | null>(null);
  isLoading = signal(true);

  readonly apiUrl = 'http://localhost:3000/uploads/slike';

  jeAdmin = computed(() =>
    this.authService.currentUser()?.role.includes('admin') ?? false
  );

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/zaposlenici']); return; }
    this.ucitaj(id);
  }

  ucitaj(id?: string) {
    const resolvedId = id ?? this.route.snapshot.paramMap.get('id');
    if (!resolvedId) return;
    this.isLoading.set(true);
    this.orgService.getZaposlenik(resolvedId).subscribe({
      next: (data) => { this.zaposlenik.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  reload() { this.ucitaj(); }

  nazad() { this.router.navigate(['/zaposlenici']); }

  getKategorijaNaziv(k: string): string {
    return KATEGORIJA_NAZIV[k as KategorijaZaposlenog] ?? k;
  }

  getVrstaUgovoraNaziv(v: string): string {
    return VRSTA_UGOVORA_NAZIV[v as VrstaUgovora] ?? v;
  }

  uredi() {
    const z = this.zaposlenik();
    if (!z) return;
    import('../dialogs/zaposlenik-dialog.component').then(
      ({ ZaposlenikDialogComponent }) => {
        const ref = this.dialog.open(ZaposlenikDialogComponent, {
          width: '600px', data: { zaposlenik: z },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  dodjelaRM() {
    const z = this.zaposlenik();
    if (!z) return;
    import('../dialogs/dodjela-zaposlenik-dialog.component').then(
      ({ DodjelaZaposlenikDialogComponent }) => {
        const ref = this.dialog.open(DodjelaZaposlenikDialogComponent, {
          width: '550px', data: { zaposlenik: z },
        });
        ref.afterClosed().subscribe(r => { if (r) this.reload(); });
      }
    );
  }

  obrisi() {
    const z = this.zaposlenik();
    if (!z) return;
    if (!confirm(`Deaktivirati "${z.ime} ${z.prezime}"?`)) return;
    this.orgService.deleteZaposlenik(z._id).subscribe(() =>
      this.router.navigate(['/zaposlenici'])
    );
  }
}
