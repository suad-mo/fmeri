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
} from '../models/org.models';

@Injectable({ providedIn: 'root' })
export class OrgService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/org';
  private readonly refUrl = 'http://localhost:3000/api/ref';
  private readonly sablonUrl = 'http://localhost:3000/api/sablon';

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
}
