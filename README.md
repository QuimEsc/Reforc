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
- Pissarra docent d'explicacions a pantalla gran, accessible des de seguiment, amb conversió en directe de text pla a MathJax.
- Accés al seguiment amb una contrasenya modificable en el Google Sheet, pestanya `Contrasenya`, cel·la `A2`.
- Comentaris individuals i globals.
- Control de focus per sessió de 55 minuts:
  - primera eixida: avís;
  - següents eixides: enviament de la resposta actual.
- Set insígnies il·lustrades per treball, procés, constància, ús d'ajudes i ampliació; sense rànquing. Les últimes es veuen al panell i la col·lecció completa al perfil.
- Objectiu cooperatiu de classe alimentat per activitats individuals.
- Pistes preparades i ajuda d'OpenAI amb MathJax.
- Correcció de procediments amb IA, eixida estructurada i cua docent només per als casos dubtosos. Si la IA falla, la resposta es guarda i l'alumne continua.
- Editor geomètric tàctil sobre quadrícula per construir punts, segments, angles, polígons, simetries, girs, translacions i circumferències. El banc inclou 45 construccions autocorregibles i el seguiment mostra la figura completa en temps real.
- Reptes d'ampliació generats per IA per a qui completa cinc exercicis correctes en menys del temps configurat. El professor els ha d'aprovar, editar o rebutjar; són individuals i, si es completen bé, concedeixen la insígnia «Cometa veloç».
- Mode de ruta automàtica configurable com `DESACTIVADA`, `SUGGERIR` o `AUTOMATICA`.
- Mode batalla de classe, amb les 15 preguntes de la missió del dia, set minuts, cofres i classificació en directe.
- Batalla final de sector disponible en la missió 5: deu minuts i 20 preguntes de repàs, exactament quatre de cadascuna de les cinc missions.
- Les preguntes, solucions, opcions i pistes es carreguen totes abans del compte arrere. Durant la partida no es consulta Apps Script ni OpenAI per corregir cada resposta.
- La classificació en directe només apareix en seguiment docent. Durant els últims 20 segons també s'oculta al professor amb una animació de cambra segellada. La pantalla de l'alumnat queda dedicada a la pregunta, l'or propi i els cofres.
- Per reduir trànsit de Firebase, cada alumne escolta només la configuració general, les preguntes, els seus propis punts i els duels. Només el seguiment docent escolta la taula completa de jugadors.
- Historial docent d'insígnies obtingudes per alumne durant els últims 7 i 31 dies.

## Prova sense configurar res

Obri `demo.html` per entrar a la pantalla de demostració o, si ho prefereixes, usa directament:

- `index.html?demo=1`
- `seguiment.html?demo=1`
- `index.html?demo=1&battle=1` per entrar directament en una batalla simulada
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

## Model de dades

`Dades` conserva en les primeres 14 columnes l'estructura familiar del sistema anterior, inclosa `MotiuEnviament` en la columna N. Els camps nous comencen en O. El backend treballa pels noms de les capçaleres i no per posicions fixes.

En `Usuaris`, el backend afegeix automàticament al final la columna `CanvisAvatarDisponibles` si encara no existeix. Només conté `0` o `1`, no desplaça ni sobreescriu cap columna existent i no s'ha d'editar manualment.

L'enllaç de seguiment només es mostra en la pantalla inicial. Desapareix quan l'alumne entra en les missions o en una activitat. El panell docent valida la contrasenya en Apps Script i manté la sessió oberta durant un màxim de sis hores.

Les preguntes continuen acceptant HTML i MathJax. Firebase envia la pregunta completa només en entrar en un exercici; després actualitza únicament resposta, estat, ajudes i timestamp.

Firebase és un suport de seguiment, no el magatzem principal de respostes. Si temporalment falla o rebutja una escriptura, l'enviament a Apps Script i Google Sheets continua i l'alumne rep només un avís de seguiment no disponible.

Les construccions geomètriques no s'envien com una imatge pesada: la resposta de l'alumne es guarda en `Dades` com una llista JSON curta de coordenades, mentre Firebase rep les mateixes coordenades i una previsualització SVG compacta perquè el professor veja el dibuix. No cal afegir cap columna a `Dades`. `configurarProjecte()` crea al final de `Preguntes` les columnes `TipusInteraccio` i `ConfiguracioInteraccio`.

La pissarra i la vista matemàtica de l'alumne comparteixen el mateix conversor. Reconeix fraccions (`5/3`), potències, arrels, matrius (`mat(...)`), determinants (`det(...)`), sistemes (`sis(...)`), límits i integrals. L'esborrany de l'explicació queda guardat només en el navegador del professor.

La pestanya `Sectors` guarda l'ambientació i la pestanya `Missions` conté `SectorId` i `Desbloquejada`. `PlansNivell` només guarda les excepcions que marques per alumne i missió; sense excepció, sempre es fan les tres fases en ordre. `RevisionsDocents` conté únicament procediments que la IA no ha pogut decidir amb seguretat. El mapa rep només les cinc missions del sector actual. Els reptes de la IA tenen `GeneradaIA=SI`: no compten dins de les activitats normals i només apareixen a l'alumne al qual els has aprovat.

`PreguntesBatalla` conserva cinc preguntes ràpides per missió. En iniciar una batalla, Apps Script envia a Firebase un paquet tancat amb pregunta, resposta esperada, opcions i pista; el navegador corregeix localment i només Firebase sincronitza el joc en temps real. Apps Script torna a intervindre una única vegada al final per guardar `Batalles`, `ResultatsBatalla`, `PremisBatalla` i les insígnies permanents. `AvatarsAlumnes` manté quins avatars ha desbloquejat cada alumne i els préstecs temporals de set dies.

## OpenAI

El backend usa `gpt-4o-mini` amb la Responses API i una eixida JSON estructurada. Les fórmules de les ajudes s'exigeixen en LaTeX delimitat i el navegador les renderitza amb MathJax. Fitxa oficial del model: <https://developers.openai.com/api/docs/models/gpt-4o-mini>.
