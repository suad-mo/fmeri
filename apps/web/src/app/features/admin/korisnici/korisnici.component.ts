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
import { environment } from '../../../../environments/environment.production';

@Component({
  selector: 'app-korisnici',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDialogModule,
  ],
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.scss',
})
export class KorisniciComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog = inject(MatDialog);

  korisnici = signal<UserProfil[]>([]);
  isLoading = signal(true);

  kolone = ['name', 'email', 'role', 'zaposlenik', 'akcije'];

  readonly apiUrl = environment.uploadsUrl;

  ngOnInit() { this.ucitaj(); }

  ucitaj() {
    this.isLoading.set(true);
    this.orgService.getUsers().subscribe({
      next: (data) => { this.korisnici.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  noviKorisnik() {
    import('./dialogs/korisnik-dialog/korisnik-dialog.component').then(
      ({ KorisnikDialogComponent }) => {
        const ref = this.dialog.open(KorisnikDialogComponent, {
          width: '520px', data: {},
        });
        ref.afterClosed().subscribe(r => { if (r) this.ucitaj(); });
      }
    );
  }

  urediKorisnika(korisnik: UserProfil) {
    import('./dialogs/korisnik-dialog/korisnik-dialog.component').then(
      ({ KorisnikDialogComponent }) => {
        const ref = this.dialog.open(KorisnikDialogComponent, {
          width: '520px', data: { korisnik },
        });
        ref.afterClosed().subscribe(r => { if (r) this.ucitaj(); });
      }
    );
  }

  resetLozinka(korisnik: UserProfil) {
    import('./dialogs/reset-lozinka-dialog/reset-lozinka-dialog.component').then(
      ({ ResetLozinkaDialogComponent }) => {
        const ref = this.dialog.open(ResetLozinkaDialogComponent, {
          width: '420px', data: { korisnik },
        });
        ref.afterClosed().subscribe(r => { if (r) this.ucitaj(); });
      }
    );
  }

  poveziZaposlenika(korisnik: UserProfil) {
    import('./dialogs/povezi-zaposlenik-dialog/povezi-zaposlenik-dialog.component').then(
      ({ PoveziZaposlenikDialogComponent }) => {
        const ref = this.dialog.open(PoveziZaposlenikDialogComponent, {
          width: '500px', data: { korisnik },
        });
        ref.afterClosed().subscribe(r => { if (r) this.ucitaj(); });
      }
    );
  }
}
