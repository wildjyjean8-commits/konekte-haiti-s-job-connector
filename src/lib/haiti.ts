export type Option = { value: string; fr: string; ht: string };

export const DEPARTMENTS: { name: string; communes: string[] }[] = [
  {
    name: "Ouest",
    communes: [
      "Port-au-Prince", "Delmas", "Pétion-Ville", "Carrefour", "Tabarre", "Cité Soleil",
      "Kenscoff", "Gressier", "Croix-des-Bouquets", "Thomazeau", "Ganthier", "Cornillon",
      "Fonds-Verrettes", "Léogâne", "Grand-Goâve", "Petit-Goâve", "Arcahaie", "Cabaret",
      "Anse-à-Galets", "Pointe-à-Raquette",
    ],
  },
  {
    name: "Sud-Est",
    communes: [
      "Jacmel", "Marigot", "Cayes-Jacmel", "La Vallée", "Bainet", "Côtes-de-Fer",
      "Belle-Anse", "Grand-Gosier", "Thiotte", "Anse-à-Pitres",
    ],
  },
  {
    name: "Nord",
    communes: [
      "Cap-Haïtien", "Limonade", "Quartier-Morin", "Acul-du-Nord", "Plaine-du-Nord", "Milot",
      "Grande-Rivière-du-Nord", "Bahon", "Saint-Raphaël", "Dondon", "La Victoire", "Pignon",
      "Ranquitte", "Borgne", "Port-Margot", "Limbé", "Bas-Limbé", "Plaisance", "Pilate",
    ],
  },
  {
    name: "Nord-Est",
    communes: [
      "Fort-Liberté", "Ferrier", "Perches", "Ouanaminthe", "Capotille", "Mont-Organisé",
      "Trou-du-Nord", "Sainte-Suzanne", "Terrier-Rouge", "Caracol", "Vallières", "Carice",
      "Mombin-Crochu",
    ],
  },
  {
    name: "Nord-Ouest",
    communes: [
      "Port-de-Paix", "Bassin-Bleu", "Chansolme", "Île de la Tortue", "Saint-Louis-du-Nord",
      "Anse-à-Foleur", "Jean-Rabel", "Môle-Saint-Nicolas", "Bombardopolis", "Baie-de-Henne",
    ],
  },
  {
    name: "Artibonite",
    communes: [
      "Gonaïves", "Ennery", "L'Estère", "Saint-Marc", "Verrettes", "La Chapelle", "Liancourt",
      "Grande-Saline", "Desdunes", "Dessalines", "Petite-Rivière-de-l'Artibonite", "Marmelade",
      "Saint-Michel-de-l'Attalaye", "Gros-Morne", "Anse-Rouge", "Terre-Neuve",
    ],
  },
  {
    name: "Centre",
    communes: [
      "Hinche", "Maïssade", "Thomonde", "Cerca-Carvajal", "Mirebalais", "Saut-d'Eau",
      "Boucan-Carré", "Lascahobas", "Belladère", "Savanette", "Cerca-la-Source", "Thomassique",
    ],
  },
  {
    name: "Sud",
    communes: [
      "Les Cayes", "Torbeck", "Chantal", "Camp-Perrin", "Maniche", "Île-à-Vache", "Aquin",
      "Saint-Louis-du-Sud", "Cavaillon", "Saint-Jean-du-Sud", "Arniquet", "Coteaux",
      "Port-à-Piment", "Roche-à-Bateau", "Chardonnières", "Les Anglais", "Tiburon", "Port-Salut",
    ],
  },
  {
    name: "Grand'Anse",
    communes: [
      "Jérémie", "Abricots", "Bonbon", "Moron", "Chambellan", "Dame-Marie", "Anse-d'Hainault",
      "Les Irois", "Corail", "Pestel", "Roseaux", "Beaumont",
    ],
  },
  {
    name: "Nippes",
    communes: [
      "Miragoâne", "Fonds-des-Nègres", "Petite-Rivière-de-Nippes", "Paillant", "Anse-à-Veau",
      "L'Asile", "Petit-Trou-de-Nippes", "Arnaud", "Plaisance-du-Sud", "Baradères", "Grand-Boucan",
    ],
  },
];

export const DEPARTMENT_NAMES = DEPARTMENTS.map((d) => d.name);

export function communesOf(department?: string | null): string[] {
  if (!department) return [];
  return DEPARTMENTS.find((d) => d.name === department)?.communes ?? [];
}

export const SECTORS: Option[] = [
  { value: "agriculture", fr: "Agriculture & élevage", ht: "Agrikilti & elvaj" },
  { value: "agroalimentaire", fr: "Agroalimentaire", ht: "Agwo-alimantè" },
  { value: "construction", fr: "Construction / BTP", ht: "Konstriksyon / BTP" },
  { value: "commerce", fr: "Commerce & vente", ht: "Komès & vant" },
  { value: "technologie", fr: "Technologie & informatique", ht: "Teknoloji & enfòmatik" },
  { value: "sante", fr: "Santé", ht: "Sante" },
  { value: "education", fr: "Éducation & formation", ht: "Edikasyon & fòmasyon" },
  { value: "transport", fr: "Transport & logistique", ht: "Transpò & lojistik" },
  { value: "hotellerie", fr: "Hôtellerie & tourisme", ht: "Otèl & touris" },
  { value: "artisanat", fr: "Artisanat", ht: "Atizana" },
  { value: "finance", fr: "Services financiers", ht: "Sèvis finansye" },
  { value: "administration", fr: "Administration publique", ht: "Administrasyon piblik" },
  { value: "industrie", fr: "Industrie & manufacture", ht: "Endistri & manifakti" },
  { value: "ong", fr: "ONG & humanitaire", ht: "ONG & imanitè" },
  { value: "energie", fr: "Énergie", ht: "Enèji" },
  { value: "droit", fr: "Droit & juridique", ht: "Dwa & jiridik" },
  { value: "communication", fr: "Communication & marketing", ht: "Kominikasyon & maketing" },
  { value: "securite", fr: "Sécurité", ht: "Sekirite" },
  { value: "environnement", fr: "Environnement", ht: "Anviwònman" },
  { value: "peche", fr: "Pêche", ht: "Lapèch" },
  { value: "restauration", fr: "Restauration", ht: "Restorasyon" },
  { value: "immobilier", fr: "Immobilier", ht: "Imobilye" },
  { value: "sport_culture", fr: "Sport & culture", ht: "Espò & kilti" },
  { value: "autre", fr: "Autre", ht: "Lòt" },
];

export const CONTRACT_TYPES: Option[] = [
  { value: "full_time", fr: "Temps plein", ht: "Tan konplè" },
  { value: "part_time", fr: "Temps partiel", ht: "Tan pasyèl" },
  { value: "internship", fr: "Stage", ht: "Staj" },
  { value: "temporary", fr: "Contrat temporaire", ht: "Kontra tanporè" },
  { value: "freelance", fr: "Freelance / prestation", ht: "Frilans" },
  { value: "volunteer", fr: "Bénévolat", ht: "Volontarya" },
];

export const EXPERIENCE_LEVELS: Option[] = [
  { value: "none", fr: "Débutant accepté", ht: "Débitan aksepte" },
  { value: "junior", fr: "1 à 2 ans", ht: "1 a 2 zan" },
  { value: "mid", fr: "3 à 5 ans", ht: "3 a 5 an" },
  { value: "senior", fr: "5 ans et plus", ht: "5 an ak plis" },
];

export const APPLICATION_STATUSES: Option[] = [
  { value: "received", fr: "Reçue", ht: "Resevwa" },
  { value: "reviewing", fr: "En cours d'examen", ht: "N ap egzamine" },
  { value: "interview", fr: "Entretien programmé", ht: "Entèvyou pwograme" },
  { value: "accepted", fr: "Acceptée", ht: "Aksepte" },
  { value: "rejected", fr: "Refusée", ht: "Refize" },
];

export const AVAILABILITIES: Option[] = [
  { value: "immediate", fr: "Disponible immédiatement", ht: "Disponib kounye a" },
  { value: "two_weeks", fr: "Sous 2 semaines", ht: "Nan 2 semèn" },
  { value: "one_month", fr: "Sous 1 mois", ht: "Nan 1 mwa" },
  { value: "flexible", fr: "Flexible", ht: "Fleksib" },
];

export const LANGUAGES_SPOKEN = ["Créole", "Français", "Anglais", "Espagnol"];

export function labelOf(list: Option[], value?: string | null, lang: "fr" | "ht" = "fr") {
  if (!value) return "";
  const o = list.find((x) => x.value === value);
  return o ? o[lang] : value;
}
