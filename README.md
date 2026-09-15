# MIGDAŁOWA — spacer w przeglądarce

Rzeczywisty model 3D z projektu SketchUp, wyświetlany przez Three.js/WebGL. Wersja robocza: wygląd nie jest jeszcze wiernym odtworzeniem wszystkich wizualizacji. To osobna wersja internetowa, a nie Unreal Pixel Streaming.

## Oglądanie

WASD — ruch, mysz — rozglądanie. O otwiera/zamyka wskazane drzwi w odległości do 2,2 m. Esc pokazuje menu. Sześć skrzydeł jest interaktywnych; pozostałe drzwi nie zostały jeszcze rozdzielone. Kamera 165 cm, prędkość 1,2 m/s, kolizje ścian, podłóg, wyposażenia i ruchomych skrzydeł. Pełny audyt wszystkich pomieszczeń i schodów pozostaje do wykonania.

## Hosting FTP

Całą zawartość folderu `public` wgraj do wybranego katalogu strony, np. `public_html/spacer/`. Otwórz `https://twoja-domena.pl/spacer/`. Wszystkie ścieżki są względne, a biblioteki lokalne. Serwer nie potrzebuje Node, PHP, Unreal ani GPU. Przeglądarka użytkownika musi obsługiwać WebGL2. Nie otwieraj index.html przez file:// — moduły i model wymagają HTTP(S).

Nie ma w tej paczce haseł, tokenów ani konfiguracji Twojego konta FTP. Pliki strony zawierają model wnętrza i mogą być pobrane przez osoby mające dostęp do strony. Ochronę hasłem należy ustawić na hostingu, jeśli jest potrzebna.

## GitHub

Repozytorium może zawierać cały ten folder z wyłączeniami z `.gitignore`. Gotowy model ma około 29 MB, poniżej limitu pojedynczego pliku GitHub. `public` zawiera komplet do publikacji, więc instalowanie npm nie jest konieczne do hostowania.

Workflow `.github/workflows/pages.yml` uruchamia się ręcznie i publikuje `public` przez GitHub Pages. W repozytorium trzeba włączyć Pages ze źródłem GitHub Actions. Nie został uruchomiony ani wdrożony w ramach lokalnego przygotowania. Dostępność Pages dla prywatnego repozytorium zależy od planu konta.

## Lokalnie

Uruchom `node server.mjs` w tym folderze, potem http://127.0.0.1:4173. `URUCHOM.cmd` wykonuje to samo. Wersja na komputer z klawiaturą i myszą; sterowanie dotykowe nie zostało dodane.

## Dane i testy

`public/assets/interior.glb` pochodzi z istniejącej sceny Blender (geometria źródłowa SketchUp); tekstury WebP zostały ograniczone do 1024 px. Nie zastąpiono sceny zdjęciami. Skrzydła są wydzielane z istniejącej geometrii przy wczytywaniu, ościeżnice zostają nieruchome. Kolizje są wyliczane na geometrii z BVH, także po obrocie drzwi. Zakres potwierdzonego testu znajduje się w `QA.json`.

Materiały, światło i odbicia są uproszczone względem Unreal. Lustra nie mają tutaj pełnych dynamicznych odbić pomieszczenia. Nie jest to ukończona wersja fotorealistyczna. Windows UE oraz plik Blender nie zostały zmienione przez tę aktualizację internetową.

Biblioteki: Three.js i three-mesh-bvh (licencje w `public/vendor`). Prawa do modelu i jego zasobów pozostają przy właścicielach; paczka nie nadaje im licencji open source.
