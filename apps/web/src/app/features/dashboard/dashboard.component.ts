import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexResponsive,
} from 'ng-apexcharts';
import { OrgService } from '../../core/services/org.service';
import { AuthService } from '../../core/services/auth.service';
import {
  DashboardStats,
  SistematizacijaItem,
  KATEGORIJA_NAZIV,
  KategorijaZaposlenog,
} from '../../core/models/org.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    NgApexchartsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private orgService = inject(OrgService);
  authService = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  sistematizacija = signal<SistematizacijaItem[]>([]);
  isLoading = signal(true);

  kolone = ['naziv', 'organizacija', 'razred', 'kategorija', 'izvršioci', 'status'];

  // ── Bar chart — zaposlenici po sektoru ───────────────
  barSeries: ApexAxisChartSeries = [];
  barChart: ApexChart = {
    type: 'bar',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'inherit',
  };
  barXAxis: ApexXAxis = { categories: [] };
  barPlotOptions: ApexPlotOptions = {
    bar: { borderRadius: 6, columnWidth: '55%' },
  };
  barDataLabels: ApexDataLabels = { enabled: false };
  barColors = ['#667eea'];

  // ── Donut chart — platni razredi ──────────────────────
  donutSeries: ApexNonAxisChartSeries = [];
  donutChart: ApexChart = {
    type: 'donut',
    height: 280,
    fontFamily: 'inherit',
  };
  donutLabels: string[] = [];
  donutLegend: ApexLegend = { position: 'right', fontSize: '12px' };
  donutResponsive: ApexResponsive[] = [
    { breakpoint: 768, options: { legend: { position: 'bottom' } } },
  ];
  donutColors = ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#38b2ac',
                 '#9f7aea', '#f6ad55', '#4299e1', '#68d391', '#fc8181', '#b794f4'];

  ngOnInit() {
    Promise.all([
      this.orgService.getDashboardStats().toPromise(),
      this.orgService.getZaposleniciPoSektoru().toPromise(),
      this.orgService.getPlatniRazrediStats().toPromise(),
      this.orgService.getSistematizacija().toPromise(),
    ]).then(([stats, sektori, razredi, sistematizacija]) => {
      this.stats.set(stats ?? null);
      this.sistematizacija.set(sistematizacija ?? []);

      // Bar chart data
      if (sektori?.length) {
        this.barSeries = [{
          name: 'Zaposlenici',
          data: sektori.map((s) => s.broj),
        }];
        this.barXAxis = {
          categories: sektori.map((s) =>
            s.naziv.length > 20 ? s.naziv.substring(0, 20) + '...' : s.naziv
          ),
          labels: { style: { fontSize: '11px' } },
        };
      }

      // Donut chart data
      if (razredi?.length) {
        this.donutSeries = razredi.map((r) => r.broj);
        this.donutLabels = razredi.map((r) => `Razred ${r.razred} (koef. ${r.koeficijent})`);
      }

      this.isLoading.set(false);
    });
  }

  getStatusBoja(status: string): string {
    return status === 'popunjeno' ? 'chip-popunjeno' :
           status === 'djelimicno' ? 'chip-djelimicno' : 'chip-slobodno';
  }

  getStatusNaziv(status: string): string {
    return status === 'popunjeno' ? 'Popunjeno' :
           status === 'djelimicno' ? 'Djelimično' : 'Slobodno';
  }

  getKategorijaNaziv(k: string): string {
    return KATEGORIJA_NAZIV[k as KategorijaZaposlenog] ?? k;
  }

  stampaj() {
    window.print();
  }
}
