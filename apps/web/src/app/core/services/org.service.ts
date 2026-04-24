import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
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
  JedinicaDetalji,
  Organ,
  OrganStruktura,
  Zaposlenik,
  ZaposlenikDTO,
  PopunjenostOrgana,
  PregledOrgana,
  IPredmet,
  IAkt,
} from '../models/org.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrgService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/org`;
  private readonly refUrl = `${environment.apiUrl}/ref`;
  private readonly sablonUrl = `${environment.apiUrl}/sablon`;
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly statsUrl = `${environment.apiUrl}/stats`;
  private readonly organiUrl = `${environment.apiUrl}/organi`;
  private readonly zaposlenikUrl = `${environment.apiUrl}/zaposlenici`;

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

  // updateRadnoMjesto(
  //   id: string,
  //   data: Partial<RadnoMjestoDTO> & { [key: string]: unknown },
  // ): Observable<RadnoMjesto> {
  //   return this.http.patch<RadnoMjesto>(
  //     `${this.apiUrl}/radna-mjesta/${id}`,
  //     data,
  //   );
  // }

  updateRadnoMjesto(
    id: string,
    data: Record<string, unknown>,
  ): Observable<RadnoMjesto> {
    return this.http.patch<RadnoMjesto>(
      `${this.apiUrl}/radna-mjesta/${id}`,
      data,
    );
  }

  // deleteRadnoMjesto(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/radna-mjesta/${id}`);
  // }

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
      `${this.statsUrl}/zaposlenici-po-sektoru`,
    );
  }

  getPlatniRazrediStats(): Observable<PlatniRazredStat[]> {
    return this.http.get<PlatniRazredStat[]>(`${this.statsUrl}/platni-razredi`);
  }

  getSistematizacija(): Observable<SistematizacijaItem[]> {
    return this.http.get<SistematizacijaItem[]>(
      `${this.statsUrl}/sistematizacija`,
    );
  }

  getJedinicaDetalji(id: string): Observable<JedinicaDetalji> {
    return this.http.get<JedinicaDetalji>(
      `${this.apiUrl}/jedinice/${id}/detalji`,
    );
  }

  getOrgani(): Observable<Organ[]> {
    return this.http.get<Organ[]>(this.organiUrl);
  }

  getOrgan(id: string): Observable<Organ> {
    return this.http.get<Organ>(`${this.organiUrl}/${id}`);
  }

  getOrganStruktura(id: string): Observable<OrganStruktura> {
    return this.http.get<OrganStruktura>(`${this.organiUrl}/${id}/struktura`);
  }

  getOrganiUSastavu(organId: string): Observable<Organ[]> {
    return this.http.get<Organ[]>(`${this.organiUrl}/u-sastavu/${organId}`);
  }

  // createOrgan(data: Partial<Organ>): Observable<Organ> {
  //   return this.http.post<Organ>(this.organiUrl, data);
  // }

  // updateOrgan(id: string, data: Partial<Organ>): Observable<Organ> {
  //   return this.http.patch<Organ>(`${this.organiUrl}/${id}`, data);
  // }

  deleteOrgan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.organiUrl}/${id}`);
  }

  // ── Zaposlenici ────────────────────────────────────
  getZaposlenici(filter?: {
    organ?: string;
    organizacionaJedinica?: string;
  }): Observable<Zaposlenik[]> {
    let params = '';
    if (filter?.organ) params += `?organ=${filter.organ}`;
    if (filter?.organizacionaJedinica)
      params += `${params ? '&' : '?'}organizacionaJedinica=${filter.organizacionaJedinica}`;
    return this.http.get<Zaposlenik[]>(`${this.zaposlenikUrl}${params}`);
  }

  getZaposlenik(id: string): Observable<Zaposlenik> {
    return this.http.get<Zaposlenik>(`${this.zaposlenikUrl}/${id}`);
  }

  createZaposlenik(data: ZaposlenikDTO): Observable<Zaposlenik> {
    return this.http.post<Zaposlenik>(this.zaposlenikUrl, data);
  }

  updateZaposlenik(
    id: string,
    data: Partial<ZaposlenikDTO>,
  ): Observable<Zaposlenik> {
    return this.http.patch<Zaposlenik>(`${this.zaposlenikUrl}/${id}`, data);
  }

  deleteZaposlenik(id: string): Observable<void> {
    return this.http.delete<void>(`${this.zaposlenikUrl}/${id}`);
  }

  dodjelaZaposlenika(
    id: string,
    data: {
      organ?: string;
      organizacionaJedinica?: string;
      radnoMjesto?: string;
    },
  ): Observable<Zaposlenik> {
    return this.http.patch<Zaposlenik>(
      `${this.zaposlenikUrl}/${id}/dodjela`,
      data,
    );
  }

  getRadnaMjestaZaJedinicu(jedinicaId: string): Observable<RadnoMjesto[]> {
    return this.http.get<RadnoMjesto[]>(
      `${this.apiUrl}/radna-mjesta?organizacionaJedinica=${jedinicaId}`,
    );
  }

  getRadnaMjestaOrgana(organId: string): Observable<RadnoMjesto[]> {
    return this.http.get<RadnoMjesto[]>(
      `${this.organiUrl}/${organId}/radna-mjesta`,
    );
  }

  // Organ CRUD
  createOrgan(data: Partial<Organ>): Observable<Organ> {
    return this.http.post<Organ>(this.organiUrl, data);
  }

  updateOrgan(id: string, data: Partial<Organ>): Observable<Organ> {
    return this.http.patch<Organ>(`${this.organiUrl}/${id}`, data);
  }

  // Org. jedinice
  addOsnovnaJedinica(
    organId: string,
    data: Record<string, unknown>,
  ): Observable<OrganizacionaJedinica> {
    return this.http.post<OrganizacionaJedinica>(
      `${this.organiUrl}/${organId}/osnovne-jedinice`,
      data,
    );
  }

  addUnutrasnjaJedinica(
    organId: string,
    data: Record<string, unknown>,
  ): Observable<OrganizacionaJedinica> {
    return this.http.post<OrganizacionaJedinica>(
      `${this.organiUrl}/${organId}/unutrasnje-jedinice`,
      data,
    );
  }

  updateJedinicaUOrganu(
    organId: string,
    jedinicaId: string,
    data: Record<string, unknown>,
  ): Observable<OrganizacionaJedinica> {
    return this.http.patch<OrganizacionaJedinica>(
      `${this.organiUrl}/${organId}/jedinice/${jedinicaId}`,
      data,
    );
  }

  // RM u organu
  addRadnoMjestoUOrganu(
    organId: string,
    data: Record<string, unknown>,
  ): Observable<RadnoMjesto> {
    return this.http.post<RadnoMjesto>(
      `${this.organiUrl}/${organId}/radna-mjesta`,
      data,
    );
  }

  // Dodjela zaposlenika na RM
  dodjelaZaposlenikaNaRM(
    organId: string,
    rmId: string,
    zaposlenikId: string | null,
  ): Observable<RadnoMjesto> {
    return this.http.patch<RadnoMjesto>(
      `${this.organiUrl}/${organId}/radna-mjesta/${rmId}/zaposlenik`,
      { zaposlenikId },
    );
  }

  // U org.service.ts dodaj metodu
  getPopunjenost(): Observable<PopunjenostOrgana[]> {
    return this.http.get<PopunjenostOrgana[]>(`${this.organiUrl}/popunjenost`);
  }

  getPretrazivanjeData(): Observable<{
    zaposlenici: Zaposlenik[];
    jedinice: OrganizacionaJedinica[];
  }> {
    return forkJoin({
      zaposlenici: this.getZaposlenici(),
      jedinice: this.getJedinice(),
    });
  }

  // org.service.ts
  getPregled(
    organiIds?: string[],
    saJedinicama = true,
  ): Observable<PregledOrgana[]> {
    let params = `saJedinicama=${saJedinicama}`;
    if (organiIds?.length) params += `&organi=${organiIds.join(',')}`;
    return this.http.get<PregledOrgana[]>(
      `${environment.apiUrl}/izvjestaj/pregled?${params}`,
    );
  }

  createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string[];
  }): Observable<UserProfil> {
    return this.http.post<UserProfil>(this.usersUrl, data);
  }

  updateUserRole(id: string, role: string[]): Observable<UserProfil> {
    return this.http.patch<UserProfil>(`${this.usersUrl}/${id}/role`, { role });
  }

  resetUserLozinka(
    id: string,
    novaLozinka: string,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.usersUrl}/${id}/reset-lozinka`,
      { novaLozinka },
    );
  }

  poveziZaposlenika(
    userId: string,
    zaposlenikId: string | null,
  ): Observable<UserProfil> {
    return this.http.patch<UserProfil>(
      `${this.usersUrl}/${userId}/zaposlenik`,
      { zaposlenikId },
    );
  }

  // Predmeti
  getPredmeti(): Observable<IPredmet[]> {
    return this.http.get<IPredmet[]>(`${environment.apiUrl}/predmeti`);
  }

  getPredmet(id: string): Observable<IPredmet> {
    return this.http.get<IPredmet>(`${environment.apiUrl}/predmeti/${id}`);
  }

  createPredmet(data: Partial<IPredmet>): Observable<IPredmet> {
    return this.http.post<IPredmet>(`${environment.apiUrl}/predmeti`, data);
  }

  updatePredmet(id: string, data: Partial<IPredmet>): Observable<IPredmet> {
    return this.http.patch<IPredmet>(
      `${environment.apiUrl}/predmeti/${id}`,
      data,
    );
  }

  deletePredmet(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/predmeti/${id}`);
  }

  addAkt(predmetId: string, data: Partial<IAkt>): Observable<IPredmet> {
    return this.http.post<IPredmet>(
      `${environment.apiUrl}/predmeti/${predmetId}/akti`,
      data,
    );
  }

  updateAkt(
    predmetId: string,
    aktId: string,
    data: Partial<IAkt>,
  ): Observable<IPredmet> {
    return this.http.patch<IPredmet>(
      `${environment.apiUrl}/predmeti/${predmetId}/akti/${aktId}`,
      data,
    );
  }

  deleteAkt(predmetId: string, aktId: string): Observable<IPredmet> {
    return this.http.delete<IPredmet>(
      `${environment.apiUrl}/predmeti/${predmetId}/akti/${aktId}`,
    );
  }

  uploadAktFajl(
    predmetId: string,
    aktId: string,
    fajl: File,
  ): Observable<IPredmet> {
    const formData = new FormData();
    formData.append('fajl', fajl);
    return this.http.post<IPredmet>(
      `${environment.apiUrl}/predmeti/${predmetId}/akti/${aktId}/fajl`,
      formData,
    );
  }

  deleteFajl(
    predmetId: string,
    aktId: string,
    fajlId: string,
  ): Observable<IPredmet> {
    return this.http.delete<IPredmet>(
      `${environment.apiUrl}/predmeti/${predmetId}/akti/${aktId}/fajlovi/${fajlId}`,
    );
  }
}
