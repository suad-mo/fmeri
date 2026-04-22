# Changelog

Sve izmjene ovog projekta bit će dokumentovane u ovom fajlu.
Format baziran na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Verzionisanje prati [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-04-20

### Added

#### Organizacijska struktura
- Organ model s CRUD operacijama (ministarstvo, zavod, direkcija, uprava)
- OrganizacionaJedinica model — trostepena hijerarhija (OOJ → UOJ → RM)
- RadnoMjesto model s kategorijama, platnim razredima i koeficijentima
- Zaposlenik model s kompletnim HR podacima
- Referentni podaci — pozicije po kategorijama zaposlenih

#### Frontend — Angular 21
- `OrganiListaComponent` — pregled svih organa
- `OrganDetaljiComponent` — detalji organa s accordion strukturom
- `OojListaComponent` — custom accordion za OOJ/UOJ hijerarhiju
- `RmRowComponent` — reusable komponenta za prikaz radnog mjesta
- `ZaposleniciComponent` — lista zaposlenika s pretragom i filterima
- `ZaposlenikDetaljiComponent` — detalji zaposlenika (/zaposlenici/:id)
- `DashboardComponent` — statistike, grafikoni (ApexCharts)
- `GlobalSearchComponent` — globalna pretraga zaposlenika i org. jedinica
- `MainLayoutComponent` — glavni layout s navigacijom

#### Izvještaji
- `PopunjenostComponent` — izvještaj popunjenosti po organima
- `SistematizacijaComponent` — pregled sistematizacije radnih mjesta
- `PregledComponent` — sveobuhvatni pregled org. strukture s filterima
- PDF export (pdfkit + DejaVu font za bosanske karaktere)
- Excel export (ExcelJS)

#### Admin
- `KorisniciComponent` — upravljanje korisničkim nalozima
- `KorisnikDialogComponent` — kreiranje/uređivanje korisnika s rolama
- `ResetLozinkaDialogComponent` — admin reset lozinke
- `PoveziZaposlenikDialogComponent` — veza korisnik ↔ zaposlenik
- `OrgJediniceComponent` — tree view org. strukture s detalji panelom
- `SabloniComponent` — globalni šabloni org. strukture

#### Backend — Node.js/Express
- Kompletni CRUD endpointi za sve modele
- `GET /api/organi/:id/struktura` — puna hijerarhija organa
- `GET /api/organi/popunjenost` — sumarni pregled popunjenosti
- `GET /api/izvjestaj/popunjenost/pdf|excel`
- `GET /api/izvjestaj/sistematizacija/pdf|excel`
- `GET /api/izvjestaj/pregled` — sveobuhvatni pregled s filterima
- `GET /api/izvjestaj/pregled/pdf|excel`
- `GET /api/stats/dashboard|zaposlenici-po-sektoru|platni-razredi|sistematizacija`

#### Seedovi
- `seed-organs-new` — 3 organa (FMERI, FZM, FDNI)
- `seed-jedinice-new` — 50 org. jedinica
- `seed-radna-mjesta-new` — 274 radna mjesta
- `seed-zaposlenici-new` — 80 zaposlenika
- `seed-users-new` — 80 korisnika s default lozinkom
- `seed-reset-admin` — reset admin lozinke
- `seed-all-new` — pokreće sve seedove redom

### Changed
- User model očišćen — uklonjena `organizacionaJedinica` i `radnoMjesto` polja
- Auth flow — HttpOnly cookies za access i refresh tokene
- `getJedinicaDetalji` — koristi Zaposlenik umjesto User model
- `addOsnovnaJedinica` — automatski postavlja `nadredjenaJedinica`
- `getStablo` — poboljšano sortiranje po organu

### Fixed
- Dupli AdminLayoutComponent sidebar uklonjen
- Zakonski osnov textarea — dupla textarea u organ dijalogu
- Horizontalni scroll u šablon dijalogu
- Datumi — `DatePipe` umjesto `slice` za ispravno prikazivanje
- Bosanski karakteri u PDF — DejaVu font
- `radnomjestos` naziv kolekcije u MongoDB agregacijama

## [0.1.0] - 2026-03-23

### Added
- Auth sistem (register, login, logout)
- JWT access token + refresh token mehanizam
- Zod validacija na svim API rutama
- Angular Material UI (login, register, dashboard)
- Dark/light mode toggle
- AuthGuard i HTTP interceptor
- Argon2id password hashing
