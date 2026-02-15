// Lebensmittel-Datenbank nach Kategorien
const INGREDIENTS = {
  "Gemüse": [
    "Kartoffeln", "Tomaten", "Zwiebeln", "Paprika", "Zucchini",
    "Brokkoli", "Karotten", "Spinat", "Champignons", "Aubergine",
    "Blumenkohl", "Lauch", "Knoblauch", "Gurke", "Erbsen",
    "Bohnen", "Kürbis", "Süßkartoffeln", "Sellerie", "Mais"
  ],
  "Obst": [
    "Äpfel", "Bananen", "Zitronen", "Orangen", "Beeren",
    "Avocado", "Mango", "Birnen", "Ananas", "Trauben"
  ],
  "Fleisch & Fisch": [
    "Hähnchenbrust", "Hackfleisch", "Rindfleisch", "Schweinefilet",
    "Lachs", "Thunfisch", "Garnelen", "Putenbrust", "Würstchen", "Speck"
  ],
  "Milchprodukte": [
    "Milch", "Butter", "Sahne", "Käse", "Joghurt",
    "Frischkäse", "Mozzarella", "Parmesan", "Schmand", "Quark"
  ],
  "Getreide & Beilagen": [
    "Nudeln", "Reis", "Brot", "Mehl", "Haferflocken",
    "Couscous", "Kartoffelpüree", "Tortillas", "Bulgur", "Linsen"
  ],
  "Sonstiges": [
    "Eier", "Tofu", "Kokosmilch", "Sojasauce", "Olivenöl",
    "Passierte Tomaten", "Senf", "Honig", "Nüsse", "Brühe"
  ]
};

// Rezept-Datenbank
const RECIPES = [
  {
    name: "Spaghetti Bolognese",
    ingredients: ["Nudeln", "Hackfleisch", "Tomaten", "Zwiebeln", "Knoblauch", "Passierte Tomaten"],
    spices: ["Oregano", "Basilikum", "Salz", "Pfeffer", "Paprikapulver"],
    description: "Klassische Spaghetti mit reichhaltiger Hackfleisch-Tomatensauce.",
    servings: 4,
    difficulty: "Einfach"
  },
  {
    name: "Gemüsecurry mit Reis",
    ingredients: ["Reis", "Paprika", "Zucchini", "Kokosmilch", "Zwiebeln", "Knoblauch"],
    spices: ["Currypulver", "Kurkuma", "Kreuzkümmel", "Ingwer", "Chili", "Salz"],
    description: "Cremiges Gemüsecurry mit Kokosmilch, serviert auf duftendem Reis.",
    servings: 4,
    difficulty: "Einfach"
  },
  {
    name: "Hähnchen-Gemüse-Pfanne",
    ingredients: ["Hähnchenbrust", "Paprika", "Zucchini", "Champignons", "Zwiebeln", "Reis"],
    spices: ["Paprikapulver", "Knoblauchpulver", "Salz", "Pfeffer", "Thymian"],
    description: "Bunte Pfanne mit zartem Hähnchen und frischem Gemüse.",
    servings: 3,
    difficulty: "Einfach"
  },
  {
    name: "Kartoffelgratin",
    ingredients: ["Kartoffeln", "Sahne", "Käse", "Butter", "Knoblauch"],
    spices: ["Muskatnuss", "Salz", "Pfeffer", "Thymian"],
    description: "Goldbraun überbackene Kartoffelscheiben in cremiger Sahnesauce.",
    servings: 4,
    difficulty: "Mittel"
  },
  {
    name: "Lachs mit Brokkoli",
    ingredients: ["Lachs", "Brokkoli", "Zitronen", "Butter", "Reis"],
    spices: ["Dill", "Salz", "Pfeffer", "Zitronenpfeffer"],
    description: "Gebratener Lachs mit gedämpftem Brokkoli und Zitronenbutter.",
    servings: 2,
    difficulty: "Einfach"
  },
  {
    name: "Spinat-Ricotta-Nudeln",
    ingredients: ["Nudeln", "Spinat", "Frischkäse", "Knoblauch", "Parmesan"],
    spices: ["Muskatnuss", "Salz", "Pfeffer", "Chiliflocken"],
    description: "Cremige Nudeln mit frischem Spinat und Frischkäse-Sauce.",
    servings: 3,
    difficulty: "Einfach"
  },
  {
    name: "Chili con Carne",
    ingredients: ["Hackfleisch", "Bohnen", "Tomaten", "Mais", "Zwiebeln", "Paprika", "Knoblauch"],
    spices: ["Kreuzkümmel", "Chili", "Paprikapulver", "Oregano", "Salz", "Pfeffer"],
    description: "Würziges Chili mit Hackfleisch, Bohnen und Mais.",
    servings: 5,
    difficulty: "Einfach"
  },
  {
    name: "Kürbissuppe",
    ingredients: ["Kürbis", "Zwiebeln", "Kartoffeln", "Sahne", "Knoblauch", "Brühe"],
    spices: ["Muskatnuss", "Ingwer", "Salz", "Pfeffer", "Kürbiskernöl"],
    description: "Samtige Kürbissuppe mit einem Hauch von Muskatnuss.",
    servings: 4,
    difficulty: "Einfach"
  },
  {
    name: "Putenbrust mit Süßkartoffeln",
    ingredients: ["Putenbrust", "Süßkartoffeln", "Spinat", "Olivenöl", "Knoblauch"],
    spices: ["Rosmarin", "Thymian", "Salz", "Pfeffer", "Paprikapulver"],
    description: "Saftige Putenbrust mit gebackenen Süßkartoffeln und Spinat.",
    servings: 2,
    difficulty: "Mittel"
  },
  {
    name: "Tomaten-Mozzarella-Salat",
    ingredients: ["Tomaten", "Mozzarella", "Olivenöl", "Avocado"],
    spices: ["Basilikum", "Salz", "Pfeffer", "Balsamico"],
    description: "Frischer Caprese-Salat mit cremiger Avocado.",
    servings: 2,
    difficulty: "Einfach"
  },
  {
    name: "Kartoffelpuffer",
    ingredients: ["Kartoffeln", "Eier", "Mehl", "Zwiebeln"],
    spices: ["Salz", "Pfeffer", "Muskatnuss"],
    description: "Knusprige Kartoffelpuffer, serviert mit Apfelmus oder Schmand.",
    servings: 3,
    difficulty: "Einfach"
  },
  {
    name: "Garnelen-Pasta",
    ingredients: ["Nudeln", "Garnelen", "Knoblauch", "Tomaten", "Sahne", "Olivenöl"],
    spices: ["Chiliflocken", "Petersilie", "Salz", "Pfeffer", "Zitrone"],
    description: "Elegante Pasta mit saftigen Garnelen in Knoblauch-Sahne-Sauce.",
    servings: 2,
    difficulty: "Mittel"
  },
  {
    name: "Blumenkohl-Auflauf",
    ingredients: ["Blumenkohl", "Käse", "Sahne", "Eier", "Butter"],
    spices: ["Muskatnuss", "Salz", "Pfeffer", "Schnittlauch"],
    description: "Cremig überbackener Blumenkohl mit goldener Käsekruste.",
    servings: 4,
    difficulty: "Einfach"
  },
  {
    name: "Tacos mit Hackfleisch",
    ingredients: ["Tortillas", "Hackfleisch", "Tomaten", "Käse", "Zwiebeln", "Avocado"],
    spices: ["Kreuzkümmel", "Chili", "Paprikapulver", "Koriander", "Salz", "Limette"],
    description: "Knackige Tacos gefüllt mit würzigem Hackfleisch und frischen Toppings.",
    servings: 4,
    difficulty: "Einfach"
  },
  {
    name: "Linsensuppe",
    ingredients: ["Linsen", "Karotten", "Zwiebeln", "Kartoffeln", "Knoblauch", "Brühe"],
    spices: ["Kreuzkümmel", "Kurkuma", "Salz", "Pfeffer", "Lorbeerblatt"],
    description: "Herzhafte Linsensuppe mit Gemüse – nahrhaft und wärmend.",
    servings: 4,
    difficulty: "Einfach"
  },
  {
    name: "Schweinefilet mit Champignons",
    ingredients: ["Schweinefilet", "Champignons", "Sahne", "Zwiebeln", "Kartoffeln"],
    spices: ["Thymian", "Rosmarin", "Salz", "Pfeffer", "Senf"],
    description: "Zartes Schweinefilet in cremiger Champignon-Rahmsauce.",
    servings: 3,
    difficulty: "Mittel"
  },
  {
    name: "Couscous-Salat",
    ingredients: ["Couscous", "Paprika", "Gurke", "Tomaten", "Zitronen", "Olivenöl"],
    spices: ["Minze", "Petersilie", "Kreuzkümmel", "Salz", "Pfeffer"],
    description: "Leichter Couscous-Salat mit knackigem Gemüse und frischen Kräutern.",
    servings: 3,
    difficulty: "Einfach"
  },
  {
    name: "Auberginen-Lasagne",
    ingredients: ["Aubergine", "Passierte Tomaten", "Mozzarella", "Parmesan", "Knoblauch", "Zwiebeln"],
    spices: ["Oregano", "Basilikum", "Salz", "Pfeffer", "Thymian"],
    description: "Vegetarische Lasagne mit Auberginen statt Nudelplatten.",
    servings: 4,
    difficulty: "Mittel"
  },
  {
    name: "Thunfisch-Wraps",
    ingredients: ["Tortillas", "Thunfisch", "Mais", "Paprika", "Joghurt", "Gurke"],
    spices: ["Dill", "Salz", "Pfeffer", "Zitrone"],
    description: "Schnelle Wraps gefüllt mit Thunfischsalat und knackigem Gemüse.",
    servings: 2,
    difficulty: "Einfach"
  },
  {
    name: "Ofengemüse mit Feta",
    ingredients: ["Zucchini", "Paprika", "Süßkartoffeln", "Tomaten", "Olivenöl"],
    spices: ["Rosmarin", "Thymian", "Oregano", "Salz", "Pfeffer", "Knoblauchpulver"],
    description: "Bunt geröstetes Ofengemüse mit zerbröseltem Feta.",
    servings: 3,
    difficulty: "Einfach"
  },
  {
    name: "Eierpfannkuchen",
    ingredients: ["Eier", "Mehl", "Milch", "Butter", "Äpfel"],
    spices: ["Zimt", "Vanillezucker", "Salz", "Zucker"],
    description: "Goldene Pfannkuchen mit karamellisierten Äpfeln.",
    servings: 3,
    difficulty: "Einfach"
  },
  {
    name: "Rindfleisch-Eintopf",
    ingredients: ["Rindfleisch", "Kartoffeln", "Karotten", "Zwiebeln", "Sellerie", "Brühe"],
    spices: ["Lorbeerblatt", "Thymian", "Rosmarin", "Salz", "Pfeffer", "Paprikapulver"],
    description: "Deftiger Eintopf mit zartem Rindfleisch und Wurzelgemüse.",
    servings: 5,
    difficulty: "Mittel"
  },
  {
    name: "Bananen-Haferflocken-Frühstück",
    ingredients: ["Haferflocken", "Bananen", "Milch", "Honig", "Nüsse"],
    spices: ["Zimt", "Vanillezucker"],
    description: "Gesundes Frühstück mit cremigen Haferflocken und frischen Bananen.",
    servings: 2,
    difficulty: "Einfach"
  },
  {
    name: "Lauch-Kartoffel-Suppe",
    ingredients: ["Lauch", "Kartoffeln", "Sahne", "Butter", "Brühe"],
    spices: ["Muskatnuss", "Salz", "Pfeffer", "Schnittlauch"],
    description: "Samtige Suppe aus Lauch und Kartoffeln mit einem Schuss Sahne.",
    servings: 4,
    difficulty: "Einfach"
  },
  {
    name: "Tofu-Gemüse-Wok",
    ingredients: ["Tofu", "Paprika", "Karotten", "Champignons", "Sojasauce", "Reis"],
    spices: ["Ingwer", "Knoblauchpulver", "Sesamöl", "Chiliflocken", "Salz"],
    description: "Knuspriger Tofu mit buntem Wok-Gemüse in würziger Sauce.",
    servings: 3,
    difficulty: "Einfach"
  },
  {
    name: "Quark-Kartoffeln",
    ingredients: ["Kartoffeln", "Quark", "Zwiebeln", "Gurke", "Olivenöl"],
    spices: ["Schnittlauch", "Salz", "Pfeffer", "Kümmel"],
    description: "Einfache Pellkartoffeln mit cremigem Kräuterquark.",
    servings: 2,
    difficulty: "Einfach"
  },
  {
    name: "Birnen-Käse-Salat",
    ingredients: ["Birnen", "Käse", "Nüsse", "Spinat", "Honig"],
    spices: ["Pfeffer", "Salz", "Balsamico"],
    description: "Eleganter Salat mit süßen Birnen, würzigem Käse und Walnüssen.",
    servings: 2,
    difficulty: "Einfach"
  },
  {
    name: "Speck-Erbsen-Risotto",
    ingredients: ["Reis", "Erbsen", "Speck", "Zwiebeln", "Parmesan", "Brühe"],
    spices: ["Salz", "Pfeffer", "Muskatnuss", "Petersilie"],
    description: "Cremiges Risotto mit knusprigem Speck und süßen Erbsen.",
    servings: 3,
    difficulty: "Mittel"
  },
  {
    name: "Mango-Hähnchen-Bowl",
    ingredients: ["Hähnchenbrust", "Mango", "Reis", "Avocado", "Karotten"],
    spices: ["Sojasauce", "Sesamöl", "Ingwer", "Limette", "Chiliflocken"],
    description: "Frische Bowl mit gegrilltem Hähnchen, Mango und Avocado.",
    servings: 2,
    difficulty: "Einfach"
  },
  {
    name: "Bulgur-Salat",
    ingredients: ["Bulgur", "Tomaten", "Gurke", "Zwiebeln", "Zitronen", "Olivenöl"],
    spices: ["Petersilie", "Minze", "Sumach", "Salz", "Pfeffer"],
    description: "Orientalischer Bulgur-Salat nach Kisir-Art mit frischen Kräutern.",
    servings: 4,
    difficulty: "Einfach"
  }
];
