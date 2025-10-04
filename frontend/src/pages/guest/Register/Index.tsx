import { AutoForm } from "@/components/ui/autoform";
import { SubmitButton } from "@/components/ui/autoform/components/SubmitButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ZodProvider, fieldConfig } from "@autoform/zod";
import z from "zod";

const schema = z.object({
    email: z.string().email().max(255).superRefine(
        fieldConfig({
            label: 'E-mail',
            inputProps: {
                placeholder: 'user@example.com'
            }
        })
    ),
    username: z.string().max(255).superRefine(
        fieldConfig({
            label: 'Nazwa użytkownika',
            inputProps: {
                placeholder: 'Jan Kowalski'
            }
        })
    ),
    password: z.string().min(8).max(255).superRefine(
        fieldConfig({
            label: 'Hasło',
            inputProps: {
                type: 'password',
                placeholder: '********'
            }
        })
    ),
});

const schemaProvider = new ZodProvider(schema);

export default function Register() {
    const { login } = useAuth();
    return (
        <div>
            <Card>
                <CardHeader>
                    Rejestracja
                </CardHeader>
                <CardContent>
                    <AutoForm
                        schema={schemaProvider}
                        onSubmit={(data, form) => {
                            console.log('register', data);
                            // todo link api
                            login(data.username, data.password);
                        }}
                    >
                        <SubmitButton>
                            Zarejestruj
                        </SubmitButton>
                    </AutoForm>
                </CardContent>
            </Card>
        </div>
    )
}
