import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { OrgService } from '../../../../core/services/org.service';
import { Zaposlenik, ZaposlenikDTO } from '../../../../core/models/org.models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-zaposlenik-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.zaposlenik ? 'Uredi zaposlenika' : 'Novi zaposlenik' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Ime</mat-label>
            <input matInput formControlName="ime"/>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Prezime</mat-label>
            <input matInput formControlName="prezime"/>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Spol</mat-label>
            <mat-select formControlName="spol">
              <mat-option value="M">Muški</mat-option>
              <mat-option value="Z">Ženski</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Datum rođenja</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="datumRodjenja"/>
            <mat-datepicker-toggle matSuffix [for]="picker"/>
            <mat-datepicker #picker/>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>JMBG</mat-label>
          <input matInput formControlName="jmbg" maxlength="13"/>
        </mat-form-field>

        <div class="section-title">Kontakt</div>

        <mat-form-field appearance="outline">
          <mat-label>Službeni email</mat-label>
          <input matInput formControlName="sluzbeniEmail" type="email"/>
          <mat-icon matSuffix>email</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Privatni email</mat-label>
          <input matInput formControlName="privatniEmail" type="email"/>
          <mat-icon matSuffix>email</mat-icon>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Telefon</mat-label>
            <input matInput formControlName="telefon"/>
            <mat-icon matSuffix>phone</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Mobilni</mat-label>
            <input matInput formControlName="mobilni"/>
            <mat-icon matSuffix>smartphone</mat-icon>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Adresa</mat-label>
          <input matInput formControlName="adresa"/>
          <mat-icon matSuffix>home</mat-icon>
        </mat-form-field>

        <div class="section-title">Zaposlenje</div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Datum zaposlenja</mat-label>
            <input matInput [matDatepicker]="picker2" formControlName="datumZaposlenja"/>
            <mat-datepicker-toggle matSuffix [for]="picker2"/>
            <mat-datepicker #picker2/>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Vrsta ugovora</mat-label>
            <mat-select formControlName="vrstaUgovora">
              <mat-option value="neodredjeno">Neodređeno</mat-option>
              <mat-option value="odredjeno">Određeno</mat-option>
              <mat-option value="pripravnik">Pripravnik</mat-option>
              <mat-option value="volonter">Volonter</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Odustani</button>
      <button mat-flat-button color="primary"
        [disabled]="form.invalid || loading"
        (click)="spremi()">
        @if (loading) { <mat-spinner diameter="20"/> }
        @else { Sačuvaj }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 500px;
      padding-top: 0.5rem;
      mat-form-field { width: 100%; }
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .section-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0.5rem 0 0;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--color-border);
    }
  `],
})
export class ZaposlenikDialogComponent implements OnInit {
  ref = inject(MatDialogRef<ZaposlenikDialogComponent>);
  data = inject<{ zaposlenik?: Zaposlenik }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  loading = false;

  form = this.fb.group({
    ime:             ['', Validators.required],
    prezime:         ['', Validators.required],
    spol:            [null as 'M' | 'Z' | null],
    datumRodjenja:   [null as Date | null],
    jmbg:            [''],
    sluzbeniEmail:   ['', Validators.email],
    privatniEmail:   ['', Validators.email],
    telefon:         [''],
    mobilni:         [''],
    adresa:          [''],
    datumZaposlenja: [null as Date | null],
    vrstaUgovora:    ['neodredjeno'],
  });

  ngOnInit() {
    if (this.data.zaposlenik) {
      const z = this.data.zaposlenik;
      this.form.patchValue({
        ime:             z.ime,
        prezime:         z.prezime,
        spol:            z.spol ?? null,
        datumRodjenja:   z.datumRodjenja ? new Date(z.datumRodjenja) : null,
        jmbg:            z.jmbg ?? '',
        sluzbeniEmail:   z.sluzbeniEmail ?? '',
        privatniEmail:   z.privatniEmail ?? '',
        telefon:         z.telefon ?? '',
        mobilni:         z.mobilni ?? '',
        adresa:          z.adresa ?? '',
        datumZaposlenja: z.datumZaposlenja ? new Date(z.datumZaposlenja) : null,
        vrstaUgovora:    z.vrstaUgovora ?? 'neodredjeno',
      });
    }
  }

  spremi() {
    if (this.form.invalid) return;
    this.loading = true;

    const raw = this.form.value;
    const data: Partial<ZaposlenikDTO> = {
      ime:             raw.ime ?? '',
      prezime:         raw.prezime ?? '',
      spol:            raw.spol ?? undefined,
      datumRodjenja:   raw.datumRodjenja?.toISOString() ?? undefined,
      jmbg:            raw.jmbg ?? undefined,
      sluzbeniEmail:   raw.sluzbeniEmail ?? undefined,
      privatniEmail:   raw.privatniEmail ?? undefined,
      telefon:         raw.telefon ?? undefined,
      mobilni:         raw.mobilni ?? undefined,
      adresa:          raw.adresa ?? undefined,
      datumZaposlenja: raw.datumZaposlenja?.toISOString() ?? undefined,
      vrstaUgovora:    raw.vrstaUgovora as ZaposlenikDTO['vrstaUgovora'],
    };

    const request$ = this.data.zaposlenik
      ? this.orgService.updateZaposlenik(this.data.zaposlenik._id, data)
      : this.orgService.createZaposlenik(data as ZaposlenikDTO);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.ref.close(true);
      },
      error: () => { this.loading = false; },
    });
  }
}
