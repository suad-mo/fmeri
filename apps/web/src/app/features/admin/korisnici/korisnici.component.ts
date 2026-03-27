import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrgService } from '../../../core/services/org.service';
import { UserProfil } from '../../../core/models/org.models';
import { DodjelaDialogComponent } from './dialogs/dodjela-dialog.component';

@Component({
  selector: 'app-korisnici',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.scss',
})
export class KorisniciComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  korisnici = signal<UserProfil[]>([]);
  isLoading = signal(true);

  kolone = ['name', 'email', 'role', 'organizacija', 'radnoMjesto', 'akcije'];

  readonly apiUrl = 'http://localhost:3000/uploads/slike';

  ngOnInit() {
    this.ucitaj();
  }

  ucitaj() {
    this.isLoading.set(true);
    this.orgService.getUsers().subscribe({
      next: (data) => {
        this.korisnici.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  otvoriDodjelu(korisnik: UserProfil) {
    const ref = this.dialog.open(DodjelaDialogComponent, {
      width: '550px',
      data: { korisnik },
    });
    ref.afterClosed().subscribe((rezultat) => {
      if (rezultat) this.ucitaj();
    });
  }
}
