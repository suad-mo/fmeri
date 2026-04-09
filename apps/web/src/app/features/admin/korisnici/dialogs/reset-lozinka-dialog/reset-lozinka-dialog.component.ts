import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { OrgService } from '../../../../../core/services/org.service';
import { UserProfil } from '../../../../../core/models/org.models';

@Component({
  selector: 'app-reset-lozinka-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule,
  ],
  templateUrl: './reset-lozinka-dialog.component.html',
  styleUrl: './reset-lozinka-dialog.component.scss'
})
export class ResetLozinkaDialogComponent {
  ref = inject(MatDialogRef<ResetLozinkaDialogComponent>);
  data = inject<{ korisnik: UserProfil }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  loading = false;
  prikazi = false;

  form = this.fb.group({
    novaLozinka: ['', [Validators.required, Validators.minLength(8)]],
  });

  spremi() {
    if (this.form.invalid) return;
    this.loading = true;
    this.orgService.resetUserLozinka(
      this.data.korisnik._id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.form.value.novaLozinka!
    ).subscribe({
      next: () => { this.loading = false; this.ref.close(true); },
      error: () => { this.loading = false; },
    });
  }
}
