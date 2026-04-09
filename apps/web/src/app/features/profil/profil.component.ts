import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrgService } from '../../core/services/org.service';
import { UserProfil, KATEGORIJA_NAZIV, KategorijaZaposlenog } from '../../core/models/org.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss',
})
export class ProfilComponent implements OnInit {
  private orgService = inject(OrgService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  profil = signal<UserProfil | null>(null);
  isLoading = signal(true);
  uploadLoading = signal(false);
  lozinkaLoading = signal(false);

  readonly apiUrl = 'http://localhost:3000/uploads/slike';

  lozinkaForm = this.fb.group({
    trenutnaLozinka: ['', Validators.required],
    novaLozinka: ['', [Validators.required, Validators.minLength(8)]],
    potvrda: ['', Validators.required],
  });

  ngOnInit() {
    this.orgService.getMe().subscribe({
      next: (data) => {
        this.profil.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getKategorijaNaziv(kljuc: string): string {
    return KATEGORIJA_NAZIV[kljuc as KategorijaZaposlenog] ?? kljuc;
  }

  onSlikaChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    this.uploadLoading.set(true);
    this.orgService.uploadSlika(file).subscribe({
      next: (res) => {
        this.profil.update((p) => p ? { ...p, slika: res.slika } : p);
        this.uploadLoading.set(false);
        this.snackBar.open('Slika uspješno ažurirana!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.uploadLoading.set(false);
        this.snackBar.open('Greška pri uploadu slike.', 'OK', { duration: 3000 });
      },
    });
  }

  promijeniLozinku() {
    if (this.lozinkaForm.invalid) return;
    const { trenutnaLozinka, novaLozinka, potvrda } = this.lozinkaForm.value;

    if (novaLozinka !== potvrda) {
      this.snackBar.open('Lozinke se ne poklapaju!', 'OK', { duration: 3000 });
      return;
    }

    this.lozinkaLoading.set(true);
    this.orgService.promijeniLozinku({
      trenutnaLozinka: trenutnaLozinka as string,
      novaLozinka: novaLozinka as string,
    }).subscribe({
      next: (res) => {
        this.lozinkaLoading.set(false);
        this.lozinkaForm.reset();
        this.snackBar.open(res.message, 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.lozinkaLoading.set(false);
        this.snackBar.open(
          err.error?.message ?? 'Greška pri promjeni lozinke.',
          'OK', { duration: 3000 }
        );
      },
    });
  }
}
