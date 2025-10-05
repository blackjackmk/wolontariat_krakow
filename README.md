
# Wolontariat Kraków
HackYeah 2025 Wilki Morskie PM Szczecin
# Instalacja
#### 1. Sklonuj repozytorium
```bash
git  clone  https://github.com/blackjackmk/wolontariat_krakow.git
cd  wolontariat_krakow
```
#### 2. Skopiuj domyślny plik .env
```bash
cp  .env.example  .env
```
#### 3. Zedytuj `.env` według swoich potrzeb (opcjonalne)
#### 4. Uruchom aplikację
```bash
docker-compose  up  -d
```
#### 5. Utwórz bazę danych oraz wygeneruj testowe dane
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py shell -c "from wolontariat_krakow.seed import seed_data; seed_data()"
# w przypadku komunikatu o błędzie prosimy zignorować, testowe dane powinny znajdować się już w bazie danych
```
#### 6. Otwórz w przeglądarce http://localhost:3000
# Test data
### Loginy
Testowe konta z różnymi rolami
#### Wolontariusz
Email: `jan.kowalski@example.com`
Hasło: `haslo123`
#### Koordynator
Email: `anna.nowak@example.com`
Hasło: `haslo123`
#### Organizacja
Email: `piotr.zielinski@example.com`
Hasło: `haslo123`