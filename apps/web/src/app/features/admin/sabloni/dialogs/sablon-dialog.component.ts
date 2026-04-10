import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { OrgService } from '../../../../core/services/org.service';
import {
  GlobalniSablon,
  JedinicaSablon,
  TIP_JEDINICE_NAZIV,
  TipJedinice,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-sablon-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTabsModule,
  ],
  template: `
    <h2 mat-dialog-title>Uredi šablon — {{ data.sablon.naziv }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-tab-group>
          <!-- Tab 1: Osnovni podaci -->
          <mat-tab label="Osnovni podaci">
            <div class="tab-content">
              <mat-form-field appearance="outline">
                <mat-label>Naziv šablona</mat-label>
                <input matInput formControlName="naziv" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Pravni osnov</mat-label>
                <input matInput formControlName="pravniOsnov" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Opis</mat-label>
                <textarea matInput formControlName="opis" rows="3"></textarea>
              </mat-form-field>
            </div>
          </mat-tab>

          <!-- Tab 2: Osnovne jedinice -->
          <mat-tab label="Osnovne jedinice ({{ osnovneJedinice.length }})">
            <div class="tab-content">
              <div formArrayName="osnovneJedinice">
                @for (j of osnovneJedinice.controls; track $index) {
                  <div [formGroupName]="$index" class="jedinica-row">
                    <mat-form-field appearance="outline" class="field-tip">
                      <mat-label>Tip</mat-label>
                      <mat-select formControlName="tip">
                        @for (tip of osnovniTipovi; track tip.value) {
                          <mat-option [value]="tip.value">{{
                            tip.label
                          }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="field-min">
                      <mat-label>Min.</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="minBroj"
                        min="0"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="field-max">
                      <mat-label>Max. (0=∞)</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="maxBroj"
                        min="0"
                      />
                    </mat-form-field>

                    <mat-checkbox formControlName="obavezna"
                      >Obavezna</mat-checkbox
                    >

                    <button
                      mat-icon-button
                      color="warn"
                      type="button"
                      (click)="ukloniOsnovnu($index)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="dodajOsnovnu()">
                <mat-icon>add</mat-icon> Dodaj osnovnu jedinicu
              </button>
            </div>
          </mat-tab>

          <!-- Tab 3: Unutrašnje jedinice -->
          <mat-tab
            label="Unutrašnje jedinice ({{ unutrasnjeJedinice.length }})"
          >
            <div class="tab-content">
              <div formArrayName="unutrasnjeJedinice">
                @for (j of unutrasnjeJedinice.controls; track $index) {
                  <div [formGroupName]="$index" class="jedinica-row">
                    <mat-form-field appearance="outline" class="field-tip">
                      <mat-label>Tip</mat-label>
                      <mat-select formControlName="tip">
                        @for (tip of unutrasnjiTipovi; track tip.value) {
                          <mat-option [value]="tip.value">{{
                            tip.label
                          }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="field-min">
                      <mat-label>Min.</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="minBroj"
                        min="0"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="field-max">
                      <mat-label>Max. (0=∞)</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="maxBroj"
                        min="0"
                      />
                    </mat-form-field>

                    <mat-checkbox formControlName="obavezna"
                      >Obavezna</mat-checkbox
                    >

                    <button
                      mat-icon-button
                      color="warn"
                      type="button"
                      (click)="ukloniUnutrasnju($index)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button
                mat-stroked-button
                type="button"
                (click)="dodajUnutrasnju()"
              >
                <mat-icon>add</mat-icon> Dodaj unutrašnju jedinicu
              </button>
            </div>
          </mat-tab>
        </mat-tab-group>
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
        Sačuvaj izmjene
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-form {
        width: 100%;
        min-width: unset;
        padding-top: 0.5rem;
      }
      .tab-content {
        padding: 1rem 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        mat-form-field {
          width: 100%;
        }
      }
      .jedinica-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--color-background-secondary);
        border-radius: 8px;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;

        .field-tip {
          flex: 2;
          min-width: 120px;
        }
        .field-min {
          flex: 1;
          min-width: 70px;
        }
        .field-max {
          flex: 1;
          min-width: 70px;
        }
      }
    `,
  ],
})
export class SablonDialogComponent implements OnInit {
  ref = inject(MatDialogRef<SablonDialogComponent>);
  data = inject<{ sablon: GlobalniSablon }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  // Tipovi za dropdowne
  osnovniTipovi = (
    [
      'kabinet',
      'sektor',
      'odjeljenje',
      'inspektorat',
      'centar',
      'servis',
      'sluzba',
    ] as TipJedinice[]
  ).map((t) => ({ value: t, label: TIP_JEDINICE_NAZIV[t] ?? t }));

  unutrasnjiTipovi = (
    ['odsjek', 'grupa', 'pisarnica', 'arhiva', 'racunovodstvo'] as TipJedinice[]
  ).map((t) => ({ value: t, label: TIP_JEDINICE_NAZIV[t] ?? t }));

  form = this.fb.group({
    naziv: ['', Validators.required],
    pravniOsnov: ['', Validators.required],
    opis: [''],
    osnovneJedinice: this.fb.array([]),
    unutrasnjeJedinice: this.fb.array([]),
  });

  get osnovneJedinice() {
    return this.form.get('osnovneJedinice') as FormArray;
  }

  get unutrasnjeJedinice() {
    return this.form.get('unutrasnjeJedinice') as FormArray;
  }

  ngOnInit() {
    const s = this.data.sablon;
    this.form.patchValue({
      naziv: s.naziv,
      pravniOsnov: s.pravniOsnov,
      opis: s.opis ?? '',
    });

    s.osnovneJedinice.forEach((j) =>
      this.osnovneJedinice.push(this.kreirajJedinicu(j)),
    );
    s.unutrasnjeJedinice.forEach((j) =>
      this.unutrasnjeJedinice.push(this.kreirajJedinicu(j)),
    );
  }

  private kreirajJedinicu(j?: Partial<JedinicaSablon>) {
    return this.fb.group({
      tip: [j?.tip ?? ('' as TipJedinice), Validators.required],
      naziv: [j?.naziv ?? ''],
      obavezna: [j?.obavezna ?? false],
      minBroj: [j?.minBroj ?? 0],
      maxBroj: [j?.maxBroj ?? null],
      roditeljTipovi: [j?.roditeljTipovi ?? []],
    });
  }

  dodajOsnovnu() {
    this.osnovneJedinice.push(this.kreirajJedinicu());
  }

  ukloniOsnovnu(index: number) {
    this.osnovneJedinice.removeAt(index);
  }

  dodajUnutrasnju() {
    this.unutrasnjeJedinice.push(this.kreirajJedinicu());
  }

  ukloniUnutrasnju(index: number) {
    this.unutrasnjeJedinice.removeAt(index);
  }

  spremi() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();

    // maxBroj 0 → null (neograničeno)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizuj = (jedinice: any[]) =>
      jedinice.map((j) => ({
        ...j,
        naziv: TIP_JEDINICE_NAZIV[j.tip as TipJedinice] ?? j.tip,
        maxBroj: j.maxBroj === 0 ? null : j.maxBroj,
      }));

    const data = {
      naziv: raw.naziv as string,
      pravniOsnov: raw.pravniOsnov as string,
      opis: raw.opis as string,
      osnovneJedinice: normalizuj(raw.osnovneJedinice),
      unutrasnjeJedinice: normalizuj(raw.unutrasnjeJedinice),
    };

    this.orgService
      .updateGlobalniSablon(this.data.sablon._id, data)
      .subscribe(() => this.ref.close(true));
  }
}
