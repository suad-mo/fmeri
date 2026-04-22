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
  OsnovnaJedinicaDetalji,
  TipJedinice,
  TIP_JEDINICE_NAZIV,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-organ-jedinica-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.jedinica ? 'Uredi jedinicu' : 'Nova org. jedinica' }}</h2>
    @if (data.roditelj) {
      <p class="subtitle">U: <strong>{{ data.roditelj.naziv }}</strong></p>
    }

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <mat-form-field appearance="outline">
          <mat-label>Naziv</mat-label>
          <input matInput formControlName="naziv"/>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Tip jedinice</mat-label>
            <mat-select formControlName="tip">
              @for (t of tipovi; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Redoslijed</mat-label>
            <input matInput type="number" formControlName="redoslijed"/>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Opis / Nadležnost</mat-label>
          <textarea matInput formControlName="opis" rows="2"></textarea>
        </mat-form-field>

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
    .subtitle {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin: -0.5rem 1.5rem 0.5rem;
    }
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 480px;
      padding-top: 0.5rem;
      mat-form-field { width: 100%; }
    }
    .form-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 0.75rem;
    }
  `],
})
export class OrganJedinicaDialogComponent implements OnInit {
  ref = inject(MatDialogRef<OrganJedinicaDialogComponent>);
  data = inject<{
    organId: string;
    jedinica?: OsnovnaJedinicaDetalji;
    roditelj?: OsnovnaJedinicaDetalji;
    nivo: 'osnovna' | 'unutrasnja';
  }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  loading = false;

  // Tipovi ovisno o nivou
  tipovi = Object.entries(TIP_JEDINICE_NAZIV)
    .filter(([value]) => {
      if (this.data.nivo === 'osnovna') {
        return ['sektor', 'sluzba', 'kabinet', 'centar'].includes(value);
      }
      return ['odsjek', 'grupa', 'centar'].includes(value);
    })
    .map(([value, label]) => ({ value: value as TipJedinice, label }));

  form = this.fb.group({
    naziv:      ['', Validators.required],
    tip:        ['' as TipJedinice, Validators.required],
    opis:       [''],
    redoslijed: [1],
  });

  ngOnInit() {
    if (this.tipovi.length === 1) {
      this.form.patchValue({ tip: this.tipovi[0].value });
    }

    if (this.data.jedinica) {
      const j = this.data.jedinica;
      this.form.patchValue({
        naziv:      j.naziv,
        tip:        j.tip as TipJedinice,
        opis:       j.opis ?? '',
        redoslijed: j.redoslijed,
      });
    }
  }

  spremi() {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.value;

    const request$ = this.data.jedinica
      ? this.orgService.updateJedinicaUOrganu(
          this.data.organId,
          this.data.jedinica._id,
          { naziv: raw.naziv, tip: raw.tip, opis: raw.opis, redoslijed: raw.redoslijed }
        )
      : this.data.nivo === 'osnovna'
        ? this.orgService.addOsnovnaJedinica(this.data.organId, {
            naziv: raw.naziv, tip: raw.tip, opis: raw.opis, redoslijed: raw.redoslijed,
          })
        : this.orgService.addUnutrasnjaJedinica(this.data.organId, {
            naziv: raw.naziv, tip: raw.tip, opis: raw.opis, redoslijed: raw.redoslijed,
            osnovnaJedinicaId: this.data.roditelj?._id,
          });

    request$.subscribe({
      next: () => { this.loading = false; this.ref.close(true); },
      error: () => { this.loading = false; },
    });
  }
}
