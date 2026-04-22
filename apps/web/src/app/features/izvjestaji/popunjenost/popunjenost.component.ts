import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrgService } from '../../../core/services/org.service';
import {
  PopunjenostOrgana,
  PopunjenostJedinice,
} from '../../../core/models/org.models';
import { environment } from '../../../../environments/environment.production';

@Component({
  selector: 'app-popunjenost',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './popunjenost.component.html',
  styleUrl: './popunjenost.component.scss',
})
export class PopunjenostComponent implements OnInit {
  private orgService = inject(OrgService);

  podaci = signal<PopunjenostOrgana[]>([]);
  isLoading = signal(true);
  otvoreniOrgani = signal<Set<string>>(new Set());

  ukupnoSistem = computed(() => {
    const svi = this.podaci();
    const ukupnoRM = svi.reduce((s, o) => s + o.ukupnoRM, 0);
    const popunjeno = svi.reduce((s, o) => s + o.popunjeno, 0);
    return {
      ukupnoRM,
      popunjeno,
      upraznjeno: ukupnoRM - popunjeno,
      posto: ukupnoRM > 0 ? Math.round((popunjeno / ukupnoRM) * 100) : 0,
    };
  });

  readonly apiUrl = environment.apiUrl;

  downloadPDF() {
    window.open(`${this.apiUrl}/izvjestaj/popunjenost/pdf`, '_blank');
  }

  downloadExcel() {
    window.open(`${this.apiUrl}/izvjestaj/popunjenost/excel`, '_blank');
  }

  ngOnInit() {
    this.orgService.getPopunjenost().subscribe({
      next: (data) => {
        this.podaci.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleOrgan(id: string) {
    this.otvoreniOrgani.update((set) => {
      const next = new Set(set);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isOpen(id: string): boolean {
    return this.otvoreniOrgani().has(id);
  }

  getProgressBoja(posto: number): string {
    if (posto >= 80) return 'progress-zelena';
    if (posto >= 50) return 'progress-zuta';
    return 'progress-crvena';
  }

  // Filtriraj samo OOJ (osnovna), ne unutrašnje
  getOsnovneJedinice(jedinice: PopunjenostJedinice[]): PopunjenostJedinice[] {
    return jedinice.filter(
      (j) =>
        j.nivoJedinice === 'osnovna' &&
        !['ministarstvo', 'zavod', 'direkcija'].includes(j.tip),
    );
  }
}
