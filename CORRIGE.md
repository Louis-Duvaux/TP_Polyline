# Corrigé du TP Statecharts

## Partie 1 — Rubber banding

### `pages/simplerubber`

- **Q1.** L'état de la machine est contenu dans la variable `currentState`. Les états possibles sont regroupés dans l'objet `States`, avec `IDLE: 0` et `DRAWING: 1`.
- **Q2.** La structure algorithmique est une série de tests conditionnels `if / else` dans les gestionnaires d'événements `click` et `mousemove`. Ces tests consultent `currentState` pour choisir l'action à exécuter.

### `pages/statepatternrubber`

- **Q3.** Les états sont représentés par des objets qui sont des instances de classes concrètes (`IdleState` et `DrawingState`), dérivées de la classe `State`. Chaque classe définit le comportement associé aux événements qu'elle sait traiter.
- **Q4.** La série de tests conditionnels a été remplacée par une délégation polymorphe : chaque événement est transmis à `currentState`, qui exécute `handleMouseClick` ou `handleMouseMove`.

### `pages/xstaterubber`

- **Q5.** Dans l'objet passé à `createMachine` :
  - état : `idle` ;
  - événement : `MOUSECLICK` ;
  - transition : `target: "drawing"`.
- **Q6.** La transition de `drawing` vers `idle` est déclenchée par `MOUSECLICK`. Son action est `saveLine`.
- **Q7.** La ligne modifiée est celle qui définit la couleur dans l'action `saveLine` :
  ```js
  rubber.stroke("blue");
  ```
  La couleur d'enregistrement est ainsi devenue bleue au lieu de noire.
- **Q8.** xState sépare clairement les états, les événements, les transitions, les actions et les gardes. Le statechart est plus lisible, vérifiable visuellement et plus facile à faire évoluer que les tests conditionnels ou la délégation manuelle.

### Q9 — Matrice États × Événements

| État courant | `MOUSECLICK` | `MOUSEMOVE` |
|---|---|---|
| `idle` | créer la ligne, aller à `drawing` | aucune transition |
| `drawing` | sauvegarder la ligne, aller à `idle` | mettre à jour le dernier point, rester dans `drawing` |

## Partie 2 — Polyline

### Statechart

| État courant | Événement | Garde | Action | État cible |
|---|---|---|---|---|
| `idle` | `MOUSECLICK` | — | `createLine` | `drawing` |
| `drawing` | `MOUSEMOVE` | — | `setLastPoint` | `drawing` |
| `drawing` | `MOUSECLICK` | `pasPlein` | `addPoint` | `drawing` |
| `drawing` | `Backspace` | `plusDeDeuxPoints` | `removeLastPoint` | `drawing` |
| `drawing` | `Enter` | `plusDeDeuxPoints` | `saveLine` | `idle` |
| `drawing` | `Escape` | — | `abandon` | `idle` |

Le dernier point du tableau Konva est provisoire. La garde `pasPlein` autorise donc l'ajout tant que le nombre de points du tableau, qui inclut ce point provisoire, reste inférieur ou égal à `MAX_POINTS + 1`.

### Cas testés

- premier clic : création de la polyline et passage à `drawing` ;
- déplacement de la souris : déplacement du point provisoire ;
- clics successifs : ajout de points jusqu'à `MAX_POINTS` ;
- `Backspace` : suppression du dernier point lorsque la polyline contient au moins deux points enregistrés ;
- `Enter` avec moins de deux points : aucun enregistrement ;
- `Enter` avec au moins deux points : enregistrement et retour à `idle` ;
- `Escape` : suppression de la polyline en cours et retour à `idle`.
