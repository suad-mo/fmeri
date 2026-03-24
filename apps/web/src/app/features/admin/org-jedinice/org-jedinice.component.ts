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
  OrganizacionaJedinica,
  TIP_JEDINICE_NAZIV,
  TipJedinice,
} from '../../../core/models/org.models';
import { OrgJedinicaDialogComponent } from './dialogs/org-jedinica-dialog.component';

@Component({
  selector: 'app-org-jedinice',
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
  templateUrl: './org-jedinice.component.html',
  styleUrl: './org-jedinice.component.scss',
})
export class OrgJediniceComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  jedinice = signal<OrganizacionaJedinica[]>([]);
  isLoading = signal(true);
  tipNaziv = TIP_JEDINICE_NAZIV;

  kolone = ['naziv', 'tip', 'nadredjenaJedinica', 'aktivna', 'akcije'];

  getTipNaziv(tip: string): string {
    return this.tipNaziv[tip as TipJedinice] ?? tip;
  }

  ngOnInit() {
    this.ucitaj();
  }

  ucitaj() {
    this.isLoading.set(true);
    this.orgService.getJedinice().subscribe({
      next: (data) => {
        this.jedinice.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  otvoriDijalog(jedinica?: OrganizacionaJedinica) {
    const ref = this.dialog.open(OrgJedinicaDialogComponent, {
      width: '520px',
      data: { jedinica, sve: this.jedinice() },
    });
    ref.afterClosed().subscribe((rezultat) => {
      if (rezultat) this.ucitaj();
    });
  }

  obrisi(id: string) {
    if (!confirm('Deaktivirati ovu organizacionu jedinicu?')) return;
    this.orgService.deleteJedinica(id).subscribe(() => this.ucitaj());
  }
}
