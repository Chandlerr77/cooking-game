// Ingredient, station and recipe data. Items are { id, form }; a plate holds item keys.

export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', color: '#e0a458' },
  { id: 'patty', name: 'Patty', color: '#b5483a' },
  { id: 'lettuce', name: 'Lettuce', color: '#7bc74d' },
  { id: 'tomato', name: 'Tomato', color: '#e0402f' },
  { id: 'cheese', name: 'Cheese', color: '#f6c63d' },
  { id: 'pasta', name: 'Pasta', color: '#f0d98a' },
  { id: 'sauce', name: 'Sauce', color: '#c4271f' },
  { id: 'egg', name: 'Egg', color: '#fff3d6' },
  { id: 'bacon', name: 'Bacon', color: '#c9605a' },
];

// What each station does: which ingredients it takes, the form they come out in, and seconds needed.
export const STATIONS = {
  chop: { name: 'Chopping Board', key: 'Q', verb: 'Chop', accepts: ['lettuce', 'tomato'], form: 'chopped', time: 2, slots: 1 },
  grill: { name: 'Grill', key: 'W', verb: 'Grill', accepts: ['patty', 'bacon'], form: 'grilled', time: 3, slots: 2 },
  pot: { name: 'Pot', key: 'E', verb: 'Boil', accepts: ['pasta'], form: 'boiled', time: 3, slots: 1 },
};

export const RECIPES = [
  { id: 'pasta', name: 'Pasta Marinara', price: 30, tier: 0, needs: ['pasta.boiled', 'sauce'] },
  { id: 'salad', name: 'Garden Salad', price: 35, tier: 0, needs: ['lettuce.chopped', 'tomato.chopped', 'cheese'] },
  { id: 'roll', name: 'Bacon & Egg Roll', price: 40, tier: 0, needs: ['bun', 'bacon.grilled', 'egg'] },
  { id: 'cheese', name: 'Cheese Burger', price: 50, tier: 1, needs: ['bun', 'patty.grilled', 'cheese', 'tomato.chopped'] },
  { id: 'classic', name: 'Classic Burger', price: 55, tier: 1, needs: ['bun', 'patty.grilled', 'lettuce.chopped', 'tomato.chopped'] },
  { id: 'deluxe', name: 'Deluxe Burger', price: 90, tier: 2, needs: ['bun', 'patty.grilled', 'cheese', 'bacon.grilled', 'lettuce.chopped', 'tomato.chopped'] },
];

export const PLATE_CAPACITY = 6;

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

export function itemKey(item) {
  return item.form === 'raw' ? item.id : `${item.id}.${item.form}`;
}

export function keyParts(key) {
  const [id, form] = key.split('.');
  return { id, form: form || 'raw' };
}

export function stationFor(ingredientId) {
  return Object.keys(STATIONS).find((name) => STATIONS[name].accepts.includes(ingredientId)) || null;
}

// Ingredients that need a station first cannot go on a plate raw.
export function canPlate(item) {
  return item.form !== 'raw' || stationFor(item.id) === null;
}
