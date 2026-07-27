import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "fr" | "ht";

type Dict = Record<string, { fr: string; ht: string }>;

export const DICT: Dict = {
  "app.tagline": { fr: "Le travail près de chez vous, partout en Haïti", ht: "Travay toupre lakay ou, toupatou an Ayiti" },
  "nav.jobs": { fr: "Offres", ht: "Òf travay" },
  "nav.candidates": { fr: "Candidats", ht: "Kandida" },
  "nav.messages": { fr: "Messages", ht: "Mesaj" },
  "nav.notifications": { fr: "Notifications", ht: "Notifikasyon" },
  "nav.dashboard": { fr: "Tableau de bord", ht: "Tablo bò" },
  "nav.profile": { fr: "Mon profil", ht: "Pwofil mwen" },
  "nav.institution": { fr: "Mon institution", ht: "Enstitisyon mwen" },
  "nav.signin": { fr: "Se connecter", ht: "Konekte" },
  "nav.signout": { fr: "Se déconnecter", ht: "Dekonekte" },
  "nav.postjob": { fr: "Publier une offre", ht: "Pibliye yon òf" },
  "nav.home": { fr: "Accueil", ht: "Akèy" },

  "home.hero.title": { fr: "Trouvez du travail. Trouvez les bonnes personnes.", ht: "Jwenn travay. Jwenn bon moun yo." },
  "home.hero.sub": {
    fr: "KONEKTE relie les institutions et les chercheurs d'emploi dans les 10 départements d'Haïti, dans tous les secteurs.",
    ht: "KONEKTE konekte enstitisyon ak moun k ap chèche travay nan 10 depatman Ayiti yo, nan tout sektè.",
  },
  "home.cta.seeker": { fr: "Je cherche du travail", ht: "M ap chèche travay" },
  "home.cta.institution": { fr: "Je recrute", ht: "M ap rekrite" },
  "home.latest": { fr: "Offres récentes", ht: "Dènye òf yo" },
  "home.sectors": { fr: "Parcourir par secteur", ht: "Gade pa sektè" },
  "home.how": { fr: "Comment ça marche", ht: "Kijan sa mache" },

  "search.keyword": { fr: "Poste, compétence, institution…", ht: "Pòs, konpetans, enstitisyon…" },
  "search.button": { fr: "Rechercher", ht: "Chèche" },
  "filter.sector": { fr: "Secteur", ht: "Sektè" },
  "filter.department": { fr: "Département", ht: "Depatman" },
  "filter.commune": { fr: "Commune", ht: "Komin" },
  "filter.contract": { fr: "Type de contrat", ht: "Tip kontra" },
  "filter.experience": { fr: "Expérience", ht: "Eksperyans" },
  "filter.all": { fr: "Tous", ht: "Tout" },
  "filter.reset": { fr: "Réinitialiser", ht: "Remete" },

  "job.apply": { fr: "Postuler en un clic", ht: "Poze kandidati w" },
  "job.applied": { fr: "Candidature envoyée", ht: "Kandidati voye" },
  "job.save": { fr: "Sauvegarder", ht: "Sere" },
  "job.saved": { fr: "Sauvegardée", ht: "Sere" },
  "job.contact": { fr: "Contacter directement", ht: "Kontakte dirèkteman" },
  "job.message": { fr: "Envoyer un message", ht: "Voye yon mesaj" },
  "job.views": { fr: "vues", ht: "vi" },
  "job.none": { fr: "Aucune offre ne correspond à votre recherche.", ht: "Pa gen òf ki koresponn ak rechèch ou." },
  "job.deadline": { fr: "Date limite", ht: "Dat limit" },
  "job.published": { fr: "Publiée", ht: "Pibliye" },
  "job.description": { fr: "Description du poste", ht: "Deskripsyon pòs la" },
  "job.coverletter": { fr: "Message d'accompagnement", ht: "Mesaj akonpayman" },
  "job.cvattached": { fr: "Votre CV sera automatiquement joint.", ht: "CV ou ap tache otomatikman." },

  "auth.title": { fr: "Bienvenue sur KONEKTE", ht: "Byenveni sou KONEKTE" },
  "auth.signin": { fr: "Connexion", ht: "Koneksyon" },
  "auth.signup": { fr: "Créer un compte", ht: "Kreye yon kont" },
  "auth.email": { fr: "Email", ht: "Imèl" },
  "auth.phone": { fr: "Téléphone", ht: "Telefòn" },
  "auth.password": { fr: "Mot de passe", ht: "Modpas" },
  "auth.fullname": { fr: "Nom complet", ht: "Non konplè" },
  "auth.role": { fr: "Je suis…", ht: "Mwen se…" },
  "auth.role.seeker": { fr: "Chercheur d'emploi", ht: "Moun k ap chèche travay" },
  "auth.role.institution": { fr: "Institution / Employeur", ht: "Enstitisyon / Anplwayè" },
  "auth.google": { fr: "Continuer avec Google", ht: "Kontinye ak Google" },
  "auth.or": { fr: "ou", ht: "oswa" },

  "profile.title": { fr: "Mon profil", ht: "Pwofil mwen" },
  "profile.headline": { fr: "Titre professionnel", ht: "Tit pwofesyonèl" },
  "profile.bio": { fr: "Présentation", ht: "Prezantasyon" },
  "profile.skills": { fr: "Compétences", ht: "Konpetans" },
  "profile.experience": { fr: "Expérience professionnelle", ht: "Eksperyans pwofesyonèl" },
  "profile.education": { fr: "Formation & diplômes", ht: "Fòmasyon & diplòm" },
  "profile.languages": { fr: "Langues parlées", ht: "Lang yo pale" },
  "profile.availability": { fr: "Disponibilité", ht: "Disponiblite" },
  "profile.searchable": { fr: "Rendre mon profil visible par les institutions", ht: "Kite enstitisyon yo wè pwofil mwen" },
  "profile.save": { fr: "Enregistrer", ht: "Anrejistre" },
  "profile.saved": { fr: "Profil enregistré", ht: "Pwofil anrejistre" },

  "cv.title": { fr: "Mon CV", ht: "CV mwen" },
  "cv.upload": { fr: "Téléverser mon CV (PDF ou Word)", ht: "Voye CV mwen (PDF oswa Word)" },
  "cv.replace": { fr: "Remplacer le CV", ht: "Ranplase CV a" },
  "cv.download": { fr: "Télécharger", ht: "Telechaje" },
  "cv.generate": { fr: "Générer un CV depuis mon profil", ht: "Kreye yon CV ak pwofil mwen" },
  "cv.none": { fr: "Aucun CV téléversé pour le moment.", ht: "Pa gen CV ankò." },
  "cv.limit": { fr: "PDF ou Word, 5 Mo maximum.", ht: "PDF oswa Word, 5 Mo maksimòm." },
  "cv.badformat": { fr: "Format non supporté. Utilisez PDF, DOC ou DOCX.", ht: "Fòma sa a pa aksepte. Sèvi ak PDF, DOC oswa DOCX." },
  "cv.toobig": { fr: "Fichier trop volumineux (5 Mo maximum).", ht: "Fichye a twò gwo (5 Mo maksimòm)." },

  "inst.title": { fr: "Profil de l'institution", ht: "Pwofil enstitisyon an" },
  "inst.name": { fr: "Nom de l'institution", ht: "Non enstitisyon an" },
  "inst.logo": { fr: "Logo", ht: "Logo" },
  "inst.website": { fr: "Site web", ht: "Sit entènèt" },
  "inst.contactpublic": { fr: "Afficher publiquement mon téléphone / WhatsApp", ht: "Montre telefòn / WhatsApp mwen piblikman" },
  "inst.create": { fr: "Créer mon institution", ht: "Kreye enstitisyon mwen" },

  "dash.applications": { fr: "Candidatures", ht: "Kandidati" },
  "dash.myapplications": { fr: "Mes candidatures", ht: "Kandidati mwen yo" },
  "dash.savedjobs": { fr: "Offres sauvegardées", ht: "Òf ki sere" },
  "dash.alerts": { fr: "Alertes emploi", ht: "Alèt travay" },
  "dash.myjobs": { fr: "Mes offres", ht: "Òf mwen yo" },
  "dash.stats": { fr: "Statistiques", ht: "Estatistik" },
  "dash.empty": { fr: "Rien à afficher pour l'instant.", ht: "Pa gen anyen pou montre pou kounye a." },

  "msg.title": { fr: "Messagerie", ht: "Mesajri" },
  "msg.placeholder": { fr: "Écrire un message…", ht: "Ekri yon mesaj…" },
  "msg.send": { fr: "Envoyer", ht: "Voye" },
  "msg.empty": { fr: "Aucune conversation pour le moment.", ht: "Pa gen konvèsasyon pou kounye a." },
  "msg.select": { fr: "Sélectionnez une conversation", ht: "Chwazi yon konvèsasyon" },

  "notif.empty": { fr: "Aucune notification.", ht: "Pa gen notifikasyon." },
  "notif.markall": { fr: "Tout marquer comme lu", ht: "Make tout kòm li" },

  "cand.title": { fr: "Rechercher des profils", ht: "Chèche pwofil" },
  "cand.contact": { fr: "Contacter", ht: "Kontakte" },
  "cand.none": { fr: "Aucun profil trouvé.", ht: "Nou pa jwenn pwofil." },

  "reco.title": { fr: "Recommandations", ht: "Rekòmandasyon" },
  "reco.add": { fr: "Écrire une recommandation", ht: "Ekri yon rekòmandasyon" },
  "reco.none": { fr: "Aucune recommandation.", ht: "Pa gen rekòmandasyon." },

  "common.loading": { fr: "Chargement…", ht: "K ap chaje…" },
  "common.save": { fr: "Enregistrer", ht: "Anrejistre" },
  "common.saved": { fr: "Enregistré", ht: "Anrejistre" },
  "profile.searchable.hint": {
    fr: "Les institutions pourront trouver votre profil.",
    ht: "Enstitisyon yo ka jwenn pwofil ou.",
  },
  "cv.uploaded": { fr: "CV téléversé", ht: "CV voye" },
  "inst.description": { fr: "Présentation", ht: "Prezantasyon" },
  "post.title": { fr: "Intitulé du poste", ht: "Tit pòs la" },
  "post.salary": { fr: "Salaire (optionnel)", ht: "Salè (opsyonèl)" },
  "common.cancel": { fr: "Annuler", ht: "Anile" },
  "common.close": { fr: "Fermer", ht: "Fèmen" },
  "common.add": { fr: "Ajouter", ht: "Ajoute" },
  "common.edit": { fr: "Modifier", ht: "Modifye" },
  "common.delete": { fr: "Supprimer", ht: "Efase" },
  "common.status": { fr: "Statut", ht: "Estati" },
  "common.back": { fr: "Retour", ht: "Retounen" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };

const LanguageContext = createContext<Ctx>({ lang: "fr", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("konekte-lang");
    if (stored === "ht" || stored === "fr") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("konekte-lang", l);
  }, []);

  const t = useCallback((k: string) => DICT[k]?.[lang] ?? k, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}
