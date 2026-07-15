// =====================================
// MY PERSONAL CHEF v1.0
// Firebase + Claude API + OpenAI API
// Multi-language | Subscription model
// =====================================

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, push, update, remove, onValue }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ===== FIREBASE CONFIG =====
// 🔧 Replace with your own Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const fbApp = initializeApp(firebaseConfig);
const db    = getDatabase(fbApp);
const auth  = getAuth(fbApp);

// ===== STATE =====
let currentUser = null;
let userProfile = null;
let userLang    = 'en';
let aiProvider  = 'claude';
let chefHistory = [];
let DB          = {pantry:{},shopping:{},menu:{},recipes:{}};
let currentRecipe = null;
let recipeFilter  = 'all';
let recipeSearch  = '';
let usageCount    = 0;
const FREE_LIMIT  = 10;

// ===== TRANSLATIONS =====
const T = {
  en:{
    login:'Sign in',register:'Sign up',email:'Email',password:'Password',
    name:'Your name',createAccount:'Create account',signin:'Sign in',
    noAccount:"Don't have an account? Sign up",haveAccount:'Already have an account? Sign in',
    step1Title:'Your household',step1Sub:'Help us personalize your experience',
    adults:'Adults',children:'Children',country:'Country',
    step2Title:'Dietary preferences',step2Sub:'Select all that apply',
    step3Title:'Favorite cuisines',step3Sub:'What flavors do you love?',
    step4Title:'Choose your plan',step4Sub:'Start free, upgrade anytime',
    free:'Free',premium:'Premium ⭐',next:'Next →',letsStart:"Let's cook! 👨‍🍳",
    noRestrictions:'No restrictions',vegetarian:'Vegetarian',vegan:'Vegan',
    glutenFree:'Gluten free',lactoseFree:'Lactose free',keto:'Keto',
    highProtein:'High protein',lowSugar:'Low sugar',halal:'Halal',kosher:'Kosher',
    nav_home:'Home',nav_chef:'Chef AI',nav_recipes:'Recipes',
    nav_pantry:'Pantry',nav_menu:'Menu',nav_shopping:'Shop',
    quickActions:'Quick actions',expiringSoon:'Expiring soon',todayMenu:"Today's menu",
    chefName:'Chef AI',chefStatus:'Powered by Claude + GPT-4',
    recipes:'Recipes',all:'All',breakfast:'Breakfast',lunch:'Lunch',
    dinner:'Dinner',snack:'Snack',
    pantry:'My Pantry',add:'Add',addIngredient:'Add ingredient',
    ingredient:'Ingredient',quantity:'Quantity',expiryDate:'Expiry date (optional)',
    category:'Category',save:'Save',cancel:'Cancel',close:'Close',
    weeklyMenu:'Weekly Menu',generate:'✨ Generate',
    shoppingList:'Shopping List',addItem:'Add item',item:'Item',estimatedPrice:'Estimated price ($)',
    myPreferences:'My preferences',myPlan:'My plan',apiKeys:'Configure AI Keys',
    changeLanguage:'Change language',logout:'Sign out',
    apiKeysTitle:'AI Configuration',
    apiKeysDesc:'Add your API keys to use the AI chef. Keys are stored only on your device.',
    upgradePremium:'Upgrade to Premium',
    upgradeDesc:'Unlock unlimited AI chef, weekly menus, smart pantry and more.',
    unlimitedAI:'Unlimited AI Chef',weeklyMenuFeat:'Weekly menu generation',
    smartPantryFeat:'Smart pantry alerts',guestModeFeat:'Guest mode planning',
    noAds:'No ads',startPremium:'Start Premium — $4.99/mo',maybeLater:'Maybe later',
    addToMenu:'Add to menu',addToShopping:'🛒 Shopping list',
    feat1Free:'10 recipes/month',feat2Free:'Basic AI chef',feat3Free:'Shopping list',
    feat4Free:'Unlimited AI',feat5Free:'Weekly menu',
    feat1Premium:'Unlimited recipes',feat2Premium:'Unlimited AI chef',
    feat3Premium:'Weekly menu',feat4Premium:'Smart pantry',feat5Premium:'Guest mode',
    selectFree:'Select Free',selectPremium:'✓ Selected',
    freeLimitMsg:'You reached the free limit. Upgrade to Premium for unlimited access.',
    thinking:'Chef is thinking...',
    monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',thursday:'Thursday',
    friday:'Friday',saturday:'Saturday',sunday:'Sunday',
    breakfast2:'Breakfast',lunch2:'Lunch',dinner2:'Dinner',
    totalEstimated:'Total estimated',items:'items',purchased:'purchased',
    markAll:'Mark all',clearPurchased:'Clear purchased',
    expiresIn:'Expires in',days:'days',expired:'Expired',today2:'Today',
    totalItems:'Total items',expiring:'Expiring',outOfStock:'Out of stock',
  },
  es:{
    login:'Iniciar sesión',register:'Registrarse',email:'Correo electrónico',password:'Contraseña',
    name:'Tu nombre',createAccount:'Crear cuenta',signin:'Entrar',
    noAccount:'¿No tienes cuenta? Regístrate',haveAccount:'¿Ya tienes cuenta? Inicia sesión',
    step1Title:'Tu hogar',step1Sub:'Ayúdanos a personalizar tu experiencia',
    adults:'Adultos',children:'Niños',country:'País',
    step2Title:'Preferencias alimentarias',step2Sub:'Selecciona las que apliquen',
    step3Title:'Cocinas favoritas',step3Sub:'¿Qué sabores te encantan?',
    step4Title:'Elige tu plan',step4Sub:'Empieza gratis, mejora cuando quieras',
    free:'Gratis',premium:'Premium ⭐',next:'Siguiente →',letsStart:'¡A cocinar! 👨‍🍳',
    noRestrictions:'Sin restricciones',vegetarian:'Vegetariano',vegan:'Vegano',
    glutenFree:'Sin gluten',lactoseFree:'Sin lactosa',keto:'Keto',
    highProtein:'Alto en proteína',lowSugar:'Bajo en azúcar',halal:'Halal',kosher:'Kosher',
    nav_home:'Inicio',nav_chef:'Chef IA',nav_recipes:'Recetas',
    nav_pantry:'Despensa',nav_menu:'Menú',nav_shopping:'Compras',
    quickActions:'Acciones rápidas',expiringSoon:'Próximos a vencer',todayMenu:'Menú de hoy',
    chefName:'Chef IA',chefStatus:'Impulsado por Claude + GPT-4',
    recipes:'Recetas',all:'Todas',breakfast:'Desayuno',lunch:'Almuerzo',
    dinner:'Cena',snack:'Merienda',
    pantry:'Mi Despensa',add:'Agregar',addIngredient:'Agregar ingrediente',
    ingredient:'Ingrediente',quantity:'Cantidad',expiryDate:'Fecha de vencimiento (opcional)',
    category:'Categoría',save:'Guardar',cancel:'Cancelar',close:'Cerrar',
    weeklyMenu:'Menú Semanal',generate:'✨ Generar',
    shoppingList:'Lista de Compras',addItem:'Agregar ítem',item:'Ítem',estimatedPrice:'Precio estimado ($)',
    myPreferences:'Mis preferencias',myPlan:'Mi plan',apiKeys:'Configurar claves IA',
    changeLanguage:'Cambiar idioma',logout:'Cerrar sesión',
    apiKeysTitle:'Configuración IA',
    apiKeysDesc:'Agrega tus claves API para usar el chef IA. Las claves se guardan solo en tu dispositivo.',
    upgradePremium:'Actualizar a Premium',
    upgradeDesc:'Desbloquea chef IA ilimitado, menús semanales, despensa inteligente y más.',
    unlimitedAI:'Chef IA ilimitado',weeklyMenuFeat:'Generación de menú semanal',
    smartPantryFeat:'Alertas de despensa inteligente',guestModeFeat:'Modo invitado',
    noAds:'Sin anuncios',startPremium:'Iniciar Premium — $4.99/mes',maybeLater:'Quizás después',
    addToMenu:'Agregar al menú',addToShopping:'🛒 Lista de compras',
    feat1Free:'10 recetas/mes',feat2Free:'Chef IA básico',feat3Free:'Lista de compras',
    feat4Free:'IA ilimitada',feat5Free:'Menú semanal',
    feat1Premium:'Recetas ilimitadas',feat2Premium:'Chef IA ilimitado',
    feat3Premium:'Menú semanal',feat4Premium:'Despensa inteligente',feat5Premium:'Modo invitado',
    selectFree:'Seleccionar Gratis',selectPremium:'✓ Seleccionado',
    freeLimitMsg:'Alcanzaste el límite gratuito. Actualiza a Premium para acceso ilimitado.',
    thinking:'El chef está pensando...',
    monday:'Lunes',tuesday:'Martes',wednesday:'Miércoles',thursday:'Jueves',
    friday:'Viernes',saturday:'Sábado',sunday:'Domingo',
    breakfast2:'Desayuno',lunch2:'Almuerzo',dinner2:'Cena',
    totalEstimated:'Total estimado',items:'ítems',purchased:'comprados',
    markAll:'Marcar todo',clearPurchased:'Limpiar comprados',
    expiresIn:'Vence en',days:'días',expired:'Vencido',today2:'Hoy',
    totalItems:'Total ítems',expiring:'Por vencer',outOfStock:'Agotado',
  },
  fr:{
    login:'Connexion',register:"S'inscrire",email:'Email',password:'Mot de passe',
    name:'Votre nom',createAccount:'Créer un compte',signin:'Connexion',
    noAccount:"Pas de compte? S'inscrire",haveAccount:'Déjà un compte? Connexion',
    step1Title:'Votre foyer',step1Sub:'Aidez-nous à personnaliser votre expérience',
    adults:'Adultes',children:'Enfants',country:'Pays',
    step2Title:'Préférences alimentaires',step2Sub:'Sélectionnez tout ce qui correspond',
    step3Title:'Cuisines préférées',step3Sub:'Quelles saveurs aimez-vous?',
    step4Title:'Choisissez votre plan',step4Sub:'Commencez gratuitement',
    free:'Gratuit',premium:'Premium ⭐',next:'Suivant →',letsStart:'Cuisinons! 👨‍🍳',
    noRestrictions:'Sans restrictions',vegetarian:'Végétarien',vegan:'Végétalien',
    glutenFree:'Sans gluten',lactoseFree:'Sans lactose',keto:'Keto',
    highProtein:'Riche en protéines',lowSugar:'Faible en sucre',halal:'Halal',kosher:'Casher',
    nav_home:'Accueil',nav_chef:'Chef IA',nav_recipes:'Recettes',
    nav_pantry:'Garde-manger',nav_menu:'Menu',nav_shopping:'Courses',
    quickActions:'Actions rapides',expiringSoon:'Expirant bientôt',todayMenu:"Menu d'aujourd'hui",
    chefName:'Chef IA',chefStatus:'Propulsé par Claude + GPT-4',
    recipes:'Recettes',all:'Tout',breakfast:'Petit-déjeuner',lunch:'Déjeuner',
    dinner:'Dîner',snack:'Collation',
    pantry:'Mon Garde-manger',add:'Ajouter',addIngredient:'Ajouter ingrédient',
    ingredient:'Ingrédient',quantity:'Quantité',expiryDate:"Date d'expiration",
    category:'Catégorie',save:'Enregistrer',cancel:'Annuler',close:'Fermer',
    weeklyMenu:'Menu Hebdomadaire',generate:'✨ Générer',
    shoppingList:'Liste de courses',addItem:'Ajouter',item:'Article',estimatedPrice:'Prix estimé ($)',
    myPreferences:'Mes préférences',myPlan:'Mon plan',apiKeys:'Configurer les clés IA',
    changeLanguage:'Changer de langue',logout:'Se déconnecter',
    apiKeysTitle:'Configuration IA',apiKeysDesc:'Ajoutez vos clés API pour utiliser le chef IA.',
    upgradePremium:'Passer à Premium',upgradeDesc:'Débloquez le chef IA illimité.',
    unlimitedAI:'Chef IA illimité',weeklyMenuFeat:'Génération de menu hebdomadaire',
    smartPantryFeat:'Alertes garde-manger',guestModeFeat:'Mode invité',
    noAds:'Sans publicités',startPremium:'Démarrer Premium — 4,99$/mois',maybeLater:'Peut-être plus tard',
    addToMenu:'Ajouter au menu',addToShopping:'🛒 Liste de courses',
    feat1Free:'10 recettes/mois',feat2Free:'Chef IA basique',feat3Free:'Liste de courses',
    feat4Free:'IA illimitée',feat5Free:'Menu hebdomadaire',
    feat1Premium:'Recettes illimitées',feat2Premium:'Chef IA illimité',
    feat3Premium:'Menu hebdomadaire',feat4Premium:'Garde-manger intelligent',feat5Premium:'Mode invité',
    selectFree:'Sélectionner Gratuit',selectPremium:'✓ Sélectionné',
    freeLimitMsg:'Limite gratuite atteinte. Passez à Premium.',
    thinking:'Le chef réfléchit...',
    monday:'Lundi',tuesday:'Mardi',wednesday:'Mercredi',thursday:'Jeudi',
    friday:'Vendredi',saturday:'Samedi',sunday:'Dimanche',
    breakfast2:'Petit-déjeuner',lunch2:'Déjeuner',dinner2:'Dîner',
    totalEstimated:'Total estimé',items:'articles',purchased:'achetés',
    markAll:'Tout marquer',clearPurchased:'Effacer achetés',
    expiresIn:'Expire dans',days:'jours',expired:'Expiré',today2:"Aujourd'hui",
    totalItems:'Total articles',expiring:'Expirant',outOfStock:'Épuisé',
  }
};

// Fallback to English for missing translations
function t(key){ return (T[userLang]||T.en)[key] || T.en[key] || key; }

// ===== SAMPLE RECIPES DATABASE =====
const RECIPES_DB = [
  {id:'r1',name:'Spaghetti Carbonara',emoji:'🍝',time:25,servings:4,difficulty:'Medium',
   category:'dinner',cuisine:'italian',diet:[],
   ingredients:[{qty:'400g',name:'Spaghetti'},{qty:'200g',name:'Pancetta or bacon'},
     {qty:'4',name:'Egg yolks'},{qty:'100g',name:'Pecorino Romano'},{qty:'1 tsp',name:'Black pepper'}],
   steps:['Boil spaghetti in salted water until al dente.',
     'Fry pancetta in a pan until crispy, reserve fat.',
     'Mix egg yolks with grated cheese and pepper.',
     'Drain pasta, save 1 cup pasta water.',
     'Off heat, mix pasta with pancetta, add egg mixture.',
     'Add pasta water gradually until creamy. Serve immediately.'],
   tags:['classic','quick']},
  {id:'r2',name:'Chicken Tikka Masala',emoji:'🍛',time:45,servings:4,difficulty:'Medium',
   category:'dinner',cuisine:'indian',diet:[],
   ingredients:[{qty:'600g',name:'Chicken breast'},{qty:'400ml',name:'Coconut milk'},
     {qty:'2 tbsp',name:'Tikka masala paste'},{qty:'400g',name:'Canned tomatoes'},
     {qty:'1',name:'Onion'},{qty:'3 cloves',name:'Garlic'},{qty:'1 inch',name:'Fresh ginger'}],
   steps:['Marinate chicken in tikka paste for 30 min.',
     'Grill or pan-fry chicken until charred. Set aside.',
     'Sauté onion, garlic and ginger until soft.',
     'Add tomatoes and coconut milk. Simmer 15 min.',
     'Add chicken, simmer 10 more minutes.',
     'Serve with basmati rice and naan.'],
   tags:['spicy','protein']},
  {id:'r3',name:'Greek Salad',emoji:'🥗',time:10,servings:2,difficulty:'Easy',
   category:'lunch',cuisine:'mediterranean',diet:['vegetarian'],
   ingredients:[{qty:'2',name:'Tomatoes'},{qty:'1',name:'Cucumber'},
     {qty:'1',name:'Red onion'},{qty:'100g',name:'Feta cheese'},
     {qty:'50g',name:'Kalamata olives'},{qty:'3 tbsp',name:'Olive oil'},{qty:'1 tsp',name:'Oregano'}],
   steps:['Chop tomatoes, cucumber and onion into chunks.',
     'Add olives and crumbled feta.',
     'Drizzle olive oil and sprinkle oregano.',
     'Season with salt and pepper. Toss gently. Serve fresh.'],
   tags:['healthy','quick','vegetarian']},
  {id:'r4',name:'Avocado Toast',emoji:'🥑',time:10,servings:1,difficulty:'Easy',
   category:'breakfast',cuisine:'american',diet:['vegan'],
   ingredients:[{qty:'2 slices',name:'Sourdough bread'},{qty:'1',name:'Avocado'},
     {qty:'1',name:'Lemon'},{qty:'1 pinch',name:'Red pepper flakes'},{qty:'to taste',name:'Salt & pepper'}],
   steps:['Toast the bread until golden.',
     'Mash avocado with lemon juice, salt and pepper.',
     'Spread avocado on toast.',
     'Top with red pepper flakes. Optional: add a poached egg.'],
   tags:['quick','healthy','vegan']},
  {id:'r5',name:'Beef Tacos',emoji:'🌮',time:30,servings:4,difficulty:'Easy',
   category:'dinner',cuisine:'mexican',diet:[],
   ingredients:[{qty:'500g',name:'Ground beef'},{qty:'8',name:'Corn tortillas'},
     {qty:'1 packet',name:'Taco seasoning'},{qty:'2',name:'Tomatoes'},
     {qty:'1',name:'Onion'},{qty:'100g',name:'Cheddar cheese'},{qty:'1',name:'Lime'}],
   steps:['Cook ground beef in a pan until browned.',
     'Add taco seasoning and a splash of water. Simmer 5 min.',
     'Warm tortillas in a dry pan.',
     'Dice tomatoes and onion for pico.',
     'Assemble tacos with beef, pico, cheese and lime.'],
   tags:['quick','family']},
  {id:'r6',name:'Miso Soup',emoji:'🍜',time:15,servings:2,difficulty:'Easy',
   category:'lunch',cuisine:'japanese',diet:['vegan'],
   ingredients:[{qty:'4 cups',name:'Dashi or vegetable stock'},{qty:'3 tbsp',name:'White miso paste'},
     {qty:'100g',name:'Silken tofu'},{qty:'2 tbsp',name:'Wakame seaweed'},{qty:'2',name:'Green onions'}],
   steps:['Heat dashi stock in a pot (do not boil).',
     'Whisk miso paste with a little warm stock.',
     'Add miso mixture back to pot.',
     'Add cubed tofu and rehydrated wakame.',
     'Serve hot with sliced green onions.'],
   tags:['healthy','vegan','quick']},
  {id:'r7',name:'Pancakes',emoji:'🥞',time:20,servings:4,difficulty:'Easy',
   category:'breakfast',cuisine:'american',diet:['vegetarian'],
   ingredients:[{qty:'200g',name:'All-purpose flour'},{qty:'2 tsp',name:'Baking powder'},
     {qty:'2 tbsp',name:'Sugar'},{qty:'1',name:'Egg'},{qty:'240ml',name:'Milk'},
     {qty:'2 tbsp',name:'Butter, melted'}],
   steps:['Mix dry ingredients: flour, baking powder, sugar.',
     'Whisk wet: egg, milk, melted butter.',
     'Combine wet and dry until just mixed (lumps are ok).',
     'Heat a pan over medium heat. Grease lightly.',
     'Pour 1/4 cup batter per pancake. Cook until bubbles form.',
     'Flip and cook 1 more minute. Serve with maple syrup.'],
   tags:['quick','family','vegetarian']},
  {id:'r8',name:'Hummus',emoji:'🫙',time:10,servings:6,difficulty:'Easy',
   category:'snack',cuisine:'arabic',diet:['vegan'],
   ingredients:[{qty:'400g',name:'Canned chickpeas'},{qty:'3 tbsp',name:'Tahini'},
     {qty:'2',name:'Lemons'},{qty:'2 cloves',name:'Garlic'},{qty:'3 tbsp',name:'Olive oil'},
     {qty:'1/2 tsp',name:'Cumin'}],
   steps:['Drain and rinse chickpeas.',
     'Blend chickpeas, tahini, lemon juice and garlic.',
     'Add olive oil, cumin, salt. Blend until smooth.',
     'Add a bit of cold water for creaminess.',
     'Serve with olive oil drizzle and paprika.'],
   tags:['healthy','vegan','budget']},
];

// ===== INIT =====
window.addEventListener('load', ()=>{
  // Check saved language
  const savedLang = localStorage.getItem('mpc_lang');
  if(savedLang){ userLang=savedLang; }

  // Check auth state
  onAuthStateChanged(auth, async user=>{
    if(user){
      currentUser = user;
      await loadUserProfile();
      if(!userProfile){
        show('screen-onboarding');
        initOnboarding();
      } else {
        applyLang();
        enterApp();
      }
    } else {
      if(!savedLang){ show('screen-lang'); }
      else { show('screen-auth'); applyLang(); }
    }
  });
});

// ===== SHOW SCREENS =====
function show(id){
  ['screen-lang','screen-auth','screen-onboarding','screen-app'].forEach(s=>{
    const el=document.getElementById(s);
    if(s===id){ el.classList.remove('oculto'); if(s==='screen-app')el.classList.add('activo'); }
    else { el.classList.add('oculto'); if(s==='screen-app')el.classList.remove('activo'); }
  });
}

// ===== LANGUAGE =====
window.setLang = function(lang){
  userLang = lang;
  localStorage.setItem('mpc_lang', lang);
  applyLang();
  show('screen-auth');
};

function applyLang(){
  document.querySelectorAll('[data-i]').forEach(el=>{
    const key=el.getAttribute('data-i');
    if(T[userLang]?.[key]||T.en[key]) el.textContent=t(key);
  });
  document.documentElement.lang=userLang;
  // RTL for Arabic
  document.documentElement.dir=userLang==='ar'?'rtl':'ltr';
}

window.changeLang = function(){
  show('screen-lang');
};

// ===== AUTH =====
window.switchAuth = function(mode){
  document.getElementById('box-login').classList.toggle('oculto', mode!=='login');
  document.getElementById('box-register').classList.toggle('oculto', mode!=='register');
  document.getElementById('tab-login').classList.toggle('activo', mode==='login');
  document.getElementById('tab-register').classList.toggle('activo', mode==='register');
};

window.doLogin = async function(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  if(!email||!pass){toast('⚠️ '+t('email')+' & '+t('password')+' required');return;}
  try{
    await signInWithEmailAndPassword(auth,email,pass);
  }catch(e){
    toast('❌ '+e.message);
  }
};

window.doRegister = async function(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pass=document.getElementById('regPass').value;
  if(!name||!email||!pass){toast('⚠️ All fields required');return;}
  if(pass.length<6){toast('⚠️ Password min 6 characters');return;}
  try{
    const cred=await createUserWithEmailAndPassword(auth,email,pass);
    currentUser=cred.user;
    show('screen-onboarding');
    initOnboarding();
  }catch(e){
    toast('❌ '+e.message);
  }
};

window.doLogout = async function(){
  await signOut(auth);
  currentUser=null; userProfile=null;
  chefHistory=[];
  DB={pantry:{},shopping:{},menu:{},recipes:{}};
  show('screen-auth');
};

window.togglePass = function(id,btn){
  const i=document.getElementById(id);
  if(i.type==='password'){i.type='text';btn.textContent='🙈';}
  else{i.type='password';btn.textContent='👁';}
};

// ===== USER PROFILE =====
async function loadUserProfile(){
  if(!currentUser) return;
  const snap=await get(ref(db,`users/${currentUser.uid}/profile`));
  if(snap.exists()) userProfile=snap.val();
  // Load usage count
  const uSnap=await get(ref(db,`users/${currentUser.uid}/usage`));
  if(uSnap.exists()) usageCount=uSnap.val().count||0;
  // Load DB
  const dbSnap=await get(ref(db,`users/${currentUser.uid}`));
  if(dbSnap.exists()){
    const data=dbSnap.val();
    DB.pantry   = data.pantry   ||{};
    DB.shopping = data.shopping ||{};
    DB.menu     = data.menu     ||{};
  }
  if(userProfile?.lang) userLang=userProfile.lang;
}

async function saveProfile(profile){
  await set(ref(db,`users/${currentUser.uid}/profile`),profile);
  userProfile=profile;
}

// ===== ONBOARDING =====
let onboardData={adults:2,children:0,country:'',diets:[],cuisines:[],plan:'free'};
let onboardCurrentStep=1;

function initOnboarding(){
  applyLang();
  updateOnboardProgress();
}

function updateOnboardProgress(){
  const pct=(onboardCurrentStep/4)*100;
  document.getElementById('onboardFill').style.width=pct+'%';
  document.getElementById('onboardStep').textContent=onboardCurrentStep+' / 4';
}

window.changeCount = function(field,delta){
  onboardData[field]=Math.max(0,(onboardData[field]||0)+delta);
  document.getElementById(field+'-val').textContent=onboardData[field];
};

window.toggleDiet = function(btn){
  btn.classList.toggle('activo');
  const diet=btn.dataset.diet;
  if(btn.classList.contains('activo')){
    if(!onboardData.diets.includes(diet)) onboardData.diets.push(diet);
  } else {
    onboardData.diets=onboardData.diets.filter(d=>d!==diet);
  }
};

window.toggleCuisine = function(btn){
  btn.classList.toggle('activo');
  const c=btn.dataset.cuisine;
  if(btn.classList.contains('activo')){
    if(!onboardData.cuisines.includes(c)) onboardData.cuisines.push(c);
  } else {
    onboardData.cuisines=onboardData.cuisines.filter(x=>x!==c);
  }
};

window.selectPlan = function(plan){
  onboardData.plan=plan;
  document.getElementById('plan-free').classList.toggle('activo',plan==='free');
  document.getElementById('plan-premium').classList.toggle('activo',plan==='premium');
};

window.nextStep = function(step){
  if(step===2) onboardData.country=document.getElementById('userCountry').value.trim();
  document.getElementById('step'+(step-1)).classList.remove('activa');
  document.getElementById('step'+step).classList.add('activa');
  onboardCurrentStep=step;
  updateOnboardProgress();
};

window.finishOnboarding = async function(){
  const profile={
    name:currentUser.email?.split('@')[0]||'Chef',
    email:currentUser.email,
    adults:onboardData.adults,
    children:onboardData.children,
    country:onboardData.country,
    diets:onboardData.diets,
    cuisines:onboardData.cuisines,
    plan:onboardData.plan,
    lang:userLang,
    createdAt:new Date().toISOString()
  };
  await saveProfile(profile);
  applyLang();
  enterApp();
};

// ===== ENTER APP =====
function enterApp(){
  show('screen-app');
  applyLang();
  initNavTeclado();
  // Load API keys from localStorage
  const ck=localStorage.getItem('mpc_claude_key');
  const ok=localStorage.getItem('mpc_openai_key');
  if(ck) document.getElementById('claudeKeyInput').value=ck;
  if(ok) document.getElementById('openaiKeyInput').value=ok;
  // Set header
  const name=userProfile?.name||currentUser?.email?.split('@')[0]||'Chef';
  document.getElementById('headerAvatar').textContent=name[0].toUpperCase();
  document.getElementById('headerPlanTag').textContent=userProfile?.plan==='premium'?'Premium ⭐':'Free';
  document.getElementById('headerPlanTag').classList.toggle('premium',userProfile?.plan==='premium');
  navegar('home');
}

// ===== NAV KEYBOARD =====
function initNavTeclado(){
  const nav=document.getElementById('mainNav');
  const base=window.innerHeight;
  window.addEventListener('resize',()=>{nav.classList.toggle('oculto-teclado',window.innerHeight<base*0.75);});
  document.addEventListener('focusin',e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName))nav.classList.add('oculto-teclado');});
  document.addEventListener('focusout',()=>{setTimeout(()=>nav.classList.remove('oculto-teclado'),150);});
}

// ===== NAVIGATE =====
window.navegar = function(pag){
  document.querySelectorAll('.pagina,.pag-chat-flex').forEach(p=>{p.classList.remove('activa');if(p.scrollTop!==undefined)p.scrollTop=0;});
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('nav-activo'));
  const pagEl=document.getElementById('pag-'+pag);
  if(pagEl) pagEl.classList.add('activa');
  const navEl=document.getElementById('nav-'+pag);
  if(navEl) navEl.classList.add('nav-activo');
  const fn={home:renderHome,chef:renderChef,recipes:renderRecipes,
            pantry:renderPantry,menu:renderMenu,shopping:renderShopping,profile:renderProfile};
  fn[pag]?.();
};

// ===== TOAST =====
window.toast = function(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('visible');
  setTimeout(()=>t.classList.remove('visible'),2800);
};

// ===== MODALS =====
window.abrirModal  = id=>document.getElementById(id).classList.remove('oculto');
window.cerrarModal = id=>document.getElementById(id).classList.add('oculto');
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',e=>{if(e.target===o)cerrarModal(o.id);});
});

// ===== HOME =====
function renderHome(){
  const name=userProfile?.name||'Chef';
  const hour=new Date().getHours();
  let greet=hour<12?'Good morning':'hour<17'?'Good afternoon':'Good evening';
  if(userLang==='es') greet=hour<12?'Buenos días':hour<17?'Buenas tardes':'Buenas noches';
  if(userLang==='fr') greet=hour<12?'Bonjour':hour<17?'Bon après-midi':'Bonsoir';
  document.getElementById('homeGreeting').textContent=`${greet}, ${name}! 👋`;
  document.getElementById('homeDate').textContent=new Date().toLocaleDateString(userLang,{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  // Quick actions
  document.getElementById('quickGrid').innerHTML=[
    {icon:'👨‍🍳',label:t('nav_chef'),fn:"navegar('chef')"},
    {icon:'📖',label:t('nav_recipes'),fn:"navegar('recipes')"},
    {icon:'🧺',label:t('nav_pantry'),fn:"navegar('pantry')"},
    {icon:'📅',label:t('nav_menu'),fn:"navegar('menu')"},
    {icon:'🛒',label:t('nav_shopping'),fn:"navegar('shopping')"},
    {icon:'⭐',label:'Premium',fn:"abrirModal('modalPremium')"},
  ].map(q=>`<div class="quick-card" onclick="${q.fn}">
    <div class="qc-icon">${q.icon}</div>
    <div class="qc-label">${q.label}</div>
  </div>`).join('');

  // Suggestions (random recipes)
  const shuffled=[...RECIPES_DB].sort(()=>Math.random()-.5).slice(0,4);
  document.getElementById('homeSuggestions').innerHTML=`
    <div class="suggestions-row">
      ${shuffled.map(r=>`<div class="suggestion-card" onclick="openRecipe('${r.id}')">
        <div class="sc-emoji">${r.emoji}</div>
        <div class="sc-name">${r.name}</div>
        <div class="sc-time">⏱ ${r.time} min</div>
      </div>`).join('')}
    </div>`;

  // Today's menu
  const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const today=days[new Date().getDay()];
  const todayData=DB.menu[today]||{};
  const meals=[
    {key:'breakfast',label:t('breakfast2')},
    {key:'lunch',label:t('lunch2')},
    {key:'dinner',label:t('dinner2')},
  ];
  document.getElementById('todayMenu').innerHTML=meals.map(m=>`
    <div class="today-slot" onclick="navegar('menu')">
      <div class="today-meal-time">${m.label}</div>
      <div class="today-meal-name">${todayData[m.key]||`<span class="today-empty">Not planned</span>`}</div>
      <span style="color:#666;font-size:18px">›</span>
    </div>`).join('');

  // Expiring items
  const expiring=Object.values(DB.pantry||{}).filter(i=>{
    if(!i.expiry)return false;
    const diff=(new Date(i.expiry)-new Date())/(1000*60*60*24);
    return diff<=3;
  });
  if(expiring.length){
    document.getElementById('expiringSection').style.display='block';
    document.getElementById('expiringList').innerHTML=expiring.map(i=>{
      const diff=Math.ceil((new Date(i.expiry)-new Date())/(1000*60*60*24));
      return`<div class="pantry-item">
        <div class="pi-icon">${categoryIcon(i.category)}</div>
        <div class="pi-info">
          <div class="pi-name">${i.name}</div>
          <div class="pi-expiry ${diff<=0?'expiry-expired':diff<=1?'expiry-warn':'expiry-warn'}">
            ${diff<=0?t('expired'):diff===0?t('today2'):`${t('expiresIn')} ${diff} ${t('days')}`}
          </div>
        </div>
      </div>`;
    }).join('');
  } else {
    document.getElementById('expiringSection').style.display='none';
  }
}

// ===== CHEF IA =====
function renderChef(){
  // Add welcome message if empty
  if(chefHistory.length===0){
    const name=userProfile?.name||'Chef';
    const diets=userProfile?.diets?.join(', ')||'none';
    const cuisines=userProfile?.cuisines?.join(', ')||'various';
    addChefMessage('chef',`👨‍🍳 Hello ${name}! I'm your personal chef assistant. I know you prefer **${diets}** diet and love **${cuisines}** cuisine. Ask me anything about cooking, recipes, ingredients or meal planning! What would you like to cook today?`);
  }
  // Update suggestions language
  document.getElementById('chefSuggestions').querySelectorAll('.sugg-btn').forEach((btn,i)=>{
    const suggestions={
      en:['🤔 What can I cook today?','💰 Economic meal for 4 people','🎉 Dinner for guests','🥗 Healthy recipe ideas'],
      es:['🤔 ¿Qué puedo cocinar hoy?','💰 Comida económica para 4 personas','🎉 Cena para invitados','🥗 Ideas de recetas saludables'],
      fr:['🤔 Que puis-je cuisiner?','💰 Repas économique pour 4','🎉 Dîner pour invités','🥗 Idées de recettes saines'],
    };
    const s=(suggestions[userLang]||suggestions.en)[i];
    if(s)btn.textContent=s;
  });
}

function addChefMessage(role,content,isRecipes=false){
  const div=document.createElement('div');
  div.className=`chat-msg ${role==='user'?'user':'chef'}`;
  const formattedContent=content.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  div.innerHTML=`<div class="msg-burbuja">${formattedContent}</div>
    <div class="msg-meta">${role==='user'?(userProfile?.name||'You'):'Chef AI'} · ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>`;
  document.getElementById('chefMensajes').appendChild(div);
  document.getElementById('chefMensajes').scrollTop=99999;
}

function addTypingIndicator(){
  const div=document.createElement('div');
  div.className='chat-msg chef'; div.id='typing-indicator';
  div.innerHTML=`<div class="msg-burbuja"><div class="typing-dots">
    <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
  </div></div>`;
  document.getElementById('chefMensajes').appendChild(div);
  document.getElementById('chefMensajes').scrollTop=99999;
}

function removeTypingIndicator(){
  document.getElementById('typing-indicator')?.remove();
}

window.sendSuggestion = function(btn){
  document.getElementById('chefInput').value=btn.textContent.replace(/^[^\s]+\s/,'');
  sendChefMsg();
};

window.sendChefMsg = async function(){
  const input=document.getElementById('chefInput');
  const msg=input.value.trim();
  if(!msg)return;

  // Check free limit
  if(userProfile?.plan!=='premium' && usageCount>=FREE_LIMIT){
    abrirModal('modalPremium');
    toast('⭐ '+t('freeLimitMsg'));
    return;
  }

  input.value='';
  addChefMessage('user',msg);
  chefHistory.push({role:'user',content:msg});
  addTypingIndicator();

  const provider=document.getElementById('aiSelector').value;
  const claudeKey=localStorage.getItem('mpc_claude_key');
  const openaiKey=localStorage.getItem('mpc_openai_key');

  const systemPrompt=buildSystemPrompt();

  try{
    let response='';
    if(provider==='claude' && claudeKey){
      response=await callClaude(claudeKey,systemPrompt,chefHistory);
    } else if(provider==='openai' && openaiKey){
      response=await callOpenAI(openaiKey,systemPrompt,chefHistory);
    } else if(claudeKey){
      response=await callClaude(claudeKey,systemPrompt,chefHistory);
    } else if(openaiKey){
      response=await callOpenAI(openaiKey,systemPrompt,chefHistory);
    } else {
      // Demo mode: smart fallback
      response=demoChefResponse(msg);
    }
    removeTypingIndicator();
    chefHistory.push({role:'assistant',content:response});
    addChefMessage('chef',response);

    // Increment usage
    usageCount++;
    if(currentUser){
      await set(ref(db,`users/${currentUser.uid}/usage`),{count:usageCount,updatedAt:new Date().toISOString()});
    }

  }catch(e){
    removeTypingIndicator();
    addChefMessage('chef','Sorry, I had trouble connecting. Please check your API key in Profile settings. Error: '+e.message);
  }
};

function buildSystemPrompt(){
  const diets=userProfile?.diets?.join(', ')||'no restrictions';
  const cuisines=userProfile?.cuisines?.join(', ')||'any cuisine';
  const adults=userProfile?.adults||2;
  const children=userProfile?.children||0;
  const country=userProfile?.country||'';
  const pantryItems=Object.values(DB.pantry||{}).map(i=>i.name).join(', ')||'unknown';
  const lang=userLang==='es'?'Spanish':userLang==='fr'?'French':userLang==='pt'?'Portuguese':userLang==='de'?'German':userLang==='it'?'Italian':'English';

  return `You are My Personal Chef, an expert culinary AI assistant that knows every cuisine in the world. You help with recipes, cooking techniques, meal planning, shopping lists and nutrition.

RESPOND ONLY IN ${lang.toUpperCase()}.

USER PROFILE:
- Household: ${adults} adults, ${children} children
- Country: ${country}
- Dietary restrictions: ${diets}
- Favorite cuisines: ${cuisines}
- Current pantry items: ${pantryItems}

GUIDELINES:
1. Always respect dietary restrictions — never suggest forbidden ingredients
2. Adjust recipes for their household size
3. When giving a recipe, include: ingredients with exact quantities, step-by-step instructions, cooking time, difficulty level
4. For international cuisines, be culturally accurate and use authentic techniques
5. When suggesting recipes, consider what they have in their pantry
6. Be warm, encouraging and professional like a real chef
7. Format recipes clearly with **bold** for section headers
8. You know ALL world cuisines: Italian, Mexican, Japanese, Chinese, Indian, Thai, Korean, Arabic, French, Greek, Peruvian, Ethiopian, Turkish, and hundreds more
9. If asked about ingredients you don't know, be honest and suggest alternatives
10. Keep responses concise but complete`;
}

async function callClaude(apiKey, systemPrompt, history){
  const messages=history.map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content}));
  const response=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({
      model:'claude-sonnet-4-6',
      max_tokens:1500,
      system:systemPrompt,
      messages
    })
  });
  if(!response.ok){const e=await response.json();throw new Error(e.error?.message||'Claude API error');}
  const data=await response.json();
  return data.content?.[0]?.text||'';
}

async function callOpenAI(apiKey, systemPrompt, history){
  const messages=[
    {role:'system',content:systemPrompt},
    ...history.map(m=>({role:m.role,content:m.content}))
  ];
  const response=await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
    body:JSON.stringify({model:'gpt-4o',max_tokens:1500,messages})
  });
  if(!response.ok){const e=await response.json();throw new Error(e.error?.message||'OpenAI API error');}
  const data=await response.json();
  return data.choices?.[0]?.message?.content||'';
}

function demoChefResponse(msg){
  const m=msg.toLowerCase();
  if(m.includes('pasta')||m.includes('spaghetti'))
    return `👨‍🍳 Great choice! Here's a classic **Spaghetti Carbonara**:\n\n**Ingredients (2 servings):**\n• 200g spaghetti\n• 100g pancetta\n• 2 egg yolks\n• 50g Pecorino cheese\n• Black pepper\n\n**Steps:**\n1. Cook pasta in salted water\n2. Fry pancetta until crispy\n3. Mix yolks + cheese\n4. Toss pasta with pancetta, add egg mix off heat\n5. Add pasta water for creaminess\n\n⏱ 25 min | 🟡 Medium\n\n*To use real AI, add your API key in Profile → Configure AI Keys*`;
  if(m.includes('chicken')||m.includes('pollo'))
    return `👨‍🍳 Chicken is so versatile! Try this **Lemon Herb Chicken**:\n\n**Ingredients:**\n• 2 chicken breasts\n• 1 lemon (zest + juice)\n• 2 garlic cloves, minced\n• Fresh rosemary & thyme\n• Olive oil, salt, pepper\n\n**Steps:**\n1. Marinate chicken 30 min in lemon, garlic, herbs\n2. Heat pan over high heat\n3. Cook 6-7 min each side\n4. Rest 5 min before cutting\n\n⏱ 45 min | 🟢 Easy\n\n*To use real AI, add your API key in Profile → Configure AI Keys*`;
  if(m.includes('healthy')||m.includes('saludable'))
    return `👨‍🍳 Here are 3 healthy meal ideas:\n\n1. **Greek Salad Bowl** — tomatoes, cucumber, feta, olives, olive oil\n2. **Baked Salmon** — with steamed broccoli and quinoa\n3. **Lentil Soup** — with vegetables and turmeric\n\nAll high in nutrients and easy to make!\n\n*To get personalized healthy recipes with AI, add your API key in Profile*`;
  if(m.includes('budget')||m.includes('cheap')||m.includes('económ'))
    return `👨‍🍳 Budget-friendly meals for the week:\n\n1. **Bean & Rice Bowl** — $2/serving\n2. **Vegetable Stir Fry** — $1.50/serving\n3. **Egg Fried Rice** — $1/serving\n4. **Lentil Dal** — $1.50/serving\n5. **Pasta Arrabiata** — $1.50/serving\n\n💡 Buy in bulk, cook grains in large batches!\n\n*For AI-personalized budget recipes, add your API key in Profile*`;
  return `👨‍🍳 I'm in demo mode right now. To unlock the full AI chef powered by Claude and GPT-4:\n\n**1.** Go to Profile → Configure AI Keys\n**2.** Add your Anthropic or OpenAI API key\n**3.** Come back and ask anything!\n\nI can help with:\n• 🌍 Any world cuisine recipe\n• 🛒 Shopping lists from recipes\n• 📅 Weekly meal planning\n• 💰 Budget cooking tips\n• 🥗 Dietary adaptations\n• And much more!`;
}

// ===== RECIPES =====
function renderRecipes(){
  let list=RECIPES_DB;
  if(recipeFilter!=='all') list=list.filter(r=>r.category===recipeFilter||(recipeFilter==='quick'&&r.time<=20)||(recipeFilter==='budget'&&r.tags.includes('budget')));
  if(recipeSearch) list=list.filter(r=>r.name.toLowerCase().includes(recipeSearch.toLowerCase())||r.tags.some(t=>t.includes(recipeSearch.toLowerCase())));
  // Also filter by user diet
  if(userProfile?.diets?.length){
    const userDiets=userProfile.diets.filter(d=>d!=='none');
    if(userDiets.length){
      list=list.filter(r=>userDiets.every(d=>r.diet.includes(d)||r.diet.length===0)||r.diet.length===0);
    }
  }
  document.getElementById('recipesGrid').innerHTML=list.length?list.map(r=>`
    <div class="recipe-card" onclick="openRecipe('${r.id}')">
      <div class="rc-emoji">${r.emoji}</div>
      <div class="rc-body">
        <div class="rc-name">${r.name}</div>
        <div class="rc-meta">
          <span>⏱ ${r.time}m</span>
          <span>👤 ${r.servings}</span>
          <span class="rc-tag">${r.difficulty}</span>
        </div>
      </div>
    </div>`).join('')
    :`<div style="grid-column:1/-1;text-align:center;color:#666;padding:40px;font-size:14px">No recipes found 🍽️</div>`;
}

window.filterRecipes = function(f,el){
  recipeFilter=f;
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('activo'));
  el.classList.add('activo');
  renderRecipes();
};

window.searchRecipes = function(){
  recipeSearch=document.getElementById('recipeSearch').value;
  renderRecipes();
};

window.openRecipe = function(id){
  const r=RECIPES_DB.find(x=>x.id===id);
  if(!r)return;
  currentRecipe=r;
  document.getElementById('modalRecipeContent').innerHTML=`
    <div class="recipe-detail-hero">${r.emoji}</div>
    <div class="recipe-detail-title">${r.name}</div>
    <div class="recipe-detail-meta">
      <span class="rdm-tag">⏱ ${r.time} min</span>
      <span class="rdm-tag">👤 ${r.servings} servings</span>
      <span class="rdm-tag">📊 ${r.difficulty}</span>
      ${r.diet.map(d=>`<span class="rdm-tag" style="color:var(--green-light)">✓ ${d}</span>`).join('')}
    </div>
    <div class="recipe-section-title">Ingredients</div>
    <div class="ingredient-list">${r.ingredients.map(i=>`
      <div class="ingredient-item">
        <span class="ingr-qty">${i.qty}</span>
        <span>${i.name}</span>
      </div>`).join('')}
    </div>
    <div class="recipe-section-title">Instructions</div>
    <div class="steps-list">${r.steps.map((s,i)=>`
      <div class="step-item">
        <div class="step-num">${i+1}</div>
        <div>${s}</div>
      </div>`).join('')}
    </div>`;
  abrirModal('modalRecipe');
};

window.addRecipeToMenu = function(){
  cerrarModal('modalRecipe');
  navegar('menu');
  toast('📅 Select a slot to add this recipe');
};

window.addRecipeToShopping = async function(){
  if(!currentRecipe)return;
  for(const ing of currentRecipe.ingredients){
    const nr=push(ref(db,`users/${currentUser.uid}/shopping`));
    const item={id:nr.key,name:ing.name+' ('+currentRecipe.name+')',qty:ing.qty,price:0,done:false,addedAt:new Date().toISOString()};
    await set(nr,item);
    DB.shopping[nr.key]=item;
  }
  cerrarModal('modalRecipe');
  toast('🛒 Ingredients added to shopping list!');
};

// ===== PANTRY =====
function categoryIcon(cat){
  const map={protein:'🥩',vegetable:'🥦',fruit:'🍎',dairy:'🥛',grain:'🌾',condiment:'🧂',other:'📦'};
  return map[cat]||'📦';
}

function renderPantry(){
  const items=Object.values(DB.pantry||{});
  const expiring=items.filter(i=>{if(!i.expiry)return false;const d=(new Date(i.expiry)-new Date())/(1000*60*60*24);return d<=3&&d>0;});
  const expired=items.filter(i=>{if(!i.expiry)return false;return (new Date(i.expiry)-new Date())<0;});
  document.getElementById('pantryStats').innerHTML=`
    <div class="pantry-stat"><strong>${items.length}</strong><span>${t('totalItems')}</span></div>
    <div class="pantry-stat"><strong style="color:var(--orange)">${expiring.length}</strong><span>${t('expiring')}</span></div>
    <div class="pantry-stat"><strong style="color:var(--red)">${expired.length}</strong><span>${t('expired')}</span></div>`;

  if(!items.length){
    document.getElementById('pantryList').innerHTML='<div style="text-align:center;color:#666;padding:40px;font-size:14px">Your pantry is empty 🧺<br>Add ingredients to get personalized recipes</div>';
    return;
  }
  // Group by category
  const grouped={};
  items.forEach(i=>{if(!grouped[i.category])grouped[i.category]=[];grouped[i.category].push(i);});
  document.getElementById('pantryList').innerHTML=Object.entries(grouped).map(([cat,its])=>`
    <div style="margin-bottom:18px">
      <div style="font-size:12px;color:#aaa;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px">${categoryIcon(cat)} ${cat}</div>
      ${its.map(i=>{
        let expiryHTML='';
        if(i.expiry){
          const diff=Math.ceil((new Date(i.expiry)-new Date())/(1000*60*60*24));
          const cls=diff<=0?'expiry-expired':diff<=1?'expiry-warn':'expiry-ok';
          const txt=diff<=0?t('expired'):diff===1?t('today2'):`${t('expiresIn')} ${diff} ${t('days')}`;
          expiryHTML=`<div class="pi-expiry ${cls}">${txt}</div>`;
        }
        return`<div class="pantry-item">
          <div class="pi-icon">${categoryIcon(i.category)}</div>
          <div class="pi-info">
            <div class="pi-name">${i.name}</div>
            <div class="pi-meta">${i.qty}</div>
            ${expiryHTML}
          </div>
          <button class="pi-delete" onclick="deletePantryItem('${i.id}')">🗑</button>
        </div>`;
      }).join('')}
    </div>`).join('');
}

window.abrirModalPantry = function(){
  document.getElementById('pantryName').value='';
  document.getElementById('pantryQty').value='';
  document.getElementById('pantryExpiry').value='';
  abrirModal('modalPantry');
};

window.savePantryItem = async function(){
  const name=document.getElementById('pantryName').value.trim();
  if(!name){toast('⚠️ Enter ingredient name');return;}
  const qty=document.getElementById('pantryQty').value.trim();
  const expiry=document.getElementById('pantryExpiry').value;
  const category=document.getElementById('pantryCategory').value;
  const nr=push(ref(db,`users/${currentUser.uid}/pantry`));
  const item={id:nr.key,name,qty,expiry,category,addedAt:new Date().toISOString()};
  await set(nr,item);
  DB.pantry[nr.key]=item;
  cerrarModal('modalPantry');
  renderPantry();
  toast('✅ Added to pantry');
};

window.deletePantryItem = async function(id){
  await remove(ref(db,`users/${currentUser.uid}/pantry/${id}`));
  delete DB.pantry[id];
  renderPantry();
};

// ===== WEEKLY MENU =====
const WEEK_DAYS=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function renderMenu(){
  const content=document.getElementById('weeklyMenuContent');
  if(!Object.keys(DB.menu||{}).length){
    content.innerHTML=`<div style="text-align:center;padding:40px">
      <div style="font-size:56px;margin-bottom:16px">📅</div>
      <h3 style="font-family:'Playfair Display',serif;margin-bottom:8px">No menu yet</h3>
      <p style="color:#aaa;margin-bottom:20px">Generate a weekly menu with AI or add meals manually</p>
      <button class="btn" onclick="generateWeeklyMenu()">✨ ${t('generate')}</button>
    </div>`;
    return;
  }
  content.innerHTML=WEEK_DAYS.map(day=>{
    const data=DB.menu[day]||{};
    const dayName=t(day);
    return`<div class="week-day">
      <div class="week-day-name">${dayName}</div>
      ${['breakfast','lunch','dinner'].map(meal=>`
        <div class="meal-slot">
          <div class="meal-type">${t(meal+'2')}</div>
          <div class="meal-name">${data[meal]||'<span style="color:#555">—</span>'}</div>
          <button class="meal-edit" onclick="editMealSlot('${day}','${meal}','${data[meal]||''}')">✏️</button>
        </div>`).join('')}
    </div>`;
  }).join('');
}

window.generateWeeklyMenu = async function(){
  if(userProfile?.plan!=='premium'){
    abrirModal('modalPremium');return;
  }
  toast('✨ Generating your weekly menu...');
  const recipeNames=RECIPES_DB.map(r=>r.name);
  const menu={};
  WEEK_DAYS.forEach(day=>{
    menu[day]={
      breakfast:recipeNames[Math.floor(Math.random()*recipeNames.length)],
      lunch:recipeNames[Math.floor(Math.random()*recipeNames.length)],
      dinner:recipeNames[Math.floor(Math.random()*recipeNames.length)],
    };
  });
  await set(ref(db,`users/${currentUser.uid}/menu`),menu);
  DB.menu=menu;
  renderMenu();
  toast('✅ Weekly menu generated!');
};

window.editMealSlot = function(day,meal,current){
  const val=prompt(`${t(meal+'2')} for ${t(day)}:`,current);
  if(val===null)return;
  if(!DB.menu[day])DB.menu[day]={};
  DB.menu[day][meal]=val;
  update(ref(db,`users/${currentUser.uid}/menu/${day}`),{[meal]:val});
  renderMenu();
};

// ===== SHOPPING LIST =====
function renderShopping(){
  const items=Object.values(DB.shopping||{});
  const done=items.filter(i=>i.done).length;
  const total=items.reduce((s,i)=>s+(parseFloat(i.price)||0),0);
  document.getElementById('shoppingStats').innerHTML=`
    <div class="pantry-stat"><strong>${items.length}</strong><span>${t('items')}</span></div>
    <div class="pantry-stat"><strong style="color:var(--green-light)">${done}</strong><span>${t('purchased')}</span></div>
    <div class="pantry-stat"><strong style="color:var(--gold-light)">$${total.toFixed(2)}</strong><span>${t('totalEstimated')}</span></div>`;

  if(!items.length){
    document.getElementById('shoppingList').innerHTML='<div style="text-align:center;color:#666;padding:40px;font-size:14px">Your shopping list is empty 🛒<br>Add items or generate from a recipe</div>';
    return;
  }

  const pending=items.filter(i=>!i.done);
  const purchased=items.filter(i=>i.done);

  let html='';
  if(pending.length){
    html+=pending.map(i=>shoppingItemHTML(i)).join('');
  }
  if(purchased.length){
    html+=`<div style="margin-top:16px;margin-bottom:8px;font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:.5px">✓ ${t('purchased')}</div>`;
    html+=purchased.map(i=>shoppingItemHTML(i)).join('');
  }
  html+=`<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
    <button class="btn btn-gris btn-sm" onclick="clearPurchasedItems()">${t('clearPurchased')}</button>
  </div>`;
  document.getElementById('shoppingList').innerHTML=html;
}

function shoppingItemHTML(i){
  return`<div class="shopping-item ${i.done?'comprado':''}" id="si-${i.id}">
    <button class="si-check ${i.done?'done':''}" onclick="toggleShoppingItem('${i.id}')">${i.done?'✓':''}</button>
    <div class="si-info">
      <div class="si-name">${i.name}</div>
      <div class="si-qty">${i.qty||''}</div>
    </div>
    <div class="si-price">${i.price>0?'$'+parseFloat(i.price).toFixed(2):''}</div>
    <button class="si-delete" onclick="deleteShoppingItem('${i.id}')">🗑</button>
  </div>`;
}

window.abrirModalShoppingItem = function(){
  document.getElementById('shoppingName').value='';
  document.getElementById('shoppingQty').value='';
  document.getElementById('shoppingPrice').value='';
  abrirModal('modalShopping');
};

window.saveShoppingItem = async function(){
  const name=document.getElementById('shoppingName').value.trim();
  if(!name){toast('⚠️ Enter item name');return;}
  const qty=document.getElementById('shoppingQty').value.trim();
  const price=parseFloat(document.getElementById('shoppingPrice').value)||0;
  const nr=push(ref(db,`users/${currentUser.uid}/shopping`));
  const item={id:nr.key,name,qty,price,done:false,addedAt:new Date().toISOString()};
  await set(nr,item);
  DB.shopping[nr.key]=item;
  cerrarModal('modalShopping');
  renderShopping();
  toast('✅ Added to shopping list');
};

window.toggleShoppingItem = async function(id){
  const item=DB.shopping[id];if(!item)return;
  item.done=!item.done;
  await update(ref(db,`users/${currentUser.uid}/shopping/${id}`),{done:item.done});
  renderShopping();
};

window.deleteShoppingItem = async function(id){
  await remove(ref(db,`users/${currentUser.uid}/shopping/${id}`));
  delete DB.shopping[id];
  renderShopping();
};

window.clearPurchasedItems = async function(){
  const purchased=Object.values(DB.shopping||{}).filter(i=>i.done);
  for(const i of purchased){
    await remove(ref(db,`users/${currentUser.uid}/shopping/${i.id}`));
    delete DB.shopping[i.id];
  }
  renderShopping();
  toast(`🗑 Cleared ${purchased.length} items`);
};

// ===== PROFILE =====
function renderProfile(){
  const p=userProfile||{};
  document.getElementById('profileName').textContent=p.name||'Chef';
  document.getElementById('profilePlan').textContent=p.plan==='premium'?'Premium ⭐':'Free plan';
  document.getElementById('profileAvatar').textContent=p.plan==='premium'?'👑':'👨‍🍳';

  // Preferences
  const diets=(p.diets||[]).map(d=>`<span class="pref-tag">🥗 ${d}</span>`).join('');
  const cuisines=(p.cuisines||[]).map(c=>`<span class="pref-tag">🍽️ ${c}</span>`).join('');
  document.getElementById('profilePrefs').innerHTML=`
    <div style="margin-bottom:8px"><strong style="font-size:12px;color:#aaa">Diet:</strong><br>${diets||'<span class="pref-tag">No restrictions</span>'}</div>
    <div><strong style="font-size:12px;color:#aaa">Cuisines:</strong><br>${cuisines||'<span class="pref-tag">Any</span>'}</div>`;

  // Plan info
  document.getElementById('profilePlanInfo').innerHTML=p.plan==='premium'
    ?`<div style="background:rgba(201,151,58,.15);border:1px solid var(--gold);border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:28px">👑</div>
        <div style="font-weight:600;color:var(--gold-light);margin-top:6px">Premium Active</div>
        <div style="font-size:13px;color:#aaa;margin-top:4px">Unlimited AI chef & features</div>
      </div>`
    :`<div style="background:var(--glass);border:1px solid var(--glass-border);border-radius:14px;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:13px">AI uses this month</span>
          <strong style="color:var(--gold-light)">${usageCount} / ${FREE_LIMIT}</strong>
        </div>
        <div style="height:6px;background:rgba(255,255,255,.1);border-radius:6px;overflow:hidden;margin-bottom:14px">
          <div style="height:100%;width:${Math.min(100,(usageCount/FREE_LIMIT)*100)}%;background:linear-gradient(90deg,var(--gold),var(--gold-light));border-radius:6px"></div>
        </div>
        <button class="btn btn-full" onclick="abrirModal('modalPremium')">⭐ Upgrade to Premium — $4.99/mo</button>
      </div>`;
}

// ===== API KEYS =====
window.abrirModalApiKeys = function(){
  const ck=localStorage.getItem('mpc_claude_key')||'';
  const ok=localStorage.getItem('mpc_openai_key')||'';
  document.getElementById('claudeKeyInput').value=ck;
  document.getElementById('openaiKeyInput').value=ok;
  abrirModal('modalApiKeys');
};

window.saveApiKeys = function(){
  const ck=document.getElementById('claudeKeyInput').value.trim();
  const ok=document.getElementById('openaiKeyInput').value.trim();
  if(ck) localStorage.setItem('mpc_claude_key',ck);
  else localStorage.removeItem('mpc_claude_key');
  if(ok) localStorage.setItem('mpc_openai_key',ok);
  else localStorage.removeItem('mpc_openai_key');
  cerrarModal('modalApiKeys');
  toast('✅ API keys saved');
};

// ===== PREMIUM =====
window.processPremium = async function(){
  // In production: integrate Stripe, PayPal or similar
  // For now: simulate upgrade
  toast('⭐ Redirecting to payment...');
  setTimeout(async()=>{
    // Simulate successful payment
    if(userProfile){
      userProfile.plan='premium';
      await update(ref(db,`users/${currentUser.uid}/profile`),{plan:'premium'});
      document.getElementById('headerPlanTag').textContent='Premium ⭐';
      document.getElementById('headerPlanTag').classList.add('premium');
      cerrarModal('modalPremium');
      toast('🎉 Welcome to Premium!');
      renderProfile();
    }
  },1500);
};