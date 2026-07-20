// =====================================
// MY PERSONAL CHEF v2.0
// + Memoria permanente en Firebase
// + Fridge/Pantry con alertas inteligentes
// + Presupuesto y ahorro semanal
// + IA que ya conoce al usuario
// =====================================

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, push, update, remove, onValue }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ===== FIREBASE CONFIG =====
// 🔧 Reemplaza con tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAWSt1ay-pv598b9bhJIAfSwBSLGk54XyQ",
  authDomain: "my-personal-chef-7d0d0.firebaseapp.com",
  databaseURL: "https://my-personal-chef-7d0d0-default-rtdb.firebaseio.com",
  projectId: "my-personal-chef-7d0d0",
  storageBucket: "my-personal-chef-7d0d0.firebasestorage.app",
  messagingSenderId: "1043789225461",
  appId: "1:1043789225461:web:2805b10010d7bb22bfd4bc"
};

const fbApp = initializeApp(firebaseConfig);
const db    = getDatabase(fbApp);
const auth  = getAuth(fbApp);

// ===== ESTADO GLOBAL =====
let currentUser  = null;
let userProfile  = null;
let userLang     = 'en';
let chefHistory  = [];
let DB = { pantry:{}, shopping:{}, menu:{}, spending:{} };
let currentRecipe   = null;
let recipeFilter    = 'all';
let recipeSearch    = '';
let usageCount      = 0;
let currentPantryTab= 'fridge';
let onboardCounts   = {adults:2, children:0};
let editCounts      = {adults:2, children:0};
const FREE_LIMIT    = 10;

// ===== TRADUCCIONES =====
const T = {
  en:{
    login:'Sign in', register:'Sign up', email:'Email', password:'Password',
    name:'Your name', yourName:'Your name', createAccount:'Create account',
    signin:'Sign in', noAccount:"Don't have an account? Sign up",
    haveAccount:'Already have an account? Sign in',
    step1Title:'Your household', step1Sub:'We\'ll plan meals for your whole family',
    step2Title:'Your food budget', step2Sub:'We\'ll suggest recipes that fit your budget',
    step3Title:'Dietary preferences', step3Sub:'Select all that apply to your family',
    step4Title:'Favorite cuisines', step4Sub:'What flavors does your family love?',
    step5Title:'Choose your plan', step5Sub:'Start free, upgrade anytime',
    adults:'Adults', children:'Children', country:'Country / Region',
    weeklyBudget:'Weekly grocery budget ($)',
    savingsGoal:'Weekly savings goal (optional, $)',
    mealBudget:'Budget per meal ($)',
    budgetTip:'The AI will always suggest the most economical options that fit your family size and budget.',
    skipForNow:'Skip for now',
    noRestrictions:'No restrictions', vegetarian:'Vegetarian', vegan:'Vegan',
    glutenFree:'Gluten free', lactoseFree:'Lactose free', highProtein:'High protein',
    lowSugar:'Low sugar',
    free:'Free', next:'Next →', letsStart:"Let's cook! 👨‍🍳",
    nav_home:'Home', nav_chef:'Chef AI', nav_recipes:'Recipes',
    nav_pantry:'Pantry', nav_menu:'Menu', nav_shopping:'Shop',
    quickActions:'Quick actions', todayMenu:"Today's menu",
    chefName:'Chef AI', chefStatus:'Knows your family · budget · pantry',
    recipes:'Recipes', all:'All', breakfast:'Breakfast', lunch:'Lunch',
    dinner:'Dinner', snack:'Snack',
    pantry:'My Pantry & Fridge', add:'Add',
    addIngredient:'Add ingredient', ingredient:'Ingredient name',
    quantity:'Current quantity', unit:'Unit',
    alertThreshold:'Alert when below (quantity)',
    alertHint:'You\'ll get notified when this ingredient runs low',
    location:'Location', category:'Category',
    expiryDate:'Expiry date (optional)', approxPrice:'Approx. price paid ($)',
    weeklyMenu:'Weekly Menu', generate:'✨ AI Generate',
    shoppingList:'Shopping List', addItem:'Add item', item:'Item',
    estimatedPrice:'Estimated price ($)',
    alerts:'Alerts', myBudget:'Budget & savings',
    myPreferences:'My preferences', myPlan:'My plan',
    apiKeys:'Configure AI Keys', changeLanguage:'Change language',
    logout:'Sign out', save:'Save', cancel:'Cancel', close:'Close',
    addToMenu:'Add to menu', addToShopping:'🛒 Shopping list',
    upgradePremium:'Upgrade to Premium',
    feat1Free:'10 AI requests/month', feat2Free:'Pantry & fridge tracker',
    feat3Free:'Shopping list', feat4Free:'Weekly AI menu', feat5Free:'Smart alerts',
    feat1Premium:'Unlimited AI chef', feat2Premium:'Smart pantry alerts',
    feat3Premium:'Weekly menu planner', feat4Premium:'Budget tracking',
    feat5Premium:'Guest mode planning',
    selectFree:'Select Free', selectPremium:'✓ Selected',
    freeLimitMsg:'Free limit reached. Upgrade to Premium for unlimited access.',
    monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday', thursday:'Thursday',
    friday:'Friday', saturday:'Saturday', sunday:'Sunday',
    breakfast2:'Breakfast', lunch2:'Lunch', dinner2:'Dinner',
    totalEstimated:'Total estimated', items:'items', purchased:'purchased',
    clearPurchased:'Clear purchased',
    expiresIn:'Expires in', days:'days', expired:'Expired', today2:'Today',
    totalItems:'Total', expiring:'Expiring soon', lowStock:'Running low',
    spent:'Spent', remaining:'Remaining', saved:'Saved',
    canMakeWith:'Can make with your pantry',
    guestsPrompt:'How many guests are coming?',
    budgetLeft:'Budget left this week',
  },
  es:{
    login:'Iniciar sesión', register:'Registrarse', email:'Correo electrónico',
    password:'Contraseña', name:'Tu nombre', yourName:'Tu nombre',
    createAccount:'Crear cuenta', signin:'Entrar',
    noAccount:'¿No tienes cuenta? Regístrate',
    haveAccount:'¿Ya tienes cuenta? Inicia sesión',
    step1Title:'Tu hogar', step1Sub:'Planificaremos comidas para toda tu familia',
    step2Title:'Tu presupuesto de comida', step2Sub:'Sugeriremos recetas dentro de tu presupuesto',
    step3Title:'Preferencias alimentarias', step3Sub:'Selecciona las que apliquen a tu familia',
    step4Title:'Cocinas favoritas', step4Sub:'¿Qué sabores le encantan a tu familia?',
    step5Title:'Elige tu plan', step5Sub:'Empieza gratis, mejora cuando quieras',
    adults:'Adultos', children:'Niños', country:'País / Región',
    weeklyBudget:'Presupuesto semanal de comida ($)',
    savingsGoal:'Meta de ahorro semanal (opcional, $)',
    mealBudget:'Presupuesto por comida ($)',
    budgetTip:'La IA siempre sugerirá las opciones más económicas que se adapten al tamaño de tu familia y presupuesto.',
    skipForNow:'Saltar por ahora',
    noRestrictions:'Sin restricciones', vegetarian:'Vegetariano', vegan:'Vegano',
    glutenFree:'Sin gluten', lactoseFree:'Sin lactosa', highProtein:'Alto en proteína',
    lowSugar:'Bajo en azúcar',
    free:'Gratis', next:'Siguiente →', letsStart:'¡A cocinar! 👨‍🍳',
    nav_home:'Inicio', nav_chef:'Chef IA', nav_recipes:'Recetas',
    nav_pantry:'Despensa', nav_menu:'Menú', nav_shopping:'Compras',
    quickActions:'Acciones rápidas', todayMenu:'Menú de hoy',
    chefName:'Chef IA', chefStatus:'Conoce tu familia · presupuesto · despensa',
    recipes:'Recetas', all:'Todas', breakfast:'Desayuno', lunch:'Almuerzo',
    dinner:'Cena', snack:'Merienda',
    pantry:'Mi Despensa y Refrigerador', add:'Agregar',
    addIngredient:'Agregar ingrediente', ingredient:'Nombre del ingrediente',
    quantity:'Cantidad actual', unit:'Unidad',
    alertThreshold:'Alertar cuando quede menos de (cantidad)',
    alertHint:'Recibirás una notificación cuando este ingrediente se esté acabando',
    location:'Ubicación', category:'Categoría',
    expiryDate:'Fecha de vencimiento (opcional)', approxPrice:'Precio pagado aprox. ($)',
    weeklyMenu:'Menú Semanal', generate:'✨ Generar con IA',
    shoppingList:'Lista de Compras', addItem:'Agregar ítem', item:'Ítem',
    estimatedPrice:'Precio estimado ($)',
    alerts:'Alertas', myBudget:'Presupuesto y ahorro',
    myPreferences:'Mis preferencias', myPlan:'Mi plan',
    apiKeys:'Configurar claves IA', changeLanguage:'Cambiar idioma',
    logout:'Cerrar sesión', save:'Guardar', cancel:'Cancelar', close:'Cerrar',
    addToMenu:'Agregar al menú', addToShopping:'🛒 Lista de compras',
    upgradePremium:'Actualizar a Premium',
    feat1Free:'10 solicitudes IA/mes', feat2Free:'Rastreador de despensa y fridge',
    feat3Free:'Lista de compras', feat4Free:'Menú semanal con IA', feat5Free:'Alertas inteligentes',
    feat1Premium:'Chef IA ilimitado', feat2Premium:'Alertas inteligentes de despensa',
    feat3Premium:'Planificador de menú semanal', feat4Premium:'Control de presupuesto',
    feat5Premium:'Modo invitados',
    selectFree:'Seleccionar Gratis', selectPremium:'✓ Seleccionado',
    freeLimitMsg:'Límite gratuito alcanzado. Actualiza a Premium.',
    monday:'Lunes', tuesday:'Martes', wednesday:'Miércoles', thursday:'Jueves',
    friday:'Viernes', saturday:'Sábado', sunday:'Domingo',
    breakfast2:'Desayuno', lunch2:'Almuerzo', dinner2:'Cena',
    totalEstimated:'Total estimado', items:'ítems', purchased:'comprados',
    clearPurchased:'Limpiar comprados',
    expiresIn:'Vence en', days:'días', expired:'Vencido', today2:'Hoy',
    totalItems:'Total', expiring:'Por vencer', lowStock:'Quedando poco',
    spent:'Gastado', remaining:'Restante', saved:'Ahorrado',
    canMakeWith:'Puedo hacer con mi despensa',
    guestsPrompt:'¿Cuántos invitados llegan?',
    budgetLeft:'Presupuesto restante esta semana',
  }
};
function t(k){ return (T[userLang]||T.en)[k] || T.en[k] || k; }

// ===== RECETAS BASE =====
const RECIPES_DB = [
  {id:'r1',name:'Spaghetti Carbonara',emoji:'🍝',time:25,servings:4,cost:8,
   difficulty:'Medium',category:'dinner',cuisine:'italian',diet:[],
   ingredients:[{qty:'400g',name:'Spaghetti'},{qty:'200g',name:'Pancetta'},{qty:'4',name:'Egg yolks'},{qty:'100g',name:'Pecorino cheese'},{qty:'1 tsp',name:'Black pepper'}],
   steps:['Boil spaghetti in salted water until al dente.','Fry pancetta until crispy.','Mix egg yolks with grated cheese and pepper.','Off heat, toss pasta with pancetta and egg mix.','Add pasta water until creamy.'],
   tags:['classic','quick'],pantryItems:['spaghetti','pasta','pancetta','eggs','cheese']},
  {id:'r2',name:'Chicken Tikka Masala',emoji:'🍛',time:45,servings:4,cost:12,
   difficulty:'Medium',category:'dinner',cuisine:'indian',diet:[],
   ingredients:[{qty:'600g',name:'Chicken breast'},{qty:'400ml',name:'Coconut milk'},{qty:'2 tbsp',name:'Tikka masala paste'},{qty:'400g',name:'Canned tomatoes'},{qty:'1',name:'Onion'}],
   steps:['Marinate chicken in tikka paste for 30 min.','Cook chicken in pan until charred.','Sauté onion, add tomatoes and coconut milk.','Simmer 15 min, add chicken, cook 10 more min.','Serve with rice.'],
   tags:['spicy','protein'],pantryItems:['chicken','milk','tomatoes','onion']},
  {id:'r3',name:'Greek Salad',emoji:'🥗',time:10,servings:2,cost:5,
   difficulty:'Easy',category:'lunch',cuisine:'mediterranean',diet:['vegetarian'],
   ingredients:[{qty:'2',name:'Tomatoes'},{qty:'1',name:'Cucumber'},{qty:'1',name:'Red onion'},{qty:'100g',name:'Feta cheese'},{qty:'50g',name:'Olives'}],
   steps:['Chop tomatoes, cucumber and onion.','Add olives and feta.','Drizzle olive oil, season, toss gently.'],
   tags:['healthy','quick','vegetarian'],pantryItems:['tomatoes','cucumber','onion','cheese']},
  {id:'r4',name:'Avocado Toast',emoji:'🥑',time:10,servings:1,cost:3,
   difficulty:'Easy',category:'breakfast',cuisine:'american',diet:['vegan'],
   ingredients:[{qty:'2 slices',name:'Sourdough bread'},{qty:'1',name:'Avocado'},{qty:'1',name:'Lemon'},{qty:'1 pinch',name:'Red pepper flakes'}],
   steps:['Toast bread until golden.','Mash avocado with lemon juice, salt and pepper.','Spread on toast, add toppings.'],
   tags:['quick','healthy','vegan'],pantryItems:['bread','avocado','lemon']},
  {id:'r5',name:'Beef Tacos',emoji:'🌮',time:30,servings:4,cost:10,
   difficulty:'Easy',category:'dinner',cuisine:'mexican',diet:[],
   ingredients:[{qty:'500g',name:'Ground beef'},{qty:'8',name:'Corn tortillas'},{qty:'1 packet',name:'Taco seasoning'},{qty:'2',name:'Tomatoes'},{qty:'100g',name:'Cheddar cheese'}],
   steps:['Cook ground beef until browned.','Add taco seasoning and a splash of water.','Warm tortillas.','Assemble tacos with toppings.'],
   tags:['quick','family'],pantryItems:['beef','tortillas','tomatoes','cheese']},
  {id:'r6',name:'Vegetable Stir Fry',emoji:'🥘',time:20,servings:3,cost:6,
   difficulty:'Easy',category:'dinner',cuisine:'chinese',diet:['vegan'],
   ingredients:[{qty:'2 cups',name:'Mixed vegetables'},{qty:'3 tbsp',name:'Soy sauce'},{qty:'2 cloves',name:'Garlic'},{qty:'1 tbsp',name:'Sesame oil'},{qty:'1 cup',name:'Rice'}],
   steps:['Cook rice separately.','Sauté garlic in sesame oil.','Add vegetables, stir fry 5-7 min.','Add soy sauce, toss. Serve over rice.'],
   tags:['healthy','quick','vegan','budget'],pantryItems:['vegetables','garlic','rice']},
  {id:'r7',name:'Pancakes',emoji:'🥞',time:20,servings:4,cost:4,
   difficulty:'Easy',category:'breakfast',cuisine:'american',diet:['vegetarian'],
   ingredients:[{qty:'200g',name:'Flour'},{qty:'2 tsp',name:'Baking powder'},{qty:'2 tbsp',name:'Sugar'},{qty:'1',name:'Egg'},{qty:'240ml',name:'Milk'}],
   steps:['Mix dry ingredients.','Whisk wet ingredients.','Combine until just mixed.','Cook in lightly greased pan until bubbles form. Flip.'],
   tags:['quick','family','vegetarian','budget'],pantryItems:['flour','eggs','milk']},
  {id:'r8',name:'Lentil Soup',emoji:'🍲',time:35,servings:6,cost:5,
   difficulty:'Easy',category:'lunch',cuisine:'mediterranean',diet:['vegan'],
   ingredients:[{qty:'2 cups',name:'Red lentils'},{qty:'1',name:'Onion'},{qty:'2 cloves',name:'Garlic'},{qty:'1 tsp',name:'Cumin'},{qty:'400g',name:'Canned tomatoes'}],
   steps:['Sauté onion and garlic.','Add lentils, tomatoes and 4 cups water.','Season with cumin, salt and pepper.','Simmer 25 min until lentils are soft.'],
   tags:['healthy','budget','vegan'],pantryItems:['lentils','onion','garlic','tomatoes']},
];

// ===== CATEGORIAS DE ICONOS =====
function catIcon(c){
  const m={protein:'🥩',dairy:'🥛',vegetable:'🥦',fruit:'🍎',grain:'🌾',
           condiment:'🧂',beverage:'🥤',snack:'🍪',frozen:'🧊',other:'📦'};
  return m[c]||'📦';
}

// ===== INIT =====
window.addEventListener('load',()=>{
  const saved=localStorage.getItem('mpc_lang');
  if(saved) userLang=saved;
  onAuthStateChanged(auth, async user=>{
    if(user){
      currentUser=user;
      await loadUserData();
      if(!userProfile){ show('screen-onboarding'); initOnboarding(); }
      else { applyLang(); enterApp(); }
    } else {
      if(!saved) show('screen-lang');
      else { show('screen-auth'); applyLang(); }
    }
  });
});

// ===== SHOW/HIDE =====
function show(id){
  ['screen-lang','screen-auth','screen-onboarding','screen-app'].forEach(s=>{
    const el=document.getElementById(s);
    if(s===id){
      el.classList.remove('oculto');
      if(s==='screen-app') el.classList.add('activo');
    } else {
      el.classList.add('oculto');
      if(s==='screen-app') el.classList.remove('activo');
    }
  });
}

// ===== IDIOMA =====
window.setLang=function(lang){
  userLang=lang;localStorage.setItem('mpc_lang',lang);
  applyLang();show('screen-auth');
};
function applyLang(){
  document.querySelectorAll('[data-i]').forEach(el=>{
    const k=el.getAttribute('data-i');
    const v=t(k);if(v&&v!==k)el.textContent=v;
  });
  document.documentElement.lang=userLang;
  document.documentElement.dir=userLang==='ar'?'rtl':'ltr';
}
window.changeLang=()=>show('screen-lang');

// ===== AUTH =====
window.switchAuth=function(m){
  document.getElementById('box-login').classList.toggle('oculto',m!=='login');
  document.getElementById('box-register').classList.toggle('oculto',m!=='register');
  document.getElementById('tab-login').classList.toggle('activo',m==='login');
  document.getElementById('tab-register').classList.toggle('activo',m==='register');
};
window.doLogin=async function(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  if(!email||!pass){toast('⚠️ Email and password required');return;}
  try{ await signInWithEmailAndPassword(auth,email,pass); }
  catch(e){ toast('❌ '+e.message); }
};
window.doRegister=async function(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pass=document.getElementById('regPass').value;
  if(!name||!email||!pass){toast('⚠️ All fields required');return;}
  if(pass.length<6){toast('⚠️ Password min 6 characters');return;}
  try{
    const c=await createUserWithEmailAndPassword(auth,email,pass);
    currentUser=c.user;
    show('screen-onboarding');initOnboarding();
  }catch(e){toast('❌ '+e.message);}
};
window.doLogout=async function(){
  await signOut(auth);
  currentUser=null;userProfile=null;chefHistory=[];
  DB={pantry:{},shopping:{},menu:{},spending:{}};
  show('screen-auth');
};
window.togglePass=function(id,btn){
  const i=document.getElementById(id);
  if(i.type==='password'){i.type='text';btn.textContent='🙈';}
  else{i.type='password';btn.textContent='👁';}
};

// ===== CARGAR DATOS DEL USUARIO =====
async function loadUserData(){
  if(!currentUser)return;
  const snap=await get(ref(db,`users/${currentUser.uid}`));
  if(!snap.exists())return;
  const data=snap.val();
  userProfile   = data.profile   ||null;
  DB.pantry     = data.pantry    ||{};
  DB.shopping   = data.shopping  ||{};
  DB.menu       = data.menu      ||{};
  DB.spending   = data.spending  ||{};
  usageCount    = data.usage?.count||0;
  if(userProfile?.lang) userLang=userProfile.lang;
}

async function saveProfile(p){
  await set(ref(db,`users/${currentUser.uid}/profile`),p);
  userProfile=p;
}

// ===== ONBOARDING =====
let onboardData={adults:2,children:0,country:'',diets:[],cuisines:[],plan:'premium',
                 weeklyBudget:0,savingsGoal:0,mealBudget:0,name:''};
let obStep=1;

function initOnboarding(){ applyLang(); updateOnboardProgress(); }

function updateOnboardProgress(){
  const pct=(obStep/5)*100;
  document.getElementById('onboardFill').style.width=pct+'%';
  document.getElementById('onboardStep').textContent=obStep+' / 5';
}

window.changeCount=function(f,d){
  onboardCounts[f]=Math.max(0,(onboardCounts[f]||0)+d);
  document.getElementById(f+'-val').textContent=onboardCounts[f];
  onboardData[f]=onboardCounts[f];
};
window.toggleDiet=function(btn){
  btn.classList.toggle('activo');
  const d=btn.dataset.diet;
  if(btn.classList.contains('activo')){ if(!onboardData.diets.includes(d))onboardData.diets.push(d); }
  else onboardData.diets=onboardData.diets.filter(x=>x!==d);
};
window.toggleCuisine=function(btn){
  btn.classList.toggle('activo');
  const c=btn.dataset.cuisine;
  if(btn.classList.contains('activo')){ if(!onboardData.cuisines.includes(c))onboardData.cuisines.push(c); }
  else onboardData.cuisines=onboardData.cuisines.filter(x=>x!==c);
};
window.selectPlan=function(p){
  onboardData.plan=p;
  document.getElementById('plan-free').classList.toggle('activo',p==='free');
  document.getElementById('plan-premium').classList.toggle('activo',p==='premium');
};
window.nextStep=function(step){
  if(step===2){
    onboardData.name=document.getElementById('ob_name').value.trim()||'Chef';
    onboardData.country=document.getElementById('ob_country').value.trim();
    onboardData.adults=onboardCounts.adults;
    onboardData.children=onboardCounts.children;
  }
  if(step===3){
    onboardData.weeklyBudget=parseFloat(document.getElementById('ob_budget').value)||0;
    onboardData.savingsGoal=parseFloat(document.getElementById('ob_savings').value)||0;
    onboardData.mealBudget=parseFloat(document.getElementById('ob_mealbudget').value)||0;
  }
  document.getElementById('step'+obStep).classList.remove('activa');
  document.getElementById('step'+step).classList.add('activa');
  obStep=step;updateOnboardProgress();
};
window.finishOnboarding=async function(){
  const profile={
    name:onboardData.name||currentUser.email?.split('@')[0]||'Chef',
    email:currentUser.email,
    adults:onboardData.adults||2,
    children:onboardData.children||0,
    country:onboardData.country||'',
    diets:onboardData.diets,
    cuisines:onboardData.cuisines,
    plan:onboardData.plan,
    lang:userLang,
    weeklyBudget:onboardData.weeklyBudget||150,
    savingsGoal:onboardData.savingsGoal||0,
    mealBudget:onboardData.mealBudget||15,
    spentThisWeek:0,
    weekStart:getWeekStart(),
    createdAt:new Date().toISOString()
  };
  await saveProfile(profile);
  applyLang();enterApp();
};

// ===== SEMANA =====
function getWeekStart(){
  const d=new Date();
  const day=d.getDay();
  const diff=d.getDate()-day+(day===0?-6:1);
  d.setDate(diff);d.setHours(0,0,0,0);
  return d.toISOString().split('T')[0];
}

// Resetear gasto semanal si es nueva semana
async function checkWeekReset(){
  if(!userProfile)return;
  const ws=getWeekStart();
  if(userProfile.weekStart!==ws){
    await update(ref(db,`users/${currentUser.uid}/profile`),{spentThisWeek:0,weekStart:ws});
    userProfile.spentThisWeek=0;userProfile.weekStart=ws;
  }
}

// ===== ENTRAR APP =====
async function enterApp(){
  show('screen-app');
  applyLang();
  initNavTeclado();
  await checkWeekReset();
  // Header
  const n=userProfile?.name||currentUser?.email?.split('@')[0]||'Chef';
  document.getElementById('headerAvatar').textContent=n[0].toUpperCase();
  document.getElementById('headerPlanTag').textContent=userProfile?.plan==='premium'?'Premium ⭐':'Free';
  document.getElementById('headerPlanTag').classList.toggle('premium',userProfile?.plan==='premium');
  // Cargar keys guardadas
  const ck=localStorage.getItem('mpc_claude_key');
  const ok=localStorage.getItem('mpc_openai_key');
  if(ck)document.getElementById('claudeKeyInput').value=ck;
  if(ok)document.getElementById('openaiKeyInput').value=ok;
  // Alertas
  updateAlertBadge();
  navegar('home');
}

// ===== NAV TECLADO =====
function initNavTeclado(){
  const nav=document.getElementById('mainNav');
  const base=window.innerHeight;
  window.addEventListener('resize',()=>nav.classList.toggle('oculto-teclado',window.innerHeight<base*0.75));
  document.addEventListener('focusin',e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName))nav.classList.add('oculto-teclado');});
  document.addEventListener('focusout',()=>setTimeout(()=>nav.classList.remove('oculto-teclado'),150));
}

// ===== NAVEGAR =====
window.navegar=function(pag){
  document.querySelectorAll('.pagina,.pag-chat-flex').forEach(p=>{p.classList.remove('activa');});
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('nav-activo'));
  const pe=document.getElementById('pag-'+pag);if(pe)pe.classList.add('activa');
  const ne=document.getElementById('nav-'+pag);if(ne)ne.classList.add('nav-activo');
  const fns={home:renderHome,chef:renderChef,pantry:renderPantry,
              recipes:renderRecipes,menu:renderMenu,shopping:renderShopping,
              profile:renderProfile,alerts:renderAlerts};
  fns[pag]?.();
};

// ===== TOAST =====
window.toast=function(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('visible');
  setTimeout(()=>t.classList.remove('visible'),2800);
};

// ===== MODALES =====
window.abrirModal =id=>document.getElementById(id).classList.remove('oculto');
window.cerrarModal=id=>document.getElementById(id).classList.add('oculto');
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',e=>{if(e.target===o)cerrarModal(o.id);});
});

// ===== ALERTAS — SISTEMA PRINCIPAL =====
function getAlerts(){
  const alerts=[];
  const items=Object.values(DB.pantry||{});
  items.forEach(item=>{
    // Alerta: cantidad baja
    if(item.alertThreshold && parseFloat(item.qty)<=parseFloat(item.alertThreshold)){
      const ratio=parseFloat(item.qty)/parseFloat(item.alertThreshold);
      alerts.push({
        id:'low_'+item.id,
        type: ratio<=0?'out':'low',
        priority: ratio<=0?'high':'medium',
        title: ratio<=0?`⛔ ${item.name} is out of stock`:`⚠️ ${item.name} is running low`,
        sub:`${item.qty} ${item.unit} remaining (alert set at ${item.alertThreshold} ${item.unit})`,
        item,time:new Date().toISOString(),
        action:()=>{ cerrarModal('modalPremium'); navegar('shopping'); }
      });
    }
    // Alerta: vencimiento
    if(item.expiry){
      const diff=Math.ceil((new Date(item.expiry)-new Date())/(1000*60*60*24));
      if(diff<=3){
        alerts.push({
          id:'exp_'+item.id,
          type:'expiry',
          priority:diff<=0?'high':'medium',
          title:diff<=0?`🚨 ${item.name} has expired`:`⏰ ${item.name} expires ${diff===0?'today':'in '+diff+' days'}`,
          sub:`Use it soon or it will go to waste`,
          item,time:new Date().toISOString(),
          action:()=>{ navegar('chef'); }
        });
      }
    }
  });
  return alerts.sort((a,b)=>a.priority==='high'?-1:1);
}

function updateAlertBadge(){
  const alerts=getAlerts();
  const badge=document.getElementById('alertBadge');
  const bell=document.getElementById('alertBell');
  if(alerts.length>0){
    badge.classList.remove('oculto');
    badge.textContent=alerts.length>9?'9+':alerts.length;
  } else {
    badge.classList.add('oculto');
  }
}

function renderAlerts(){
  const alerts=getAlerts();
  const el=document.getElementById('alertsList');
  if(!alerts.length){
    el.innerHTML=`<div style="text-align:center;padding:50px 20px;color:var(--gray)">
      <div style="font-size:48px;margin-bottom:12px">✅</div>
      <h3 style="font-family:'Playfair Display',serif;color:var(--dark);margin-bottom:6px">All good!</h3>
      <p style="font-size:14px">No alerts right now. Keep your pantry updated to get smart notifications.</p>
    </div>`;return;
  }
  el.innerHTML=alerts.map(a=>`
    <div class="alert-item ${a.priority==='high'?'high':'medium'}" onclick="this._action&&this._action()" id="al_${a.id}">
      <div class="ai-icon">${a.type==='out'?'⛔':a.type==='low'?'⚠️':a.type==='expiry'?'⏰':'🔔'}</div>
      <div class="ai-info">
        <div class="ai-title">${a.title}</div>
        <div class="ai-sub">${a.sub}</div>
      </div>
      <button class="ai-action" onclick="event.stopPropagation();window._alertAction_${a.id}&&window._alertAction_${a.id}()">
        ${a.type==='low'||a.type==='out'?'🛒 Add':'👨‍🍳 Cook'}
      </button>
    </div>`).join('');
  alerts.forEach(a=>{
    window[`_alertAction_${a.id}`]=a.action;
  });
}

// ===== HOME =====
function renderHome(){
  const name=userProfile?.name||'Chef';
  const hour=new Date().getHours();
  let greet=userLang==='es'?(hour<12?'Buenos días':hour<17?'Buenas tardes':'Buenas noches')
    :userLang==='fr'?(hour<12?'Bonjour':hour<17?'Bon après-midi':'Bonsoir')
    :(hour<12?'Good morning':hour<17?'Good afternoon':'Good evening');
  document.getElementById('homeGreeting').textContent=`${greet}, ${name}! 👋`;
  document.getElementById('homeDate').textContent=new Date().toLocaleDateString(userLang,
    {weekday:'long',year:'numeric',month:'long',day:'numeric'});

  // Resumen de presupuesto
  renderBudgetSummary();

  // Alertas en home
  const alerts=getAlerts();
  const homeAlerts=document.getElementById('homeAlerts');
  if(alerts.length){
    homeAlerts.innerHTML=`<div style="margin-bottom:16px">
      <div class="section-title" style="margin-bottom:8px">🔔 ${alerts.length} alert${alerts.length>1?'s':''}</div>
      ${alerts.slice(0,2).map(a=>`
        <div class="home-alert-card" onclick="navegar('alerts')">
          <div class="home-alert-icon">${a.type==='out'?'⛔':a.type==='low'?'⚠️':'⏰'}</div>
          <div class="home-alert-info">
            <div class="home-alert-title">${a.title}</div>
            <div class="home-alert-sub">${a.sub}</div>
          </div>
        </div>`).join('')}
      ${alerts.length>2?`<div style="text-align:center;margin-top:6px"><button class="btn-link" onclick="navegar('alerts')" style="font-size:12px">See all ${alerts.length} alerts →</button></div>`:''}
    </div>`;
  } else homeAlerts.innerHTML='';

  // Sugerencias del día (recetas con ingredientes disponibles)
  const pantryNames=Object.values(DB.pantry||{}).map(i=>i.name.toLowerCase());
  const canMake=RECIPES_DB.filter(r=>
    r.pantryItems.some(pi=>pantryNames.some(pn=>pn.includes(pi)))
  ).slice(0,4);
  const suggestions=canMake.length?canMake:RECIPES_DB.slice(0,4);
  document.getElementById('homeSuggestions').innerHTML=`
    <div style="margin-bottom:16px">
      <div class="section-title" style="margin-bottom:8px">${canMake.length?t('canMakeWith'):'✨ Today\'s suggestions'}</div>
      <div class="suggestions-row">
        ${suggestions.map(r=>`<div class="suggestion-card" onclick="openRecipe('${r.id}')">
          <div class="sc-emoji">${r.emoji}</div>
          <div class="sc-name">${r.name}</div>
          <div class="sc-time">⏱ ${r.time}m · $${r.cost}</div>
        </div>`).join('')}
      </div>
    </div>`;

  // Quick actions
  document.getElementById('quickGrid').innerHTML=[
    {icon:'👨‍🍳',label:t('nav_chef'),fn:"navegar('chef')"},
    {icon:'🧺',label:t('nav_pantry'),fn:"navegar('pantry')"},
    {icon:'📖',label:t('nav_recipes'),fn:"navegar('recipes')"},
    {icon:'📅',label:t('nav_menu'),fn:"navegar('menu')"},
    {icon:'🛒',label:t('nav_shopping'),fn:"navegar('shopping')"},
    {icon:'⭐',label:'Premium',fn:"abrirModal('modalPremium')"},
  ].map(q=>`<div class="quick-card" onclick="${q.fn}">
    <div class="qc-icon">${q.icon}</div>
    <div class="qc-label">${q.label}</div>
  </div>`).join('');

  // Menú de hoy
  const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const today=days[new Date().getDay()];
  const todayData=DB.menu[today]||{};
  document.getElementById('todayMenu').innerHTML=
    ['breakfast2','lunch2','dinner2'].map((mk,i)=>`
      <div class="today-slot" onclick="navegar('menu')">
        <div class="today-meal-time">${t(mk)}</div>
        <div class="today-meal-name">${todayData[['breakfast','lunch','dinner'][i]]||`<span class="today-empty">Not planned</span>`}</div>
        <span style="color:var(--gray);font-size:18px">›</span>
      </div>`).join('');
}

function renderBudgetSummary(){
  const budget=document.getElementById('budgetSummary');
  if(!userProfile?.weeklyBudget){ budget.innerHTML=''; return; }
  const total=userProfile.weeklyBudget||0;
  const spent=userProfile.spentThisWeek||0;
  const remaining=Math.max(0,total-spent);
  const pct=Math.min(100,Math.round((spent/total)*100));
  const barClass=pct<60?'budget-bar-ok':pct<85?'budget-bar-warn':'budget-bar-over';
  budget.innerHTML=`
    <div class="budget-row">
      <span class="budget-label">💵 ${t('budgetLeft')}</span>
      <span class="budget-value" style="color:${pct>85?'var(--red)':'var(--dark)'}">$${remaining.toFixed(0)} / $${total}</span>
    </div>
    <div class="budget-bar-track"><div class="budget-bar-fill ${barClass}" style="width:${pct}%"></div></div>
    <div class="budget-sub">${t('spent')}: $${spent.toFixed(0)} · ${t('remaining')}: $${remaining.toFixed(0)}${userProfile.savingsGoal?` · 🎯 Goal: $${userProfile.savingsGoal} saved`:''}</div>`;
}

// ===== CHEF IA CON MEMORIA COMPLETA =====
function renderChef(){
  if(chefHistory.length===0){
    // Mensaje de bienvenida con contexto del usuario
    const name=userProfile?.name||'Chef';
    const people=(userProfile?.adults||2)+(userProfile?.children||0);
    const budget=userProfile?.weeklyBudget?`$${userProfile.weeklyBudget}/week budget`:'no budget set';
    const spent=userProfile?.spentThisWeek||0;
    const remaining=userProfile?.weeklyBudget?`$${(userProfile.weeklyBudget-spent).toFixed(0)} left this week`:'';
    const pantryCount=Object.keys(DB.pantry||{}).length;
    const diets=(userProfile?.diets||[]).filter(d=>d!=='none').join(', ')||'none';
    const welcomeMsg=userLang==='es'
      ?`👨‍🍳 ¡Hola ${name}! Soy tu chef personal. Ya sé todo sobre ti:\n\n👨‍👩‍👧‍👦 **${people} personas** en tu familia\n💵 **Presupuesto:** ${budget}${remaining?' · '+remaining:''}\n🧺 **${pantryCount} ingredientes** en tu despensa/refrigerador\n🥗 **Dieta:** ${diets}\n\n¿Qué cocinamos hoy? Puedo sugerirte algo con lo que ya tienes en casa, planificar tu semana o ayudarte si tienes visitas.`
      :`👨‍🍳 Hello ${name}! I'm your personal chef and I already know you:\n\n👨‍👩‍👧‍👦 **${people} people** in your household\n💵 **Budget:** ${budget}${remaining?' · '+remaining:''}\n🧺 **${pantryCount} ingredients** in your pantry/fridge\n🥗 **Diet:** ${diets}\n\nWhat shall we cook? I can suggest something with what you already have, plan your week, or help if you have guests coming!`;
    addChefMsg('chef',welcomeMsg);
  }
  // Actualizar sugerencias
  const suggestions=userLang==='es'
    ?['🤔 ¿Qué cocino con lo que tengo?','💰 Receta dentro del presupuesto','🎉 Tengo invitados esta noche','📋 Planifica mi semana']
    :['🤔 What can I cook with what I have?','💰 Stay within budget this week','🎉 I have guests coming','📋 Plan my week'];
  document.getElementById('chefSuggestions').querySelectorAll('.sugg-btn').forEach((btn,i)=>{
    if(suggestions[i])btn.textContent=suggestions[i];
  });
}

function addChefMsg(role,content){
  const div=document.createElement('div');
  div.className=`chat-msg ${role==='user'?'user':'chef'}`;
  const html=content
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n/g,'<br>');
  div.innerHTML=`<div class="msg-burbuja">${html}</div>
    <div class="msg-meta">${role==='user'?(userProfile?.name||'You'):'Chef AI'} · ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>`;
  document.getElementById('chefMensajes').appendChild(div);
  document.getElementById('chefMensajes').scrollTop=99999;
}

function addTyping(){ 
  const d=document.createElement('div');
  d.className='chat-msg chef';d.id='typing';
  d.innerHTML=`<div class="msg-burbuja"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  document.getElementById('chefMensajes').appendChild(d);
  document.getElementById('chefMensajes').scrollTop=99999;
}
function removeTyping(){ document.getElementById('typing')?.remove(); }

window.sendSuggestion=function(btn){ document.getElementById('chefInput').value=btn.textContent.slice(2); sendChefMsg(); };

window.sendChefMsg=async function(){
  const input=document.getElementById('chefInput');
  const msg=input.value.trim();if(!msg)return;
  if(userProfile?.plan!=='premium'&&usageCount>=FREE_LIMIT){abrirModal('modalPremium');return;}
  input.value='';
  addChefMsg('user',msg);
  chefHistory.push({role:'user',content:msg});
  addTyping();

  const provider=document.getElementById('aiSelector').value;
  const ck=localStorage.getItem('mpc_claude_key');
  const ok=localStorage.getItem('mpc_openai_key');
  const system=buildSystemPrompt(msg);

  try{
    let resp='';
    if(provider==='claude'&&ck) resp=await callClaude(ck,system,chefHistory);
    else if(provider==='openai'&&ok) resp=await callOpenAI(ok,system,chefHistory);
    else if(ck) resp=await callClaude(ck,system,chefHistory);
    else if(ok) resp=await callOpenAI(ok,system,chefHistory);
    else resp=demoResponse(msg);

    removeTyping();
    chefHistory.push({role:'assistant',content:resp});
    addChefMsg('chef',resp);

    // Guardar historial en Firebase (últimos 20 mensajes)
    const histToSave=chefHistory.slice(-20);
    if(currentUser){
      await set(ref(db,`users/${currentUser.uid}/chatHistory`),histToSave);
      usageCount++;
      await set(ref(db,`users/${currentUser.uid}/usage`),{count:usageCount});
    }
  }catch(e){
    removeTyping();
    addChefMsg('chef','Sorry, I had trouble connecting. Check your API key in Profile → Configure AI Keys.');
  }
};

// ===== SYSTEM PROMPT CON TODA LA MEMORIA =====
function buildSystemPrompt(lastMsg=''){
  const p=userProfile||{};
  const people=(p.adults||2)+(p.children||0);
  const budget=p.weeklyBudget||0;
  const spent=p.spentThisWeek||0;
  const remaining=budget-spent;
  const pantryItems=Object.values(DB.pantry||{}).map(i=>`${i.name} (${i.qty} ${i.unit}, ${i.location})`).join(', ')||'pantry is empty';
  const lowItems=Object.values(DB.pantry||{}).filter(i=>i.alertThreshold&&parseFloat(i.qty)<=parseFloat(i.alertThreshold)).map(i=>i.name).join(', ')||'none';
  const recentRecipes=(DB.menu?.lastCooked||[]).join(', ')||'none recorded';
  const diets=(p.diets||[]).filter(d=>d!=='none').join(', ')||'no dietary restrictions';
  const cuisines=(p.cuisines||[]).join(', ')||'any cuisine';
  const country=p.country||'';
  const lang=userLang==='es'?'SPANISH':userLang==='fr'?'FRENCH':userLang==='pt'?'PORTUGUESE':'ENGLISH';

  // Detectar si el usuario menciona visitas
  const guestMode=lastMsg.toLowerCase().includes('guest')||lastMsg.toLowerCase().includes('invit')||lastMsg.toLowerCase().includes('visit');

  return `You are My Personal Chef, an expert culinary AI assistant. You KNOW this specific user and their household deeply. ALWAYS use this knowledge to personalize every response.

RESPOND ONLY IN ${lang}.

=== USER MEMORY (use this in every response) ===
NAME: ${p.name||'Chef'}
HOUSEHOLD: ${p.adults||2} adults, ${p.children||0} children = ${people} people total
COUNTRY: ${country}
WEEKLY FOOD BUDGET: $${budget} total | $${spent.toFixed(0)} spent | $${remaining.toFixed(0)} REMAINING
BUDGET PER MEAL: $${p.mealBudget||0}
SAVINGS GOAL: $${p.savingsGoal||0}/week
DIETARY RESTRICTIONS: ${diets}
FAVORITE CUISINES: ${cuisines}

=== CURRENT PANTRY & FRIDGE ===
AVAILABLE: ${pantryItems}
RUNNING LOW (alert triggered): ${lowItems}
RECENTLY COOKED: ${recentRecipes}

=== YOUR MISSION ===
1. ALWAYS suggest recipes using what's ALREADY in the pantry/fridge first
2. NEVER suggest recipes that exceed the remaining budget ($${remaining.toFixed(0)})
3. ALWAYS scale recipes to ${people} people
4. RESPECT all dietary restrictions (${diets}) — never suggest forbidden ingredients
5. If LOW items are detected, suggest using them TODAY before they run out
6. Be warm and personal — you know this family, use their name (${p.name})
${guestMode?`7. GUEST MODE ACTIVE: Ask how many guests are coming, then calculate total people and suggest impressive recipes within budget`:''}

=== RESPONSE STYLE ===
- Be like a friendly personal chef who knows the family well
- Always mention how the recipe uses what they already have
- Show cost estimates and how it fits the budget
- If budget is tight (<$20 left), proactively suggest budget recipes
- Format recipes clearly with **Ingredients** and **Steps** sections
- You know ALL world cuisines — be culturally authentic

Remember: This person trusts you. You know their family, their fridge, their budget. Make every suggestion feel personal and thoughtful.`;
}

async function callClaude(key,system,history){
  const msgs=history.map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content}));
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1500,system,messages:msgs})
  });
  if(!r.ok){const e=await r.json();throw new Error(e.error?.message||'Claude error');}
  const d=await r.json();return d.content?.[0]?.text||'';
}

async function callOpenAI(key,system,history){
  const msgs=[{role:'system',content:system},...history.map(m=>({role:m.role,content:m.content}))];
  const r=await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
    body:JSON.stringify({model:'gpt-4o',max_tokens:1500,messages:msgs})
  });
  if(!r.ok){const e=await r.json();throw new Error(e.error?.message||'OpenAI error');}
  const d=await r.json();return d.choices?.[0]?.message?.content||'';
}

function demoResponse(msg){
  const m=msg.toLowerCase();
  const name=userProfile?.name||'Chef';
  const pantryItems=Object.values(DB.pantry||{});
  const pantryNames=pantryItems.map(i=>i.name.toLowerCase());
  const budget=userProfile?.weeklyBudget||0;
  const spent=userProfile?.spentThisWeek||0;
  const remaining=budget-spent;
  const people=(userProfile?.adults||2)+(userProfile?.children||0);

  if(m.includes('guest')||m.includes('invit')||m.includes('visit'))
    return `🎉 ${name}, I see you have guests coming! How many people will be joining your family of ${people}?\n\nOnce you tell me the total headcount, I'll suggest an impressive meal that fits within your **$${remaining.toFixed(0)} remaining budget**.\n\n*(Add your API key in Profile to get full personalized responses)*`;

  if(m.includes('what')||m.includes('cook')||m.includes('have')||m.includes('qué')||m.includes('tengo')){
    if(pantryItems.length>0){
      const item=pantryItems[0];
      return `👨‍🍳 ${name}, looking at your pantry I can see you have **${item.name}**${pantryItems.length>1?' and '+(pantryItems.length-1)+' other ingredients':''}\n\nWith what you have, I suggest a quick **${item.name.includes('chicken')||item.name.includes('pollo')?'Grilled Chicken':'Simple Stir Fry'}** — no extra shopping needed!\n\n💰 Cost: ~$${Math.min(remaining,8).toFixed(0)} (well within your budget)\n👨‍👩‍👧‍👦 Scaled for ${people} people\n\n*(Add your API key in Profile for full personalized AI responses)*`;
    }
    return `👨‍🍳 ${name}, your pantry seems empty! I'd recommend adding your ingredients first in the Pantry tab 🧺, then I can suggest meals using what you have.\n\n💡 Tip: Add everything in your fridge and pantry, including the **alert quantity** (e.g. alert when milk is below 1L), and I'll notify you when things run low.`;
  }

  if(m.includes('budget')||m.includes('cheap')||m.includes('econom')||m.includes('presupuesto'))
    return `💰 ${name}, you have **$${remaining.toFixed(0)} left** this week.\n\nHere are 3 budget-friendly meals for ${people} people:\n\n1. **Lentil Soup** — ~$5 total, serves 6\n2. **Egg Fried Rice** — ~$4 total, very filling\n3. **Vegetable Pasta** — ~$6 total, quick and nutritious\n\nAll three meals together cost ~$15, leaving you $${Math.max(0,remaining-15).toFixed(0)} for the rest of the week! 🎯\n\n*(Add your API key in Profile for fully personalized budget planning)*`;

  if(m.includes('plan')||m.includes('week')||m.includes('semana'))
    return `📅 ${name}, I'll plan the week for ${people} people within your $${remaining.toFixed(0)} remaining budget!\n\n**Sample weekly plan:**\n• Mon: Pasta with pantry ingredients (~$8)\n• Tue: Rice and beans (~$5)\n• Wed: Chicken stir fry (~$12)\n• Thu: Soup with leftovers (~$3)\n• Fri: Tacos (~$10)\n\n**Total: ~$38** — well within budget 💪\n\n*(Go to Menu tab → Generate to create your personalized AI menu)*`;

  return `👨‍🍳 ${name}, I'm in demo mode right now. To unlock your personal AI chef:\n\n1. Go to **Profile** → Configure AI Keys\n2. Add your Claude (Anthropic) or GPT-4 (OpenAI) key\n3. Come back — I'll know your pantry, budget and family!\n\nI can help with:\n🧺 Recipes using what's in your fridge\n💰 Meals within your budget ($${remaining.toFixed(0)} left)\n👨‍👩‍👧‍👦 Scaled for ${people} people\n🎉 Guest meal planning\n⚠️ Using ingredients before they expire`;
}

// ===== PANTRY / FRIDGE =====
let pantryEditId=null;
window.setPantryTab=function(btn,loc){
  currentPantryTab=loc;
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('activo'));
  btn.classList.add('activo');
  renderPantryList();
};

function renderPantry(){
  renderPantryAlerts();
  renderPantryStats();
  renderPantryList();
}

function renderPantryAlerts(){
  const alerts=getAlerts();
  const el=document.getElementById('pantryAlerts');
  if(!alerts.length){el.innerHTML='';return;}
  el.innerHTML=alerts.slice(0,3).map(a=>`
    <div class="pantry-alert ${a.type==='out'||a.type==='expiry'&&a.priority==='high'?'expired':'low'}">
      <div class="pa-icon">${a.type==='out'?'⛔':a.type==='low'?'⚠️':'⏰'}</div>
      <div class="pa-info">
        <div class="pa-title">${a.title}</div>
        <div class="pa-sub">${a.sub}</div>
      </div>
    </div>`).join('');
}

function renderPantryStats(){
  const items=Object.values(DB.pantry||{}).filter(i=>i.location===currentPantryTab);
  const total=items.length;
  const low=items.filter(i=>i.alertThreshold&&parseFloat(i.qty)<=parseFloat(i.alertThreshold)&&parseFloat(i.qty)>0).length;
  const out=items.filter(i=>parseFloat(i.qty)<=0).length;
  const expiring=items.filter(i=>{if(!i.expiry)return false;const d=(new Date(i.expiry)-new Date())/(1000*60*60*24);return d<=3&&d>0;}).length;
  document.getElementById('pantryStats').innerHTML=`
    <div class="pantry-stat"><strong>${total}</strong><span>${t('totalItems')}</span></div>
    <div class="pantry-stat"><strong style="color:var(--orange)">${low}</strong><span>${t('lowStock')}</span></div>
    <div class="pantry-stat"><strong style="color:var(--red)">${out}</strong><span>Out</span></div>
    <div class="pantry-stat"><strong style="color:var(--gold)">${expiring}</strong><span>${t('expiring')}</span></div>`;
}

function renderPantryList(){
  const items=Object.values(DB.pantry||{}).filter(i=>i.location===currentPantryTab);
  const el=document.getElementById('pantryList');
  if(!items.length){
    el.innerHTML=`<div style="text-align:center;padding:40px;color:var(--gray)">
      <div style="font-size:40px;margin-bottom:10px">${currentPantryTab==='fridge'?'🧊':currentPantryTab==='pantry'?'🥫':'❄️'}</div>
      <p style="font-size:14px">Nothing here yet. Add ingredients to get smart suggestions!</p>
    </div>`;return;
  }
  // Agrupar por categoría
  const grouped={};
  items.forEach(i=>{if(!grouped[i.category])grouped[i.category]=[];grouped[i.category].push(i);});
  el.innerHTML=Object.entries(grouped).map(([cat,its])=>`
    <div style="margin-bottom:18px">
      <div style="font-size:11px;color:var(--gray);font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:7px">${catIcon(cat)} ${cat}</div>
      ${its.map(i=>{
        const qty=parseFloat(i.qty)||0;
        const thresh=parseFloat(i.alertThreshold)||0;
        const isLow=thresh>0&&qty<=thresh&&qty>0;
        const isOut=qty<=0;
        let expiryHTML='',alertTag='';
        if(i.expiry){
          const diff=Math.ceil((new Date(i.expiry)-new Date())/(1000*60*60*24));
          const cls=diff<=0?'expiry-expired':diff<=1?'expiry-warn':'expiry-ok';
          const txt=diff<=0?t('expired'):diff===1?t('today2'):`${t('expiresIn')} ${diff} ${t('days')}`;
          expiryHTML=`<span style="font-size:11px;color:${diff<=0?'var(--red)':diff<=1?'var(--orange)':'var(--gray)'}">${txt}</span>`;
        }
        if(isOut)alertTag=`<span class="pi-alert-tag expired">⛔ Out of stock</span>`;
        else if(isLow)alertTag=`<span class="pi-alert-tag low">⚠️ ${t('lowStock')}: ${i.qty} ${i.unit} left</span>`;
        return`<div class="pantry-item ${isLow?'low-stock':''} ${isOut?'out-stock':''}">
          <div class="pi-icon">${catIcon(i.category)}</div>
          <div class="pi-info">
            <div class="pi-name">${i.name}</div>
            <div class="pi-meta">${i.category}${i.alertThreshold?` · alert at ${i.alertThreshold} ${i.unit}`:''}</div>
            ${alertTag}
            ${expiryHTML}
          </div>
          <div class="pi-qty">${i.qty} <span style="font-size:11px;color:var(--gray)">${i.unit}</span></div>
          <div class="pi-actions">
            <button class="pi-btn" onclick="editItem('${i.id}')" title="Edit">✏️</button>
            <button class="pi-btn" onclick="deleteItem('${i.id}')" title="Delete">🗑️</button>
          </div>
        </div>`;
      }).join('')}
    </div>`).join('');
}

window.abrirModalAddItem=function(){
  pantryEditId=null;
  document.getElementById('itemName').value='';
  document.getElementById('itemQty').value='';
  document.getElementById('itemAlert').value='';
  document.getElementById('itemExpiry').value='';
  document.getElementById('itemPrice').value='';
  document.getElementById('itemLocation').value=currentPantryTab;
  abrirModal('modalAddItem');
};

window.editItem=function(id){
  const item=DB.pantry[id];if(!item)return;
  pantryEditId=id;
  document.getElementById('itemName').value=item.name;
  document.getElementById('itemQty').value=item.qty;
  document.getElementById('itemUnit').value=item.unit||'units';
  document.getElementById('itemAlert').value=item.alertThreshold||'';
  document.getElementById('itemExpiry').value=item.expiry||'';
  document.getElementById('itemCategory').value=item.category||'other';
  document.getElementById('itemLocation').value=item.location||'fridge';
  document.getElementById('itemPrice').value=item.price||'';
  abrirModal('modalAddItem');
};

window.saveItem=async function(){
  const name=document.getElementById('itemName').value.trim();
  if(!name){toast('⚠️ Enter ingredient name');return;}
  const qty=document.getElementById('itemQty').value;
  const unit=document.getElementById('itemUnit').value;
  const alertThreshold=document.getElementById('itemAlert').value;
  const location=document.getElementById('itemLocation').value;
  const category=document.getElementById('itemCategory').value;
  const expiry=document.getElementById('itemExpiry').value;
  const price=parseFloat(document.getElementById('itemPrice').value)||0;

  const itemData={name,qty:parseFloat(qty)||0,unit,alertThreshold:parseFloat(alertThreshold)||0,
    location,category,expiry,price,updatedAt:new Date().toISOString()};

  if(pantryEditId){
    await update(ref(db,`users/${currentUser.uid}/pantry/${pantryEditId}`),itemData);
    DB.pantry[pantryEditId]={...DB.pantry[pantryEditId],...itemData};
    toast('✅ Updated');
  } else {
    const nr=push(ref(db,`users/${currentUser.uid}/pantry`));
    itemData.id=nr.key;itemData.addedAt=new Date().toISOString();
    await set(nr,itemData);DB.pantry[nr.key]=itemData;
    toast('✅ Added to '+location);
  }
  cerrarModal('modalAddItem');
  updateAlertBadge();
  renderPantry();
};

window.deleteItem=async function(id){
  await remove(ref(db,`users/${currentUser.uid}/pantry/${id}`));
  delete DB.pantry[id];
  updateAlertBadge();
  renderPantry();
  toast('🗑 Removed');
};

// ===== RECETAS =====
function canMakeRecipe(r){
  const pantryNames=Object.values(DB.pantry||{}).map(i=>i.name.toLowerCase());
  return r.pantryItems.filter(pi=>pantryNames.some(pn=>pn.includes(pi))).length>=Math.ceil(r.pantryItems.length*0.5);
}

function renderRecipes(){
  let list=RECIPES_DB;
  if(recipeFilter==='all'){}
  else if(recipeFilter==='quick') list=list.filter(r=>r.time<=20);
  else if(recipeFilter==='budget') list=list.filter(r=>r.tags.includes('budget'));
  else if(recipeFilter==='canmake') list=list.filter(r=>canMakeRecipe(r));
  else list=list.filter(r=>r.category===recipeFilter);
  if(recipeSearch) list=list.filter(r=>r.name.toLowerCase().includes(recipeSearch.toLowerCase()));
  // Filtrar por dieta
  if(userProfile?.diets?.length){
    const ud=userProfile.diets.filter(d=>d!=='none');
    if(ud.length) list=list.filter(r=>ud.every(d=>r.diet.includes(d))||r.diet.length===0);
  }
  document.getElementById('recipesGrid').innerHTML=list.length?list.map(r=>{
    const canMake=canMakeRecipe(r);
    const budgetOk=!userProfile?.weeklyBudget||r.cost<=(userProfile.weeklyBudget-userProfile.spentThisWeek);
    return`<div class="recipe-card ${canMake?'rc-can-make':''}" onclick="openRecipe('${r.id}')">
      <div class="rc-emoji">${r.emoji}</div>
      <div class="rc-body">
        <div class="rc-name">${r.name}</div>
        <div class="rc-meta">
          <span>⏱ ${r.time}m</span>
          <span style="color:${budgetOk?'var(--green)':'var(--red)'}">$${r.cost}</span>
          <span class="rc-tag">${r.difficulty}</span>
          ${canMake?'<span class="rc-tag" style="background:var(--green-pale);color:var(--green)">✓ Have it</span>':''}
        </div>
      </div>
    </div>`;
  }).join(''):`<div style="grid-column:1/-1;text-align:center;color:var(--gray);padding:40px;font-size:14px">No recipes found 🍽️</div>`;
}

window.filterRecipes=function(f,el){
  recipeFilter=f;
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('activo'));
  el.classList.add('activo');renderRecipes();
};
window.searchRecipes=function(){ recipeSearch=document.getElementById('recipeSearch').value;renderRecipes(); };

window.openRecipe=function(id){
  const r=RECIPES_DB.find(x=>x.id===id);if(!r)return;
  currentRecipe=r;
  const people=(userProfile?.adults||2)+(userProfile?.children||0);
  const scale=people/r.servings;
  document.getElementById('modalRecipeContent').innerHTML=`
    <div class="recipe-detail-hero">${r.emoji}</div>
    <div class="recipe-detail-title">${r.name}</div>
    <div class="recipe-detail-meta">
      <span class="rdm-tag">⏱ ${r.time} min</span>
      <span class="rdm-tag">👤 ${r.servings} → <strong>${people}</strong> people</span>
      <span class="rdm-tag" style="color:var(--green)">💵 ~$${(r.cost*scale).toFixed(0)}</span>
      <span class="rdm-tag">${r.difficulty}</span>
      ${r.diet.map(d=>`<span class="rdm-tag" style="color:var(--green)">✓ ${d}</span>`).join('')}
      ${canMakeRecipe(r)?'<span class="rdm-tag" style="color:var(--green);background:var(--green-pale)">✅ You have the ingredients</span>':''}
    </div>
    ${scale!==1?`<div style="background:var(--gold-pale);border-radius:10px;padding:10px 14px;font-size:13px;margin-bottom:12px;color:var(--dark)">📐 Scaled for <strong>${people} people</strong> (original: ${r.servings})</div>`:''}
    <div class="recipe-section-title">Ingredients</div>
    <div class="ingredient-list">${r.ingredients.map(i=>`
      <div class="ingredient-item">
        <span class="ingr-qty">${scaleQty(i.qty,scale)}</span>
        <span>${i.name}</span>
      </div>`).join('')}</div>
    <div class="recipe-section-title">Instructions</div>
    <div class="steps-list">${r.steps.map((s,i)=>`
      <div class="step-item"><div class="step-num">${i+1}</div><div>${s}</div></div>`).join('')}
    </div>`;
  abrirModal('modalRecipe');
};

function scaleQty(qty,scale){
  if(scale===1)return qty;
  const num=parseFloat(qty);
  if(!isNaN(num))return(num*scale).toFixed(num%1===0?0:1)+qty.replace(/[\d.]+/,'').trim();
  return qty;
}

window.addRecipeToMenu=function(){
  cerrarModal('modalRecipe');navegar('menu');toast('📅 Select a slot to add this recipe');
};
window.addRecipeToShopping=async function(){
  if(!currentRecipe)return;
  const people=(userProfile?.adults||2)+(userProfile?.children||0);
  const scale=people/currentRecipe.servings;
  for(const ing of currentRecipe.ingredients){
    const nr=push(ref(db,`users/${currentUser.uid}/shopping`));
    const item={id:nr.key,name:`${ing.name} (${currentRecipe.name})`,
      qty:scaleQty(ing.qty,scale),price:0,done:false,addedAt:new Date().toISOString()};
    await set(nr,item);DB.shopping[nr.key]=item;
  }
  cerrarModal('modalRecipe');toast('🛒 Ingredients added to shopping list!');
};

// ===== MENÚ SEMANAL =====
const WEEK_DAYS=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function renderMenu(){
  const budget=userProfile?.weeklyBudget||0;
  const spent=userProfile?.spentThisWeek||0;
  const remaining=budget-spent;

  // Costo estimado del menú
  let menuCost=0;
  Object.values(DB.menu||{}).forEach(day=>{
    if(typeof day==='object'&&day.breakfast)menuCost+=5;
    if(typeof day==='object'&&day.lunch)menuCost+=7;
    if(typeof day==='object'&&day.dinner)menuCost+=10;
  });

  const costEl=document.getElementById('menuCostSummary');
  if(budget&&Object.keys(DB.menu||{}).length){
    costEl.innerHTML=`<div class="menu-cost-summary">
      <div style="display:flex;justify-content:space-between;font-size:13px">
        <span>📅 Estimated weekly menu cost</span>
        <strong style="color:${menuCost<=remaining?'var(--green)':'var(--red)'}">~$${menuCost}</strong>
      </div>
      <div style="font-size:12px;color:var(--gray);margin-top:4px">Budget remaining: $${remaining.toFixed(0)}</div>
    </div>`;
  } else costEl.innerHTML='';

  const content=document.getElementById('weeklyMenuContent');
  if(!Object.keys(DB.menu||{}).filter(k=>WEEK_DAYS.includes(k)).length){
    content.innerHTML=`<div style="text-align:center;padding:40px">
      <div style="font-size:52px;margin-bottom:14px">📅</div>
      <h3 style="font-family:'Playfair Display',serif;color:var(--dark);margin-bottom:8px">No menu yet</h3>
      <p style="color:var(--gray);margin-bottom:20px;font-size:14px">Generate a weekly menu with AI or add meals manually</p>
      <button class="btn" onclick="generateWeeklyMenu()">✨ ${t('generate')}</button>
    </div>`;return;
  }
  content.innerHTML=WEEK_DAYS.map(day=>{
    const data=DB.menu[day]||{};
    return`<div class="week-day">
      <div class="week-day-name">${t(day)}</div>
      ${['breakfast','lunch','dinner'].map((meal,i)=>`
        <div class="meal-slot">
          <div class="meal-type">${t(['breakfast2','lunch2','dinner2'][i])}</div>
          <div class="meal-name">${data[meal]||'<span style="color:var(--gray)">—</span>'}</div>
          <button class="meal-edit" onclick="editMealSlot('${day}','${meal}','${data[meal]||''}')">✏️</button>
        </div>`).join('')}
    </div>`;
  }).join('');
}

window.generateWeeklyMenu=async function(){
  if(userProfile?.plan!=='premium'){abrirModal('modalPremium');return;}
  toast('✨ Generating your personalized menu...');
  const people=(userProfile?.adults||2)+(userProfile?.children||0);
  const budget=userProfile?.weeklyBudget||0;
  const diets=(userProfile?.diets||[]).filter(d=>d!=='none');
  // Generar menú con recetas disponibles filtradas
  const available=RECIPES_DB.filter(r=>diets.length===0||diets.every(d=>r.diet.includes(d))||r.diet.length===0);
  const menu={};
  WEEK_DAYS.forEach(day=>{
    const breakfasts=available.filter(r=>r.category==='breakfast');
    const lunches=available.filter(r=>r.category==='lunch');
    const dinners=available.filter(r=>r.category==='dinner');
    menu[day]={
      breakfast:(breakfasts[Math.floor(Math.random()*breakfasts.length)]||available[0]).name,
      lunch:(lunches[Math.floor(Math.random()*lunches.length)]||available[1]).name,
      dinner:(dinners[Math.floor(Math.random()*dinners.length)]||available[2]).name,
    };
  });
  await set(ref(db,`users/${currentUser.uid}/menu`),menu);DB.menu=menu;
  renderMenu();toast('✅ Weekly menu created!');
};

window.editMealSlot=function(day,meal,current){
  const val=prompt(`${t(meal+'2')} for ${t(day)}:`,current);
  if(val===null)return;
  if(!DB.menu[day])DB.menu[day]={};
  DB.menu[day][meal]=val;
  update(ref(db,`users/${currentUser.uid}/menu/${day}`),{[meal]:val});
  renderMenu();
};

// ===== LISTA DE COMPRAS =====
function renderShopping(){
  const items=Object.values(DB.shopping||{});
  const done=items.filter(i=>i.done).length;
  const total=items.reduce((s,i)=>s+(parseFloat(i.price)||0),0);
  document.getElementById('shoppingStats').innerHTML=`
    <div class="pantry-stat"><strong>${items.length}</strong><span>${t('items')}</span></div>
    <div class="pantry-stat"><strong style="color:var(--green)">${done}</strong><span>${t('purchased')}</span></div>
    <div class="pantry-stat"><strong style="color:var(--gold)">$${total.toFixed(2)}</strong><span>${t('totalEstimated')}</span></div>`;
  if(!items.length){
    document.getElementById('shoppingList').innerHTML=`<div style="text-align:center;color:var(--gray);padding:40px;font-size:14px">Your shopping list is empty 🛒<br>Add items or generate from a recipe</div>`;return;
  }
  const pending=items.filter(i=>!i.done);
  const purchased=items.filter(i=>i.done);
  let html=pending.map(i=>siHTML(i)).join('');
  if(purchased.length){
    html+=`<div style="margin:14px 0 8px;font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.5px">✓ ${t('purchased')}</div>`;
    html+=purchased.map(i=>siHTML(i)).join('');
  }
  html+=`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn btn-gris btn-sm" onclick="clearPurchasedItems()">${t('clearPurchased')}</button>
    <button class="btn btn-sm" onclick="addAllToSpending()" style="background:var(--green)">✅ Mark as spent</button>
  </div>`;
  document.getElementById('shoppingList').innerHTML=html;
}

function siHTML(i){
  return`<div class="shopping-item ${i.done?'comprado':''}">
    <button class="si-check ${i.done?'done':''}" onclick="toggleSI('${i.id}')">${i.done?'✓':''}</button>
    <div class="si-info"><div class="si-name">${i.name}</div><div class="si-qty">${i.qty||''}</div></div>
    <div class="si-price">${i.price>0?'$'+parseFloat(i.price).toFixed(2):''}</div>
    <button class="si-delete" onclick="deleteSI('${i.id}')">🗑</button>
  </div>`;
}

window.abrirModalShoppingItem=function(){
  document.getElementById('shoppingName').value='';
  document.getElementById('shoppingQty').value='';
  document.getElementById('shoppingPrice').value='';
  abrirModal('modalShopping');
};
window.saveShoppingItem=async function(){
  const name=document.getElementById('shoppingName').value.trim();
  if(!name){toast('⚠️ Enter item name');return;}
  const qty=document.getElementById('shoppingQty').value.trim();
  const price=parseFloat(document.getElementById('shoppingPrice').value)||0;
  const nr=push(ref(db,`users/${currentUser.uid}/shopping`));
  const item={id:nr.key,name,qty,price,done:false,addedAt:new Date().toISOString()};
  await set(nr,item);DB.shopping[nr.key]=item;
  cerrarModal('modalShopping');renderShopping();toast('✅ Added');
};
window.toggleSI=async function(id){
  const i=DB.shopping[id];if(!i)return;
  i.done=!i.done;
  await update(ref(db,`users/${currentUser.uid}/shopping/${id}`),{done:i.done});
  renderShopping();
};
window.deleteSI=async function(id){
  await remove(ref(db,`users/${currentUser.uid}/shopping/${id}`));
  delete DB.shopping[id];renderShopping();
};
window.clearPurchasedItems=async function(){
  const p=Object.values(DB.shopping||{}).filter(i=>i.done);
  for(const i of p){await remove(ref(db,`users/${currentUser.uid}/shopping/${i.id}`));delete DB.shopping[i.id];}
  renderShopping();toast(`🗑 Cleared ${p.length} items`);
};

// Marcar gasto semanal cuando se compra
window.addAllToSpending=async function(){
  const total=Object.values(DB.shopping||{}).filter(i=>i.done).reduce((s,i)=>s+(parseFloat(i.price)||0),0);
  if(!total){toast('⚠️ No prices set for purchased items');return;}
  const newSpent=(userProfile.spentThisWeek||0)+total;
  await update(ref(db,`users/${currentUser.uid}/profile`),{spentThisWeek:newSpent});
  userProfile.spentThisWeek=newSpent;
  toast(`💵 $${total.toFixed(2)} added to weekly spending`);
  renderShopping();renderBudgetSummary();
};

// ===== PERFIL =====
function renderProfile(){
  const p=userProfile||{};
  document.getElementById('profileName').textContent=p.name||'Chef';
  document.getElementById('profilePlan').textContent=p.plan==='premium'?'Premium ⭐':'Free plan';
  document.getElementById('profileAvatar').textContent=p.plan==='premium'?'👑':'👨‍🍳';

  // Presupuesto
  const spent=p.spentThisWeek||0;
  const budget=p.weeklyBudget||0;
  const remaining=Math.max(0,budget-spent);
  document.getElementById('profileBudget').innerHTML=budget?`
    <div style="background:white;border:1px solid var(--border);border-radius:14px;padding:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px">
        <span style="color:var(--gray)">Weekly budget</span><strong>$${budget}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px">
        <span style="color:var(--gray)">Spent this week</span><strong style="color:var(--red)">$${spent.toFixed(0)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px">
        <span style="color:var(--gray)">Remaining</span><strong style="color:var(--green)">$${remaining.toFixed(0)}</strong>
      </div>
      <div style="height:6px;background:var(--gray-light);border-radius:6px;overflow:hidden">
        <div style="height:100%;width:${Math.min(100,Math.round((spent/budget)*100))}%;background:${spent/budget<0.7?'var(--green)':spent/budget<0.9?'var(--orange)':'var(--red)'};border-radius:6px"></div>
      </div>
      ${p.savingsGoal?`<div style="font-size:12px;color:var(--gray);margin-top:6px">🎯 Savings goal: $${p.savingsGoal}/week</div>`:''}
    </div>`:'<div style="color:var(--gray);font-size:14px">No budget set. <button class="btn-link" style="display:inline;padding:0" onclick="editarPerfil()">Set one now</button></div>';

  // Preferencias
  const diets=(p.diets||[]).map(d=>`<span class="pref-tag">🥗 ${d}</span>`).join('');
  const cuisines=(p.cuisines||[]).map(c=>`<span class="pref-tag">🍽 ${c}</span>`).join('');
  const people=(p.adults||2)+(p.children||0);
  document.getElementById('profilePrefs').innerHTML=`
    <div style="margin-bottom:10px"><span class="pref-tag">👨‍👩‍👧‍👦 ${people} people</span><span class="pref-tag">📍 ${p.country||'—'}</span></div>
    ${diets?`<div style="margin-bottom:6px"><strong style="font-size:12px;color:var(--gray)">Diet:</strong><br>${diets}</div>`:''}
    ${cuisines?`<div><strong style="font-size:12px;color:var(--gray)">Cuisines:</strong><br>${cuisines}</div>`:''}`;

  // Plan info
  document.getElementById('profilePlanInfo').innerHTML=p.plan==='premium'
    ?`<div style="background:var(--gold-pale);border:1px solid rgba(201,151,58,.25);border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:28px">👑</div>
        <div style="font-weight:600;color:var(--gold);margin-top:6px">Premium Active</div>
        <div style="font-size:13px;color:var(--gray);margin-top:4px">Unlimited AI chef & all features</div>
      </div>`
    :`<div style="background:var(--gray-light);border-radius:14px;padding:14px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
          <span>AI uses this month</span><strong>${usageCount} / ${FREE_LIMIT}</strong>
        </div>
        <div style="height:6px;background:white;border-radius:6px;overflow:hidden;margin-bottom:12px">
          <div style="height:100%;width:${Math.min(100,(usageCount/FREE_LIMIT)*100)}%;background:var(--gold);border-radius:6px"></div>
        </div>
        <button class="btn btn-full" onclick="abrirModal('modalPremium')">⭐ Upgrade to Premium — $4.99/mo</button>
      </div>`;
}

window.editarPerfil=function(){
  const p=userProfile||{};
  document.getElementById('ep_name').value=p.name||'';
  document.getElementById('ep_adults').textContent=p.adults||2;
  document.getElementById('ep_children').textContent=p.children||0;
  document.getElementById('ep_budget').value=p.weeklyBudget||'';
  document.getElementById('ep_savings').value=p.savingsGoal||'';
  document.getElementById('ep_mealbudget').value=p.mealBudget||'';
  editCounts.adults=p.adults||2;editCounts.children=p.children||0;
  abrirModal('modalEditProfile');
};

window.changeEditCount=function(f,d){
  editCounts[f]=Math.max(0,(editCounts[f]||0)+d);
  document.getElementById('ep_'+f).textContent=editCounts[f];
};

window.saveEditProfile=async function(){
  const updates={
    name:document.getElementById('ep_name').value.trim()||userProfile.name,
    adults:editCounts.adults,
    children:editCounts.children,
    weeklyBudget:parseFloat(document.getElementById('ep_budget').value)||0,
    savingsGoal:parseFloat(document.getElementById('ep_savings').value)||0,
    mealBudget:parseFloat(document.getElementById('ep_mealbudget').value)||0,
  };
  await update(ref(db,`users/${currentUser.uid}/profile`),updates);
  Object.assign(userProfile,updates);
  cerrarModal('modalEditProfile');renderProfile();toast('✅ Profile updated');
};

// ===== API KEYS =====
window.abrirModalApiKeys=function(){
  document.getElementById('claudeKeyInput').value=localStorage.getItem('mpc_claude_key')||'';
  document.getElementById('openaiKeyInput').value=localStorage.getItem('mpc_openai_key')||'';
  abrirModal('modalApiKeys');
};
window.saveApiKeys=function(){
  const ck=document.getElementById('claudeKeyInput').value.trim();
  const ok=document.getElementById('openaiKeyInput').value.trim();
  if(ck)localStorage.setItem('mpc_claude_key',ck);else localStorage.removeItem('mpc_claude_key');
  if(ok)localStorage.setItem('mpc_openai_key',ok);else localStorage.removeItem('mpc_openai_key');
  cerrarModal('modalApiKeys');toast('✅ Keys saved');
};

// ===== PREMIUM =====
window.processPremium=async function(){
  // En producción: integrar Stripe o PayPal aquí
  toast('⭐ Redirecting to payment...');
  setTimeout(async()=>{
    if(userProfile){
      userProfile.plan='premium';
      await update(ref(db,`users/${currentUser.uid}/profile`),{plan:'premium'});
      document.getElementById('headerPlanTag').textContent='Premium ⭐';
      document.getElementById('headerPlanTag').classList.add('premium');
      cerrarModal('modalPremium');
      toast('🎉 Welcome to Premium! All features unlocked.');
      renderProfile();
    }
  },1500);
};


// ===== MODO DEMO / CUENTA DE PRUEBA =====
// Credenciales: admin@mypersonalchef.app / demo1234
// Funciona sin Firebase — todo en memoria local

const DEMO_PROFILE = {
  name: 'Alfredo (Demo)',
  email: 'admin@mypersonalchef.app',
  adults: 2,
  children: 2,
  country: 'Canada',
  diets: ['none'],
  cuisines: ['italian','mexican','american','latin'],
  plan: 'premium',
  lang: 'en',
  weeklyBudget: 150,
  savingsGoal: 20,
  mealBudget: 15,
  spentThisWeek: 42,
  weekStart: getWeekStart(),
  createdAt: new Date().toISOString(),
  isDemo: true
};

const DEMO_PANTRY = {
  'd1':{ id:'d1', name:'Chicken breast',   qty:4,    unit:'units',   alertThreshold:2, location:'fridge',  category:'protein',   expiry:'', price:12 },
  'd2':{ id:'d2', name:'Milk',             qty:0.5,  unit:'L',       alertThreshold:1, location:'fridge',  category:'dairy',     expiry:'', price:3  },
  'd3':{ id:'d3', name:'Eggs',             qty:3,    unit:'units',   alertThreshold:4, location:'fridge',  category:'protein',   expiry:'', price:5  },
  'd4':{ id:'d4', name:'Tomatoes',         qty:5,    unit:'units',   alertThreshold:2, location:'fridge',  category:'vegetable', expiry:'', price:3  },
  'd5':{ id:'d5', name:'Pasta',            qty:500,  unit:'g',       alertThreshold:0, location:'pantry',  category:'grain',     expiry:'', price:2  },
  'd6':{ id:'d6', name:'Olive oil',        qty:300,  unit:'ml',      alertThreshold:50,location:'pantry',  category:'condiment', expiry:'', price:8  },
  'd7':{ id:'d7', name:'Rice',             qty:2,    unit:'kg',      alertThreshold:0, location:'pantry',  category:'grain',     expiry:'', price:5  },
  'd8':{ id:'d8', name:'Onions',           qty:3,    unit:'units',   alertThreshold:2, location:'pantry',  category:'vegetable', expiry:'', price:2  },
  'd9':{ id:'d9', name:'Garlic',           qty:1,    unit:'units',   alertThreshold:0, location:'pantry',  category:'condiment', expiry:'', price:1  },
  'd10':{ id:'d10',name:'Chicken thighs',  qty:500,  unit:'g',       alertThreshold:0, location:'freezer', category:'protein',   expiry:'', price:7  },
  'd11':{ id:'d11',name:'Frozen peas',     qty:400,  unit:'g',       alertThreshold:0, location:'freezer', category:'vegetable', expiry:'', price:3  },
  'd12':{ id:'d12',name:'Cheddar cheese',  qty:150,  unit:'g',       alertThreshold:100,location:'fridge', category:'dairy',     expiry:'', price:4  },
};

const DEMO_SHOPPING = {
  's1':{ id:'s1', name:'Milk (1L)',        qty:'2 L',   price:4.50, done:false },
  's2':{ id:'s2', name:'Eggs (12 pack)',   qty:'1 pack',price:5.99, done:false },
  's3':{ id:'s3', name:'Bread',            qty:'1 loaf',price:3.49, done:true  },
  's4':{ id:'s4', name:'Apples',           qty:'6 units',price:3.00,done:false },
};

window.enterDemoMode = function(){
  userLang = localStorage.getItem('mpc_lang') || 'en';

  // Simular usuario demo sin Firebase
  currentUser = { uid: 'demo_user', email: 'admin@mypersonalchef.app', isDemo: true };
  userProfile  = { ...DEMO_PROFILE, lang: userLang };
  DB.pantry    = { ...DEMO_PANTRY };
  DB.shopping  = { ...DEMO_SHOPPING };
  DB.menu      = {
    monday:   { breakfast:'Pancakes', lunch:'Greek Salad', dinner:'Spaghetti Carbonara' },
    tuesday:  { breakfast:'Avocado Toast', lunch:'Miso Soup', dinner:'Chicken Tikka Masala' },
    wednesday:{ breakfast:'Pancakes', lunch:'Hummus & Pita', dinner:'Beef Tacos' },
    thursday: { breakfast:'Avocado Toast', lunch:'Lentil Soup', dinner:'Vegetable Stir Fry' },
    friday:   { breakfast:'Pancakes', lunch:'Greek Salad', dinner:'Spaghetti Carbonara' },
    saturday: { breakfast:'Avocado Toast', lunch:'Chicken Tikka Masala', dinner:'Beef Tacos' },
    sunday:   { breakfast:'Pancakes', lunch:'Lentil Soup', dinner:'Vegetable Stir Fry' },
  };
  usageCount = 3;

  // Mostrar banner demo
  document.getElementById('demoBanner').classList.remove('oculto');

  applyLang();
  enterApp();

  // Override doLogout para demo
  window.doLogout = function(){
    currentUser = null; userProfile = null;
    chefHistory = []; DB = {pantry:{},shopping:{},menu:{},spending:{}};
    document.getElementById('demoBanner').classList.add('oculto');
    show('screen-lang');
    // Restaurar doLogout original
    window.doLogout = async function(){
      await signOut(auth);
      currentUser=null; userProfile=null; chefHistory=[];
      DB={pantry:{},shopping:{},menu:{},spending:{}};
      show('screen-auth');
    };
  };

  // Override saves para demo (no escribe en Firebase)
  window._demoMode = true;
};

// Parchar funciones de escritura en Firebase para el modo demo
const _origSaveItem   = window.saveItem;
const _origSaveSI     = window.saveShoppingItem;
const _origToggleSI   = window.toggleSI;
const _origDeleteItem = window.deleteItem;
const _origDeleteSI   = window.deleteSI;
const _origSaveProfile= window.saveEditProfile;

// En modo demo, las funciones de escritura trabajan solo en memoria
function patchDemoSaves(){
  window.saveItem = async function(){
    if(!window._demoMode){ _origSaveItem && _origSaveItem(); return; }
    const name=document.getElementById('itemName').value.trim();
    if(!name){toast('⚠️ Enter ingredient name');return;}
    const id = pantryEditId || ('demo_'+Date.now());
    DB.pantry[id]={
      id, name,
      qty:parseFloat(document.getElementById('itemQty').value)||0,
      unit:document.getElementById('itemUnit').value,
      alertThreshold:parseFloat(document.getElementById('itemAlert').value)||0,
      location:document.getElementById('itemLocation').value,
      category:document.getElementById('itemCategory').value,
      expiry:document.getElementById('itemExpiry').value,
      price:parseFloat(document.getElementById('itemPrice').value)||0,
      updatedAt:new Date().toISOString()
    };
    cerrarModal('modalAddItem');
    updateAlertBadge(); renderPantry();
    toast('✅ Saved (demo mode)');
  };

  window.deleteItem = async function(id){
    if(!window._demoMode){ _origDeleteItem && _origDeleteItem(id); return; }
    delete DB.pantry[id];
    updateAlertBadge(); renderPantry(); toast('🗑 Removed');
  };

  window.saveShoppingItem = async function(){
    if(!window._demoMode){ _origSaveSI && _origSaveSI(); return; }
    const name=document.getElementById('shoppingName').value.trim();
    if(!name){toast('⚠️ Enter item name');return;}
    const id='ds_'+Date.now();
    DB.shopping[id]={id,name,
      qty:document.getElementById('shoppingQty').value.trim(),
      price:parseFloat(document.getElementById('shoppingPrice').value)||0,
      done:false,addedAt:new Date().toISOString()};
    cerrarModal('modalShopping'); renderShopping(); toast('✅ Added');
  };

  window.toggleSI = async function(id){
    if(!window._demoMode){ _origToggleSI && _origToggleSI(id); return; }
    if(DB.shopping[id]) DB.shopping[id].done=!DB.shopping[id].done;
    renderShopping();
  };

  window.deleteSI = async function(id){
    if(!window._demoMode){ _origDeleteSI && _origDeleteSI(id); return; }
    delete DB.shopping[id]; renderShopping(); toast('🗑 Removed');
  };

  window.saveEditProfile = async function(){
    if(!window._demoMode){ _origSaveProfile && _origSaveProfile(); return; }
    Object.assign(userProfile,{
      name:document.getElementById('ep_name').value.trim()||userProfile.name,
      adults:editCounts.adults, children:editCounts.children,
      weeklyBudget:parseFloat(document.getElementById('ep_budget').value)||0,
      savingsGoal:parseFloat(document.getElementById('ep_savings').value)||0,
      mealBudget:parseFloat(document.getElementById('ep_mealbudget').value)||0,
    });
    cerrarModal('modalEditProfile'); renderProfile(); toast('✅ Profile updated (demo)');
  };
}
patchDemoSaves();