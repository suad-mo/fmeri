import { Component, inject } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OrgService } from '../../../../../core/services/org.service';
import { UserProfil } from '../../../../../core/models/org.models';

const DOSTUPNE_ROLE = [
  { value: 'admin', label: 'Administrator', opis: 'Pun pristup sistemu' },
  { value: 'user', label: 'Korisnik', opis: 'Pregled podataka' },
  { value: 'resursi', label: 'HR resursi', opis: 'Upravljanje zaposlenicima' },
];

@Component({
  selector: 'app-korisnik-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './korisnik-dialog.component.html',
  styleUrl: './korisnik-dialog.component.scss',
})
export class KorisnikDialogComponent {
  ref = inject(MatDialogRef<KorisnikDialogComponent>);
  data = inject<{ korisnik?: UserProfil }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  loading = false;
  prikaziLozinku = false;
  role = DOSTUPNE_ROLE;
  odabraneRole: string[] = this.data.korisnik?.role ?? ['user'];

  form = this.fb.group({
    name: [this.data.korisnik?.name ?? '', Validators.required],
    email: [
      this.data.korisnik?.email ?? '',
      [Validators.required, Validators.email],
    ],
    password: [
      this.data.korisnik ? '' : '',
      this.data.korisnik ? [] : [Validators.required, Validators.minLength(8)],
    ],
  });

  toggleRole(rola: string, checked: boolean) {
    if (checked) {
      this.odabraneRole = [...this.odabraneRole, rola];
    } else {
      this.odabraneRole = this.odabraneRole.filter((r) => r !== rola);
    }
  }

  spremi() {
    if (this.form.invalid || this.odabraneRole.length === 0) return;
    this.loading = true;
    const raw = this.form.value;

    const request$ = this.data.korisnik
      ? this.orgService.updateUserRole(
          this.data.korisnik._id,
          this.odabraneRole,
        )
      : this.orgService.createUser({
          name: raw.name!,
          email: raw.email!,
          password: raw.password!,
          role: this.odabraneRole,
        });

    request$.subscribe({
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
