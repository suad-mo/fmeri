import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OrganizacionaJedinica,
  OrganizacionaJedinicaDTO,
  RadnoMjesto,
  RadnoMjestoDTO,
  PlatniRazredPozicija,
  GlobalniSablon,
  UserProfil,
  DashboardStats,
  PlatniRazredStat,
  SistematizacijaItem,
} from '../models/org.models';

@Injectable({ providedIn: 'root' })
export class OrgService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/org';
  private readonly refUrl = 'http://localhost:3000/api/ref';
  private readonly sablonUrl = 'http://localhost:3000/api/sablon';
  private readonly usersUrl = 'http://localhost:3000/api/users';
  private readonly statsUrl = 'http://localhost:3000/api/stats';

  // Vlastiti profil
  getMe(): Observable<UserProfil> {
    return this.http.get<UserProfil>(`${this.usersUrl}/me`);
  }

  promijeniLozinku(data: {
    trenutnaLozinka: string;
    novaLozinka: string;
  }): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.usersUrl}/me/lozinka`,
      data,
    );
  }

  uploadSlika(file: File): Observable<{ slika: string }> {
    const formData = new FormData();
    formData.append('slika', file);
    return this.http.post<{ slika: string }>(
      `${this.usersUrl}/me/slika`,
      formData,
    );
  }

  // Admin
  getUsers(): Observable<UserProfil[]> {
    return this.http.get<UserProfil[]>(`${this.usersUrl}`);
  }

  dodjelaOrgRM(
    userId: string,
    data: { organizacionaJedinica: string; radnoMjesto: string },
  ): Observable<UserProfil> {
    return this.http.patch<UserProfil>(
      `${this.usersUrl}/${userId}/dodjela`,
      data,
    );
  }

  getGlobalniSabloni(): Observable<GlobalniSablon[]> {
    return this.http.get<GlobalniSablon[]>(`${this.sablonUrl}/globalni`);
  }

  getGlobalniSablonByTip(tip: string): Observable<GlobalniSablon> {
    return this.http.get<GlobalniSablon>(`${this.sablonUrl}/globalni/${tip}`);
  }

  // ── Organizacione jedinice ──────────────────────────
  getStablo(): Observable<OrganizacionaJedinica[]> {
    return this.http.get<OrganizacionaJedinica[]>(
      `${this.apiUrl}/jedinice/stablo`,
    );
  }

  getJedinice(): Observable<OrganizacionaJedinica[]> {
    return this.http.get<OrganizacionaJedinica[]>(`${this.apiUrl}/jedinice`);
  }

  createJedinica(
    data: OrganizacionaJedinicaDTO,
  ): Observable<OrganizacionaJedinica> {
    return this.http.post<OrganizacionaJedinica>(
      `${this.apiUrl}/jedinice`,
      data,
    );
  }

  updateJedinica(
    id: string,
    data: OrganizacionaJedinicaDTO,
  ): Observable<OrganizacionaJedinica> {
    return this.http.patch<OrganizacionaJedinica>(
      `${this.apiUrl}/jedinice/${id}`,
      data,
    );
  }

  deleteJedinica(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/jedinice/${id}`);
  }

  // ── Radna mjesta ────────────────────────────────────
  getRadnaMjesta(jedinicaId?: string): Observable<RadnoMjesto[]> {
    const url = jedinicaId
      ? `${this.apiUrl}/radna-mjesta?jedinica=${jedinicaId}`
      : `${this.apiUrl}/radna-mjesta`;
    return this.http.get<RadnoMjesto[]>(url);
  }

  createRadnoMjesto(data: RadnoMjestoDTO): Observable<RadnoMjesto> {
    return this.http.post<RadnoMjesto>(`${this.apiUrl}/radna-mjesta`, data);
  }

  updateRadnoMjesto(id: string, data: RadnoMjestoDTO): Observable<RadnoMjesto> {
    return this.http.patch<RadnoMjesto>(
      `${this.apiUrl}/radna-mjesta/${id}`,
      data,
    );
  }

  deleteRadnoMjesto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/radna-mjesta/${id}`);
  }

  // ── Referentni podaci ───────────────────────────────
  getPozicijeByKategorija(
    kategorija: string,
  ): Observable<PlatniRazredPozicija[]> {
    return this.http.get<PlatniRazredPozicija[]>(
      `${this.refUrl}/pozicije?kategorija=${kategorija}`,
    );
  }

  getPozicijaByKljuc(kljuc: string): Observable<PlatniRazredPozicija> {
    return this.http.get<PlatniRazredPozicija>(
      `${this.refUrl}/pozicije/${kljuc}`,
    );
  }

  updateGlobalniSablon(
    id: string,
    data: Partial<GlobalniSablon>,
  ): Observable<GlobalniSablon> {
    return this.http.patch<GlobalniSablon>(
      `${this.sablonUrl}/globalni/${id}`,
      data,
    );
  }


getDashboardStats(): Observable<DashboardStats> {
  return this.http.get<DashboardStats>(`${this.statsUrl}/dashboard`);
}

getZaposleniciPoSektoru(): Observable<{ naziv: string; broj: number }[]> {
  return this.http.get<{ naziv: string; broj: number }[]>(
    `${this.statsUrl}/zaposlenici-po-sektoru`
  );
}

getPlatniRazrediStats(): Observable<PlatniRazredStat[]> {
  return this.http.get<PlatniRazredStat[]>(`${this.statsUrl}/platni-razredi`);
}

getSistematizacija(): Observable<SistematizacijaItem[]> {
  return this.http.get<SistematizacijaItem[]>(`${this.statsUrl}/sistematizacija`);
}
}
