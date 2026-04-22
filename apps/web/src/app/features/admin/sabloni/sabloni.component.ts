import { Component, inject, signal, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { OrgService } from '../../../core/services/org.service';
import {
  GlobalniSablon,
  TIP_JEDINICE_NAZIV,
  TipJedinice,
} from '../../../core/models/org.models';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SablonDialogComponent } from './dialogs/sablon-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sabloni',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatBadgeModule,
    MatDialogModule, // ← dodaj
    MatTooltipModule, // ← dodaj
    MatButtonModule, // ← dodaj
  ],
  templateUrl: './sabloni.component.html',
  styleUrl: './sabloni.component.scss',
})
export class SabloniComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  sabloni = signal<GlobalniSablon[]>([]);
  isLoading = signal(true);

  koloneOsnovne = ['tip', 'obavezna', 'minBroj', 'maxBroj', 'roditeljTipovi'];
  koloneUnutrasnje = [
    'tip',
    'obavezna',
    'minBroj',
    'maxBroj',
    'roditeljTipovi',
  ];

  ngOnInit() {
    this.orgService.getGlobalniSabloni().subscribe({
      next: (data) => {
        this.sabloni.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getTipNaziv(tip: string): string {
    return TIP_JEDINICE_NAZIV[tip as TipJedinice] ?? tip;
  }

  getRoditeljNazivi(tipovi: string[]): string {
    return tipovi.map((t) => this.getTipNaziv(t)).join(', ');
  }

  uredi(sablon: GlobalniSablon) {
    const ref = this.dialog.open(SablonDialogComponent, {
      width: '640px',
      maxWidth: '95vw', // ← dodaj
      data: { sablon },
    });
    ref.afterClosed().subscribe((rezultat) => {
      if (rezultat) this.ngOnInit();
    });
  }
}
