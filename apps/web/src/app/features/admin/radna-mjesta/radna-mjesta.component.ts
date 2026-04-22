import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrgService } from '../../../core/services/org.service';
import {
  RadnoMjesto,
  KATEGORIJA_NAZIV,
  KategorijaZaposlenog,
} from '../../../core/models/org.models';
import { RadnoMjestoDialogComponent } from './dialogs/radno-mjesto-dialog.component';

@Component({
  selector: 'app-radna-mjesta',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './radna-mjesta.component.html',
  styleUrl: './radna-mjesta.component.scss',
})
export class RadnaMjestaComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  mjesta = signal<RadnoMjesto[]>([]);
  isLoading = signal(true);

  kolone = ['naziv', 'pozicija', 'organizacionaJedinica', 'kategorija', 'broj', 'akcije'];

  getKategorijaNaziv(kategorija: string): string {
    return KATEGORIJA_NAZIV[kategorija as KategorijaZaposlenog] ?? kategorija;
  }

  ngOnInit() {
    this.ucitaj();
  }

  ucitaj() {
    this.isLoading.set(true);
    this.orgService.getRadnaMjesta().subscribe({
      next: (data) => {
        this.mjesta.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  otvoriDijalog(mjesto?: RadnoMjesto) {
    const ref = this.dialog.open(RadnoMjestoDialogComponent, {
      width: '520px',
      data: { mjesto },
    });
    ref.afterClosed().subscribe((rezultat) => {
      if (rezultat) this.ucitaj();
    });
  }

  obrisi(id: string) {
    if (!confirm('Deaktivirati ovo radno mjesto?')) return;
    this.orgService.deleteRadnoMjesto(id).subscribe(() => this.ucitaj());
  }
}
