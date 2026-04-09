import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OrgService } from '../../../core/services/org.service';
import {
  Organ,
  PregledOrgana,
  // PregledOOJ,
  // PregledRM,
} from '../../../core/models/org.models';
import { NgTemplateOutlet } from '@angular/common';

interface OrganFilter {
  organ: Organ;
  ukljucen: boolean;
}

@Component({
  selector: 'app-pregled',
  standalone: true,
  imports: [
    MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatCheckboxModule, FormsModule,
    MatSelectModule, MatFormFieldModule,
    NgTemplateOutlet,
  ],
  templateUrl: './pregled.component.html',
  styleUrl: './pregled.component.scss',
})
export class PregledComponent implements OnInit {
  private orgService = inject(OrgService);

  organi = signal<Organ[]>([]);
  organFilteri = signal<OrganFilter[]>([]);
  podaci = signal<PregledOrgana[]>([]);
  isLoading = signal(false);
  organiLoading = signal(true);
  saJedinicama = signal(true);
  otvoreniOrgani = signal<Set<string>>(new Set());
  otvoreneOOJ = signal<Set<string>>(new Set());

  sumarno = computed(() => {
    const svi = this.podaci();
    const ukupnoRM = svi.reduce((s, o) => s + o.ukupnoRM, 0);
    const popunjeno = svi.reduce((s, o) => s + o.popunjeno, 0);
    return {
      ukupnoRM,
      popunjeno,
      upraznjeno: ukupnoRM - popunjeno,
      posto: ukupnoRM > 0 ? Math.round((popunjeno / ukupnoRM) * 100) : 0,
    };
  });

  ngOnInit() {
    this.orgService.getOrgani().subscribe({
      next: (organi) => {
        this.organi.set(organi);
        this.organFilteri.set(organi.map(o => ({ organ: o, ukljucen: true })));
        this.organiLoading.set(false);
        this.ucitaj();
      },
    });
  }

  ucitaj() {
    const ukljuceni = this.organFilteri()
      .filter(f => f.ukljucen)
      .map(f => f.organ._id);

    if (!ukljuceni.length) {
      this.podaci.set([]);
      return;
    }

    this.isLoading.set(true);
    this.orgService.getPregled(ukljuceni, this.saJedinicama()).subscribe({
      next: (data) => {
        this.podaci.set(data);
        // Otvori sve organe po defaultu
        const ids = new Set(data.map(o => o.organId));
        this.otvoreniOrgani.set(ids);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleOrgan(id: string) {
    this.otvoreniOrgani.update(set => {
      const next = new Set(set);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleOOJ(id: string) {
    this.otvoreneOOJ.update(set => {
      const next = new Set(set);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isOrganOpen(id: string) { return this.otvoreniOrgani().has(id); }
  isOOJOpen(id: string) { return this.otvoreneOOJ().has(id); }

  getBojuPostotka(posto: number): string {
    return posto >= 80 ? 'zelena' : posto >= 50 ? 'zuta' : 'crvena';
  }

  downloadPDF() {
    const ids = this.organFilteri().filter(f => f.ukljucen).map(f => f.organ._id);
    const jed = this.saJedinicama();
    window.open(
      `http://localhost:3000/api/izvjestaj/pregled/pdf?organi=${ids.join(',')}&saJedinicama=${jed}`,
      '_blank'
    );
  }

  downloadExcel() {
    const ids = this.organFilteri().filter(f => f.ukljucen).map(f => f.organ._id);
    const jed = this.saJedinicama();
    window.open(
      `http://localhost:3000/api/izvjestaj/pregled/excel?organi=${ids.join(',')}&saJedinicama=${jed}`,
      '_blank'
    );
  }
}
