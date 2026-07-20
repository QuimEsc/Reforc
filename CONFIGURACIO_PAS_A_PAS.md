# Configuració pas a pas

La configuració està pensada perquè només calga copiar, apegar i executar una funció. No has de crear manualment `/gamificacio` dins de Firebase.

## Part 1 — Crear el Google Sheet

1. Crea un Google Sheet completament buit.
2. Canvia-li el nom, per exemple, a `Missió Mates 1r ESO`.
3. Dins del full, entra en **Extensions → Apps Script**.
4. En l'editor, obri el fitxer `Code.gs` que apareix per defecte.
5. Esborra el seu contingut i copia tot el contingut de `Gamificacio/apps-script/Code.gs`.
6. Prem el símbol **+** situat al costat de «Fitxers» i crea un script anomenat `Contingut`.
7. Copia dins el contingut de `Gamificacio/apps-script/Contingut.gs`.
8. Torna a prémer **+**, crea un script anomenat `Batalla` i copia dins `Gamificacio/apps-script/Batalla.gs`.
9. Torna a prémer **+**, crea un script anomenat `Configuracio` i copia dins `Gamificacio/apps-script/Configuracio.gs`.

No fa falta posar encara l'ID del full ni la clau per crear les pestanyes.

## Part 2 — Crear automàticament les pestanyes

1. En la barra superior d'Apps Script, obri el desplegable de funcions.
2. Tria `configurarProjecte`.
3. Prem **Executar**.
4. Google demanarà permisos la primera vegada. Accepta'ls amb el teu compte.
5. Apareixerà un missatge amb l'ID del Google Sheet. Copia'l.
6. Torna al fitxer `Configuracio.gs` i substitueix:

```javascript
var SPREADSHEET_ID = "POSA_ACI_ID_DEL_GOOGLE_SHEET";
```

pel valor copiat, sense eliminar les cometes.

La funció crea estes pestanyes:

- `Contrasenya`
- `Configuracio`
- `Sectors`
- `Usuaris`
- `Missions`
- `Preguntes`
- `Assignacions`
- `Progres`
- `Dades`
- `RespAlumnes`
- `MetodesIA`
- `Insignies`
- `InsigniesAlumnes`
- `PropostesIA`
- `SuggerimentsRuta`
- `Sessions`
- `DebugIA`
- `PlansNivell`
- `RevisionsDocents`
- `Diagnostic`
- `HistorialPreguntes`
- `HistoriaRespAlumnes`
- `PreguntesBatalla`
- `Batalles`
- `ResultatsBatalla`
- `AvatarsAlumnes`
- `PremisBatalla`

També crea un alumne de prova, els 15 sectors previstos per al curs, cinc missions per sector i el banc complet de **1.125 exercicis**: cinc activitats en cadascuna de les tres fases de cada missió. Entre elles hi ha **45 construccions geomètriques interactives**. A més, crea **375 preguntes ràpides de batalla**, cinc per missió, amb la resposta, les opcions i la pista ja preparades. Les fases es fan per defecte en l'ordre `SUPORT → BASE → REPTE`; des de seguiment pots canviar les fases d'un alumne en la missió actual. No esborra dades si tornes a executar-la.

No has de preparar columnes manuals. En `Preguntes`, les dues últimes capçaleres són `TipusInteraccio` i `ConfiguracioInteraccio`; el generador les ompli només en les construccions. La pestanya `Dades` manté l'estructura prevista i no necessita cap columna geomètrica nova: la resposta queda guardada dins de `RespostaAlumne` com coordenades compactes.

### Posar la contrasenya del seguiment

1. Torna al Google Sheet.
2. Obri la pestanya `Contrasenya`.
3. En la cel·la `A2`, substitueix `CANVIA_ACI_LA_CONTRASENYA` per la contrasenya que vulgues.

No has de modificar cap altra cel·la. Quan canvies `A2`, la nova contrasenya s'utilitza automàticament en el següent inici de sessió. Una sessió docent oberta dura com a màxim sis hores.

## Part 3 — Posar la clau d'OpenAI directament en el codi

En `Configuracio.gs`, substitueix:

```javascript
var OPENAI_API_KEY = "POSA_ACI_LA_CLAU_OPENAI";
```

per la teua clau. La clau queda en un fitxer de codi d'Apps Script, no en `PropertiesService`.

Per evitar publicar-la sense voler, no copies després la versió real de `Configuracio.gs` dins del repositori de GitHub. Quan actualitzem el programa, normalment hauràs de substituir `Code.gs` i, si ha canviat el temari, també `Contingut.gs`; el fitxer `Configuracio.gs` no canviarà.

Pots desactivar temporalment la IA canviant:

```javascript
var OPENAI_ACTIU = false;
```

Els `PROCEDIMENT_LOCAL` exigeixen passos i validen sense OpenAI la resposta final, les igualtats numèriques i que el procediment no siga una repetició trivial. També reconeixen fraccions equivalents, coma decimal, factors en un altre ordre, llistes de divisors o múltiples reordenades i expressions algebraiques equivalents. En preguntes textuals o de classificació demanen una justificació breu i una última línia `Resposta: ...`, no una cadena artificial d'igualtats. Els `PROCEDIMENT` reserven la IA per a l'últim exercici textual del bloc. Si la IA està desactivada, falla o supera una quota, la resposta **no es perd ni bloqueja l'alumne**: queda com `REVISAR_DOCENT` en la cua de seguiment.

En una pregunta `PROCEDIMENT_LOCAL` o `PROCEDIMENT`, el navegador avisa abans d'enviar si només s'ha escrit el resultat. Si encara arriba una resposta sense passos —per exemple, per un enviament forçat en perdre el focus— el primer intent queda `EN_CURS`. Un procediment incomplet no rep energia, ratxa, insígnies ni aporta a l'objectiu cooperatiu. Només un procediment validat pot concedir `PAS_A_PAS`.

Deixa `DEBUG_IA_ACTIU = false` durant les classes. Això evita una escriptura addicional en Sheets per cada correcció. Activa-ho només temporalment quan vulgues diagnosticar una resposta de l'API.

### Si ja havies creat les 1.125 preguntes

No tornes a executar `configurarProjecte()` ni esborres cap pestanya:

1. Substitueix en Apps Script els continguts de `Code.gs` i `Contingut.gs` per les versions noves de la carpeta `Gamificacio/apps-script`.
2. Guarda el projecte.
3. Tria la funció `actualitzarProjecteDiagnosi` i executa-la **una sola vegada**.
4. Quan aparega el missatge de finalització, crea una nova versió de la implementació web.

La funció crea la pestanya `Diagnostic`, afegeix sempre al final les capçaleres noves que falten i usa `CorreccionsIAPerNivell = 1` per reclassificar **totes les preguntes compatibles que ja hi haja en `Preguntes`**. Respecta la teoria i les construccions geomètriques, no esborra respostes, historial, columnes addicionals, anotacions ni càlculs. No cal crear, moure ni omplir cap columna manualment. Després crea una nova versió de la implementació web.

## Part 4 — Desplegar Apps Script

1. Prem **Implementar → Nova implementació**.
2. En «Tipus», tria **Aplicació web**.
3. En «Executar com», tria **Jo**.
4. En «Qui té accés», tria **Qualsevol**.
5. Prem **Implementar**.
6. Copia la URL que acaba en `/exec`.
7. Obri `Gamificacio/config.js`.
8. Substitueix:

```javascript
appsScriptUrl: "POSA_ACI_LA_URL_D_APPS_SCRIPT",
```

per la URL copiada.

Per comprovar el backend, obri la URL `/exec` directament. Ha d'aparéixer un JSON amb el text «El backend esta actiu».

Quan actualitzes `Code.gs`, recorda crear una **nova versió de la implementació** en Apps Script. La URL `/exec` pot continuar sent la mateixa.

## Part 5 — Activar les regles de Firebase

No has de crear cap carpeta o node manualment.

1. Entra en la consola de Firebase.
2. Obri el projecte `seguiment-exercicis`.
3. Entra en **Realtime Database → Regles**.
4. Copia tot el contingut de `Gamificacio/firebase-rules.json`.
5. Substitueix les regles que apareixen en l'editor de Firebase.
6. Prem **Publicar**.

El fitxer conserva les regles `live` i `comments` del projecte anterior i afegeix `gamificacio`. Per tant, no elimina el funcionament de la web actual.

La còpia `firebase-rules.json` de l'arrel d'ExercicisMates i la de `Gamificacio` estan sincronitzades i contenen les mateixes regles combinades. Pots publicar qualsevol de les dues sense desactivar l'altre projecte.

La primera vegada que un alumne entre en un exercici, Firebase crearà automàticament:

```text
gamificacio
 ├─ live
 ├─ comments
 ├─ classGoal
 └─ battles
```

No cal fer cap altra acció en Firebase.

## Part 6 — Posar l'alumnat real

1. Obri la pestanya `Usuaris`.
2. Pots eliminar la fila `Alumne de prova`.
3. Afig una fila per alumne.

Exemple:

| AlumneId | Nom | RutaDefault | Avatar | Actiu | CanvisAvatarDisponibles |
|---|---|---|---|---|---:|
| `ALU-001` | Anna | `BASE` |  | `SI` | `0` |
| `ALU-002` | Marc | `SUPORT` |  | `SI` | `0` |

- `AlumneId` no s'ha de repetir.
- L'alumne només veu `Nom`.
- `RutaDefault` pot ser `SUPORT`, `BASE` o `REPTE`.
- Deixa `Avatar` buit: al principi l'alumne veurà un interrogant.
- No cal crear manualment `CanvisAvatarDisponibles`. En actualitzar el backend, s'afegirà automàticament al final de `Usuaris` si no existeix, sense moure les teues columnes. El programa la gestiona amb `0` o `1`.
- En completar la primera missió, l'alumne desbloqueja tres avatars aleatoris i pot triar-ne un. Després se'n desbloqueja un més cada cinc missions, fins a tindre els 15 en la missió 60.
- En completar una missió pot tornar a canviar l'avatar, però només entre els que ja té desbloquejats i els que tinga temporalment prestats per una batalla.

## Part 7 — Publicar en GitHub Pages

1. Puja **el contingut de la carpeta `Gamificacio`** al repositori.
2. `index.html` ha de quedar en l'arrel que publica GitHub Pages.
3. En GitHub, entra en **Settings → Pages**.
4. Tria la branca i la carpeta de publicació.
5. Espera que GitHub mostre la nova adreça web.

Adreces finals:

- alumnat: `https://.../index.html`
- professor: `https://.../seguiment.html` — demanarà la contrasenya de `Contrasenya!A2`.
- pissarra d'explicacions: s'obri amb el botó **Explicació** situat al costat de **Web alumnat** en seguiment.

La carpeta `apps-script` pot quedar publicada perquè només conté la plantilla amb marcadors, no la clau real. La clau real només s'ha d'apegar en l'editor d'Apps Script.

### Provar abans en el teu ordinador

Evita obrir `index.html` directament amb doble clic. Obri PowerShell dins de la carpeta `Gamificacio` i executa:

```powershell
python -m http.server 8000
```

Deixa eixa finestra oberta i entra en `http://localhost:8000/index.html`. Per a una prova sense escriure en Firebase, Sheets ni OpenAI, usa `http://localhost:8000/index.html?demo=1`.

## Part 8 — Provar el recorregut complet

1. Obri `index.html` i tria l'alumne de prova.
2. Entra en la primera missió.
3. Escriu una resposta.
4. Obri `seguiment.html` en una altra finestra, escriu la contrasenya de `Contrasenya!A2` i comprova que apareix.
5. Envia un comentari individual.
6. Demana una pista en la web de l'alumne.
7. Completa les activitats de la missió. Comprova que apareix el premi i, després de tancar-lo, s'obri el perfil amb tres avatars desbloquejats aleatòriament.
8. Guarda un avatar i comprova que ja no es pot tornar a canviar fins que complete una altra missió.
9. En seguiment, prem **Desbloquejar missió**. Només ho faràs una vegada: queda oberta per a tot l'alumnat, mentre cada alumne conserva el seu propi punt de progrés.
10. En seguiment, prem **Reforç IA** o revisa un repte ràpid que aparega automàticament.
11. Revisa la pregunta proposada.
12. Aprova-la i comprova que queda en `Preguntes`, `PropostesIA` i `Assignacions` només per a l'alumne destinatari.

## Utilitzar el mode batalla

1. Entra en `seguiment.html` i obri **Batalla**.
2. El panell marca automàticament els alumnes que han estat actius durant els últims deu minuts. Pots modificar la selecció abans de començar; fan falta almenys dos participants.
3. Tria la missió actual.
4. Prem **Batalla del dia** per carregar les 15 preguntes de la missió. Si és la missió 5 del sector, també apareix **Repàs de les cinc missions**, que carrega 20 preguntes: quatre de cada missió.
5. Revisa el resum i inicia la partida. La batalla del dia dura set minuts i la final de sector, deu.

En prémer **Llançar compte arrere**, primer Apps Script prepara i valida tot el paquet. Fins que esta càrrega acaba, la pantalla de l'alumnat no canvia. Després es publica una única ordre en Firebase i comença un compte arrere global de set segons. Només els alumnes seleccionats que tinguen la web oberta veuen com la batalla cobreix l'activitat actual; els no seleccionats continuen treballant amb normalitat. La resposta que estaven escrivint queda darrere de la batalla i torna a aparéixer en eixir, però no es considera enviada a `Dades` si encara no havien premut el botó d'enviament.

La classificació docent mostra immediatament tota la selecció. Mentre arriba la connexió d'un dispositiu apareix `Esperant connexió…`; en connectar-se, comencen a actualitzar-se el seu or, encerts i errors. Si un alumne obri la web tard, entra en el temps que quede de la mateixa partida: no rep un compte arrere particular nou.

Apps Script només intervé en preparar el paquet inicial i en guardar el resultat final. Abans del compte arrere, el navegador rep totes les preguntes, respostes esperades, opcions i pistes. Cada resposta es corregeix localment i Firebase només sincronitza l'or, la classificació, els cofres i els duels; per tant, **no hi ha cap crida a Apps Script ni a OpenAI per cada intent**.

Una resposta incorrecta activa deu segons d'espera. Les preguntes es repeteixen cíclicament fins que acaba el temps. La classificació en directe només es veu en seguiment docent i queda substituïda per una animació de cambra segellada durant els últims 20 segons. No ocupa espai a la pantalla de l'alumnat. Per reduir el consum de Firebase, cada alumne escolta només les preguntes, el seu propi estat i els duels; la llista completa de puntuacions s'envia únicament al panell docent. En acabar, el panell guarda el resultat, les insígnies i, si correspon, els préstecs d'avatars durant set dies.

En la mateixa secció de seguiment, **Historial d'insígnies** mostra per alumne les obtingudes en els últims 7 i 31 dies. En el perfil, una mateixa insígnia es representa amb un comptador visual de fins a `×5`; l'històric conserva totes les concessions reals.

## Utilitzar la pissarra d'explicacions

1. Entra en `seguiment.html`.
2. Prem **Explicació**, al costat de **Web alumnat**.
3. Escriu en el quadre inferior. La part superior es renderitza automàticament amb MathJax.
4. Usa **A−** i **A+** per ajustar la grandària a la pantalla de classe.
5. Prem **Pantalla completa** quan vulgues projectar només la pissarra.

Exemples d'escriptura:

```text
5/3
sqrt(x+1)
mat(1,2,3;4,5,6)
det(1,2;3,4)
sis(x+y=3;2x-y=1)
lim(x->2) (x^2-4)/(x-2)
int(0,1)(x^2) dx
```

Pots combinar explicació normal i fórmules en la mateixa línia, per exemple: `La fracció 5/3 és major que 1.` La pissarra conserva l'últim esborrany en eixe navegador perquè no es perda si tornes momentàniament al seguiment.

## Sectors i desbloqueig de les classes

El mapa sempre mostra **un sector de cinc missions**. Una missió pot tindre cinc, sis o set exercicis; ho indiques en `Missions`, columna `ObjectiuActivitats`.

Abans de desbloquejar la missió següent, el backend comprova que tinga almenys eixe nombre d'exercicis per a cada ruta. Tens dos sistemes vàlids:

- preparar, per exemple, cinc preguntes `SUPORT`, cinc `BASE` i cinc `REPTE`;
- preparar cinc preguntes amb ruta `COMUNA`, si han de ser exactament les mateixes per a tots.

Quan prems **Desbloquejar missió** en `seguiment.html`, la columna `Desbloquejada` canvia a `SI`. És un únic permís global, no un permís per alumne. Per això l'alumne ràpid pot passar a la nova missió i el més lent continua en l'anterior; quan hi arribe, ja la trobarà oberta.

No desbloqueges una missió fins que vulgues començar-la amb la classe. El panell sempre et proposa la primera missió bloquejada del trimestre, en ordre.

## Triar 3, 5 o 7 sectors per trimestre

En `Configuracio` tens estes tres files:

| Clau | Valor inicial |
|---|---:|
| `SectorsTrimestre1` | 5 |
| `SectorsTrimestre2` | 5 |
| `SectorsTrimestre3` | 5 |

Pots canviar cada valor en qualsevol moment. En tornar a obrir el panell de seguiment o la web de l'alumne:

- si baixes de 5 a 3, els sectors sobrants queden amb `Actiu=NO`, però no s'esborren;
- si tornes de 3 a 5, es reactiven amb el progrés conservat;
- si puges a 6 o 7, es creen automàticament els sectors addicionals i cinc missions buides per sector perquè els poses el contingut.

Els primers cinc sectors de cada trimestre ja tenen nom, narrativa, habilitats i ambientació pròpia. Els sectors 6 i 7 es creen com a repassos adaptables, i pots canviar-ne els textos directament en `Sectors` i `Missions`.

La clau `MissionsPerSector` es deixa en `5`, perquè és la quantitat que representa el mapa. `ExercicisPerMissio` determina l'objectiu inicial de les missions noves; després pots ajustar cada missió individualment en `ObjectiuActivitats`.

## Reptes ràpids amb IA

En `Configuracio`:

| Clau | Funció |
|---|---|
| `ReptesRapidsIA` | `SI` activa les propostes automàtiques |
| `LlindarRapidMinuts` | temps màxim des que l'alumne entra; inicialment 25 |
| `MinimExercicisRapids` | activitats correctes exigides; inicialment 5 |

Si l'alumne acaba la missió dins del temps i totes les activitats tenen `Percentatge=1`, es crea una petició pendent. La crida a OpenAI no bloqueja l'enviament de la resposta de l'alumne: el panell docent processa la cua i mostra la proposta per revisar.

En aprovar-la, el sistema crea una pregunta amb `GeneradaIA=SI` i una assignació individual. Esta pregunta no passa a la ruta general ni modifica el percentatge de finalització de la missió. Si l'alumne la resol correctament, guanya una vegada la insígnia **Cometa veloç**.

## Canviar de trimestre

En la pestanya `Configuracio`, modifica `TrimestreActual`:

- `1`: Agència espacial.
- `2`: Ciutat dels robots.
- `3`: Expedició del tresor.

El backend envia el trimestre a la web i esta canvia automàticament colors, títols i ambientació.

En canviar `TrimestreActual`, el món visual passa automàticament d'espai a ciutat robot o expedició. La primera missió del trimestre nou continua sotmesa al teu desbloqueig docent, igual que la resta.

## Activar l'adaptació de ruta

En `Configuracio`, la clau `RutaAutomatica` admet:

- `DESACTIVADA`: no calcula canvis.
- `SUGGERIR`: guarda propostes en `SuggerimentsRuta`, però no canvia l'alumne.
- `AUTOMATICA`: aplica el canvi després d'almenys tres intents recents.

Per començar, deixa-la en `SUGGERIR`.
