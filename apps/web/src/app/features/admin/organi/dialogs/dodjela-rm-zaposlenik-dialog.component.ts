import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrgService } from '../../../../core/services/org.service';
import { RadnoMjestoDetalji, Zaposlenik } from '../../../../core/models/org.models';

@Component({
  selector: 'app-dodjela-rm-zaposlenik-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Dodjela zaposlenika</h2>
    <p class="subtitle"><strong>{{ data.rm.naziv }}</strong></p>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Zaposlenik</mat-label>
          <mat-select formControlName="zaposlenikId">
            <mat-option [value]="null">— Slobodno radno mjesto —</mat-option>
            @for (z of zaposlenici; track z._id) {
              <mat-option [value]="z._id">
                {{ z.prezime }} {{ z.ime }}
                @if (z.organizacionaJedinica) {
                  <span class="jedinica-info">
                    — {{ z.organizacionaJedinica.naziv }}
                  </span>
                }
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Odustani</button>
      <button mat-flat-button color="primary"
        [disabled]="loading"
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
      font-style: italic;
    }
    .dialog-form {
      min-width: 450px;
      padding-top: 0.5rem;
      mat-form-field { width: 100%; }
    }
    .jedinica-info {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
  `],
})
export class DodjelaRmZaposlenikDialogComponent implements OnInit {
  ref = inject(MatDialogRef<DodjelaRmZaposlenikDialogComponent>);
  data = inject<{
    rm: RadnoMjestoDetalji;
    organId: string;
  }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  zaposlenici: Zaposlenik[] = [];
  loading = false;

  form = this.fb.group({
    zaposlenikId: [null as string | null],
  });

  ngOnInit() {
    // Dohvati sve zaposlenike
    this.orgService.getZaposlenici().subscribe(data => {
      this.zaposlenici = data.sort((a, b) =>
        `${a.prezime} ${a.ime}`.localeCompare(`${b.prezime} ${b.ime}`)
      );

      // Predpopulaj trenutnog zaposlenika
      if (this.data.rm.zaposlenici?.length > 0) {
        this.form.patchValue({ zaposlenikId: this.data.rm.zaposlenici[0]._id });
      }
    });
  }

  spremi() {
    this.loading = true;
    const zaposlenikId = this.form.value.zaposlenikId ?? null;

    this.orgService.dodjelaZaposlenikaNaRM(
      this.data.organId,
      this.data.rm._id,
      zaposlenikId
    ).subscribe({
      next: () => { this.loading = false; this.ref.close(true); },
      error: () => { this.loading = false; },
    });
  }
}
