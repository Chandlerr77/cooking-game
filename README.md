# Sizzle & Serve

A rush-hour kitchen game. You are the chef: read the tickets, grab ingredients, chop, grill and boil them, plate the dish and ring the bell before the customers lose patience.

An original game built for the make.fun cooking-game bounty. All art is vector shapes drawn on a canvas, all sound is synthesised with WebAudio, and there are no network requests.

## How to play

1. Tickets along the top show each dish and the ingredients it needs, with a countdown bar (green, then amber, then red).
2. Pick an ingredient from a bin. You hold one thing at a time.
3. Prep it: lettuce and tomato on the chopping board, patty and bacon on the grill, pasta in the pot. Pick the finished food back up when the green tick appears.
4. Put it on a plate. Bun, cheese, sauce and egg go on raw. When a plate matches a ticket it glows green.
5. Serve by clicking the ticket, ringing the bell or pressing Space. Faster service means bigger tips, and back-to-back serves build a combo.
6. A ticket that times out costs a star. Lose all three, or survive the three-minute shift, to reach the results screen. Orders come faster, get bigger and run shorter as the shift goes on.

Recipes: Classic Burger, Cheese Burger, Garden Salad, Pasta Marinara, Bacon & Egg Roll, Deluxe Burger.

## Controls

| Input | Action |
| --- | --- |
| Mouse | Click bins, stations, plates, tickets and the serve bell. Fully playable by mouse alone. |
| 1-9 | Pick up bun, patty, lettuce, tomato, cheese, pasta, sauce, egg, bacon |
| Q / W / E | Chopping board / grill / pot (place or collect) |
| R | Plating: add the held item to the active plate; with an empty hand, switch plate |
| X | Clear the active plate |
| Space | Serve the matching plate |
| P | Pause |
| M | Mute |
| Shift+R | Restart (during play) |
| R | Restart (on the pause and results screens) |
| H | How to play |

## Run it

```
node serve.ts            # http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`?scene=cover|assembly|serve|rush` loads a staged kitchen state for screenshots; it holds still until the first click or key.

## Layout

`game/src/`: `main.js` (loop), `state.js`, `recipes.js`, `orders.js`, `kitchen.js`, `timer.js`, `layout.js`, `input.js`, `render.js`, `food.js`, `audio.js`, `scenes.js`.

MIT licensed.
