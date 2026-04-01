import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrgService } from '../../../../core/services/org.service';
import {
  OrganizacionaJedinica,
  RadnoMjestoDetalji,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-premjesti-rm-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Premjesti radno mjesto</h2>
    <p class="rm-naziv">{{ data.rm.naziv }}</p>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" style="width:100%">
          <mat-label>Nova org. jedinica</mat-label>
          <mat-select formControlName="organizacionaJedinica">
            @for (j of jedinice; track j._id) {
              <mat-option [value]="j._id">
                <span
                  [style.padding-left.px]="
                    j.nivoJedinice === 'unutrasnja' ? 16 : 0
                  "
                >
                  {{ j.nivoJedinice === 'unutrasnja' ? '↳ ' : '' }}{{ j.naziv }}
                </span>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Odustani</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || loading"
        (click)="spremi()"
      >
        @if (loading) {
          <mat-spinner diameter="20" />
        } @else {
          Premjesti
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .rm-naziv {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin: -0.5rem 1.5rem 0.5rem;
        font-style: italic;
      }
    `,
  ],
})
export class PremjestiRmDialogComponent implements OnInit {
  ref = inject(MatDialogRef<PremjestiRmDialogComponent>);
  data = inject<{ rm: RadnoMjestoDetalji; organId: string }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  jedinice: (OrganizacionaJedinica & { nivoJedinice?: string })[] = [];
  loading = false;

  form = this.fb.group({
    organizacionaJedinica: [this.data.rm._id ?? ''],
  });

  ngOnInit() {
    // Dohvati sve jedinice ovog organa
    this.orgService.getOrganStruktura(this.data.organId).subscribe((s) => {
      const lista: (OrganizacionaJedinica & { nivoJedinice?: string })[] = [];

      // Dodaj sam organ (direkcija/zavod)
      lista.push({ ...(s.organ as unknown as OrganizacionaJedinica), nivoJedinice: 'osnovna' });
      // Dodaj OOJ i UOJ
      for (const ooj of s.osnovneJedinice) {
        lista.push({ ...ooj, nivoJedinice: 'osnovna' });
        for (const uoj of ooj.unutrasnje) {
          lista.push({ ...uoj, nivoJedinice: 'unutrasnja' });
        }
      }
      this.jedinice = lista;

      // Postavi trenutnu vrijednost
      this.form.patchValue({
        organizacionaJedinica:
          typeof this.data.rm.organizacionaJedinica === 'object'
            ? (this.data.rm.organizacionaJedinica?._id ?? '')
            : (this.data.rm.organizacionaJedinica ?? ''),
      });
    });
  }

  spremi() {
    this.loading = true;
    const jedinicaId = this.form.value.organizacionaJedinica as string;

    this.orgService
      .updateRadnoMjesto(this.data.rm._id, {
        organizacionaJedinica: jedinicaId,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.ref.close(true);
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
