import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { OrgService } from '../../../../core/services/org.service';
import {
  KategorijaZaposlenog,
  KATEGORIJA_NAZIV,
  OsnovnaJedinicaDetalji,
  UnutrasnjaJedinicaDetalji,
  PlatniRazredPozicija,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-organ-rm-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Novo radno mjesto</h2>
    @if (data.jedinica) {
      <p class="subtitle">U: <strong>{{ data.jedinica.naziv }}</strong></p>
    } @else {
      <p class="subtitle">Direktno u: <strong>{{ data.organNaziv }}</strong></p>
    }

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <!-- Kategorija -->
        <mat-form-field appearance="outline">
          <mat-label>Kategorija</mat-label>
          <mat-select formControlName="kategorijaZaposlenog"
            (selectionChange)="onKategorijaChange($event.value)">
            @for (k of kategorije; track k.value) {
              <mat-option [value]="k.value">{{ k.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Pozicija -->
        @if (pozicijeLoading()) {
          <div class="loading-row">
            <mat-spinner diameter="20"/>
            <span>Učitavam pozicije...</span>
          </div>
        } @else if (pozicije().length > 0) {
          <mat-form-field appearance="outline">
            <mat-label>Pozicija / radno mjesto</mat-label>
            <mat-select formControlName="pozicijaKljuc"
              (selectionChange)="onPozicijaChange($event.value)">
              @for (p of pozicije(); track p.kljuc) {
                <mat-option [value]="p.kljuc">
                  {{ p.naziv }}
                  <span class="razred-hint"> — Razred {{ p.razred }} ({{ p.koeficijent }})</span>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        <!-- Naziv -->
        <mat-form-field appearance="outline">
          <mat-label>Naziv radnog mjesta</mat-label>
          <input matInput formControlName="naziv"
            placeholder="Npr. Stručni savjetnik za energetiku"/>
          <mat-hint>Možeš promijeniti predloženi naziv</mat-hint>
        </mat-form-field>

        <!-- Razred, koeficijent, broj izvršilaca -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Platni razred</mat-label>
            <input matInput formControlName="platniRazred" [readonly]="!!odabranaPozicija()"/>
            @if (odabranaPozicija()) {
              <mat-icon matSuffix matTooltip="Automatski popunjeno">lock</mat-icon>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Koeficijent</mat-label>
            <input matInput type="number" step="0.01" formControlName="koeficijent"
              [readonly]="!!odabranaPozicija()"/>
            @if (odabranaPozicija()) {
              <mat-icon matSuffix matTooltip="Automatski popunjeno">lock</mat-icon>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Broj izvršilaca</mat-label>
            <input matInput type="number" min="1" formControlName="brojIzvrsilaca"/>
          </mat-form-field>
        </div>

        <!-- Opis poslova -->
        <mat-form-field appearance="outline">
          <mat-label>Opis poslova</mat-label>
          <textarea matInput formControlName="opsisPoslova" rows="3"
            placeholder="Kratki opis poslova i zadataka..."></textarea>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Odustani</button>
      <button mat-flat-button color="primary"
        [disabled]="form.invalid || loading"
        (click)="spremi()">
        @if (loading) { <mat-spinner diameter="20"/> }
        @else { Kreiraj }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .subtitle {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin: -0.5rem 1.5rem 0.5rem;
    }
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 520px;
      padding-top: 0.5rem;
      mat-form-field { width: 100%; }
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.75rem;
    }
    .loading-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--color-text-secondary);
      padding: 0.5rem 0;
    }
    .razred-hint {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    input[readonly] {
      color: var(--color-text-secondary);
      cursor: not-allowed;
    }
  `],
})
export class OrganRmDialogComponent implements OnInit {
  ref = inject(MatDialogRef<OrganRmDialogComponent>);
  data = inject<{
    organId: string;
    organNaziv: string;
    jedinica?: OsnovnaJedinicaDetalji | UnutrasnjaJedinicaDetalji;
  }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  loading = false;
  pozicije = signal<PlatniRazredPozicija[]>([]);
  pozicijeLoading = signal(false);
  odabranaPozicija = signal<PlatniRazredPozicija | null>(null);

  kategorije = Object.entries(KATEGORIJA_NAZIV).map(([value, label]) => ({
    value: value as KategorijaZaposlenog,
    label,
  }));

  form = this.fb.group({
    naziv:                ['', Validators.required],
    kategorijaZaposlenog: ['' as KategorijaZaposlenog, Validators.required],
    pozicijaKljuc:        ['', Validators.required],
    platniRazred:         ['', Validators.required],
    koeficijent:          [0, [Validators.required, Validators.min(0.01)]],
    brojIzvrsilaca:       [1, [Validators.required, Validators.min(1)]],
    opsisPoslova:         [''],
  });

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() { /* empty */ }

  onKategorijaChange(kategorija: string) {
    this.pozicije.set([]);
    this.odabranaPozicija.set(null);
    this.form.patchValue({
      pozicijaKljuc: '',
      platniRazred: '',
      koeficijent: 0,
      naziv: '',
    });

    this.pozicijeLoading.set(true);
    this.orgService.getPozicijeByKategorija(kategorija).subscribe({
      next: (data) => {
        this.pozicije.set(data);
        this.pozicijeLoading.set(false);
      },
      error: () => this.pozicijeLoading.set(false),
    });
  }

  onPozicijaChange(kljuc: string) {
    const pozicija = this.pozicije().find(p => p.kljuc === kljuc);
    if (!pozicija) return;

    this.odabranaPozicija.set(pozicija);
    this.form.patchValue({
      naziv: pozicija.naziv,
      platniRazred: pozicija.razred,
      koeficijent: pozicija.koeficijent,
    });
  }

  spremi() {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.value;

    const rmData: Record<string, unknown> = {
      naziv:                raw.naziv,
      kategorijaZaposlenog: raw.kategorijaZaposlenog,
      pozicijaKljuc:        raw.pozicijaKljuc,
      platniRazred:         raw.platniRazred,
      koeficijent:          raw.koeficijent,
      brojIzvrsilaca:       raw.brojIzvrsilaca,
      opsisPoslova:         raw.opsisPoslova,
      osnovnaJedinicaId:    this.data.jedinica?._id ?? null,
    };

    this.orgService.addRadnoMjestoUOrganu(this.data.organId, rmData).subscribe({
      next: () => { this.loading = false; this.ref.close(true); },
      error: () => { this.loading = false; },
    });
  }
}
