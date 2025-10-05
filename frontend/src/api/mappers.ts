// Helpers to map Django API responses to current frontend types

export function toOrganizacjaMinimal(id: number, nazwa: string): Organizacja {
  return {
    id,
    nazwa_organizacji: nazwa,
    // backend doesn’t return these in nested contexts; fill sensible defaults
    nr_telefonu: '',
    nip: '',
    weryfikacja: false,
  };
}

export function mapProjektFromApi(p: any): Projekt {
  return {
    id: p.id,
    organizacja: toOrganizacjaMinimal(p.organizacja, p.organizacja_nazwa ?? ''),
    nazwa_projektu: p.nazwa_projektu,
    opis_projektu: p.opis_projektu,
  };
}

export function mapOfertaFromApi(o: any): Oferta {
  const organizacja = toOrganizacjaMinimal(o.organizacja, o.organizacja_nazwa ?? '');
  const projekt: Projekt = {
    id: o.projekt,
    organizacja,
    nazwa_projektu: o.projekt_nazwa ?? '',
    opis_projektu: '',
  };

  let wolontariusz: Uzytkownik | null = null;
  const normalizeUser = (w: any): Uzytkownik => ({
    id: w.id,
    username: w.username ?? '',
    email: w.email ?? '',
    nr_telefonu: w.nr_telefonu ?? '',
    wiek: typeof w.wiek === 'number' ? w.wiek : (w.wiek ? Number(w.wiek) : undefined),
    organizacja: w.organizacja
      ? toOrganizacjaMinimal(w.organizacja, w.organizacja_nazwa ?? '')
      : null,
    rola: (w.rola as RoleType) ?? 'wolontariusz',
    czy_maloletni: typeof w.czy_maloletni === 'boolean' ? w.czy_maloletni : (w.wiek ? Number(w.wiek) < 18 : undefined),
    first_name: w.first_name,
    last_name: w.last_name,
    is_active: w.is_active,
    is_staff: w.is_staff,
    date_joined: w.date_joined,
  });

  let wolontariusze: Uzytkownik[] | undefined = undefined;
  if (Array.isArray(o.wolontariusze) && o.wolontariusze.length > 0) {
    wolontariusze = o.wolontariusze.map((w: any) => normalizeUser(w));
    wolontariusz = wolontariusze[0];
  } else if (o.wolontariusz_info) {
    const w = o.wolontariusz_info;
    wolontariusz = normalizeUser(w);
  }

  return {
    id: o.id,
    organizacja,
    projekt,
    tytul_oferty: o.tytul_oferty,
    data: o.data || undefined,
    lokalizacja: o.lokalizacja,
    tematyka: o.tematyka,
    czas_trwania: o.czas_trwania,
    wymagania: o.wymagania,
    czy_ukonczone: Boolean(o.czy_ukonczone),
    wolontariusz,
    wolontariusze,
    liczba_uczestnikow: typeof o.liczba_uczestnikow === 'number' ? o.liczba_uczestnikow : (wolontariusz ? 1 : 0),
  };
}
