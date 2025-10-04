import { useMemo, useState } from "react";
import { AutoForm } from "@/components/ui/autoform";
import { SubmitButton } from "@/components/ui/autoform/components/SubmitButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ZodProvider, fieldConfig } from "@autoform/zod";
import z from "zod";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { login } = useAuth();
  const [accountType, setAccountType] = useState<RoleType>('wolontariusz');

  const provider = useMemo(() => new ZodProvider(makeSchema(accountType)), [accountType]);

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

          <AutoForm
            key={accountType}
            schema={provider}
            onSubmit={(data) => {
              const payload = { ...data, rola: accountType } as any;
              console.log('register', payload);
              // TODO: call backend register, then login
              login(payload.username, payload.password);
            }}
          >
            <SubmitButton>Zarejestruj</SubmitButton>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}
