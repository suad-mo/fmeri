import { Component, inject, OnInit } from '@angular/core';
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
import { OrgService } from '../../../../core/services/org.service';
import {
  OrganizacionaJedinica,
  TipJedinice,
  TIP_JEDINICE_NAZIV,
  OrganizacionaJedinicaDTO,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-org-jedinica-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.jedinica ? 'Uredi jedinicu' : 'Nova organizaciona jedinica' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Naziv</mat-label>
          <input matInput formControlName="naziv" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tip jedinice</mat-label>
          <mat-select formControlName="tip">
            @for (tip of tipovi; track tip.value) {
              <mat-option [value]="tip.value">{{ tip.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nadređena jedinica</mat-label>
          <mat-select formControlName="nadredjenaJedinica">
            <mat-option [value]="null">— Nema (root) —</mat-option>
            @for (j of data.sve; track j._id) {
              <mat-option [value]="j._id">{{ j.naziv }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Opis</mat-label>
          <textarea matInput formControlName="opis" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Redoslijed</mat-label>
          <input matInput type="number" formControlName="redoslijed" />
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
        {{ data.jedinica ? 'Sačuvaj' : 'Kreiraj' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 460px;
        padding-top: 0.5rem;

        mat-form-field {
          width: 100%;
        }
      }
    `,
  ],
})
export class OrgJedinicaDialogComponent implements OnInit {
  ref = inject(MatDialogRef<OrgJedinicaDialogComponent>);
  data = inject<{
    jedinica?: OrganizacionaJedinica;
    sve: OrganizacionaJedinica[];
    roditelj?: OrganizacionaJedinica;
    dozvoljeneTipove?: TipJedinice[];
  }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  tipovi = Object.entries(TIP_JEDINICE_NAZIV).map(([value, label]) => ({
    value: value as TipJedinice,
    label,
  }));

  form = this.fb.group({
    naziv: ['', Validators.required],
    tip: ['' as TipJedinice, Validators.required],
    nadredjenaJedinica: [null as string | null],
    opis: [''],
    redoslijed: [0],
  });

  ngOnInit() {
    this.orgService.getJedinice().subscribe((jedinice) => {
      // Filtriraj trenutnu jedinicu iz liste
      this.data.sve = this.data.jedinica
        ? jedinice.filter((j) => j._id !== this.data.jedinica?._id)
        : jedinice;

      if (this.data.dozvoljeneTipove?.length) {
        this.tipovi = Object.entries(TIP_JEDINICE_NAZIV)
          .filter(([value]) =>
            this.data.dozvoljeneTipove?.includes(value as TipJedinice),
          )
          .map(([value, label]) => ({ value: value as TipJedinice, label }));

        if (this.data.dozvoljeneTipove.length === 1) {
          this.form.patchValue({ tip: this.data.dozvoljeneTipove[0] });
        }
      }

      if (this.data.roditelj) {
        this.form.patchValue({ nadredjenaJedinica: this.data.roditelj._id });
      }

      if (this.data.jedinica) {
        const j = this.data.jedinica;

        // nadredjenaJedinica može biti string ili objekat — izvuci _id
        const nadredjenaId = j.nadredjenaJedinica
          ? typeof j.nadredjenaJedinica === 'string'
            ? j.nadredjenaJedinica
            : (j.nadredjenaJedinica as OrganizacionaJedinica)._id
          : null;

        this.form.patchValue({
          naziv: j.naziv,
          tip: j.tip,
          nadredjenaJedinica: nadredjenaId,
          opis: j.opis ?? '',
          redoslijed: j.redoslijed,
        });
      }
    });
  }

  spremi() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const data: OrganizacionaJedinicaDTO = {
      naziv: raw.naziv as string,
      tip: raw.tip as TipJedinice,
      nadredjenaJedinica: raw.nadredjenaJedinica,
      opis: raw.opis as string,
      redoslijed: raw.redoslijed as number,
    };

    const obs = this.data.jedinica
      ? this.orgService.updateJedinica(this.data.jedinica._id, data)
      : this.orgService.createJedinica(data);

    obs.subscribe(() => this.ref.close(true));
  }
}
