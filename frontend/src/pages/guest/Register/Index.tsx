import { useEffect, useMemo, useState } from "react";
import { AutoForm } from "@/components/ui/autoform";
import { SubmitButton } from "@/components/ui/autoform/components/SubmitButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ZodProvider, fieldConfig } from "@autoform/zod";
import z from "zod";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOrganizations } from "@/api/organizations";

function makeSchema(accountType: RoleType) {
  const base = {
    email: z.string().email().max(255).superRefine(
      fieldConfig({ label: 'E-mail', inputProps: { placeholder: 'user@example.com' } })
    ),
    username: z.string().max(255).superRefine(
      fieldConfig({ label: 'Nazwa użytkownika', inputProps: { placeholder: 'Jan Kowalski' } })
    ),
    nr_telefonu: z.string().regex(/^\d{9}$/).superRefine(
      fieldConfig({ label: 'Numer telefonu (9 cyfr)', inputProps: { placeholder: '123456789' } })
    ),
    password: z.string().min(8).max(255).superRefine(
      fieldConfig({ label: 'Hasło', inputProps: { type: 'password', placeholder: '********' } })
    ),
  };

  if (accountType === 'organizacja') {
    return z.object({
      ...base,
      nazwa_organizacji: z.string().min(1).max(255).superRefine(
        fieldConfig({ label: 'Nazwa organizacji' })
      ),
      nip: z.string().min(10).max(10).superRefine(
        fieldConfig({ label: 'NIP (10 cyfr)', description: 'Wpisz 10 cyfr NIP' })
      ),
      organizacja_nr_telefonu: z.string().regex(/^\d{9}$/).superRefine(
        fieldConfig({ label: 'Telefon organizacji (9 cyfr)', inputProps: { placeholder: '111222333' } })
      ),
    });
  }

  if (accountType === 'koordynator') {
    return z.object({
      ...base,
      nazwa_organizacji: z.string().min(1).max(255).superRefine(
        fieldConfig({ label: 'Szkoła / Organizacja' })
      ),
    });
  }

  // wolontariusz
  return z.object(base);
}

export default function Register() {
  const { register } = useAuth();
  const [accountType, setAccountType] = useState<RoleType>('wolontariusz');
  const [organizations, setOrganizations] = useState<Organizacja[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const provider = useMemo(() => new ZodProvider(makeSchema(accountType)), [accountType]);

  useEffect(() => {
    // Load organizations for selection (public endpoint)
    getOrganizations().then(setOrganizations).catch(() => setOrganizations([]));
  }, []);

  return (
    <div>
      <Card>
        <CardHeader className="text-lg font-semibold">Rejestracja</CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Label>Typ konta</Label>
            <Select value={accountType} onValueChange={(v) => setAccountType(v as RoleType)}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ konta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wolontariusz">Wolontariusz</SelectItem>
                <SelectItem value="koordynator">Koordynator</SelectItem>
                <SelectItem value="organizacja">Organizacja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(accountType === 'organizacja' || accountType === 'koordynator') && (
            <div className="space-y-2 mb-4">
              <Label>Przypisz do organizacji</Label>
              <Select value={selectedOrgId} onValueChange={(v) => setSelectedOrgId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz organizację" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.nazwa_organizacji}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <AutoForm
            key={accountType}
            schema={provider}
            onSubmit={(data) => {
              const payload = { ...data, rola: accountType } as any;
              console.log('register', payload);
              // Send required fields to backend register
              const req = {
                username: payload.username,
                email: payload.email,
                password: payload.password,
                nr_telefonu: payload.nr_telefonu,
                rola: accountType,
                ...(selectedOrgId && (accountType === 'organizacja' || accountType === 'koordynator')
                  ? { organizacja_id: Number(selectedOrgId) }
                  : {}),
              } as {
                username: string; email: string; password: string; nr_telefonu: string; rola: RoleType; organizacja_id?: number;
              };
              register(req);
            }}
          >
            <SubmitButton>Zarejestruj</SubmitButton>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}
