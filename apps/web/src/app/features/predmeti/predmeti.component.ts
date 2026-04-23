import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { OrgService } from '../../core/services/org.service';
import { IPredmet, StatusPredmeta, STATUS_PREDMETA } from '../../core/models/org.models';

@Component({
  selector: 'app-predmeti',
  standalone: true,
  imports: [
    RouterLink, FormsModule, DatePipe, TitleCasePipe,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
  ],
  templateUrl: './predmeti.component.html',
  styleUrl: './predmeti.component.scss',
})
export class PredmetiComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  predmeti = signal<IPredmet[]>([]);
  isLoading = signal(true);
  pretraga = signal('');
  statusFilter = signal<StatusPredmeta | ''>('');

  statusNaziv = STATUS_PREDMETA;
  statusi: { value: StatusPredmeta | ''; label: string }[] = [
    { value: '', label: 'Svi statusi' },
    { value: 'u_radu', label: 'U radu' },
    { value: 'rijeseno', label: 'Riješeno' },
    { value: 'arhivirano', label: 'Arhivirano' },
  ];

  filtrirani() {
    const p = this.pretraga().toLowerCase();
    const s = this.statusFilter();
    return this.predmeti().filter(pred => {
      const matchPretraga = !p ||
        pred.brojPredmeta.toLowerCase().includes(p) ||
        pred.naziv.toLowerCase().includes(p);
      const matchStatus = !s || pred.status === s;
      return matchPretraga && matchStatus;
    });
  }

  ngOnInit() { this.ucitaj(); }

  ucitaj() {
    this.isLoading.set(true);
    this.orgService.getPredmeti().subscribe({
      next: (data) => { this.predmeti.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  noviPredmet() {
    import('./dialogs/predmet-dialog/predmet-dialog.component').then(
      ({ PredmetDialogComponent }) => {
        const ref = this.dialog.open(PredmetDialogComponent, {
          width: '560px',
          maxWidth: '95vw',
          data: {},
        });
        ref.afterClosed().subscribe(r => { if (r) this.ucitaj(); });
      }
    );
  }

  urediPredmet(predmet: IPredmet) {
    import('./dialogs/predmet-dialog/predmet-dialog.component').then(
      ({ PredmetDialogComponent }) => {
        const ref = this.dialog.open(PredmetDialogComponent, {
          width: '560px',
          maxWidth: '95vw',
          data: { predmet },
        });
        ref.afterClosed().subscribe(r => { if (r) this.ucitaj(); });
      }
    );
  }

  obrisiPredmet(id: string) {
    if (!confirm('Da li ste sigurni da želite obrisati predmet?')) return;
    this.orgService.deletePredmet(id).subscribe(() => this.ucitaj());
  }

  getStatusClass(status: StatusPredmeta): string {
    const map: Record<StatusPredmeta, string> = {
      u_radu: 'status-u-radu',
      rijeseno: 'status-rijeseno',
      arhivirano: 'status-arhivirano',
    };
    return map[status];
  }
}
