import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const translations = {
  en: {
    _dir: 'ltr',
    appName: 'Barti',
    tagline: 'Exchange goods and services, no money needed',
    nav: { explore: 'Explore', myListings: 'My Listings', trades: 'Trades', hubs: 'Hubs', profile: 'Profile' },
    local: { title: 'Near you', viewAll: 'Browse all', sub: 'Listings in your area. Use the search to explore anywhere worldwide.', empty: 'No listings in your area yet — set your city in Profile to see local items.' },
    impact: { global: 'Items traded worldwide', globalSub: 'Live community counter', section: 'Your impact', sectionSub: 'The good you have created through bartering', itemsKeptOut: 'Items kept out of landfills', hoursSaved: 'Bartering hours saved', tradesCompleted: 'Trades completed' },
    hubs: { title: 'Safe Exchange Hubs', sub: 'Verified public spaces to meet and complete trades in person', suggest: 'Suggest a spot', name: 'Spot name', type: 'Type', country: 'Country', city: 'City', address: 'Address / notes', save: 'Submit', cancel: 'Cancel', verified: 'Verified', notVerified: 'Pending review', empty: 'No hubs yet — suggest the first safe spot in your area.', types: { library: 'Library', community_center: 'Community center', public_square: 'Public square', police_station: 'Police station', market: 'Market', other: 'Other' }, disclaimer: 'These locations are suggested by your community for safety. Always meet in open, well-lit, public areas.', vote: 'Confirm safe', voted: 'Confirmed', verifiedOnly: 'Verified hubs only', votesLabel: 'confirmations', thresholdHint: 'Spots are marked verified after 3 community confirmations.', locating: 'Locating you…', useLocation: 'Use my location' },
    search: { placeholder: 'Search listings...', location: 'Location', radius: 'Radius (km)', allLocations: 'All countries', allLanguages: 'All languages', anyTown: 'All cities', language: 'Language', town: 'Town', category: 'Category', allCategories: 'All categories', type: 'Type', allTypes: 'All', goods: 'Goods', services: 'Services', intent: 'Intent', allIntents: 'All', offerings: 'Offerings', seekings: 'Requests',       search: 'Search', searchLang: 'Search languages...', clear: 'Clear' },
    categories: { electronics: 'Electronics', computers: 'Computers', phones: 'Phones', camera: 'Cameras & Photo', audio: 'Audio & Sound', gaming: 'Gaming', furniture: 'Furniture', home: 'Home & Decor', kitchen: 'Kitchenware', garden: 'Garden', tools: 'Tools', appliances: 'Appliances', clothing: 'Clothing', footwear: 'Footwear', accessories: 'Accessories', jewelry: 'Jewelry', beauty: 'Beauty', books: 'Books', media: 'Movies & Music', music: 'Instruments', art: 'Art', crafts: 'Crafts', collectibles: 'Collectibles', sports: 'Sports', fitness: 'Fitness', outdoors: 'Outdoors', bicycles: 'Bicycles', vehicles: 'Vehicles', toys: 'Toys', baby: 'Baby', kids: 'Kids', pets: 'Pets', office: 'Office & Stationery', agriculture: 'Agriculture', food: 'Food & Groceries', repairs: 'Repairs', maintenance: 'Maintenance', cleaning: 'Cleaning', transport: 'Transport', moving: 'Moving Help', cooking: 'Cooking', tutoring: 'Tutoring', languages: 'Languages', music_lessons: 'Music Lessons', design: 'Design', writing: 'Writing', translation: 'Translation', it_services: 'IT Services', consulting: 'Consulting', marketing: 'Marketing', photo_video: 'Photo & Video', events: 'Events', travel: 'Travel', health: 'Health', wellness: 'Wellness', other: 'Other' },
    listing: { new: 'New Listing', title: 'Title', description: 'Description', intent: 'I am', offering: 'Offering', seeking: 'Seeking', offeringHint: 'I am offering this good or service', seekingHint: 'I am looking for this good or service', seekingField: 'What I am looking for', seekingPlaceholder: 'Search items or skills...', seekingAdd: 'Add', lookingFor: 'Looking for', returnMode: 'What do you want in return?', modeSpecific: 'Looking for something specific', modeAnything: 'Open to Anything', modeAnythingHint: 'Accept any fair counter-offer — leave the specifics open.', modeSpecificHint: 'Describe what you want in return.', openToAnything: 'Open to Offers / Anything!', seekingAnythingBadge: 'Open to Anything', openToAnythingDesc: 'This owner is open to any fair exchange. Offer one of your own listings to start a trade.', type: 'Type', good: 'Good', service: 'Service', category: 'Category', country: 'Country', city: 'City / Town', town: 'Village / Area', language: 'Language', images: 'Images', addImage: 'Add image URL', save: 'Save Listing', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', back: 'Back', by: 'By', location: 'Location', proposeTrade: 'Propose Trade', fulfillRequest: 'Offer this', counterOffer: 'Offer Your Listing', myListing: 'Your listing', propose: 'Propose', valueHint: 'Fairness is calculated internally — no prices are ever shown.', contact: 'Contact', noImages: 'No images yet' },
    trade: { title: 'Trades', empty: 'No trades yet', youOffered: 'You offered', youRequested: 'You requested', status: { pending: 'Pending', accepted: 'Accepted', completed: 'Completed', cancelled: 'Cancelled' }, accept: 'Accept', decline: 'Decline', markComplete: 'Mark as Completed', cancel: 'Cancel Trade', chat: 'Conversation', messages: 'Messages', send: 'Send', typeMessage: 'Type a message...', completeConfirm: 'Only mark complete after you have met in person and inspected the exchange.', bothComplete: 'Both parties must confirm completion', leaveReview: 'Leave a Review', rating: 'Rating', comment: 'Comment', recommend: 'Recommend this user', submitReview: 'Submit Review', reviewLeft: 'Review submitted', offered: 'Offered', requested: 'Requested', safeSpot: 'Meetup safe hub', chooseSpot: 'Choose a verified hub for the exchange', spotSaved: 'Safe hub saved', noSpots: 'No verified hubs yet' },
    value: { fair: 'Fair Exchange', balanced: 'Well Balanced', slightlyUnbalanced: 'Slightly Unbalanced', unbalanced: 'Unbalanced Exchange', explanation: 'This is a non-monetary fairness indicator. No cash values are involved.' },
    safety: { title: 'Stay Safe', body: 'Always meet in a public place and inspect goods or services thoroughly in person before finalizing. Exchanges are final once you complete the trade in person.' },
    profile: { title: 'Profile', language: 'Language', country: 'Country', city: 'City / Town', town: 'Village / Area', bio: 'Bio', save: 'Save Profile', myListings: 'My Listings', reviews: 'Reviews', logout: 'Log out', noListings: 'You have no listings yet', noReviews: 'No reviews yet', createListing: 'Create a listing' },
    common: { loading: 'Loading...', empty: 'Nothing here yet', create: 'Create', close: 'Close', you: 'You' },
    landing: { hero: 'Trade anything, anywhere — without money', sub: 'Barti connects people worldwide to exchange goods and services through fair bartering across countries, cities, and villages.', cta: 'Start Exploring', feature1: 'Goods & Services', feature1d: 'List physical items or skills you can offer.', feature2: 'Smart Matching', feature2d: 'A built-in fairness engine keeps exchanges balanced.', feature3: 'Global & Local', feature3d: 'Find barters near you or across the world.' }
  },
  es: {
    _dir: 'ltr',
    appName: 'Barti',
    tagline: 'Intercambia bienes y servicios, sin dinero',
    nav: { explore: 'Explorar', myListings: 'Mis Anuncios', trades: 'Intercambios', hubs: 'Puntos Seguros', profile: 'Perfil' },
    local: { title: 'Cerca de ti', viewAll: 'Ver todo', sub: 'Anuncios en tu zona. Usa la búsqueda para explorar cualquier lugar del mundo.', empty: 'Aún no hay anuncios en tu zona — configura tu ciudad en el Perfil para ver artículos locales.' },
    impact: { global: 'Artículos intercambiados en el mundo', globalSub: 'Contador comunitario en vivo', section: 'Tu impacto', sectionSub: 'El bien que has creado mediante el trueque', itemsKeptOut: 'Artículos salvados de vertederos', hoursSaved: 'Horas de trueque ahorradas', tradesCompleted: 'Intercambios completados' },
    hubs: { title: 'Puntos de Intercambio Seguro', sub: 'Espacios públicos verificados para reunirse y completar intercambios en persona', suggest: 'Sugerir un punto', name: 'Nombre del punto', type: 'Tipo', country: 'País', city: 'Ciudad', address: 'Dirección / notas', save: 'Enviar', cancel: 'Cancelar', verified: 'Verificado', notVerified: 'Pendiente de revisión', empty: 'Aún no hay puntos — sugiere el primero en tu zona.', types: { library: 'Biblioteca', community_center: 'Centro comunitario', public_square: 'Plaza pública', police_station: 'Comisaría', market: 'Mercado', other: 'Otro' }, disclaimer: 'Estos lugares son sugeridos por tu comunidad por seguridad. Reúnete siempre en zonas abiertas, iluminadas y públicas.', vote: 'Confirmar seguro', voted: 'Confirmado', verifiedOnly: 'Solo puntos verificados', votesLabel: 'confirmaciones', thresholdHint: 'Los puntos se marcan como verificados tras 3 confirmaciones de la comunidad.', locating: 'Ubicándote…', useLocation: 'Usar mi ubicación' },
    search: { placeholder: 'Buscar anuncios...', location: 'Ubicación', radius: 'Radio (km)', allLocations: 'Todos los países', allLanguages: 'Todos los idiomas', anyTown: 'Todas las ciudades', language: 'Idioma', town: 'Pueblo', category: 'Categoría', allCategories: 'Todas', type: 'Tipo', allTypes: 'Todos', goods: 'Bienes', services: 'Servicios', intent: 'Intención', allIntents: 'Todos', offerings: 'Ofertas', seekings: 'Peticiones',       search: 'Buscar', searchLang: 'Buscar idiomas...', clear: 'Limpiar' },
    categories: { electronics: 'Electrónica', computers: 'Ordenadores', phones: 'Teléfonos', camera: 'Cámaras y Foto', audio: 'Audio y Sonido', gaming: 'Videojuegos', furniture: 'Mobiliario', home: 'Hogar y Decoración', kitchen: 'Menaje de Cocina', garden: 'Jardín', tools: 'Herramientas', appliances: 'Electrodomésticos', clothing: 'Ropa', footwear: 'Calzado', accessories: 'Accesorios', jewelry: 'Joyería', beauty: 'Belleza', books: 'Libros', media: 'Películas y Música', music: 'Instrumentos', art: 'Arte', crafts: 'Manualidades', collectibles: 'Coleccionismo', sports: 'Deportes', fitness: 'Fitness', outdoors: 'Aire Libre', bicycles: 'Bicicletas', vehicles: 'Vehículos', toys: 'Juguetes', baby: 'Bebé', kids: 'Niños', pets: 'Mascotas', office: 'Oficina y Papelería', agriculture: 'Agricultura', food: 'Alimentación', repairs: 'Reparaciones', maintenance: 'Mantenimiento', cleaning: 'Limpieza', transport: 'Transporte', moving: 'Ayuda con Mudanzas', cooking: 'Cocina', tutoring: 'Tutorías', languages: 'Idiomas', music_lessons: 'Clases de Música', design: 'Diseño', writing: 'Escritura', translation: 'Traducción', it_services: 'Servicios Informáticos', consulting: 'Consultoría', marketing: 'Marketing', photo_video: 'Foto y Vídeo', events: 'Eventos', travel: 'Viajes', health: 'Salud', wellness: 'Bienestar', other: 'Otro' },
    listing: { new: 'Nuevo Anuncio', title: 'Título', description: 'Descripción', intent: 'Yo', offering: 'Ofrezco', seeking: 'Busco', offeringHint: 'Ofrezco este bien o servicio', seekingHint: 'Busco este bien o servicio', seekingField: 'Lo que busco', seekingPlaceholder: 'Buscar artículos o habilidades...', seekingAdd: 'Añadir', lookingFor: 'Busca', returnMode: '¿Qué buscas a cambio?', modeSpecific: 'Busco algo específico', modeAnything: 'Abierto a cualquier cosa', modeAnythingHint: 'Acepta cualquier contraoferta justa — deja abierto el detalle.', modeSpecificHint: 'Describe lo que quieres a cambio.', openToAnything: '¡Abierto a Ofertas / Cualquier cosa!', seekingAnythingBadge: 'Abierto a todo', openToAnythingDesc: 'Este dueño está abierto a cualquier intercambio justo. Ofrece uno de tus anuncios para iniciar el trueque.', type: 'Tipo', good: 'Bien', service: 'Servicio', category: 'Categoría', country: 'País', city: 'Ciudad / Pueblo', town: 'Aldea / Zona', language: 'Idioma', images: 'Imágenes', addImage: 'Añadir URL de imagen', save: 'Guardar Anuncio', cancel: 'Cancelar', edit: 'Editar', delete: 'Eliminar', back: 'Volver', by: 'Por', location: 'Ubicación', proposeTrade: 'Proponer Intercambio', fulfillRequest: 'Ofrecer esto', counterOffer: 'Ofrece tu anuncio', myListing: 'Tu anuncio', propose: 'Proponer', valueHint: 'La equidad se calcula internamente — nunca se muestran precios.', contact: 'Contacto', noImages: 'Sin imágenes aún' },
    trade: { title: 'Intercambios', empty: 'Sin intercambios aún', youOffered: 'Ofreciste', youRequested: 'Solicitaste', status: { pending: 'Pendiente', accepted: 'Aceptado', completed: 'Completado', cancelled: 'Cancelado' }, accept: 'Aceptar', decline: 'Rechazar', markComplete: 'Marcar como Completado', cancel: 'Cancelar Intercambio', chat: 'Conversación', messages: 'Mensajes', send: 'Enviar', typeMessage: 'Escribe un mensaje...', completeConfirm: 'Solo marca como completado tras reunirte en persona e inspeccionar el intercambio.', bothComplete: 'Ambas partes deben confirmar la finalización', leaveReview: 'Deja una Reseña', rating: 'Valoración', comment: 'Comentario', recommend: 'Recomendar a este usuario', submitReview: 'Enviar Reseña', reviewLeft: 'Reseña enviada', offered: 'Ofrecido', requested: 'Solicitado', safeSpot: 'Punto seguro de encuentro', chooseSpot: 'Elige un punto verificado para el intercambio', spotSaved: 'Punto guardado', noSpots: 'Aún no hay puntos verificados' },
    value: { fair: 'Intercambio Justo', balanced: 'Bien Equilibrado', slightlyUnbalanced: 'Ligeramente Desequilibrado', unbalanced: 'Intercambio Desequilibrado', explanation: 'Este es un indicador de equidad no monetario. No hay valores en efectivo.' },
    safety: { title: 'Mantente Seguro', body: 'Reúnete siempre en un lugar público e inspecciona los bienes o servicios minuciosamente en persona antes de finalizar. Los intercambios son definitivos una vez completados en persona.' },
    profile: { title: 'Perfil', language: 'Idioma', country: 'País', city: 'Ciudad / Pueblo', town: 'Aldea / Zona', verified: 'ID Verificado', notVerified: 'No verificado', verify: 'Verificar ID Oficial', verifyTitle: 'Verifica tu identidad', verifyDesc: 'Confirma tu identidad con un documento oficial. Esto desbloquea la insignia de verificado en tu perfil.', legalName: 'Nombre legal completo', docType: 'Tipo de documento', dtPassport: 'Pasaporte', dtNationalID: 'Carné de identidad nacional', dtLicense: 'Licencia de conducir', dtResPermit: 'Permiso de residencia', docNumber: 'Número de documento', issuingCountry: 'País emisor', ack: 'Confirmo que estos datos son exactos.', verifyNow: 'Verificar ahora', verifying: 'Verificando...', verifySuccess: '¡Identidad verificada!', verifyError: 'La verificación falló. Inténtalo de nuevo.', bio: 'Bio', save: 'Guardar Perfil', myListings: 'Mis Anuncios', reviews: 'Reseñas', logout: 'Cerrar sesión', noListings: 'No tienes anuncios aún', noReviews: 'Sin reseñas aún', createListing: 'Crear un anuncio' },
    common: { loading: 'Cargando...', empty: 'Nada por aquí aún', create: 'Crear', close: 'Cerrar', you: 'Tú' },
    landing: { hero: 'Intercambia cualquier cosa, en cualquier lugar — sin dinero', sub: 'Barti conecta personas en todo el mundo para intercambiar bienes y servicios mediante trueque justo entre países, ciudades y aldeas.', cta: 'Empezar a Explorar', feature1: 'Bienes y Servicios', feature1d: 'Lista artículos físicos o habilidades que puedas ofrecer.', feature2: 'Coincidencia Inteligente', feature2d: 'Un motor de equidad integrado mantiene los intercambios balanceados.', feature3: 'Global y Local', feature3d: 'Encuentra trueques cerca de ti o por el mundo.' }
  },
  fr: {
    _dir: 'ltr',
    appName: 'Barti',
    tagline: 'Échangez biens et services, sans argent',
    nav: { explore: 'Explorer', myListings: 'Mes Annonces', trades: 'Échanges', hubs: 'Lieux Sûrs', profile: 'Profil' },
    local: { title: 'Près de chez vous', viewAll: 'Tout voir', sub: 'Annonces dans votre région. Utilisez la recherche pour explorer partout dans le monde.', empty: 'Aucune annonce près de chez vous — définissez votre ville dans le Profil.' },
    impact: { global: 'Articles échangés dans le monde', globalSub: 'Compteur communautaire en direct', section: 'Votre impact', sectionSub: 'Le bien que vous avez créé par le troc', itemsKeptOut: 'Articles sauvés des décharges', hoursSaved: 'Heures de troc économisées', tradesCompleted: 'Échanges terminés' },
    hubs: { title: 'Lieux de Rencontre Sûrs', sub: 'Espaces publics vérifiés pour se rencontrer et finaliser les échanges en personne', suggest: 'Suggérer un lieu', name: 'Nom du lieu', type: 'Type', country: 'Pays', city: 'Ville', address: 'Adresse / notes', save: 'Envoyer', cancel: 'Annuler', verified: 'Vérifié', notVerified: 'En attente de vérification', empty: 'Aucun lieu pour le moment — suggérez le premier lieu sûr près de chez vous.', types: { library: 'Bibliothèque', community_center: 'Centre communautaire', public_square: 'Place publique', police_station: 'Commissariat', market: 'Marché', other: 'Autre' }, disclaimer: 'Ces lieux sont suggérés par votre communauté pour la sécurité. Rencontrez-vous toujours dans des endroits ouverts, bien éclairés et publics.', vote: 'Confirmer sûr', voted: 'Confirmé', verifiedOnly: 'Lieux vérifiés seulement', votesLabel: 'confirmations', thresholdHint: 'Les lieux sont marqués vérifiés après 3 confirmations de la communauté.', locating: 'Localisation…', useLocation: 'Utiliser ma position' },
    search: { placeholder: 'Rechercher des annonces...', location: 'Lieu', radius: 'Rayon (km)', allLocations: 'Tous les pays', allLanguages: 'Toutes les langues', anyTown: 'Toutes les villes', language: 'Langue', town: 'Ville', category: 'Catégorie', allCategories: 'Toutes', type: 'Type', allTypes: 'Tous', goods: 'Biens', services: 'Services', intent: 'Intention', allIntents: 'Tous', offerings: 'Offres', seekings: 'Demandes',       search: 'Rechercher', searchLang: 'Rechercher une langue...', clear: 'Effacer' },
    categories: { electronics: 'Électronique', computers: 'Ordinateurs', phones: 'Téléphones', camera: 'Caméras & Photo', audio: 'Audio & Son', gaming: 'Jeux vidéo', furniture: 'Ameublement', home: 'Maison & Déco', kitchen: 'Ustensiles de cuisine', garden: 'Jardin', tools: 'Outils', appliances: 'Électroménager', clothing: 'Vêtements', footwear: 'Chaussures', accessories: 'Accessoires', jewelry: 'Bijoux', beauty: 'Beauté', books: 'Livres', media: 'Films & Musique', music: 'Instruments', art: 'Art', crafts: 'Loisirs créatifs', collectibles: 'Collection', sports: 'Sports', fitness: 'Fitness', outdoors: 'Plein air', bicycles: 'Vélos', vehicles: 'Véhicules', toys: 'Jouets', baby: 'Bébé', kids: 'Enfants', pets: 'Animaux', office: 'Bureau & Fournitures', agriculture: 'Agriculture', food: 'Alimentation', repairs: 'Réparations', maintenance: 'Entretien', cleaning: 'Nettoyage', transport: 'Transport', moving: 'Aide au déménagement', cooking: 'Cuisine', tutoring: 'Soutien scolaire', languages: 'Langues', music_lessons: 'Cours de musique', design: 'Design', writing: 'Écriture', translation: 'Traduction', it_services: 'Services informatiques', consulting: 'Conseil', marketing: 'Marketing', photo_video: 'Photo & Vidéo', events: 'Événements', travel: 'Voyages', health: 'Santé', wellness: 'Bien-être', other: 'Autre' },
    listing: { new: 'Nouvelle Annonce', title: 'Titre', description: 'Description', intent: 'Je', offering: 'Propose', seeking: 'Recherche', offeringHint: 'Je propose ce bien ou service', seekingHint: 'Je recherche ce bien ou service', seekingField: 'Ce que je recherche', seekingPlaceholder: 'Rechercher des articles ou compétences...', seekingAdd: 'Ajouter', lookingFor: 'Recherche', returnMode: 'Que recherchez-vous en retour ?', modeSpecific: 'Je recherche quelque chose de précis', modeAnything: 'Ouvert à Tout', modeAnythingHint: 'Accepte toute contre-offre équitable — laissez les détails ouverts.', modeSpecificHint: 'Décrivez ce que vous voulez en retour.', openToAnything: 'Ouvert aux Offres / À Tout !', seekingAnythingBadge: 'Ouvert à tout', openToAnythingDesc: 'Ce propriétaire est ouvert à tout échange équitable. Proposez l\'une de vos annonces pour lancer le troc.', type: 'Type', good: 'Bien', service: 'Service', category: 'Catégorie', country: 'Pays', city: 'Ville / Village', town: 'Hameau / Quartier', language: 'Langue', images: 'Images', addImage: 'Ajouter une URL d\'image', save: 'Enregistrer', cancel: 'Annuler', edit: 'Modifier', delete: 'Supprimer', back: 'Retour', by: 'Par', location: 'Lieu', proposeTrade: 'Proposer un Échange', fulfillRequest: 'Proposer ceci', counterOffer: 'Proposez votre annonce', myListing: 'Votre annonce', propose: 'Proposer', valueHint: 'L\'équité est calculée en interne — aucun prix n\'est affiché.', contact: 'Contact', noImages: 'Pas d\'images' },
    trade: { title: 'Échanges', empty: 'Aucun échange', youOffered: 'Vous avez offert', youRequested: 'Vous avez demandé', status: { pending: 'En attente', accepted: 'Accepté', completed: 'Terminé', cancelled: 'Annulé' }, accept: 'Accepter', decline: 'Refuser', markComplete: 'Marquer comme Terminé', cancel: 'Annuler l\'Échange', chat: 'Conversation', messages: 'Messages', send: 'Envoyer', typeMessage: 'Écrivez un message...', completeConfirm: 'Ne marquez comme terminé qu\'après une rencontre en personne et inspection.', bothComplete: 'Les deux parties doivent confirmer l\'achèvement', leaveReview: 'Laisser un Avis', rating: 'Note', comment: 'Commentaire', recommend: 'Recommander cet utilisateur', submitReview: 'Envoyer l\'Avis', reviewLeft: 'Avis envoyé', offered: 'Offert', requested: 'Demandé', safeSpot: 'Lieu sûr de rendez-vous', chooseSpot: 'Choisissez un lieu vérifié pour la rencontre', spotSaved: 'Lieu enregistré', noSpots: 'Aucun lieu vérifié' },
    value: { fair: 'Échange Équitable', balanced: 'Bien Équilibré', slightlyUnbalanced: 'Légèrement Déséquilibré', unbalanced: 'Échange Déséquilibré', explanation: 'Ceci est un indicateur d\'équité non monétaire. Aucune valeur monétaire.' },
    safety: { title: 'Restez en Sécurité', body: 'Rencontrez toujours dans un lieu public et inspectez les biens ou services en personne avant de finaliser. Les échanges sont définitifs une fois terminés en personne.' },
    profile: { title: 'Profil', language: 'Langue', country: 'Pays', city: 'Ville / Village', town: 'Hameau / Quartier', verified: 'ID Vérifié', notVerified: 'Non vérifié', verify: 'Vérifier l\'ID Officiel', verifyTitle: 'Vérifiez votre identité', verifyDesc: 'Confirmez votre identité avec un document officiel. Cela débloque le badge vérifié sur votre profil.', legalName: 'Nom légal complet', docType: 'Type de document', dtPassport: 'Passeport', dtNationalID: 'Carte d\'identité nationale', dtLicense: 'Permis de conduire', dtResPermit: 'Permis de résidence', docNumber: 'Numéro de document', issuingCountry: 'Pays émetteur', ack: 'Je confirme que ces informations sont exactes.', verifyNow: 'Vérifier maintenant', verifying: 'Vérification...', verifySuccess: 'Identité vérifiée !', verifyError: 'La vérification a échoué. Réessayez.', bio: 'Bio', save: 'Enregistrer le Profil', myListings: 'Mes Annonces', reviews: 'Avis', logout: 'Déconnexion', noListings: 'Aucune annonce', noReviews: 'Aucun avis', createListing: 'Créer une annonce' },
    common: { loading: 'Chargement...', empty: 'Rien ici', create: 'Créer', close: 'Fermer', you: 'Vous' },
    landing: { hero: 'Échangez tout, partout — sans argent', sub: 'Barti connecte des personnes du monde entier pour échanger biens et services via un troc équitable entre pays, villes et villages.', cta: 'Commencer à Explorer', feature1: 'Biens & Services', feature1d: 'Listez des objets physiques ou des compétences.', feature2: 'Correspondance Intelligente', feature2d: 'Un moteur d\'équité intégré garde les échanges équilibrés.', feature3: 'Global & Local', feature3d: 'Trouvez des trocs près de chez vous ou partout.' }
  },
  ar: {
    _dir: 'rtl',
    appName: 'بارتي',
    tagline: 'تبادل السلع والخدمات دون أموال',
    nav: { explore: 'استكشاف', myListings: 'إعلاناتي', trades: 'المقايضات', hubs: 'النقاط الآمنة', profile: 'الملف الشخصي' },
    local: { title: 'قريب منك', viewAll: 'تصفح الكل', sub: 'إعلانات في منطقتك. استخدم البحث لاستكشاف أي مكان حول العالم.', empty: 'لا إعلانات في منطقتك بعد — اضبط مدينتك في الملف الشخصي لمعرفة العناصر المحلية.' },
    impact: { global: 'عناصر تمت مقايضتها عالميًا', globalSub: 'العداد المجتمعي المباشر', section: 'مساهمتك', sectionSub: 'الخير الذي وجدته عبر المقايضة', itemsKeptOut: 'عناصر نُجيت من المكبات', hoursSaved: 'ساعات مقايضة موفّرة', tradesCompleted: 'مقايضات مكتملة' },
    hubs: { title: 'نقاط التبادل الآمنة', sub: 'مساحات عامة موثقة للالتقاء وإتمام المقايضات شخصيًا', suggest: 'اقترح نقطة', name: 'اسم النقطة', type: 'النوع', country: 'الدولة', city: 'المدينة', address: 'العنوان / ملاحظات', save: 'إرسال', cancel: 'إلغاء', verified: 'موثّق', notVerified: 'قيد المراجعة', empty: 'لا نقاط بعد — اقترح أول نقطة آمنة في منطقتك.', types: { library: 'مكتبة', community_center: 'مركز مجتمعي', public_square: 'ساحة عامة', police_station: 'مركز شرطة', market: 'سوق', other: 'أخرى' }, disclaimer: 'هذه المواقع مقترحة من مجتمعك لأجل السلامة. التقِ دائمًا في أماكن مفتوحة ومضاءة وعامة.', vote: 'تأكيد آمن', voted: 'مؤكد', verifiedOnly: 'النقاط الموثقة فقط', votesLabel: 'تأكيدات', thresholdHint: 'تُوسم النقاط كموثقة بعد 3 تأكيدات من المجتمع.', locating: 'جارٍ تحديد موقعك…', useLocation: 'استخدم موقعي' },
    search: { placeholder: 'ابحث في الإعلانات...', location: 'الموقع', radius: 'نصف القطر (كم)', allLocations: 'كل الدول', allLanguages: 'كل اللغات', anyTown: 'كل المدن', language: 'اللغة', town: 'البلدة', category: 'الفئة', allCategories: 'كل الفئات', type: 'النوع', allTypes: 'الكل', goods: 'سلع', services: 'خدمات', intent: 'النية', allIntents: 'الكل', offerings: 'عروض', seekings: 'طلبات',       search: 'بحث', searchLang: 'ابحث عن لغة...', clear: 'مسح' },
    categories: { electronics: 'إلكترونيات', computers: 'حواسيب', phones: 'هواتف', camera: 'كاميرات وتصوير', audio: 'صوتيات', gaming: 'ألعاب فيديو', furniture: 'أثاث', home: 'المنزل والديكور', kitchen: 'أدوات مطبخ', garden: 'حديقة', tools: 'أدوات', appliances: 'أجهزة منزلية', clothing: 'ملابس', footwear: 'أحذية', accessories: 'إكسسوارات', jewelry: 'مجوهرات', beauty: 'تجميل', books: 'كتب', media: 'أفلام وموسيقى', music: 'آلات موسيقية', art: 'فنون', crafts: 'حرف يدوية', collectibles: 'مقتنيات', sports: 'رياضة', fitness: 'لياقة', outdoors: 'أنشطة خارجية', bicycles: 'دراجات', vehicles: 'مركبات', toys: 'ألعاب', baby: 'أطفال رضع', kids: 'أطفال', pets: 'حيوانات أليفة', office: 'مكتب وقرطاسية', agriculture: 'زراعة', food: 'أغذية', repairs: 'إصلاحات', maintenance: 'صيانة', cleaning: 'تنظيف', transport: 'نقل', moving: 'مساعدة في الانتقال', cooking: 'طبخ', tutoring: 'تدريس', languages: 'لغات', music_lessons: 'دروس موسيقى', design: 'تصميم', writing: 'كتابة', translation: 'ترجمة', it_services: 'خدمات تقنية', consulting: 'استشارات', marketing: 'تسويق', photo_video: 'تصوير فوتوغرافي وفيديو', events: 'فعاليات', travel: 'سفر', health: 'صحة', wellness: 'عافية', other: 'أخرى' },
    listing: { new: 'إعلان جديد', title: 'العنوان', description: 'الوصف', intent: 'أنا', offering: 'أعرض', seeking: 'أبحث عن', offeringHint: 'أعرض هذا السلعة أو الخدمة', seekingHint: 'أبحث عن هذا السلعة أو الخدمة', seekingField: 'ما أبحث عنه', seekingPlaceholder: 'ابحث عن عناصر أو مهارات...', seekingAdd: 'إضافة', lookingFor: 'يبحث عن', returnMode: 'ماذا تريد في المقابل؟', modeSpecific: 'أبحث عن شيء محدد', modeAnything: 'منفتح على أي شيء', modeAnythingHint: 'اقبل أي عرض مقابل عادل — اترك التفاصيل مفتوحة.', modeSpecificHint: 'صف ما تريده في المقابل.', openToAnything: 'منفتح على العروض / أي شيء!', seekingAnythingBadge: 'منفتح على الكل', openToAnythingDesc: 'هذا المالك منفتح على أي تبادل عادل. قدّم أحد إعلاناتك لبدء المقايضة.', type: 'النوع', good: 'سلعة', service: 'خدمة', category: 'الفئة', country: 'الدولة', city: 'المدينة / البلدة', town: 'القرية / المنطقة', language: 'اللغة', images: 'الصور', addImage: 'أضف رابط صورة', save: 'حفظ الإعلان', cancel: 'إلغاء', edit: 'تعديل', delete: 'حذف', back: 'رجوع', by: 'بواسطة', location: 'الموقع', proposeTrade: 'اقترح مقايضة', fulfillRequest: 'قدّم هذا', counterOffer: 'قدّم إعلانك', myListing: 'إعلانك', propose: 'اقترح', valueHint: 'يتم حساب العدالة داخليًا — لا تظهر الأسعار مطلقًا.', contact: 'تواصل', noImages: 'لا صور بعد' },
    trade: { title: 'المقايضات', empty: 'لا مقايضات بعد', youOffered: 'عرضت', youRequested: 'طلبت', status: { pending: 'قيد الانتظار', accepted: 'مقبول', completed: 'مكتمل', cancelled: 'ملغى' }, accept: 'قبول', decline: 'رفض', markComplete: 'وضع كمكتمل', cancel: 'إلغاء المقايضة', chat: 'المحادثة', messages: 'الرسائل', send: 'إرسال', typeMessage: 'اكتب رسالة...', completeConfirm: 'ضع كمكتمل فقط بعد اللقاء شخصيًا وفحص المقايضة.', bothComplete: 'يجب على الطرفين تأكيد الإتمام', leaveReview: 'اترك تقييمًا', rating: 'التقييم', comment: 'تعليق', recommend: 'أوصِ بهذا المستخدم', submitReview: 'إرسال التقييم', reviewLeft: 'تم إرسال التقييم', offered: 'مُقدَّم', requested: 'مطلوب', safeSpot: 'نقطة لقاء آمنة', chooseSpot: 'اختر نقطة موثقة للقاء', spotSaved: 'تم حفظ النقطة', noSpots: 'لا نقاط موثقة بعد' },
    value: { fair: 'مقايضة عادلة', balanced: 'متوازنة جيدًا', slightlyUnbalanced: 'غير متوازنة قليلاً', unbalanced: 'مقايضة غير متوازنة', explanation: 'هذا مؤشر عدالة غير نقدي. لا توجد قيم نقدية.' },
    safety: { title: 'ابقَ آمنًا', body: 'التقِ دائمًا في مكان عام وفحص السلع أو الخدمات بدقة شخصيًا قبل الإتمام. المقايضات نهائية بعد إتمامها شخصيًا.' },
    profile: { title: 'الملف الشخصي', language: 'اللغة', country: 'الدولة', city: 'المدينة / البلدة', town: 'القرية / المنطقة', verified: 'هوية موثقة', notVerified: 'غير موثق', verify: 'وثّق هويتك الرسمية', verifyTitle: 'تحقق من هويتك', verifyDesc: 'أكّد هويتك بمستند رسمي حكومي. يُفعّل شارة موثّق على ملفك الشخصي.', legalName: 'الاسم القانوني الكامل', docType: 'نوع المستند', dtPassport: 'جواز سفر', dtNationalID: 'بطاقة هوية وطنية', dtLicense: 'رخصة قيادة', dtResPermit: 'تصريح إقامة', docNumber: 'رقم المستند', issuingCountry: 'الدولة المُصدِرة', ack: 'أؤكد أن هذه البيانات دقيقة.', verifyNow: 'تحقق الآن', verifying: 'جارٍ التحقق...', verifySuccess: 'تم التحقق من الهوية!', verifyError: 'فشل التحقق. حاول مرة أخرى.', bio: 'نبذة', save: 'حفظ الملف', myListings: 'إعلاناتي', reviews: 'التقييمات', logout: 'تسجيل الخروج', noListings: 'لا إعلانات بعد', noReviews: 'لا تقييمات بعد', createListing: 'أنشئ إعلانًا' },
    common: { loading: 'جارٍ التحميل...', empty: 'لا شيء هنا', create: 'إنشاء', close: 'إغلاق', you: 'أنت' },
    landing: { hero: 'قايض أي شيء، في أي مكان — دون أموال', sub: 'يربط بارتي الناس حول العالم لتبادل السلع والخدمات عبر مقايضة عادلة بين الدول والمدن والقرى.', cta: 'ابدأ الاستكشاف', feature1: 'سلع وخدمات', feature1d: 'أدر عناصر مادية أو مهارات يمكنك تقديمها.', feature2: 'مطابقة ذكية', feature2d: 'محرك عدالة مدمج يبقي المقايضات متوازنة.', feature3: 'عالمي ومحلي', feature3d: 'اعثر على مقايضات قربك أو حول العالم.' }
  }
};

// Languages written right-to-left; everything else is treated as LTR.
const RTL_CODES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'dv', 'ug', 'ks']);

// Comprehensive list of UI languages (ISO 639-1 codes). Any code here can be
// selected; when a static translation dictionary does not exist, the provider
// auto-generates (and caches) one via the LLM, so the whole UI localizes.
const UI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'ar', label: 'Arabic' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ru', label: 'Russian' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'pl', label: 'Polish' },
  { code: 'cs', label: 'Czech' },
  { code: 'sk', label: 'Slovak' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'ro', label: 'Romanian' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'sr', label: 'Serbian' },
  { code: 'hr', label: 'Croatian' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'mk', label: 'Macedonian' },
  { code: 'sq', label: 'Albanian' },
  { code: 'el', label: 'Greek' },
  { code: 'tr', label: 'Turkish' },
  { code: 'da', label: 'Danish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'nb', label: 'Norwegian' },
  { code: 'nn', label: 'Norwegian Nynorsk' },
  { code: 'fi', label: 'Finnish' },
  { code: 'is', label: 'Icelandic' },
  { code: 'et', label: 'Estonian' },
  { code: 'lv', label: 'Latvian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'be', label: 'Belarusian' },
  { code: 'ca', label: 'Catalan' },
  { code: 'eu', label: 'Basque' },
  { code: 'gl', label: 'Galician' },
  { code: 'cy', label: 'Welsh' },
  { code: 'ga', label: 'Irish' },
  { code: 'gd', label: 'Scottish Gaelic' },
  { code: 'mt', label: 'Maltese' },
  { code: 'he', label: 'Hebrew' },
  { code: 'fa', label: 'Persian' },
  { code: 'fa_AF', label: 'Dari' },
  { code: 'ps', label: 'Pashto' },
  { code: 'ur', label: 'Urdu' },
  { code: 'sd', label: 'Sindhi' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ne', label: 'Nepali' },
  { code: 'th', label: 'Thai' },
  { code: 'lo', label: 'Lao' },
  { code: 'km', label: 'Khmer' },
  { code: 'my', label: 'Burmese' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ms', label: 'Malay' },
  { code: 'tl', label: 'Filipino' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'mn', label: 'Mongolian' },
  { code: 'kk', label: 'Kazakh' },
  { code: 'uz', label: 'Uzbek' },
  { code: 'az', label: 'Azerbaijani' },
  { code: 'ky', label: 'Kyrgyz' },
  { code: 'tg', label: 'Tajik' },
  { code: 'tk', label: 'Turkmen' },
  { code: 'ka', label: 'Georgian' },
  { code: 'hy', label: 'Armenian' },
  { code: 'sw', label: 'Swahili' },
  { code: 'am', label: 'Amharic' },
  { code: 'so', label: 'Somali' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'zu', label: 'Zulu' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'st', label: 'Sesotho' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'mg', label: 'Malagasy' },
  { code: 'ht', label: 'Haitian Creole' },
  { code: 'qu', label: 'Quechua' },
  { code: 'gn', label: 'Guarani' },
  { code: 'ay', label: 'Aymara' },
  { code: 'mi', label: 'Maori' },
  { code: 'sm', label: 'Samoan' },
  { code: 'to', label: 'Tongan' },
  { code: 'ug', label: 'Uyghur' },
  { code: 'dv', label: 'Dhivehi' },
  { code: 'yi', label: 'Yiddish' },
  { code: 'or', label: 'Odia' },
  { code: 'as', label: 'Assamese' },
  { code: 'sa', label: 'Sanskrit' }
];

const LANGUAGES_BY_CODE = UI_LANGUAGES.reduce((m, l) => { m[l.code] = l; return m; }, {});

const detectDir = (code) => (RTL_CODES.has(code) ? 'rtl' : 'ltr');

// Deep-merge so dynamically translated dictionaries fall back to English for any
// missing key — guarantees t.value[...], t.trade.status[...] etc. never resolve
// to undefined even if the LLM omits a key.
const deepMerge = (base, override) => {
  if (override === undefined) return base;
  if (!base || typeof base !== 'object' || Array.isArray(base)) return override;
  if (typeof override !== 'object' || override === null) return base;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = deepMerge(base[k], override[k]);
  }
  return out;
};

const I18nContext = createContext();

export const I18nProvider = ({ children, initialLang = 'en' }) => {
  const [lang, setLangState] = useState(initialLang);
  const [t, setT] = useState(() => translations[initialLang] || translations.en);
  const [translating, setTranslating] = useState(false);

  const dir = translations[lang]?._dir || detectDir(lang);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const applyLang = (code, dict) => {
    const merged = deepMerge(translations.en, dict || {});
    merged._dir = detectDir(code);
    setT(merged);
  };

  const setLang = async (code) => {
    setLangState(code);
    if (translations[code]) { applyLang(code, translations[code]); return; }
    const cacheKey = `barti_i18n_${code}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { applyLang(code, JSON.parse(cached)); return; }
    } catch { /* ignore malformed cache */ }
    setTranslating(true);
    try {
      const langName = LANGUAGES_BY_CODE[code]?.label || code;
      const en = JSON.stringify(translations.en);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional UI localizer. Translate the user-facing strings in the JSON below into ${langName} (language code "${code}"). Return ONLY a raw JSON object (no markdown, no code fences, no commentary) with the EXACT same structure and the same keys, as the top-level object. Translate every human-readable value into ${langName}; keep object keys, enum-like codes, and English-in-code tokens verbatim. Set the "_dir" field to "rtl" if ${langName} is written right-to-left (e.g. Arabic, Hebrew, Persian/Farsi/Dari, Urdu, Pashto, Sindhi, Yiddish, Dhivehi, Uyghur, Kashmiri), otherwise "ltr". JSON:\n${en}`,
        model: 'gpt_5_mini'
      });
      // InvokeLLM returns a string when no response_json_schema is supplied —
      // strip any accidental code fences and parse the JSON object ourselves.
      const raw = typeof res === 'string' ? res.trim().replace(/^```(?:json)?\s*|\s*```$/g, '').trim() : '';
      let dict = {};
      try { dict = raw ? JSON.parse(raw) : {}; } catch { dict = {}; }
      if (!dict || typeof dict !== 'object' || Array.isArray(dict)) dict = {};
      try { localStorage.setItem(cacheKey, JSON.stringify(dict)); } catch { /* storage full */ }
      applyLang(code, dict);
    } catch {
      applyLang(code, translations.en);
    } finally {
      setTranslating(false);
    }
  };

  // On mount, hydrate a persisted non-static preference (generate if not cached)
  useEffect(() => {
    if (lang === 'en' || translations[lang]) return;
    const cacheKey = `barti_i18n_${lang}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { applyLang(lang, JSON.parse(cached)); return; }
    } catch { /* ignore */ }
    setLang(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir, translating }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

export const LANGUAGES = UI_LANGUAGES;

export { translations };