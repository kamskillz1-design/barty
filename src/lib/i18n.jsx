import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    _dir: 'ltr',
    appName: 'Barti',
    tagline: 'Exchange goods and services, no money needed',
    nav: { explore: 'Explore', myListings: 'My Listings', trades: 'Trades', profile: 'Profile' },
    search: { placeholder: 'Search listings...', location: 'Location', radius: 'Radius (km)', allLocations: 'All countries', allLanguages: 'All languages', anyTown: 'All towns', language: 'Language', town: 'Town', category: 'Category', allCategories: 'All categories', type: 'Type', allTypes: 'All', goods: 'Goods', services: 'Services', search: 'Search', clear: 'Clear' },
    categories: { electronics: 'Electronics', clothing: 'Clothing', home: 'Home & Garden', tools: 'Tools', books: 'Books', toys: 'Toys', sports: 'Sports', tutoring: 'Tutoring', repairs: 'Repairs', design: 'Design', transport: 'Transport', cooking: 'Cooking', other: 'Other' },
    listing: { new: 'New Listing', title: 'Title', description: 'Description', type: 'Type', good: 'Good', service: 'Service', category: 'Category', country: 'Country', city: 'City / Town', town: 'Village / Area', language: 'Language', images: 'Images', addImage: 'Add image URL', save: 'Save Listing', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', back: 'Back', by: 'By', location: 'Location', proposeTrade: 'Propose Trade', myListing: 'Your listing', propose: 'Propose', valueHint: 'Fairness is calculated internally — no prices are ever shown.', contact: 'Contact', noImages: 'No images yet' },
    trade: { title: 'Trades', empty: 'No trades yet', youOffered: 'You offered', youRequested: 'You requested', status: { pending: 'Pending', accepted: 'Accepted', completed: 'Completed', cancelled: 'Cancelled' }, accept: 'Accept', decline: 'Decline', markComplete: 'Mark as Completed', cancel: 'Cancel Trade', chat: 'Conversation', messages: 'Messages', send: 'Send', typeMessage: 'Type a message...', completeConfirm: 'Only mark complete after you have met in person and inspected the exchange.', bothComplete: 'Both parties must confirm completion', leaveReview: 'Leave a Review', rating: 'Rating', comment: 'Comment', recommend: 'Recommend this user', submitReview: 'Submit Review', reviewLeft: 'Review submitted', offered: 'Offered', requested: 'Requested' },
    value: { fair: 'Fair Exchange', balanced: 'Well Balanced', slightlyUnbalanced: 'Slightly Unbalanced', unbalanced: 'Unbalanced Exchange', explanation: 'This is a non-monetary fairness indicator. No cash values are involved.' },
    safety: { title: 'Stay Safe', body: 'Always meet in a public place and inspect goods or services thoroughly in person before finalizing. Exchanges are final once you complete the trade in person.' },
    profile: { title: 'Profile', language: 'Language', country: 'Country', city: 'City / Town', town: 'Village / Area', verified: 'ID Verified', notVerified: 'Not verified', verify: 'Verify Government ID', bio: 'Bio', save: 'Save Profile', myListings: 'My Listings', reviews: 'Reviews', logout: 'Log out', noListings: 'You have no listings yet', noReviews: 'No reviews yet', createListing: 'Create a listing' },
    common: { loading: 'Loading...', empty: 'Nothing here yet', create: 'Create', close: 'Close', you: 'You' },
    landing: { hero: 'Trade anything, anywhere — without money', sub: 'Barti connects people worldwide to exchange goods and services through fair bartering across countries, cities, and villages.', cta: 'Start Exploring', feature1: 'Goods & Services', feature1d: 'List physical items or skills you can offer.', feature2: 'Smart Matching', feature2d: 'A built-in fairness engine keeps exchanges balanced.', feature3: 'Global & Local', feature3d: 'Find barters near you or across the world.' }
  },
  es: {
    _dir: 'ltr',
    appName: 'Barti',
    tagline: 'Intercambia bienes y servicios, sin dinero',
    nav: { explore: 'Explorar', myListings: 'Mis Anuncios', trades: 'Intercambios', profile: 'Perfil' },
    search: { placeholder: 'Buscar anuncios...', location: 'Ubicación', radius: 'Radio (km)', allLocations: 'Todos los países', allLanguages: 'Todos los idiomas', anyTown: 'Todos los pueblos', language: 'Idioma', town: 'Pueblo', category: 'Categoría', allCategories: 'Todas', type: 'Tipo', allTypes: 'Todos', goods: 'Bienes', services: 'Servicios', search: 'Buscar', clear: 'Limpiar' },
    categories: { electronics: 'Electrónica', clothing: 'Ropa', home: 'Hogar y Jardín', tools: 'Herramientas', books: 'Libros', toys: 'Juguetes', sports: 'Deportes', tutoring: 'Tutorías', repairs: 'Reparaciones', design: 'Diseño', transport: 'Transporte', cooking: 'Cocina', other: 'Otro' },
    listing: { new: 'Nuevo Anuncio', title: 'Título', description: 'Descripción', type: 'Tipo', good: 'Bien', service: 'Servicio', category: 'Categoría', country: 'País', city: 'Ciudad / Pueblo', town: 'Aldea / Zona', language: 'Idioma', images: 'Imágenes', addImage: 'Añadir URL de imagen', save: 'Guardar Anuncio', cancel: 'Cancelar', edit: 'Editar', delete: 'Eliminar', back: 'Volver', by: 'Por', location: 'Ubicación', proposeTrade: 'Proponer Intercambio', myListing: 'Tu anuncio', propose: 'Proponer', valueHint: 'La equidad se calcula internamente — nunca se muestran precios.', contact: 'Contacto', noImages: 'Sin imágenes aún' },
    trade: { title: 'Intercambios', empty: 'Sin intercambios aún', youOffered: 'Ofreciste', youRequested: 'Solicitaste', status: { pending: 'Pendiente', accepted: 'Aceptado', completed: 'Completado', cancelled: 'Cancelado' }, accept: 'Aceptar', decline: 'Rechazar', markComplete: 'Marcar como Completado', cancel: 'Cancelar Intercambio', chat: 'Conversación', messages: 'Mensajes', send: 'Enviar', typeMessage: 'Escribe un mensaje...', completeConfirm: 'Solo marca como completado tras reunirte en persona e inspeccionar el intercambio.', bothComplete: 'Ambas partes deben confirmar la finalización', leaveReview: 'Deja una Reseña', rating: 'Valoración', comment: 'Comentario', recommend: 'Recomendar a este usuario', submitReview: 'Enviar Reseña', reviewLeft: 'Reseña enviada', offered: 'Ofrecido', requested: 'Solicitado' },
    value: { fair: 'Intercambio Justo', balanced: 'Bien Equilibrado', slightlyUnbalanced: 'Ligeramente Desequilibrado', unbalanced: 'Intercambio Desequilibrado', explanation: 'Este es un indicador de equidad no monetario. No hay valores en efectivo.' },
    safety: { title: 'Mantente Seguro', body: 'Reúnete siempre en un lugar público e inspecciona los bienes o servicios minuciosamente en persona antes de finalizar. Los intercambios son definitivos una vez completados en persona.' },
    profile: { title: 'Perfil', language: 'Idioma', country: 'País', city: 'Ciudad / Pueblo', town: 'Aldea / Zona', verified: 'ID Verificado', notVerified: 'No verificado', verify: 'Verificar ID Oficial', bio: 'Bio', save: 'Guardar Perfil', myListings: 'Mis Anuncios', reviews: 'Reseñas', logout: 'Cerrar sesión', noListings: 'No tienes anuncios aún', noReviews: 'Sin reseñas aún', createListing: 'Crear un anuncio' },
    common: { loading: 'Cargando...', empty: 'Nada por aquí aún', create: 'Crear', close: 'Cerrar', you: 'Tú' },
    landing: { hero: 'Intercambia cualquier cosa, en cualquier lugar — sin dinero', sub: 'Barti conecta personas en todo el mundo para intercambiar bienes y servicios mediante trueque justo entre países, ciudades y aldeas.', cta: 'Empezar a Explorar', feature1: 'Bienes y Servicios', feature1d: 'Lista artículos físicos o habilidades que puedas ofrecer.', feature2: 'Coincidencia Inteligente', feature2d: 'Un motor de equidad integrado mantiene los intercambios balanceados.', feature3: 'Global y Local', feature3d: 'Encuentra trueques cerca de ti o por el mundo.' }
  },
  fr: {
    _dir: 'ltr',
    appName: 'Barti',
    tagline: 'Échangez biens et services, sans argent',
    nav: { explore: 'Explorer', myListings: 'Mes Annonces', trades: 'Échanges', profile: 'Profil' },
    search: { placeholder: 'Rechercher des annonces...', location: 'Lieu', radius: 'Rayon (km)', allLocations: 'Tous les pays', allLanguages: 'Toutes les langues', anyTown: 'Toutes les villes', language: 'Langue', town: 'Ville', category: 'Catégorie', allCategories: 'Toutes', type: 'Type', allTypes: 'Tous', goods: 'Biens', services: 'Services', search: 'Rechercher', clear: 'Effacer' },
    categories: { electronics: 'Électronique', clothing: 'Vêtements', home: 'Maison & Jardin', tools: 'Outils', books: 'Livres', toys: 'Jouets', sports: 'Sports', tutoring: 'Soutien scolaire', repairs: 'Réparations', design: 'Design', transport: 'Transport', cooking: 'Cuisine', other: 'Autre' },
    listing: { new: 'Nouvelle Annonce', title: 'Titre', description: 'Description', type: 'Type', good: 'Bien', service: 'Service', category: 'Catégorie', country: 'Pays', city: 'Ville / Village', town: 'Hameau / Quartier', language: 'Langue', images: 'Images', addImage: 'Ajouter une URL d\'image', save: 'Enregistrer', cancel: 'Annuler', edit: 'Modifier', delete: 'Supprimer', back: 'Retour', by: 'Par', location: 'Lieu', proposeTrade: 'Proposer un Échange', myListing: 'Votre annonce', propose: 'Proposer', valueHint: 'L\'équité est calculée en interne — aucun prix n\'est affiché.', contact: 'Contact', noImages: 'Pas d\'images' },
    trade: { title: 'Échanges', empty: 'Aucun échange', youOffered: 'Vous avez offert', youRequested: 'Vous avez demandé', status: { pending: 'En attente', accepted: 'Accepté', completed: 'Terminé', cancelled: 'Annulé' }, accept: 'Accepter', decline: 'Refuser', markComplete: 'Marquer comme Terminé', cancel: 'Annuler l\'Échange', chat: 'Conversation', messages: 'Messages', send: 'Envoyer', typeMessage: 'Écrivez un message...', completeConfirm: 'Ne marquez comme terminé qu\'après une rencontre en personne et inspection.', bothComplete: 'Les deux parties doivent confirmer l\'achèvement', leaveReview: 'Laisser un Avis', rating: 'Note', comment: 'Commentaire', recommend: 'Recommander cet utilisateur', submitReview: 'Envoyer l\'Avis', reviewLeft: 'Avis envoyé', offered: 'Offert', requested: 'Demandé' },
    value: { fair: 'Échange Équitable', balanced: 'Bien Équilibré', slightlyUnbalanced: 'Légèrement Déséquilibré', unbalanced: 'Échange Déséquilibré', explanation: 'Ceci est un indicateur d\'équité non monétaire. Aucune valeur monétaire.' },
    safety: { title: 'Restez en Sécurité', body: 'Rencontrez toujours dans un lieu public et inspectez les biens ou services en personne avant de finaliser. Les échanges sont définitifs une fois terminés en personne.' },
    profile: { title: 'Profil', language: 'Langue', country: 'Pays', city: 'Ville / Village', town: 'Hameau / Quartier', verified: 'ID Vérifié', notVerified: 'Non vérifié', verify: 'Vérifier l\'ID Officiel', bio: 'Bio', save: 'Enregistrer le Profil', myListings: 'Mes Annonces', reviews: 'Avis', logout: 'Déconnexion', noListings: 'Aucune annonce', noReviews: 'Aucun avis', createListing: 'Créer une annonce' },
    common: { loading: 'Chargement...', empty: 'Rien ici', create: 'Créer', close: 'Fermer', you: 'Vous' },
    landing: { hero: 'Échangez tout, partout — sans argent', sub: 'Barti connecte des personnes du monde entier pour échanger biens et services via un troc équitable entre pays, villes et villages.', cta: 'Commencer à Explorer', feature1: 'Biens & Services', feature1d: 'Listez des objets physiques ou des compétences.', feature2: 'Correspondance Intelligente', feature2d: 'Un moteur d\'équité intégré garde les échanges équilibrés.', feature3: 'Global & Local', feature3d: 'Trouvez des trocs près de chez vous ou partout.' }
  },
  ar: {
    _dir: 'rtl',
    appName: 'بارتي',
    tagline: 'تبادل السلع والخدمات دون أموال',
    nav: { explore: 'استكشاف', myListings: 'إعلاناتي', trades: 'المقايضات', profile: 'الملف الشخصي' },
    search: { placeholder: 'ابحث في الإعلانات...', location: 'الموقع', radius: 'نصف القطر (كم)', allLocations: 'كل الدول', allLanguages: 'كل اللغات', anyTown: 'كل البلدات', language: 'اللغة', town: 'البلدة', category: 'الفئة', allCategories: 'كل الفئات', type: 'النوع', allTypes: 'الكل', goods: 'سلع', services: 'خدمات', search: 'بحث', clear: 'مسح' },
    categories: { electronics: 'إلكترونيات', clothing: 'ملابس', home: 'المنزل والحديقة', tools: 'أدوات', books: 'كتب', toys: 'ألعاب', sports: 'رياضة', tutoring: 'تدريس', repairs: 'إصلاحات', design: 'تصميم', transport: 'نقل', cooking: 'طبخ', other: 'أخرى' },
    listing: { new: 'إعلان جديد', title: 'العنوان', description: 'الوصف', type: 'النوع', good: 'سلعة', service: 'خدمة', category: 'الفئة', country: 'الدولة', city: 'المدينة / البلدة', town: 'القرية / المنطقة', language: 'اللغة', images: 'الصور', addImage: 'أضف رابط صورة', save: 'حفظ الإعلان', cancel: 'إلغاء', edit: 'تعديل', delete: 'حذف', back: 'رجوع', by: 'بواسطة', location: 'الموقع', proposeTrade: 'اقترح مقايضة', myListing: 'إعلانك', propose: 'اقترح', valueHint: 'يتم حساب العدالة داخليًا — لا تظهر الأسعار مطلقًا.', contact: 'تواصل', noImages: 'لا صور بعد' },
    trade: { title: 'المقايضات', empty: 'لا مقايضات بعد', youOffered: 'عرضت', youRequested: 'طلبت', status: { pending: 'قيد الانتظار', accepted: 'مقبول', completed: 'مكتمل', cancelled: 'ملغى' }, accept: 'قبول', decline: 'رفض', markComplete: 'وضع كمكتمل', cancel: 'إلغاء المقايضة', chat: 'المحادثة', messages: 'الرسائل', send: 'إرسال', typeMessage: 'اكتب رسالة...', completeConfirm: 'ضع كمكتمل فقط بعد اللقاء شخصيًا وفحص المقايضة.', bothComplete: 'يجب على الطرفين تأكيد الإتمام', leaveReview: 'اترك تقييمًا', rating: 'التقييم', comment: 'تعليق', recommend: 'أوصِ بهذا المستخدم', submitReview: 'إرسال التقييم', reviewLeft: 'تم إرسال التقييم', offered: 'مُقدَّم', requested: 'مطلوب' },
    value: { fair: 'مقايضة عادلة', balanced: 'متوازنة جيدًا', slightlyUnbalanced: 'غير متوازنة قليلاً', unbalanced: 'مقايضة غير متوازنة', explanation: 'هذا مؤشر عدالة غير نقدي. لا توجد قيم نقدية.' },
    safety: { title: 'ابقَ آمنًا', body: 'التقِ دائمًا في مكان عام وفحص السلع أو الخدمات بدقة شخصيًا قبل الإتمام. المقايضات نهائية بعد إتمامها شخصيًا.' },
    profile: { title: 'الملف الشخصي', language: 'اللغة', country: 'الدولة', city: 'المدينة / البلدة', town: 'القرية / المنطقة', verified: 'هوية موثقة', notVerified: 'غير موثق', verify: 'وثّق هويتك الرسمية', bio: 'نبذة', save: 'حفظ الملف', myListings: 'إعلاناتي', reviews: 'التقييمات', logout: 'تسجيل الخروج', noListings: 'لا إعلانات بعد', noReviews: 'لا تقييمات بعد', createListing: 'أنشئ إعلانًا' },
    common: { loading: 'جارٍ التحميل...', empty: 'لا شيء هنا', create: 'إنشاء', close: 'إغلاق', you: 'أنت' },
    landing: { hero: 'قايض أي شيء، في أي مكان — دون أموال', sub: 'يربط بارتي الناس حول العالم لتبادل السلع والخدمات عبر مقايضة عادلة بين الدول والمدن والقرى.', cta: 'ابدأ الاستكشاف', feature1: 'سلع وخدمات', feature1d: 'أدر عناصر مادية أو مهارات يمكنك تقديمها.', feature2: 'مطابقة ذكية', feature2d: 'محرك عدالة مدمج يبقي المقايضات متوازنة.', feature3: 'عالمي ومحلي', feature3d: 'اعثر على مقايضات قربك أو حول العالم.' }
  }
};

const I18nContext = createContext();

export const I18nProvider = ({ children, initialLang = 'en' }) => {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.dir = translations[lang]._dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang];
  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: t._dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
];

export { translations };