import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrgService } from '../../../../core/services/org.service';
import {
  KategorijaZaposlenog,
  KATEGORIJA_NAZIV,
  OsnovnaJedinicaDetalji,
  UnutrasnjaJedinicaDetalji,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-organ-rm-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
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

        <mat-form-field appearance="outline">
          <mat-label>Naziv radnog mjesta</mat-label>
          <input matInput formControlName="naziv"/>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Kategorija</mat-label>
          <mat-select formControlName="kategorijaZaposlenog"
            (selectionChange)="onKategorijaChange($event.value)">
            @for (k of kategorije; track k.value) {
              <mat-option [value]="k.value">{{ k.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Platni razred</mat-label>
            <input matInput formControlName="platniRazred"/>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Koeficijent</mat-label>
            <input matInput type="number" step="0.01" formControlName="koeficijent"/>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Broj izvršilaca</mat-label>
            <input matInput type="number" formControlName="brojIzvrsilaca"/>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Opis poslova</mat-label>
          <textarea matInput formControlName="opsisPoslova" rows="3"></textarea>
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
      min-width: 500px;
      padding-top: 0.5rem;
      mat-form-field { width: 100%; }
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.75rem;
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

  kategorije = Object.entries(KATEGORIJA_NAZIV).map(([value, label]) => ({
    value: value as KategorijaZaposlenog,
    label,
  }));

  form = this.fb.group({
    naziv:                ['', Validators.required],
    kategorijaZaposlenog: ['' as KategorijaZaposlenog, Validators.required],
    platniRazred:         ['', Validators.required],
    koeficijent:          [0, Validators.required],
    brojIzvrsilaca:       [1, Validators.required],
    opsisPoslova:         [''],
  });

  ngOnInit() {
    console.log('NgOnInit.....');

  }

  onKategorijaChange(kategorija: string) {
    // Auto-postavi koeficijent ovisno o kategoriji
  }

  spremi() {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.value;

    const rmData: Record<string, unknown> = {
      naziv:                raw.naziv,
      kategorijaZaposlenog: raw.kategorijaZaposlenog,
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
