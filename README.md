# wolontariat_krakow
HackYeah 2025 Wilki Morskie PM Szczecin

# Setup
#### 1. Clone the repository
```bash
git clone https://github.com/blackjackmk/wolontariat_krakow.git
cd wolontariat_krakow
```
#### 2. Copy the environment config
```bash
cp .env.example .env
```
#### 3. Edit `.env` with your own values

#### 4. Start the application
```bash
docker-compose up -d
```

#### 5. Open http://localhost:8000 in your browser

# Test data
### Loginy
Przy logowaniu/rejestrowaniu z dowolnymi danymi aktualnie jest wyświetlany widok wolontariusza.
#### Wolontariusz
Nazwa: `jan_wolontariusz`
Hasło: dowolny tekst
#### Koordynator
Nazwa: `koordynator_adam`
Hasło: dowolny tekst
#### Organizacja
Nazwa: `pomocna_dlon_org`
Hasło: dowolny tekst