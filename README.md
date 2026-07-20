# Missió Mates — Gamificació

Aplicació web autònoma per a reforç de matemàtiques de 1r d'ESO. La carpeta `Gamificacio` és directament l'arrel publicable en GitHub Pages: no té compilació, `npm` ni dependències locals.

## Què inclou

- Selecció ràpida de l'alumne, sense contrasenya.
- Perfil amb 15 avatars guardats en Google Sheets. Al principi es mostra `?`; la primera missió desbloqueja tres avatars aleatoris i després se'n desbloqueja un de nou cada cinc missions, fins a completar la col·lecció en la missió 60.
- Recorregut visual de cinc missions per sector, amb 15 sectors dissenyats i tres aspectes trimestrals:
  - trimestre 1: Agència espacial;
  - trimestre 2: Ciutat dels robots;
  - trimestre 3: Expedició del tresor.
- Tres fases consecutives per missió: cinc exercicis de suport, cinc de base i cinc de repte. El professor pot reduir o canviar les fases d'un alumne des de seguiment.
- Assignacions per a tota la classe, una ruta o un alumne.
- Desbloqueig docent global: s'autoritza cada missió una sola vegada i els alumnes lents continuen sempre des del seu punt, sense demanar cap desbloqueig individual.
- Nombre de sectors ampliable des de Sheets: pots usar 3, 5 o 7 per trimestre; els sectors addicionals i les seues cinc missions es creen sense tocar el codi.
- Històric en `Dades` i estat compacte en `Progres`.
- Seguiment quasi en temps real amb Firebase i MathJax.
- Una única targeta de seguiment per alumne: si entra des d'un altre ordinador, la connexió nova substitueix l'anterior, recupera l'últim esborrany del mateix exercici i la pantalla antiga deixa d'actualitzar. L'última resposta es conserva 72 hores i després el monitor la retira automàticament.
- Pissarra docent d'explicacions a pantalla gran, accessible des de seguiment, amb conversió en directe de text pla a MathJax.
- Accés al seguiment amb una contrasenya modificable en el Google Sheet, pestanya `Contrasenya`, cel·la `A2`.
- Comentaris individuals i globals.
- Control de focus per sessió de 55 minuts:
  - primera eixida: avís;
  - següents eixides: enviament de la resposta actual.
  - en el seguiment, l'alumne amb una incidència de focus activa puja al principi i la seua targeta queda marcada en roig durant 1 minut; si torna a eixir, el minut comença de nou.
- Set insígnies il·lustrades per treball, procés, constància, ús d'ajudes i ampliació; sense rànquing. Les últimes es veuen al panell i la col·lecció completa al perfil.
- Objectiu cooperatiu de classe alimentat per activitats individuals.
- Pistes preparades i ajuda d'OpenAI amb MathJax.
- Correcció híbrida i conscient del tipus de resposta: càlculs numèrics, fraccions, llistes, signes, factoritzacions, expressions algebraiques i respostes textuals exigeixen el procediment o la justificació apropiada. Fins a quatre exercicis de cada bloc es validen localment i només l'últim exercici textual usa IA. Les construccions conserven el corrector geomètric propi. Posar únicament el resultat no dona energia. Si la IA falla, la resposta es guarda per a revisió docent.
- Diagnosi per blocs en el seguiment: la correcció amb IA rep també l'enunciat, la resposta real i la nota local dels exercicis previs, calcula una nota sobre 10, separa observacions de dificultats confirmades i pot preparar un reforç pendent d'aprovació docent.
- En els exercicis `PROCEDIMENT`, un resultat correcte sense passos provoca un primer reintent obligatori. Si torna a ometre'ls, avança amb un 50 %, però sense energia, ratxa, insígnia ni aportació a l'objectiu de classe. Les respostes incorrectes tampoc generen recompenses.
- Editor geomètric tàctil sobre quadrícula per construir punts, segments, angles, polígons, simetries, girs, translacions i circumferències. El banc inclou 45 construccions autocorregibles i el seguiment mostra la figura completa en temps real.
- Reptes d'ampliació generats per IA per a qui completa cinc exercicis correctes en menys del temps configurat. El professor els ha d'aprovar, editar o rebutjar; són individuals i, si es completen bé, concedeixen la insígnia «Cometa veloç».
- Mode de ruta automàtica configurable com `DESACTIVADA`, `SUGGERIR` o `AUTOMATICA`.
- Mode batalla de classe, amb les 15 preguntes de la missió del dia, set minuts, cofres i classificació en directe.
- Batalla final de sector disponible en la missió 5: deu minuts i 20 preguntes de repàs, exactament quatre de cadascuna de les cinc missions.
- Les preguntes, solucions, opcions i pistes es carreguen totes abans del compte arrere. Durant la partida no es consulta Apps Script ni OpenAI per corregir cada resposta.
- El seguiment docent conserva l'alumnat en ordre alfabètic i actualitza només la posició, l'or, els encerts, els errors i els intents. El botó `Projectar classificació` obri una vista gran que reordena els noms amb animació; només esta vista pública queda segellada durant els últims 20 segons.
- En acabar, cada alumne veu la seua posició final. Els tres primers —o els dos primers si només hi ha quatre o cinc participants— trien, estrictament per ordre de classificació, un avatar disponible dels últims participants durant set dies.
- Per reduir trànsit de Firebase, cada alumne escolta només la configuració general, les preguntes, els seus propis punts i els duels. La taula completa de jugadors només l'escolten el seguiment docent i, quan l'obris, una única pantalla de projector.
- Historial docent d'insígnies obtingudes per alumne durant els últims 7 i 31 dies.

## Prova sense configurar res

Obri `demo.html` per entrar a la pantalla de demostració o, si ho prefereixes, usa directament:

- `index.html?demo=1`
- `seguiment.html?demo=1`
- `index.html?demo=1&battle=1` per entrar directament en una batalla simulada
- `batalla-classificacio.html?demo=1` per provar la classificació projectada
- `demo-geometria.html` per provar directament la quadrícula de construcció

El mode demostració usa dades locals i no escriu en Sheets, Firebase ni OpenAI.

## Fitxers principals

| Fitxer | Funció |
|---|---|
| `index.html` | Web de l'alumnat |
| `seguiment.html` | Centre de control del professor |
| `explicacio.html` | Pissarra independent per a explicacions de classe |
| `config.js` | URL d'Apps Script, grup i temes |
| `firebase-config.js` | Projecte Firebase reutilitzat |
| `firebase-rules.json` | Regles actuals més el nou espai `/gamificacio` |
| `app.js` | Flux de missions, perfil, focus i respostes |
| `seguiment.js` | Monitor, assignacions i aprovació d'IA |
| `battle-student.js` | Partida de l'alumnat, cofres, penalitzacions, duels i premis |
| `battle-teacher.js` | Preparació, selecció de participants, control i historial docent |
| `batalla-classificacio.html` | Classificació animada per al projector i cambra final de 20 segons |
| `battle-projector.js` | Sincronització lleugera i moviment en directe de la vista projectada |
| `battle-service.js` | Estat de la batalla en Firebase i correcció local de respostes |
| `firebase-service.js` | Escriptures incrementals i comentaris |
| `math-render.js` | MathJax i sanejament d'HTML |
| `geometry-editor.js` | Editor SVG tàctil i serialització compacta de construccions |
| `explicacio.js` | Vista en directe, pantalla completa i esborrany local de la pissarra |
| `apps-script/Code.gs` | Backend complet |
| `apps-script/Contingut.gs` | Generador curricular de les 75 missions i 1.125 exercicis |
| `apps-script/Batalla.gs` | Banc ràpid, preparació, resultats, insígnies i préstec d'avatars |
| `apps-script/Configuracio.gs` | Plantilla de configuració directa, sense `PropertiesService` |
| `IMG/avatar-01.png` … `avatar-15.png` | Quinze avatars individuals; els dos fitxers `avatars-sheet*.png` conserven els fulls originals |
| `IMG/insignies/` | Imatges de les insígnies, incloses les dues del mode batalla |

## Configuració real

Segueix [CONFIGURACIO_PAS_A_PAS.md](CONFIGURACIO_PAS_A_PAS.md). La funció `configurarProjecte()` crea automàticament totes les pestanyes, capçaleres, validacions, el banc complet de 1.125 exercicis i les 375 preguntes ràpides de les batalles finals.

La planificació completa de temàtiques i missions està resumida en [SECTORS_DEL_CURS.md](SECTORS_DEL_CURS.md).

Al final del curs, la funció manual `reiniciarDadesFinalDeCurs()` elimina totes les dades de l'alumnat i torna el projecte a l'estat inicial amb `ALU-001`. Conserva íntegrament el temari, les preguntes, les solucions, les preguntes de batalla, els sectors, les missions i la configuració. La funció també neteja únicament el grup actual de `/gamificacio` en Firebase i no toca les dades de l'altre projecte `ExercicisMates`.

## Model de dades

`Dades` conserva en les primeres 14 columnes l'estructura familiar del sistema anterior, inclosa `MotiuEnviament` en la columna N. Els camps nous comencen en O. El backend treballa pels noms de les capçaleres i no per posicions fixes. `actualitzarProjecteDiagnosi()` afegeix al final, sense moure cap columna existent, els camps de nota i diagnosi que falten.

`actualitzarProcedimentsProjecte()` permet corregir el banc curricular ja existent sense recrear-lo: sincronitza la guia de resposta, el mode de càlcul o raonament, `PassosMinims`, `CriteriIA` i `SolucioModel`. Només actua sobre les files `CURR_*`; les activitats manuals, les construccions i totes les dades de l'alumnat queden intactes.

En `Usuaris`, el backend afegeix automàticament al final la columna `CanvisAvatarDisponibles` si encara no existeix. Només conté `0` o `1`, no desplaça ni sobreescriu cap columna existent i no s'ha d'editar manualment.

L'enllaç de seguiment només es mostra en la pantalla inicial. Desapareix quan l'alumne entra en les missions o en una activitat. El panell docent valida la contrasenya en Apps Script i manté la sessió oberta durant un màxim de sis hores.

Les preguntes continuen acceptant HTML i MathJax. Firebase envia la pregunta completa només en entrar en un exercici; després actualitza únicament resposta, estat, ajudes i timestamp. La clau de `live` és l'identificador estable de l'alumne, no el dispositiu ni la sessió; no cal afegir cap columna al Google Sheet ni cap regla nova per a este canvi.

Firebase és un suport de seguiment, no el magatzem principal de respostes. Si temporalment falla o rebutja una escriptura, l'enviament a Apps Script i Google Sheets continua i l'alumne rep només un avís de seguiment no disponible.

Les construccions geomètriques no s'envien com una imatge pesada: la resposta de l'alumne es guarda en `Dades` com una llista JSON curta de coordenades, mentre Firebase rep les mateixes coordenades i una previsualització SVG compacta perquè el professor veja el dibuix. No cal afegir cap columna a `Dades`. `configurarProjecte()` crea al final de `Preguntes` les columnes `TipusInteraccio` i `ConfiguracioInteraccio`.

La pissarra i la vista matemàtica de l'alumne comparteixen el mateix conversor. Reconeix fraccions (`5/3`), potències, arrels, matrius (`mat(...)`), determinants (`det(...)`), sistemes (`sis(...)`), límits i integrals. L'esborrany de l'explicació queda guardat només en el navegador del professor.

El seguiment docent carrega `SolucioModel` mitjançant el catàleg privat d'Apps Script i la mostra oberta i renderitzada amb MathJax dins de cada targeta. Si no hi ha model, mostra almenys la resposta esperada publicada en la sessió. `SolucioModel` no s'escriu en Firebase ni s'envia a la interfície de l'alumnat.

La pestanya `Sectors` guarda l'ambientació i la pestanya `Missions` conté `SectorId` i `Desbloquejada`. `PlansNivell` només guarda les excepcions que marques per alumne i missió; sense excepció, sempre es fan les tres fases en ordre. `RevisionsDocents` conté únicament procediments que la IA no ha pogut decidir amb seguretat i `Diagnostic` conserva els informes de bloc. El mapa rep només les cinc missions del sector actual. Els reptes de la IA tenen `GeneradaIA=SI`: no compten dins de les activitats normals i només apareixen a l'alumne al qual els has aprovat.

`PreguntesBatalla` conserva cinc preguntes ràpides per missió. En iniciar una batalla, Apps Script envia a Firebase un paquet tancat amb pregunta, resposta esperada, opcions i pista; el navegador corregeix localment i només Firebase sincronitza el joc en temps real. Apps Script torna a intervindre una única vegada al final per guardar `Batalles`, `ResultatsBatalla`, `PremisBatalla` i les insígnies permanents. `AvatarsAlumnes` manté quins avatars ha desbloquejat cada alumne i els préstecs temporals de set dies.

## OpenAI

El backend usa `gpt-4o-mini` amb la Responses API i una eixida JSON estructurada. Les fórmules de les ajudes s'exigeixen en LaTeX delimitat i el navegador les renderitza amb MathJax. La fila `CorreccionsIAPerNivell` de `Configuracio` val inicialment `1`: l'últim exercici textual de cada bloc pot usar IA; els anteriors són `PROCEDIMENT_LOCAL`, exigeixen passos o justificació i es corregeixen sense xarxa ni cost d'OpenAI. Si el cinqué és una construcció geomètrica, la correcció amb IA passa al quart i el dibuix continua autocorregint-se localment. Les peticions repetides després d'un timeout reutilitzen el resultat i no sumen intents ni insígnies. Fitxa oficial del model: <https://developers.openai.com/api/docs/models/gpt-4o-mini>.
