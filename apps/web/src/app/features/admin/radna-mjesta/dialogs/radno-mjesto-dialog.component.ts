import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrgService } from '../../../../core/services/org.service';
import {
  RadnoMjesto,
  RadnoMjestoDTO,
  OrganizacionaJedinica,
  KategorijaZaposlenog,
  PlatniRazredPozicija,
  KATEGORIJA_NAZIV,
  PozicijaKljuc,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-radno-mjesto-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mjesto ? 'Uredi radno mjesto' : 'Novo radno mjesto' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Naziv radnog mjesta</mat-label>
          <input
            matInput
            formControlName="naziv"
            placeholder="npr. Stručni savjetnik za energetiku"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Organizaciona jedinica</mat-label>
          <mat-select formControlName="organizacionaJedinica">
            @for (j of jedinice; track j._id) {
              <mat-option [value]="j._id">{{ j.naziv }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Kategorija zaposlenog</mat-label>
          <mat-select
            formControlName="kategorijaZaposlenog"
            (selectionChange)="onKategorijaChange($event.value)"
          >
            @for (k of kategorije; track k.value) {
              <mat-option [value]="k.value">{{ k.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Pozicija</mat-label>
          <mat-select
            formControlName="pozicijaKljuc"
            (selectionChange)="onPozicijaChange($event.value)"
          >
            @if (ucitavaPozicije) {
              <mat-option disabled>Učitavam...</mat-option>
            }
            @for (p of pozicije; track p.kljuc) {
              <mat-option [value]="p.kljuc">
                {{ p.naziv }}
                <span class="razred-badge">
                  — Razred {{ p.razred }} ({{ p.koeficijent }})</span
                >
              </mat-option>
            }
          </mat-select>
          @if (odabranaPozicija) {
            <mat-hint>{{ odabranaPozicija.opis }}</mat-hint>
          }
        </mat-form-field>

        <!-- Platni razred i koeficijent — readonly, automatski -->
        <div class="info-row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Platni razred</mat-label>
            <input matInput formControlName="platniRazred" readonly />
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Koeficijent</mat-label>
            <input matInput formControlName="koeficijent" readonly />
          </mat-form-field>
        </div>

        @if (odabranaPozicija) {
          <div class="uvjeti-box">
            <p class="uvjeti-naslov">Uvjeti konkursa</p>
            <p>
              Stručna sprema:
              <strong>{{
                odabranaPozicija.uvjetiKonkursa.stucnaSprema
              }}</strong>
            </p>
            <p>
              Min. radno iskustvo:
              <strong
                >{{
                  odabranaPozicija.uvjetiKonkursa.minRadnoIskustvo
                }}
                god.</strong
              >
            </p>
            @if (odabranaPozicija.uvjetiKonkursa.posebniUvjeti.length > 0) {
              <p>Posebni uvjeti:</p>
              <ul>
                @for (
                  u of odabranaPozicija.uvjetiKonkursa.posebniUvjeti;
                  track u
                ) {
                  <li>{{ u }}</li>
                }
              </ul>
            }
          </div>
        }

        <mat-form-field appearance="outline">
          <mat-label>Opis poslova</mat-label>
          <textarea
            matInput
            formControlName="opsisPoslova"
            rows="3"
            placeholder="Specifičan opis poslova za ovo radno mjesto"
          ></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Broj izvršilaca</mat-label>
          <input
            matInput
            type="number"
            formControlName="brojIzvrsilaca"
            min="1"
          />
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Odustani</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="spremi()"
      >
        {{ data.mjesto ? 'Sačuvaj' : 'Kreiraj' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 500px;
        padding-top: 0.5rem;
        mat-form-field {
          width: 100%;
        }
      }
      .info-row {
        display: flex;
        gap: 1rem;
        .half {
          flex: 1;
        }
      }
      .razred-badge {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }
      .uvjeti-box {
        background: var(--color-background-secondary);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        p {
          margin: 0.2rem 0;
        }
        ul {
          margin: 0.2rem 0 0 1rem;
          padding: 0;
        }
        .uvjeti-naslov {
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
        }
      }
    `,
  ],
})
export class RadnoMjestoDialogComponent implements OnInit {
  ref = inject(MatDialogRef<RadnoMjestoDialogComponent>);
  data = inject<{
    mjesto?: RadnoMjesto;
    defaultJedinica?: OrganizacionaJedinica;
  }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);
  private cdr = inject(ChangeDetectorRef);

  jedinice: OrganizacionaJedinica[] = [];
  pozicije: PlatniRazredPozicija[] = [];
  odabranaPozicija: PlatniRazredPozicija | null = null;
  ucitavaPozicije = false;

  kategorije = Object.entries(KATEGORIJA_NAZIV).map(([value, label]) => ({
    value: value as KategorijaZaposlenog,
    label,
  }));

  form = this.fb.group({
    naziv: ['', Validators.required],
    organizacionaJedinica: ['', Validators.required],
    kategorijaZaposlenog: ['' as KategorijaZaposlenog, Validators.required],
    pozicijaKljuc: ['', Validators.required],
    platniRazred: [{ value: '', disabled: true }], // ← već ispravno
    koeficijent: [{ value: '', disabled: true }], // ← već ispravno
    opsisPoslova: [''],
    brojIzvrsilaca: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.orgService.getJedinice().subscribe((data) => {
      this.jedinice = data;
      this.cdr.detectChanges();

      if (this.data.defaultJedinica) {
        this.form.patchValue({
          organizacionaJedinica: this.data.defaultJedinica._id,
        });
      }

      if (this.data.mjesto) {
        const m = this.data.mjesto;
        // Učitaj pozicije za kategoriju pa patch
        this.ucitajPozicije(m.kategorijaZaposlenog, () => {
          this.form.patchValue({
            naziv: m.naziv,
            organizacionaJedinica: m.organizacionaJedinica._id,
            kategorijaZaposlenog: m.kategorijaZaposlenog,
            pozicijaKljuc: m.pozicijaKljuc,
            platniRazred: m.platniRazred,
            koeficijent: m.koeficijent.toString(),
            opsisPoslova: m.opsisPoslova ?? '',
            brojIzvrsilaca: m.brojIzvrsilaca,
          });
          this.odabranaPozicija =
            this.pozicije.find((p) => p.kljuc === m.pozicijaKljuc) ?? null;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onKategorijaChange(kategorija: KategorijaZaposlenog) {
    this.form.patchValue({
      pozicijaKljuc: '',
      platniRazred: '',
      koeficijent: '',
    });
    this.odabranaPozicija = null;
    this.pozicije = [];
    this.ucitajPozicije(kategorija);
  }

  onPozicijaChange(kljuc: string) {
    const pozicija = this.pozicije.find((p) => p.kljuc === kljuc);
    if (pozicija) {
      this.odabranaPozicija = pozicija;
      this.form.patchValue({
        platniRazred: pozicija.razred,
        koeficijent: pozicija.koeficijent.toString(),
      });
    }
  }

  private ucitajPozicije(kategorija: string, callback?: () => void) {
    this.ucitavaPozicije = true;
    this.orgService.getPozicijeByKategorija(kategorija).subscribe((data) => {
      this.pozicije = data;
      this.ucitavaPozicije = false;
      this.cdr.detectChanges();
      if (callback) callback();
    });
  }

  spremi() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const data: RadnoMjestoDTO = {
      naziv: raw.naziv as string,
      organizacionaJedinica: raw.organizacionaJedinica as string,
      kategorijaZaposlenog: raw.kategorijaZaposlenog as KategorijaZaposlenog,
      pozicijaKljuc: raw.pozicijaKljuc as PozicijaKljuc,
      platniRazred: raw.platniRazred as string,
      koeficijent: Number(raw.koeficijent),
      opsisPoslova: raw.opsisPoslova as string,
      brojIzvrsilaca: raw.brojIzvrsilaca as number,
    };

    const obs = this.data.mjesto
      ? this.orgService.updateRadnoMjesto(this.data.mjesto._id, data)
      : this.orgService.createRadnoMjesto(data);

    obs.subscribe(() => this.ref.close(true));
  }
}
