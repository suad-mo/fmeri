import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { OrgService } from '../../../core/services/org.service';
import {
  IPredmet,
  IAkt,
  STATUS_PREDMETA,
  VRSTA_AKTA,
  SMJER_AKTA,
  ULOGA_AKTA,
} from '../../../core/models/org.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-predmet-detalji',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './predmet-detalji.component.html',
  styleUrl: './predmet-detalji.component.scss',
})
export class PredmetDetaljiComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  readonly aktiFajlUrl = environment.aktiUrl;

  predmet = signal<IPredmet | null>(null);
  isLoading = signal(true);

  statusNaziv = STATUS_PREDMETA;
  vrstaNaziv = VRSTA_AKTA;
  smjerNaziv = SMJER_AKTA;

  environment = environment;

  ulogaNaziv = ULOGA_AKTA;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.ucitaj(id);
  }

  ucitaj(id: string) {
    this.isLoading.set(true);
    this.orgService.getPredmet(id).subscribe({
      next: (data) => {
        this.predmet.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  dodajAkt() {
    const predmet = this.predmet();
    if (!predmet) return;
    import('../dialogs/akt-dialog/akt-dialog.component').then(
      ({ AktDialogComponent }) => {
        const ref = this.dialog.open(AktDialogComponent, {
          width: '560px',
          maxWidth: '95vw',
          data: { predmetId: predmet._id },
        });
        ref.afterClosed().subscribe((r) => {
          if (r) this.ucitaj(predmet._id);
        });
      },
    );
  }

  urediAkt(akt: IAkt) {
    const predmet = this.predmet();
    if (!predmet) return;
    import('../dialogs/akt-dialog/akt-dialog.component').then(
      ({ AktDialogComponent }) => {
        const ref = this.dialog.open(AktDialogComponent, {
          width: '560px',
          maxWidth: '95vw',
          data: { predmetId: predmet._id, akt },
        });
        ref.afterClosed().subscribe((r) => {
          if (r) this.ucitaj(predmet._id);
        });
      },
    );
  }

  obrisiAkt(aktId: string) {
    const predmet = this.predmet();
    if (!predmet) return;
    if (!confirm('Obrisati akt?')) return;
    this.orgService
      .deleteAkt(predmet._id, aktId)
      .subscribe(() => this.ucitaj(predmet._id));
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      u_radu: 'status-u-radu',
      rijeseno: 'status-rijeseno',
      arhivirano: 'status-arhivirano',
    };
    return map[status] ?? '';
  }

  getSmjerClass(smjer: string): string {
    return smjer === 'ulazni' ? 'smjer-ulazni' : 'smjer-izlazni';
  }

  obrisiAktFajl(aktId: string, fajlId: string) {
    const predmet = this.predmet();
    if (!predmet) return;
    if (!confirm('Obrisati fajl?')) return;
    this.orgService
      .deleteFajl(predmet._id, aktId, fajlId)
      .subscribe(() => this.ucitaj(predmet._id));
  }
}
