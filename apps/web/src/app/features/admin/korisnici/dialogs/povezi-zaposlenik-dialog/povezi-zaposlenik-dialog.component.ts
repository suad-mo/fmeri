import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
import { FormsModule } from '@angular/forms';
import { OrgService } from '../../../../../core/services/org.service';
import { UserProfil, Zaposlenik } from '../../../../../core/models/org.models';

@Component({
  selector: 'app-povezi-zaposlenik-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],

  templateUrl: './povezi-zaposlenik-dialog.component.html',
  styleUrl: './povezi-zaposlenik-dialog.component.scss',
})
export class PoveziZaposlenikDialogComponent implements OnInit {
  ref = inject(MatDialogRef<PoveziZaposlenikDialogComponent>);
  data = inject<{ korisnik: UserProfil }>(MAT_DIALOG_DATA);
  private orgService = inject(OrgService);

  loading = false;
  isLoading = signal(true);
  zaposlenici = signal<Zaposlenik[]>([]);
  pretraga = '';
  odabranId: string | null = null;

  filtrirani = computed(() => {
    const p = this.pretraga.toLowerCase();
    if (!p) return this.zaposlenici();
    return this.zaposlenici().filter(
      (z) =>
        `${z.ime} ${z.prezime}`.toLowerCase().includes(p) ||
        z.radnoMjesto?.naziv.toLowerCase().includes(p),
    );
  });

  ngOnInit() {
    this.orgService.getZaposlenici().subscribe({
      next: (data) => {
        this.zaposlenici.set(data);
        // Postavi trenutnu vezu ako postoji
        const trenutniZaposlenik = data.find(
          (z) => z.user?._id === this.data.korisnik._id,
        );
        this.odabranId = trenutniZaposlenik?._id ?? null;
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  spremi() {
    this.loading = true;
    this.orgService
      .poveziZaposlenika(this.data.korisnik._id, this.odabranId)
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
