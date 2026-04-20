# CLAUDE.md — nx-fmeri

## O projektu
HR sistem za Federalno ministarstvo energije, rudarstva i industrije (FMERI).
Nx monorepo, Angular 21, Node.js/Express, MongoDB/Mongoose, Docker.

## Struktura projekta
```
apps/
  web/          — Angular 21 frontend (port 4200)
  api-server/   — Node.js/Express backend (port 3000)
```

## Stack
- **Frontend**: Angular 21, standalone komponente, signals, Angular Material
- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Baza**: MongoDB
- **Monorepo**: Nx workspace
- **Shared libs**: `@nx-fmeri/api-org` (modeli), `@nx-fmeri/api-auth` (auth)

## Pokretanje
```bash
# Development
npx nx serve web        # Frontend
npx nx serve api-server # Backend

# Seedovi
npx nx run api-server:seed-all-new  # Puni bazu s podacima
```

## Organizacijska struktura
```
Organ (ministarstvo/zavod/direkcija)
├── Radna mjesta direktno u organu
└── OOJ — Osnovna organizaciona jedinica
    ├── Radna mjesta direktno u OOJ
    └── UOJ — Unutrašnja organizaciona jedinica
        └── Radna mjesta
```

**Organi u sistemu:**
- FMERI — Federalno ministarstvo energije, rudarstva i industrije
- FZM — Zavod za mjeriteljstvo (u sastavu FMERI)
- FDNI — Federalna direkcija za namjensku industriju (u sastavu FMERI)

## Rute (Frontend)
```
/                           → redirect na /organi
/organi                     → lista organa
/organi/:organId            → detalji organa s org. strukturom
/zaposlenici                → lista zaposlenika
/zaposlenici/:id            → detalji zaposlenika
/izvjestaji/popunjenost     → izvještaj popunjenosti (PDF/Excel)
/izvjestaji/sistematizacija → sistematizacija (PDF/Excel)
/izvjestaji/pregled         → sveobuhvatni pregled (PDF/Excel)
/profil                     → korisnički profil
/admin/org-jedinice         → tree view org. strukture
/admin/radna-mjesta         → lista radnih mjesta
/admin/korisnici            → upravljanje korisnicima
/admin/sabloni              → globalni šabloni
/dashboard                  → statistike i grafikoni
```

## API Endpointi (Backend)
```
GET  /api/organi                           → lista organa
GET  /api/organi/:id                       → detalji organa
GET  /api/organi/:id/struktura             → puna hijerarhija
GET  /api/organi/popunjenost               → sumarni pregled
POST /api/organi/:id/osnovne-jedinice      → dodaj OOJ
POST /api/organi/:id/unutrasnje-jedinice   → dodaj UOJ
POST /api/organi/:id/radna-mjesta          → dodaj RM

GET  /api/zaposlenici                      → lista zaposlenika
GET  /api/zaposlenici/:id                  → detalji zaposlenika
POST /api/zaposlenici                      → novi zaposlenik

GET  /api/stats/dashboard
GET  /api/stats/zaposlenici-po-sektoru
GET  /api/stats/platni-razredi
GET  /api/stats/sistematizacija

GET  /api/izvjestaj/popunjenost/pdf
GET  /api/izvjestaj/popunjenost/excel
GET  /api/izvjestaj/sistematizacija/pdf
GET  /api/izvjestaj/sistematizacija/excel
GET  /api/izvjestaj/pregled
GET  /api/izvjestaj/pregled/pdf
GET  /api/izvjestaj/pregled/excel

POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/users/me
GET  /api/users
```

## Ključne tehničke napomene

### Nx generator
```bash
# Uvijek koristiti puni path:
npx nx g @nx/angular:component apps/web/src/app/features/... --standalone --skipTests
```

### PDF export
- Koristi `pdfkit` s DejaVu fontovima za bosanske karaktere
- Fontovi se nalaze u: `apps/api-server/src/assets/fonts/`

### Middleware redoslijed
```typescript
router.use(protect);                              // auth middleware
router.get('/', handler);                         // rute
router.post('/', requireRole('admin'), handler);  // admin rute
```

### MongoDB kolekcije
```
organs
organizacionajedinicas
radnomjestos
zaposleniks
users
globalnisablons
referentnipodacis
organsablons
```

### Seedovi
```bash
npx nx run api-server:seed-all-new
# Redoslijed: organs → jedinice → radna-mjesta → zaposlenici → users
# Admin lozinka: Fmeri2026!
# Default lozinka za sve korisnike: Fmeri2026!
```

### Dvije okoline (posao/laptop)
- Svaki računar ima vlastiti `.env` s `MONGODB_URI`
- Sinhronizacija podataka:
  1. Export JSON iz Compassa
  2. Spremi u `apps/api-server/src/seeds/data/`
  3. `git add . && git commit`
  4. Na drugom računaru: `git pull` + `npx nx run api-server:seed-all-new`

## Stilovi (Angular)
- Angular Material + custom CSS varijable
- CSS varijable: `--color-text-primary`, `--color-border`, `--color-background-card`...
- Boje kategorija zaposlenih:
  - `izabrani_duznosnik` → zlatna (`#f6ad55`)
  - `rukovodeci_drzavni_sluzbenik` → ljubičasta (`#667eea`)
  - `ostali_drzavni_sluzbenik` → zelena (`#48bb78`)
  - `namjestenik` → siva (`#a0aec0`)
- Accordion: custom implementacija (ne Material expansion panel)
- Komponente generisane s `--standalone --skipTests`

## Dijalozi — lazy loading pattern
```typescript
urediNesto(item: Model) {
  import('./dialogs/nesto-dialog.component').then(
    ({ NestoDialogComponent }) => {
      const ref = this.dialog.open(NestoDialogComponent, {
        width: '540px',
        maxWidth: '95vw',
        data: { item },
      });
      ref.afterClosed().subscribe(r => { if (r) this.reload(); });
    }
  );
}
```

## Planirane funkcionalnosti
- Kancelarijsko poslovanje (čeka se Zakon iz 2019)
- Validacija šablona org. strukture
- Dosije zaposlenika
- Audit log
- Notifikacije (istek ugovora, upražnjena mjesta)
- Dodatna ministarstva i uprave u sastavu
