import { AutoForm } from "@/components/ui/autoform";
import { SubmitButton } from "@/components/ui/autoform/components/SubmitButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ZodProvider, fieldConfig } from "@autoform/zod";
import { Link } from "react-router-dom";
import z from "zod";

const schema = z.object({
    username: z.string().max(255).superRefine(
        fieldConfig({
            label: 'Email',
            inputProps: {
                placeholder: 'jan.kowalski@example.com'
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
                <CardHeader className="text-lg font-semibold">
                    Zaloguj się
                </CardHeader>
                <CardContent>
                    <AutoForm
                        schema={schemaProvider}
                        onSubmit={(data, form) => {
                            console.log('login', data);
                            // todo link api
                            login(data.username, data.password);
                        }}
                    >
                        <p>
                            Nie masz konta? <Link className="text-primary hover:underline" to="/register">Zarejestruj się</Link> na tej stronie
                        </p>
                        <SubmitButton>
                            Zaloguj się
                        </SubmitButton>
                    </AutoForm>
                </CardContent>
            </Card>
        </div>
    )
}
