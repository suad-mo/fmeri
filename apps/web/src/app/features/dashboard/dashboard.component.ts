import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApexYAxis, NgApexchartsModule } from 'ng-apexcharts';
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
import { DashboardStats } from '../../core/models/org.models';
// import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    // RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    NgApexchartsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private orgService = inject(OrgService);
  authService = inject(AuthService);

  stats = signal<DashboardStats | null>(null);

  popunjenost = signal<{
    posto: number;
    popunjeno: number;
    ukupno: number;
  } | null>(null);

  isLoading = signal(true);
  isDark = signal(localStorage.getItem('theme') === 'dark');

  // ── Bar chart ─────────────────────────────────────────
  barSeries: ApexAxisChartSeries = [];
  barChart: ApexChart = {
    type: 'bar',
    height: 350,
    toolbar: { show: false },
    fontFamily: 'inherit',
    animations: { enabled: true, speed: 600 },
  };

  barPlotOptions: ApexPlotOptions = {
    bar: {
      borderRadius: 6,
      horizontal: true, // ← horizontalni
      barHeight: '60%',
    },
  };

  barXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '11px' } },
  };

  barYAxis: ApexYAxis = {
    labels: {
      style: { fontSize: '11px' },
      maxWidth: 200,
    },
  };
  barDataLabels: ApexDataLabels = { enabled: false };
  barColors = ['#667eea'];
  barFill = {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.4,
      gradientToColors: ['#764ba2'],
      opacityFrom: 1,
      opacityTo: 0.8,
    },
  };

  // ── Donut chart ───────────────────────────────────────
  donutSeries: ApexNonAxisChartSeries = [];
  donutChart: ApexChart = {
    type: 'donut',
    height: 300,
    fontFamily: 'inherit',
    animations: { enabled: true, speed: 600 },
  };
  donutLabels: string[] = [];
  donutLegend: ApexLegend = { position: 'bottom', fontSize: '12px' };
  donutResponsive: ApexResponsive[] = [
    { breakpoint: 768, options: { legend: { position: 'bottom' } } },
  ];
  donutPlotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Ukupno',
            fontSize: '14px',
            fontWeight: '600',
          },
        },
      },
    },
  };
  donutColors = [
    '#667eea',
    '#48bb78',
    '#ed8936',
    '#e53e3e',
    '#38b2ac',
    '#9f7aea',
    '#f6ad55',
    '#4299e1',
    '#68d391',
    '#fc8181',
    '#b794f4',
  ];

  ngOnInit() {
    Promise.all([
      this.orgService.getDashboardStats().toPromise(),
      this.orgService.getZaposleniciPoSektoru().toPromise(),
      this.orgService.getPlatniRazrediStats().toPromise(),
      this.orgService.getPopunjenost().toPromise(),
    ]).then(([stats, sektori, razredi, popunjenost]) => {
      // ← ukloni sistematizacija
      this.stats.set(stats ?? null);

      // Popunjenost
      if (popunjenost?.length) {
        const ukupno = popunjenost.reduce((s, o) => s + o.ukupnoRM, 0);
        const popunjeno = popunjenost.reduce((s, o) => s + o.popunjeno, 0);
        this.popunjenost.set({
          ukupno,
          popunjeno,
          posto: ukupno > 0 ? Math.round((popunjeno / ukupno) * 100) : 0,
        });
      }

      // Bar chart
      if (sektori?.length) {
        this.barSeries = [
          { name: 'Zaposlenici', data: sektori.map((s) => s.broj) },
        ];
        this.barXAxis = {
          categories: sektori.map((s) =>
            s.naziv.length > 20 ? s.naziv.substring(0, 20) + '...' : s.naziv,
          ),
          labels: { style: { fontSize: '11px' } },
        };
      }

      // Donut chart
      if (razredi?.length) {
        this.donutSeries = razredi.map((r) => r.broj);
        this.donutLabels = razredi.map(
          (r) => `Razred ${r.razred} (koef. ${r.koeficijent})`,
        );
      }

      this.isLoading.set(false);
    });
  }

  stampaj() {
    window.print();
  }

  // logout() {
  //   this.authService.logout();
  // }

  // toggleTheme(): void {
  //   this.isDark.set(!this.isDark());
  //   constgetSt body = document.body;
  //   if (this.isDark()) {
  //     body.classList.add('dark-theme');
  //     localStorage.setItem('theme', 'dark');
  //   } else {
  //     body.classList.remove('dark-theme');
  //     localStorage.setItem('theme', 'light');
  //   }
  // }
}
