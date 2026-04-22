
export const ORGAN_UPRAVE = {
  vrsta_organa: 'organ_uprave',
  tip: 'ministarstvo',
  naziv: 'Federalno ministarstvo energije, rudarstva i industrije',
  nadleznost: 'Energetika, rudarstvo i industrija',
  opis: 'Federalno ministarstvo energije, rudarstva i industrije',
  zakonski_osnov: ['Zakon o ministarstvima i drugim organima uprave'],
  redoslijed: 1,
  radna_mjesta: [
    {
      naziv: 'Ministar',
      kategorija: 'izabrani_duznosnik',
      opis: 'Ministar je šef ministarstva i odgovoran je za ukupno funkcionisanje ministarstva.',
      platni_razred: 'I',
    },
    {
      naziv: 'Savjetnik ministra',
      kategorija: 'izabrani_duznosnik',
      opis: 'Savjetnik ministra',
      platni_razred: 'II',
    },
  ],
  osnovne_organizacione_jedinice: [
    {
      tip: 'kabinet',
      naziv: 'Kabinet ministra',
      opis: 'Kabinet ministra',
      redosljed: 1,
      radna_mjesta: [
        {
          naziv: 'Šef kabineta',
          kategorija: 'rukovodeci_drzavni_sluzbenik',
          opis: 'Šef kabineta ministra',
          platni_razred: 'III',
        },
        {
          naziv: 'Saradnik za odnose s javnošću',
          kategorija: 'ostali_drzavni_sluzbenik',
          opis: 'Saradnik za odnose s javnošću u kabinetu ministra',
          platni_razred: 'IV',
        },
      ],
    },
    {
      tip: 'sektor',
      naziv: 'Sektor energije',
      opis: 'Sektor energije',
      redosljed: 2,
      radna_mjesta: [
        {
          naziv: 'Pomoćnik ministra za energiju - Rukovodilac sektora',
          kategorija: 'rukovodeci_drzavni_sluzbenik',
          opis: 'Rukovodilac sektora energije',
          platni_razred: 'IV',
        },
      ],
      unitrasnje_organizacione_jedinice: [
        {
          naziv: 'Odsjek za elektroenergetiku',
          tip: 'odsjek',
          opis: 'Odsjek za elektroenergetiku',
          redosljed: 1,
          radna_mjesta: [
            {
              naziv: 'Rukovodilac odsjeka',
              kategorija: 'rukovodeci_drzavni_sluzbenik',
              opis: 'Rukovodilac odsjeka',
              platni_razred: 'V',
            },
          ],
        },
        {
          naziv: 'Odsjek za tečne energente, plin i termoenergetiku',
          tip: 'odsjek',
          opis: 'Odsjek za tečne energente, plin i termoenergetiku',
          redosljed: 2,
          radna_mjesta: [
            {
              naziv: 'Rukovodilac odsjeka',
              kategorija: 'rukovodeci_drzavni_sluzbenik',
              opis: 'Rukovodilac odsjeka',
              platni_razred: 'V',
            },
            {
              naziv: 'Saradnik za tečne energente, plin i termoenergetiku',
              kategorija: 'ostali_drzavni_sluzbenik',
              opis: 'Saradnik za tečne energente, plin i termoenergetiku',
              platni_razred: 'VI',
            }
          ],
        },
        {
          naziv: 'Odsjek za razvoj',
          tip: 'odsjek',
          opis: 'Odsjek za razvoj',
          redosljed: 3,
        },
      ],
    },
  ],
  upravna_organizacija_u_sastavu: [
    {
      vrsta_organa: 'upravna_organizacija_u_sastavu',
      naziv: 'Zavod za mjeriteljstvo',
      tip: 'zavod',
      opis: 'Federalni zavod za mjeriteljstvo',
      nadleznost: 'Mjeriteljstvo....',
      zakonski_osnov: ['Zakon o direkcijama i drugim organima uprave', 'Zakon o mjeriteljstvu'],
      redosljed: 1,
      osnovne_organizacione_jedinice: [
        {
          naziv: 'Centar za mjeriteljstvo Srajevo',
          tip: 'centar',
          opis: 'Centar za mjeriteljstvo Sarajevo',
          redosljed: 1,
        },
        {
          naziv: 'Centar za mjeriteljstvo Tuzla',
          tip: 'centar',
          opis: 'Centar za mjeriteljstvo Tuzla',
          redosljed: 2,
        },
        {
          naziv: 'Centar za mjeriteljstvo Mostar',
          tip: 'centar',
          opis: 'Centar za mjeriteljstvo Mostar',
          redosljed: 3,
        },
      ],
    },
    {
      naziv: 'Federalna direkcija za namjensku industriju',
      vrsta: 'upravna_organizacija_u_sastavu',
      tip: 'direkcija',
      opis: 'Federalna direkcija za namjensku industriju',
      nadleznost: 'Namjenska industrija....',
      zakonski_osnov: ['Zakon o direkcijama i drugim organima uprave', 'Zakon o namjenskoj industriji'],
      redosljed: 2,
      radna_mjesta: [
        {
          naziv: 'Direktor direkcije',
          kategorija: 'rukovodeci_drzavni_sluzbenik',
          opis: 'Rukovodilac direkcije',
          platni_razred: 'IV',
        },
      ],
      osnovne_organizacione_jedinice: [
        {
          naziv: 'Sektor za ekonomsko pravne poslove',
          tip: 'sektor',
          opis: 'Sektor za ekonomsko pravne poslove',
          redosljed: 1,
          radna_mjesta: [
            {
              naziv: 'Pomoćnik direktora za ekonomsko pravne poslove - Rukovodilac sektora',
              kategorija: 'rukovodeci_drzavni_sluzbenik',
              opis: 'Rukovodilac sektora',
              platni_razred: 'V',
            },
          ],
          unutrašnje_organizacione_jedinice: [
            {
              naziv: 'Grupa za pravne poslove',
              tip: 'grupa',
              opis: 'Grupa za pravne poslove',
              redosljed: 1,
              radna_mjesta: [
                {
                  naziv: 'Rukovodilac grupe',
                  kategorija: 'rukovodeci_drzavni_sluzbenik',
                  opis: 'Rukovodilac grupe',
                  platni_razred: 'VI',
                },
                {
                  naziv: 'Saradnik za pravne poslove',
                  kategorija: 'ostali_drzavni_sluzbenik',
                  opis: 'Saradnik za pravne poslove',
                  platni_razred: 'VII',
                }
              ],
            },
            {
              naziv: 'Grupa za ekonomske poslove',
              tip: 'grupa',
              opis: 'Grupa za ekonomske poslove',
              redosljed: 2,
              radna_mjesta: [
                {
                  naziv: 'Rukovodilac grupe',
                  kategorija: 'rukovodeci_drzavni_sluzbenik',
                  opis: 'Rukovodilac grupe',
                  platni_razred: 'VIII',
                }
              ],
            },
          ],
        },
      ],
    },
  ],

  uprava_u_sastavu: [],
};
