import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OrgService } from '../../../core/services/org.service';
import {
  SistematizacijaItem,
  KATEGORIJA_NAZIV,
  KategorijaZaposlenog,
} from '../../../core/models/org.models';
import { environment } from '../../../../environments/environment.production';

@Component({
  selector: 'app-sistematizacija',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './sistematizacija.component.html',
  styleUrl: './sistematizacija.component.scss',
})
export class SistematizacijaComponent implements OnInit {
  private orgService = inject(OrgService);

  stavke = signal<SistematizacijaItem[]>([]);
  isLoading = signal(true);
  pretraga = signal('');
  filterStatus = signal('sve');

  filtrirane = computed(() => {
    const p = this.pretraga().toLowerCase();
    const s = this.filterStatus();
    return this.stavke().filter((item) => {
      const matchPretraga =
        !p ||
        item.naziv.toLowerCase().includes(p) ||
        item.organizacionaJedinica?.naziv.toLowerCase().includes(p);
      const matchStatus = s === 'sve' || item.status === s;
      return matchPretraga && matchStatus;
    });
  });

  grupirane = computed(() => {
    const grupe = new Map<
      string,
      { naziv: string; items: SistematizacijaItem[] }
    >();
    for (const item of this.filtrirane()) {
      const naziv = item.organizacionaJedinica?.naziv ?? 'Ostalo';
      if (!grupe.has(naziv)) grupe.set(naziv, { naziv, items: [] });
      grupe.get(naziv)?.items.push(item);
    }
    return Array.from(grupe.values());
  });

  sumarno = computed(() => {
    const sve = this.stavke();
    const ukupno = sve.reduce((s, i) => s + i.brojIzvrsilaca, 0);
    const popunjeno = sve.reduce((s, i) => s + i.popunjeno, 0);
    return {
      ukupnoRM: sve.length,
      ukupnoIzvrsilaca: ukupno,
      popunjeno,
      upraznjeno: ukupno - popunjeno,
      posto: ukupno > 0 ? Math.round((popunjeno / ukupno) * 100) : 0,
    };
  });

  ngOnInit() {
    this.orgService.getSistematizacija().subscribe({
      next: (data) => {
        this.stavke.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getKategorijaNaziv(k: string): string {
    return KATEGORIJA_NAZIV[k as KategorijaZaposlenog] ?? k;
  }

  getStatusBoja(status: string): string {
    return status === 'popunjeno'
      ? 'status-popunjeno'
      : status === 'djelimicno'
        ? 'status-djelimicno'
        : 'status-slobodno';
  }

  getStatusNaziv(status: string): string {
    return status === 'popunjeno'
      ? 'Popunjeno'
      : status === 'djelimicno'
        ? 'Djelimično'
        : 'Slobodno';
  }

  downloadPDF() {
    window.open(
      `${environment.apiUrl}/izvjestaj/sistematizacija/pdf`,
      '_blank',
    );
  }

  downloadExcel() {
    window.open(
      `${environment.apiUrl}/izvjestaj/sistematizacija/excel`,
      '_blank',
    );
  }
}
