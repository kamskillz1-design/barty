import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/api/supabaseClient';

const translations = {
  en: {
    _dir: 'ltr',
    appName: 'iBarti',
    tagline: 'Exchange goods and services, no money needed',
    nav: { explore: 'Explore', myListings: 'My Listings', trades: 'Trades', hubs: 'Hubs', profile: 'Profile' },
    local: { title: 'Near you', viewAll: 'Browse all', sub: 'Listings in your area. Use the search to explore anywhere worldwide.', empty: 'No listings in your area yet — set your city in Profile to personalize results.' },
    impact: { global: 'Items traded worldwide', globalSub: 'Live community counter', section: 'Your impact', sectionSub: 'The good you have created through bartering', itemsKeptOut: 'Items kept out of landfill', itemsKeptOutSub: 'Estimated from completed trades and category factors', co2Saved: 'Estimated CO₂ saved', co2SavedSub: 'Approximate emissions avoided by reuse', moneySaved: 'Estimated money saved', moneySavedSub: 'Estimated replacement value avoided', completionRate: 'Completion rate', completionRateSub: 'Completed trades out of total trades' },
    hubs: { title: 'Safe Exchange Hubs', sub: 'Verified public spaces to meet and complete trades in person', suggest: 'Suggest a spot', name: 'Spot name', type: 'Type', country: 'Country', city: 'City', notes: 'Notes', submit: 'Submit' },
    search: { placeholder: 'Search listings...', location: 'Location', radius: 'Radius (km)', allLocations: 'All countries', allLanguages: 'All languages', anyTown: 'All cities', language: 'Language', filters: 'Filters', clear: 'Clear' },
    categories: { electronics: 'Electronics', computers: 'Computers', phones: 'Phones', camera: 'Cameras & Photo', audio: 'Audio & Sound', gaming: 'Gaming', furniture: 'Furniture', home: 'Home & Decor', fashion: 'Fashion', books: 'Books', sports: 'Sports', tools: 'Tools', auto: 'Automotive', kids: 'Kids & Baby', services: 'Services', pet: 'Pet Supplies', health: 'Health & Beauty', garden: 'Garden' },
    listing: { new: 'New Listing', title: 'Title', description: 'Description', intent: 'I am', offering: 'Offering', seeking: 'Seeking', offeringHint: 'I am offering this good or service', seekingHint: 'I am looking for this good or service', haveType: 'You have (type)', haveCategory: 'You have (category)', haveSubcategory: 'You have (subcategory)', wantType: 'You want (type)', wantCategory: 'You want (category)', wantSubcategory: 'You want (subcategory)', openToAnything: 'Open to anything', exchangeLocation: 'Exchange location', tags: 'Tags', country: 'Country', city: 'City', town: 'Town / Area', baselineValue: 'Baseline value', save: 'Save Listing', back: 'Back', created: 'Listing created', saveError: 'Failed to save listing' },
    exchType: { goods: 'Goods', services: 'Services', digital: 'Digital' },
    exchLoc: { local: 'Local', national: 'National', international: 'International', online: 'Online' },
    v1cat: { electronics_technology: 'Electronics & Technology', home_furniture: 'Home & Furniture', fashion_personal: 'Fashion & Personal', beauty_wellness: 'Beauty & Wellness', books_education: 'Books & Education', sports_outdoors: 'Sports & Outdoors', tools_diy: 'Tools & DIY', automotive: 'Automotive', kids_baby: 'Kids & Baby', pet_supplies: 'Pet Supplies', garden_outdoor: 'Garden & Outdoor', services: 'Services' },
    v1sub: { electronics_technology__phones: 'Phones', electronics_technology__laptops: 'Laptops', electronics_technology__desktops: 'Desktops', electronics_technology__tablets: 'Tablets', electronics_technology__audio: 'Audio & Sound', electronics_technology__camera: 'Cameras & Photo', electronics_technology__gaming: 'Gaming' },
    tags: { label: 'Tags', placeholder: 'Add a tag…', add: 'Add', hint: 'Add keywords to help people find this listing.' },
    trade: { title: 'Trades', empty: 'No trades yet', youOffered: 'You offered', youRequested: 'You requested', status: { pending: 'Pending', accepted: 'Accepted', completed: 'Completed', cancelled: 'Cancelled' } },
    call: { video: 'Video', voice: 'Voice Only', incoming: 'Incoming call', connecting: 'Connecting…', connected: 'Connected', ended: 'Call ended', missed: 'Missed call', declined: 'Call declined' },
    value: { fair: 'Fair Exchange', balanced: 'Well Balanced', slightlyUnbalanced: 'Slightly Unbalanced', unbalanced: 'Unbalanced Exchange', explanation: 'This is a non-monetary fairness indicator based on baseline values and category balancing.' },
    safety: { title: 'Stay Safe', body: 'Always meet in a public place and inspect goods or services thoroughly in person before finalizing. Exchanges are final once you complete the trade in person.' },
    profile: { title: 'Profile', language: 'Language', country: 'Country', city: 'City / Town', town: 'Village / Area', bio: 'Bio', save: 'Save Profile', saved: 'Saved', saveError: 'Save failed', verified: 'ID Verified', notVerified: 'Not verified', verify: 'Verify ID' },
    common: { loading: 'Loading...', empty: 'Nothing here yet', create: 'Create', close: 'Close', you: 'You', member: 'iBarti member', propose: 'Propose Trade' },
    v2: { suggestedTitle: 'Suggested for you', suggestedSub: 'Listings that match what you want', leaderboardTitle: 'Community leaderboard', leaderboardSub: 'Most completed trades this month', tradesLabel: 'trades' },
    community: { comments: { title: 'Comments', empty: 'No comments yet. Start the conversation.', placeholder: 'Write a comment…', post: 'Post', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel' } },
    landing: { hero: 'Trade anything, anywhere — without money', sub: 'iBarti connects people worldwide to exchange goods and services through fair bartering across countries, cities, and villages.', cta: 'New Listing' }
  },
  es: {
    _dir: 'ltr',
    appName: 'iBarti',
    tagline: 'Intercambia bienes y servicios, sin dinero',
    nav: { explore: 'Explorar', myListings: 'Mis Anuncios', trades: 'Intercambios', hubs: 'Puntos Seguros', profile: 'Perfil' },
    local: { title: 'Cerca de ti', viewAll: 'Ver todo', sub: 'Anuncios en tu zona. Usa la búsqueda para explorar cualquier lugar del mundo.', empty: 'Aún no hay anuncios en tu zona — configura tu ciudad en Perfil para personalizar resultados.' },
    impact: { global: 'Artículos intercambiados en el mundo', globalSub: 'Contador comunitario en vivo', section: 'Tu impacto', sectionSub: 'El bien que has creado mediante el trueque', itemsKeptOut: 'Artículos fuera del vertedero', itemsKeptOutSub: 'Estimado por intercambios completados y factores de categoría', co2Saved: 'CO₂ estimado ahorrado', co2SavedSub: 'Emisiones evitadas por reutilización', moneySaved: 'Dinero estimado ahorrado', moneySavedSub: 'Valor de reemplazo evitado', completionRate: 'Tasa de finalización', completionRateSub: 'Intercambios completados del total' },
    hubs: { title: 'Puntos de Intercambio Seguro', sub: 'Espacios públicos verificados para reunirse y completar intercambios en persona', suggest: 'Sugerir un punto', name: 'Nombre del punto', type: 'Tipo', country: 'País', city: 'Ciudad', notes: 'Notas', submit: 'Enviar' },
    search: { placeholder: 'Buscar anuncios...', location: 'Ubicación', radius: 'Radio (km)', allLocations: 'Todos los países', allLanguages: 'Todos los idiomas', anyTown: 'Todas las ciudades', language: 'Idioma', filters: 'Filtros', clear: 'Limpiar' },
    categories: { electronics: 'Electrónica', computers: 'Ordenadores', phones: 'Teléfonos', camera: 'Cámaras y Foto', audio: 'Audio y Sonido', gaming: 'Videojuegos', furniture: 'Mobiliario', home: 'Hogar y Decoración', fashion: 'Moda', books: 'Libros', sports: 'Deportes', tools: 'Herramientas', auto: 'Automoción', kids: 'Niños y Bebés', services: 'Servicios', pet: 'Mascotas', health: 'Salud y Belleza', garden: 'Jardín' },
    listing: { new: 'Nuevo Anuncio', title: 'Título', description: 'Descripción', intent: 'Yo', offering: 'Ofrezco', seeking: 'Busco', offeringHint: 'Ofrezco este bien o servicio', seekingHint: 'Busco este bien o servicio', haveType: 'Tienes (tipo)', haveCategory: 'Tienes (categoría)', haveSubcategory: 'Tienes (subcategoría)', wantType: 'Quieres (tipo)', wantCategory: 'Quieres (categoría)', wantSubcategory: 'Quieres (subcategoría)', openToAnything: 'Abierto a cualquier cosa', exchangeLocation: 'Ubicación del intercambio', tags: 'Etiquetas', country: 'País', city: 'Ciudad', town: 'Pueblo / Zona', baselineValue: 'Valor base', save: 'Guardar Anuncio', back: 'Atrás', created: 'Anuncio creado', saveError: 'No se pudo guardar el anuncio' },
    exchType: { goods: 'Bienes', services: 'Servicios', digital: 'Digital' },
    exchLoc: { local: 'Local', national: 'Nacional', international: 'Internacional', online: 'En línea' },
    v1cat: { electronics_technology: 'Electrónica y Tecnología', home_furniture: 'Hogar y Mobiliario', fashion_personal: 'Moda y Personal', beauty_wellness: 'Belleza y Bienestar', books_education: 'Libros y Educación', sports_outdoors: 'Deportes y Aire libre', tools_diy: 'Herramientas y Bricolaje', automotive: 'Automoción', kids_baby: 'Niños y Bebés', pet_supplies: 'Mascotas', garden_outdoor: 'Jardín y Exterior', services: 'Servicios' },
    v1sub: { electronics_technology__phones: 'Teléfonos', electronics_technology__laptops: 'Portátiles', electronics_technology__desktops: 'Sobremesa', electronics_technology__tablets: 'Tablets', electronics_technology__audio: 'Audio y Sonido', electronics_technology__camera: 'Cámaras y Foto', electronics_technology__gaming: 'Videojuegos' },
    tags: { label: 'Etiquetas', placeholder: 'Añadir etiqueta…', add: 'Añadir', hint: 'Añade palabras clave para que la gente encuentre este anuncio.' },
    trade: { title: 'Intercambios', empty: 'Sin intercambios aún', youOffered: 'Ofreciste', youRequested: 'Solicitaste', status: { pending: 'Pendiente', accepted: 'Aceptado', completed: 'Completado', cancelled: 'Cancelado' } },
    call: { video: 'Vídeo', voice: 'Solo voz', incoming: 'Llamada entrante', connecting: 'Conectando…', connected: 'Conectado', ended: 'Llamada finalizada', missed: 'Llamada perdida', declined: 'Llamada rechazada' },
    value: { fair: 'Intercambio Justo', balanced: 'Bien Equilibrado', slightlyUnbalanced: 'Ligeramente Desequilibrado', unbalanced: 'Intercambio Desequilibrado', explanation: 'Este es un indicador de equidad no monetaria basado en valores base y equilibrio por categoría.' },
    safety: { title: 'Mantente Seguro', body: 'Reúnete siempre en un lugar público e inspecciona los bienes o servicios minuciosamente en persona antes de finalizar. Los intercambios son definitivos una vez completados en persona.' },
    profile: { title: 'Perfil', language: 'Idioma', country: 'País', city: 'Ciudad / Pueblo', town: 'Aldea / Zona', bio: 'Bio', save: 'Guardar Perfil', saved: 'Guardado', saveError: 'Error al guardar', verified: 'ID Verificado', notVerified: 'No verificado', verify: 'Verificar ID' },
    common: { loading: 'Cargando...', empty: 'Nada por aquí aún', create: 'Crear', close: 'Cerrar', you: 'Tú', member: 'Miembro de iBarti', propose: 'Proponer Intercambio' },
    community: { comments: { title: 'Comentarios', empty: 'Sin comentarios aún. Inicia la conversación.', placeholder: 'Escribe un comentario…', post: 'Publicar', edit: 'Editar', delete: 'Eliminar', save: 'Guardar', cancel: 'Cancelar' } },
    landing: { hero: 'Intercambia cualquier cosa, en cualquier lugar — sin dinero', sub: 'iBarti conecta personas en todo el mundo para intercambiar bienes y servicios mediante trueque justo entre países, ciudades y pueblos.', cta: 'Nuevo anuncio' }
  },
  fr: {
    _dir: 'ltr',
    appName: 'iBarti',
    tagline: 'Échangez biens et services, sans argent',
    nav: { explore: 'Explorer', myListings: 'Mes Annonces', trades: 'Échanges', hubs: 'Lieux Sûrs', profile: 'Profil' },
    local: { title: 'Près de chez vous', viewAll: 'Tout voir', sub: 'Annonces dans votre région. Utilisez la recherche pour explorer partout dans le monde.', empty: 'Aucune annonce près de chez vous — définissez votre ville dans Profil pour personnaliser les résultats.' },
    impact: { global: 'Articles échangés dans le monde', globalSub: 'Compteur communautaire en direct', section: 'Votre impact', sectionSub: 'Le bien que vous avez créé par le troc', itemsKeptOut: 'Articles évités de la décharge', itemsKeptOutSub: 'Estimé à partir des échanges terminés et facteurs de catégorie', co2Saved: 'CO₂ estimé économisé', co2SavedSub: 'Émissions évitées grâce au réemploi', moneySaved: 'Argent estimé économisé', moneySavedSub: 'Valeur de remplacement évitée', completionRate: 'Taux de finalisation', completionRateSub: 'Échanges terminés sur le total' },
    hubs: { title: 'Lieux de Rencontre Sûrs', sub: 'Espaces publics vérifiés pour se rencontrer et finaliser les échanges en personne', suggest: 'Suggérer un lieu', name: 'Nom du lieu', type: 'Type', country: 'Pays', city: 'Ville', notes: 'Notes', submit: 'Envoyer' },
    search: { placeholder: 'Rechercher des annonces...', location: 'Lieu', radius: 'Rayon (km)', allLocations: 'Tous les pays', allLanguages: 'Toutes les langues', anyTown: 'Toutes les villes', language: 'Langue', filters: 'Filtres', clear: 'Effacer' },
    categories: { electronics: 'Électronique', computers: 'Ordinateurs', phones: 'Téléphones', camera: 'Caméras & Photo', audio: 'Audio & Son', gaming: 'Jeux vidéo', furniture: 'Ameublement', home: 'Maison & Déco', fashion: 'Mode', books: 'Livres', sports: 'Sports', tools: 'Outils', auto: 'Automobile', kids: 'Enfants & Bébé', services: 'Services', pet: 'Animaux', health: 'Santé & Beauté', garden: 'Jardin' },
    listing: { new: 'Nouvelle Annonce', title: 'Titre', description: 'Description', intent: 'Je', offering: 'Propose', seeking: 'Recherche', offeringHint: 'Je propose ce bien ou service', seekingHint: 'Je recherche ce bien ou service', haveType: 'Vous avez (type)', haveCategory: 'Vous avez (catégorie)', haveSubcategory: 'Vous avez (sous-catégorie)', wantType: 'Vous voulez (type)', wantCategory: 'Vous voulez (catégorie)', wantSubcategory: 'Vous voulez (sous-catégorie)', openToAnything: 'Ouvert à tout', exchangeLocation: 'Lieu d’échange', tags: 'Étiquettes', country: 'Pays', city: 'Ville', town: 'Village / Quartier', baselineValue: 'Valeur de base', save: 'Enregistrer l’Annonce', back: 'Retour', created: 'Annonce créée', saveError: 'Échec de l’enregistrement de l’annonce' },
    exchType: { goods: 'Biens', services: 'Services', digital: 'Numérique' },
    exchLoc: { local: 'Local', national: 'National', international: 'International', online: 'En ligne' },
    v1cat: { electronics_technology: 'Électronique & Technologie', home_furniture: 'Maison & Ameublement', fashion_personal: 'Mode & Personnel', beauty_wellness: 'Beauté & Bien-être', books_education: 'Livres & Éducation', sports_outdoors: 'Sports & Plein air', tools_diy: 'Outils & Bricolage', automotive: 'Automobile', kids_baby: 'Enfants & Bébé', pet_supplies: 'Animaux', garden_outdoor: 'Jardin & Extérieur', services: 'Services' },
    v1sub: { electronics_technology__phones: 'Téléphones', electronics_technology__laptops: 'Portables', electronics_technology__desktops: 'Ordinateurs de bureau', electronics_technology__tablets: 'Tablettes', electronics_technology__audio: 'Audio & Son', electronics_technology__camera: 'Caméras & Photo', electronics_technology__gaming: 'Jeux vidéo' },
    tags: { label: 'Étiquettes', placeholder: 'Ajouter une étiquette…', add: 'Ajouter', hint: 'Ajoutez des mots-clés pour aider à trouver cette annonce.' },
    trade: { title: 'Échanges', empty: 'Aucun échange', youOffered: 'Vous avez offert', youRequested: 'Vous avez demandé', status: { pending: 'En attente', accepted: 'Accepté', completed: 'Terminé', cancelled: 'Annulé' } },
    call: { video: 'Vidéo', voice: 'Voix seule', incoming: 'Appel entrant', connecting: 'Connexion…', connected: 'Connecté', ended: 'Appel terminé', missed: 'Appel manqué', declined: 'Appel refusé' },
    value: { fair: 'Échange Équitable', balanced: 'Bien Équilibré', slightlyUnbalanced: 'Légèrement Déséquilibré', unbalanced: 'Échange Déséquilibré', explanation: 'Indicateur d’équité non monétaire basé sur les valeurs de base et l’équilibre des catégories.' },
    safety: { title: 'Restez en Sécurité', body: 'Rencontrez toujours dans un lieu public et inspectez les biens ou services en personne avant de finaliser. Les échanges sont définitifs une fois terminés en personne.' },
    profile: { title: 'Profil', language: 'Langue', country: 'Pays', city: 'Ville / Village', town: 'Hameau / Quartier', bio: 'Bio', save: 'Enregistrer le Profil', saved: 'Enregistré', saveError: 'Échec de l’enregistrement', verified: 'ID Vérifié', notVerified: 'Non vérifié', verify: 'Vérifier ID' },
    common: { loading: 'Chargement...', empty: 'Rien ici', create: 'Créer', close: 'Fermer', you: 'Vous', member: 'Membre iBarti', propose: 'Proposer un Échange' },
    community: { comments: { title: 'Commentaires', empty: 'Aucun commentaire pour le moment. Lancez la conversation.', placeholder: 'Écrire un commentaire…', post: 'Publier', edit: 'Modifier', delete: 'Supprimer', save: 'Enregistrer', cancel: 'Annuler' } },
    landing: { hero: 'Échangez tout, partout — sans argent', sub: 'iBarti connecte des personnes du monde entier pour échanger biens et services via un troc équitable entre pays, villes et villages.', cta: 'Nouvelle annonce' }
  },
  ar: {
    _dir: 'rtl',
    appName: 'iBarti',
    tagline: 'تبادل السلع والخدمات دون أموال',
    nav: { explore: 'استكشاف', myListings: 'إعلاناتي', trades: 'المقايضات', hubs: 'النقاط الآمنة', profile: 'الملف الشخصي' },
    local: { title: 'قريب منك', viewAll: 'تصفح الكل', sub: 'إعلانات في منطقتك. استخدم البحث لاستكشاف أي مكان حول العالم.', empty: 'لا توجد إعلانات في منطقتك بعد — حدّد مدينتك في الملف الشخصي لتخصيص النتائج.' },
    impact: { global: 'عناصر تمت مقايضتها عالميًا', globalSub: 'العداد المجتمعي المباشر', section: 'مساهمتك', sectionSub: 'الأثر الذي صنعته عبر المقايضة', itemsKeptOut: 'عناصر تم إبعادها عن المكب', itemsKeptOutSub: 'تقدير بناءً على المقايضات المكتملة وعوامل الفئة', co2Saved: 'تقدير CO₂ الموفر', co2SavedSub: 'انبعاثات تم تجنبها عبر إعادة الاستخدام', moneySaved: 'تقدير المال الموفر', moneySavedSub: 'قيمة استبدال تم تجنبها', completionRate: 'معدل الإكمال', completionRateSub: 'المقايضات المكتملة من إجمالي المقايضات' },
    hubs: { title: 'نقاط التبادل الآمنة', sub: 'مساحات عامة موثقة للالتقاء وإتمام المقايضات شخصيًا', suggest: 'اقترح نقطة', name: 'اسم النقطة', type: 'النوع', country: 'الدولة', city: 'المدينة', notes: 'ملاحظات', submit: 'إرسال' },
    search: { placeholder: 'ابحث في الإعلانات...', location: 'الموقع', radius: 'نصف القطر (كم)', allLocations: 'كل الدول', allLanguages: 'كل اللغات', anyTown: 'كل المدن', language: 'اللغة', filters: 'الفلاتر', clear: 'مسح' },
    categories: { electronics: 'إلكترونيات', computers: 'حواسيب', phones: 'هواتف', camera: 'كاميرات وتصوير', audio: 'صوتيات', gaming: 'ألعاب فيديو', furniture: 'أثاث', home: 'المنزل والديكور', fashion: 'الموضة', books: 'كتب', sports: 'رياضة', tools: 'أدوات', auto: 'سيارات', kids: 'أطفال ورضع', services: 'خدمات', pet: 'مستلزمات الحيوانات', health: 'الصحة والجمال', garden: 'الحديقة' },
    listing: { new: 'إعلان جديد', title: 'العنوان', description: 'الوصف', intent: 'أنا', offering: 'أعرض', seeking: 'أبحث عن', offeringHint: 'أعرض هذا المنتج أو الخدمة', seekingHint: 'أبحث عن هذا المنتج أو الخدمة', haveType: 'لديك (النوع)', haveCategory: 'لديك (الفئة)', haveSubcategory: 'لديك (الفئة الفرعية)', wantType: 'تريد (النوع)', wantCategory: 'تريد (الفئة)', wantSubcategory: 'تريد (الفئة الفرعية)', openToAnything: 'منفتح على أي شيء', exchangeLocation: 'موقع التبادل', tags: 'وسوم', country: 'الدولة', city: 'المدينة', town: 'البلدة / المنطقة', baselineValue: 'القيمة الأساسية', save: 'حفظ الإعلان', back: 'رجوع', created: 'تم إنشاء الإعلان', saveError: 'فشل حفظ الإعلان' },
    exchType: { goods: 'سلع', services: 'خدمات', digital: 'رقمي' },
    exchLoc: { local: 'محلي', national: 'وطني', international: 'دولي', online: 'عبر الإنترنت' },
    v1cat: { electronics_technology: 'الإلكترونيات والتقنية', home_furniture: 'المنزل والأثاث', fashion_personal: 'الأزياء والمظهر', beauty_wellness: 'الجمال والعافية', books_education: 'الكتب والتعليم', sports_outdoors: 'الرياضة والهواء الطلق', tools_diy: 'الأدوات والأعمال اليدوية', automotive: 'السيارات', kids_baby: 'الأطفال والرضع', pet_supplies: 'مستلزمات الحيوانات', garden_outdoor: 'الحديقة والخارج', services: 'Services' },
    v1sub: { electronics_technology__phones: 'هواتف', electronics_technology__laptops: 'حواسب محمولة', electronics_technology__desktops: 'حواسب مكتبية', electronics_technology__tablets: 'أجهزة لوحية', electronics_technology__audio: 'صوتيات', electronics_technology__camera: 'كاميرات وتصوير', electronics_technology__gaming: 'ألعاب فيديو' },
    tags: { label: 'وسوم', placeholder: 'أضف وسمًا…', add: 'إضافة', hint: 'أضف كلمات مفتاحية لمساعدة الناس في إيجاد هذا الإعلان.' },
    trade: { title: 'المقايضات', empty: 'لا مقايضات بعد', youOffered: 'عرضت', youRequested: 'طلبت', status: { pending: 'قيد الانتظار', accepted: 'مقبول', completed: 'مكتمل', cancelled: 'ملغى' } },
    call: { video: 'فيديو', voice: 'صوت فقط', incoming: 'مكالمة واردة', connecting: 'جارٍ الاتصال…', connected: 'متصل', ended: 'انتهت المكالمة', missed: 'مكالمة فائتة', declined: 'تم رفض المكالمة' },
    value: { fair: 'مقايضة عادلة', balanced: 'متوازنة جيدًا', slightlyUnbalanced: 'غير متوازنة قليلًا', unbalanced: 'مقايضة غير متوازنة', explanation: 'مؤشر عدالة غير مالي يعتمد على القيم الأساسية وتوازن الفئات.' },
    safety: { title: 'ابقَ آمنًا', body: 'التقِ دائمًا في مكان عام وافحص السلع أو الخدمات بدقة شخصيًا قبل الإتمام. تصبح المقايضات نهائية بعد الإتمام حضوريًا.' },
    profile: { title: 'الملف الشخصي', language: 'اللغة', country: 'الدولة', city: 'المدينة / البلدة', town: 'القرية / المنطقة', bio: 'نبذة', save: 'حفظ الملف الشخصي', saved: 'تم الحفظ', saveError: 'فشل الحفظ', verified: 'هوية موثّقة', notVerified: 'غير موثّق', verify: 'توثيق الهوية' },
    common: { loading: 'جارٍ التحميل...', empty: 'لا شيء هنا', create: 'إنشاء', close: 'إغلاق', you: 'أنت', member: 'عضو iBarti', propose: 'اقترح مقايضة' },
    community: { comments: { title: 'Comments', empty: 'No comments yet. Start the conversation.', placeholder: 'Write a comment…', post: 'Post', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel' } },
    landing: { hero: 'قايض أي شيء، في أي مكان — دون أموال', sub: 'يربط iBarti الناس حول العالم لتبادل السلع والخدمات عبر مقايضة عادلة بين الدول والمدن والقرى.', cta: 'إعلان جديد' }
  }
};

const RTL_CODES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'dv', 'ug', 'ks']);

const UI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
  { code: 'pl', label: 'Polski' },
  { code: 'cs', label: 'Čeština' },
  { code: 'sk', label: 'Slovenčina' },
  { code: 'hu', label: 'Magyar' },
  { code: 'ro', label: 'Română' },
  { code: 'bg', label: 'Български' },
  { code: 'sr', label: 'Српски' },
  { code: 'hr', label: 'Hrvatski' },
  { code: 'sl', label: 'Slovenščina' },
  { code: 'mk', label: 'Македонски' },
  { code: 'sq', label: 'Shqip' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'da', label: 'Dansk' },
  { code: 'sv', label: 'Svenska' },
  { code: 'nb', label: 'Norsk Bokmål' },
  { code: 'nn', label: 'Norsk Nynorsk' },
  { code: 'fi', label: 'Suomi' },
  { code: 'is', label: 'Íslenska' },
  { code: 'et', label: 'Eesti' },
  { code: 'lv', label: 'Latviešu' },
  { code: 'lt', label: 'Lietuvių' },
  { code: 'be', label: 'Беларуская' },
  { code: 'ca', label: 'Català' },
  { code: 'eu', label: 'Euskara' },
  { code: 'gl', label: 'Galego' },
  { code: 'cy', label: 'Cymraeg' },
  { code: 'ga', label: 'Gaeilge' },
  { code: 'gd', label: 'Gàidhlig' },
  { code: 'mt', label: 'Malti' },
  { code: 'he', label: 'עברית' },
  { code: 'fa', label: 'فارسی' },
  { code: 'ps', label: 'پښتو' },
  { code: 'ur', label: 'اردو' },
  { code: 'sd', label: 'سنڌي' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'si', label: 'සිංහල' },
  { code: 'ne', label: 'नेपाली' },
  { code: 'th', label: 'ไทย' },
  { code: 'lo', label: 'ລາວ' },
  { code: 'km', label: 'ខ្មែរ' },
  { code: 'my', label: 'မြန်မာ' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'tl', label: 'Filipino' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'mn', label: 'Монгол' },
  { code: 'kk', label: 'Қазақша' },
  { code: 'uz', label: 'Oʻzbek' },
  { code: 'az', label: 'Azərbaycan' },
  { code: 'ky', label: 'Кыргызча' },
  { code: 'tg', label: 'Тоҷикӣ' },
  { code: 'tk', label: 'Türkmençe' },
  { code: 'ka', label: 'ქართული' },
  { code: 'hy', label: 'Հայերեն' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'so', label: 'Soomaali' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ig', label: 'Igbo' },
  { code: 'zu', label: 'isiZulu' },
  { code: 'xh', label: 'isiXhosa' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'st', label: 'Sesotho' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'mg', label: 'Malagasy' },
  { code: 'ht', label: 'Kreyòl Ayisyen' },
  { code: 'qu', label: 'Quechua' },
  { code: 'gn', label: 'Guaraní' },
  { code: 'ay', label: 'Aymar aru' },
  { code: 'mi', label: 'Māori' },
  { code: 'sm', label: 'Gagana Samoa' },
  { code: 'to', label: 'Lea Faka-Tonga' },
  { code: 'ug', label: 'ئۇيغۇرچە' },
  { code: 'dv', label: 'ދިވެހި' },
  { code: 'yi', label: 'ייִדיש' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' },
  { code: 'sa', label: 'संस्कृत' }
];

const detectDir = (code) => (RTL_CODES.has(code) ? 'rtl' : 'ltr');

const GOOGLE_CODE_OVERRIDES = {
  zh: 'zh-CN',
  nb: 'no',
  nn: 'no',
  he: 'iw'
};

const toGoogleCode = (code) => GOOGLE_CODE_OVERRIDES[code] || code;

const I18nContext = createContext();
const LANG_PREF_KEY = 'ibarti_lang_pref';

const VALID_CODES = new Set(UI_LANGUAGES.map((l) => l.code));

const hasLocalDictionary = (code) => Boolean(translations[code]);

const normalizeLangCode = (input) => {
  if (!input || typeof input !== 'string') return null;
  const lower = input.toLowerCase().trim();
  if (VALID_CODES.has(lower)) return lower;
  const base = lower.split('-')[0];
  if (VALID_CODES.has(base)) return base;
  return null;
};

const readStoredLang = () => {
  try {
    const saved = localStorage.getItem(LANG_PREF_KEY);
    if (saved) {
      const normalizedSaved = normalizeLangCode(saved);
      if (normalizedSaved) return normalizedSaved;
    }

    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      const normalizedBrowser = normalizeLangCode(browserLang);
      if (normalizedBrowser) return normalizedBrowser;
    }
  } catch {
    // Fallback if localStorage or navigator is restricted
  }
  return 'en';
};

const getRootDomain = () => {
  const host = window.location.hostname;
  const parts = host.split('.');
  return parts.length >= 2 ? `.${parts.slice(-2).join('.')}` : host;
};

const setGoogTransCookie = (googleCode) => {
  const cookieVal = `/en/${googleCode}`;
  const host = window.location.hostname;
  const rootDomain = getRootDomain();

  document.cookie = `googtrans=${cookieVal}; path=/; max-age=31536000`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${host}; max-age=31536000`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${rootDomain}; max-age=31536000`;
};

const clearGoogTransCookie = () => {
  const host = window.location.hostname;
  const rootDomain = getRootDomain();
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';

  document.cookie = `googtrans=; ${expire}; path=/;`;
  document.cookie = `googtrans=; ${expire}; path=/; domain=${host};`;
  document.cookie = `googtrans=; ${expire}; path=/; domain=${rootDomain};`;
};

const triggerGTranslate = (googleCode, attemptsLeft = 12) => {
  if (googleCode === 'en') {
    clearGoogTransCookie();
    return;
  }

  if (typeof window.doGTranslate === 'function') {
    window.doGTranslate(`en|${googleCode}`);
    return;
  }

  if (attemptsLeft <= 0) return;

  window.setTimeout(() => {
    triggerGTranslate(googleCode, attemptsLeft - 1);
  }, 300);
};

export const I18nProvider = ({ children, initialLang = 'en' }) => {
  const [lang, setLangState] = useState(() =>
    normalizeLangCode(readStoredLang() || initialLang) || 'en'
  );

  const t = useMemo(() => translations[lang] || translations.en, [lang]);
  const dir = detectDir(lang);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  useEffect(() => {
    const stored = readStoredLang();

    if (hasLocalDictionary(stored)) {
      clearGoogTransCookie();
      if (stored === 'en' && typeof window.doGTranslate === 'function') {
        window.doGTranslate('en|en');
      }
      return;
    }

    triggerGTranslate(toGoogleCode(stored));
  }, []);

  const setLang = (code) => {
    const normalized = normalizeLangCode(code) || 'en';

    if (normalized === lang) return;

    try {
      localStorage.setItem(LANG_PREF_KEY, normalized);
    } catch {
      // Storage is unavailable or blocked.
    }

    if (hasLocalDictionary(normalized)) {
      clearGoogTransCookie();
      setGoogTransCookie('en');
      if (typeof window.doGTranslate === 'function') {
        window.doGTranslate('en|en');
      }
      window.location.replace(window.location.href);
      return;
    }

    setGoogTransCookie(toGoogleCode(normalized));
    window.location.replace(window.location.href);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);

  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return ctx;
};

export const LANGUAGES = UI_LANGUAGES;
export { translations };
