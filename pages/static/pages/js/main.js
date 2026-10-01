/* ═══════════════════════════════════════════════
   BOTÓN FLOTANTE MENÚ (Nosotros / Contacto)
═══════════════════════════════════════════════ */
function toggleFloatingMenu() {
  var opts = document.getElementById('floating-menu-options');
  var btn  = document.getElementById('floating-menu-btn');
  var icon = document.getElementById('floating-menu-icon');
  if (!opts) return;
  var isOpen = opts.classList.contains('open');
  if (isOpen) {
    opts.classList.remove('open');
    opts.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    icon.innerHTML = '<path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>';
  } else {
    opts.classList.add('open');
    opts.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    icon.innerHTML = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
  }
}

// Cierra el menú flotante al hacer clic fuera
document.addEventListener('click', function(e) {
  var wrap = document.getElementById('floating-menu-wrap');
  if (wrap && !wrap.contains(e.target)) {
    var opts = document.getElementById('floating-menu-options');
    var btn  = document.getElementById('floating-menu-btn');
    var icon = document.getElementById('floating-menu-icon');
    if (opts && opts.classList.contains('open')) {
      opts.classList.remove('open');
      opts.setAttribute('aria-hidden', 'true');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (icon) icon.innerHTML = '<path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>';
    }
  }
});

/* =============================================
   EMPRENDE IQUIQUE - JavaScript Principal
   main.js
   ============================================= */

/* ─────────── UTILIDADES localStorage ─────────── */
function lsGet(key) { try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {} }

/* ═══════════════════════════════════════════════
   1. MODO OSCURO
═══════════════════════════════════════════════ */
var pathLuna = "M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z";
var pathSol  = "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z";

function updateThemeIcon(theme) {
  var ip = document.getElementById('theme-path'), tn = document.getElementById('theme-text');
  if (!ip || !tn) return;
  ip.setAttribute('d', theme === 'dark' ? pathSol : pathLuna);
  tn.textContent = theme === 'dark' ? 'Día' : 'Noche';
}
function toggleTheme() {
  var html = document.documentElement, isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) { html.removeAttribute('data-theme'); lsSet('theme', 'light'); updateThemeIcon('light'); }
  else        { html.setAttribute('data-theme','dark'); lsSet('theme','dark'); updateThemeIcon('dark'); }
}

/* ═══════════════════════════════════════════════
   2. SISTEMA DE USUARIOS
═══════════════════════════════════════════════ */
function getUsers()       { return lsGet('ei_users') || []; }
function saveUsers(u)     { lsSet('ei_users', u); }
function getSession()     { return lsGet('ei_session'); }
function saveSession(u)   { lsSet('ei_session', u); }
function clearSession()   { localStorage.removeItem('ei_session'); }

function registerUser(nombre, email, password, rol) {
  var users = getUsers();
  if (users.find(function(u){ return u.email === email; })) return { ok:false, msg:'Ya existe una cuenta con ese correo.' };
  var nu = { id: Date.now(), nombre:nombre, email:email, password:password, rol:rol };
  users.push(nu); saveUsers(users);
  return { ok:true, user:nu };
}
function loginUser(email, password, rol) {
  var u = getUsers().find(function(u){ return u.email===email && u.password===password && u.rol===rol; });
  return u ? { ok:true, user:u } : { ok:false, msg:'Correo, contraseña o tipo de usuario incorrecto.' };
}
function logout() {
  clearSession(); cart = []; lsSet('ei_cart', []);
  updateUI(); showToast('Sesión cerrada. ¡Hasta pronto!');
}

/* ═══════════════════════════════════════════════
   3. MODAL DE AUTENTICACIÓN
═══════════════════════════════════════════════ */
var currentRole = 'cliente', isLoginMode = true;

function openModal(defaultRole) {
  var m = document.getElementById('authModal'); if (!m) return;
  currentRole = defaultRole || 'cliente'; isLoginMode = true;
  m.classList.add('active'); m.setAttribute('aria-hidden','false');
  syncTabs(); renderModalForm();
  setTimeout(function(){ var f=m.querySelector('input'); if(f) f.focus(); }, 300);
}
function closeModal() {
  var m = document.getElementById('authModal'); if (!m) return;
  m.classList.remove('active'); m.setAttribute('aria-hidden','true'); clearModalError();
}
function setRole(role) { currentRole=role; isLoginMode=true; syncTabs(); renderModalForm(); }
function toggleAuthMode() { isLoginMode=!isLoginMode; renderModalForm(); }

function syncTabs() {
  var c=document.getElementById('tab-cliente'), e=document.getElementById('tab-emprendedor');
  if (!c||!e) return;
  if (currentRole==='cliente') { c.classList.add('active'); c.setAttribute('aria-selected','true'); e.classList.remove('active'); e.setAttribute('aria-selected','false'); }
  else { e.classList.add('active'); e.setAttribute('aria-selected','true'); c.classList.remove('active'); c.setAttribute('aria-selected','false'); }
}
function showModalError(msg) { var el=document.getElementById('modal-error'); if(el){el.textContent=msg;el.style.display='block';} }
function clearModalError()   { var el=document.getElementById('modal-error'); if(el){el.textContent='';el.style.display='none';} }

function renderModalForm() {
  var title=document.getElementById('modal-title'), body=document.getElementById('modal-form-body'), footer=document.getElementById('modalFooter');
  if (!title||!body||!footer) return;
  clearModalError();
  if (isLoginMode) {
    title.textContent = currentRole==='cliente' ? 'Acceso Clientes' : 'Acceso Emprendedores';
    body.innerHTML =
      '<div class="form-group"><label for="auth-email">Correo electrónico</label><input type="email" id="auth-email" placeholder="ejemplo@correo.com" required autocomplete="email"/></div>' +
      '<div class="form-group"><label for="auth-pass">Contraseña</label><input type="password" id="auth-pass" placeholder="Tu contraseña" required autocomplete="current-password"/></div>' +
      '<button type="submit" class="btn-submit">' + (currentRole==='cliente' ? 'Ingresar a mi cuenta' : 'Ingresar a mi Vitrina') + '</button>';
    footer.innerHTML = '¿No tienes cuenta? <button type="button" onclick="toggleAuthMode()">Regístrate aquí</button>';
  } else {
    title.textContent = currentRole==='cliente' ? 'Crear cuenta de Cliente' : 'Inscribe tu Negocio';
    body.innerHTML =
      '<div class="form-group"><label for="auth-nombre">'+(currentRole==='cliente'?'Nombre completo':'Nombre del negocio')+'</label><input type="text" id="auth-nombre" placeholder="'+(currentRole==='cliente'?'Tu nombre':'Ej: Mi Emprendimiento')+'" required autocomplete="name"/></div>' +
      '<div class="form-group"><label for="auth-email">Correo electrónico</label><input type="email" id="auth-email" placeholder="ejemplo@correo.com" required autocomplete="email"/></div>' +
      '<div class="form-group"><label for="auth-pass">Contraseña</label><input type="password" id="auth-pass" placeholder="Mínimo 6 caracteres" required autocomplete="new-password"/></div>' +
      '<div class="form-group"><label for="auth-pass2">Confirmar contraseña</label><input type="password" id="auth-pass2" placeholder="Repite tu contraseña" required autocomplete="new-password"/></div>' +
      '<button type="submit" class="btn-submit">'+(currentRole==='cliente'?'Crear mi cuenta':'Registrar mi negocio')+'</button>';
    footer.innerHTML = '¿Ya tienes cuenta? <button type="button" onclick="toggleAuthMode()">Ingresa aquí</button>';
  }
  var form = document.getElementById('auth-form');
  if (form) form.onsubmit = handleAuthSubmit;
}

function handleAuthSubmit(e) {
  e.preventDefault(); clearModalError();
  var email = (document.getElementById('auth-email')||{}).value||'';
  var pass  = (document.getElementById('auth-pass') ||{}).value||'';
  if (isLoginMode) {
    var r = loginUser(email.trim(), pass, currentRole);
    if (!r.ok) { showModalError(r.msg); return; }
    saveSession(r.user); closeModal(); updateUI();
    showToast('¡Bienvenido/a, ' + r.user.nombre + '!');
  } else {
    var nombre = (document.getElementById('auth-nombre')||{}).value||'';
    var pass2  = (document.getElementById('auth-pass2') ||{}).value||'';
    if (!nombre.trim())      { showModalError('Por favor ingresa tu nombre.'); return; }
    if (pass.length < 6)     { showModalError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (pass !== pass2)      { showModalError('Las contraseñas no coinciden.'); return; }
    var res = registerUser(nombre.trim(), email.trim(), pass, currentRole);
    if (!res.ok) { showModalError(res.msg); return; }
    saveSession(res.user); closeModal(); updateUI();
    showToast('¡Cuenta creada! Bienvenido/a, ' + res.user.nombre + '.');
  }
}

/* ═══════════════════════════════════════════════
   4. CARRITO DE COMPRAS
═══════════════════════════════════════════════ */
var cart = lsGet('ei_cart') || [];
function saveCart() { lsSet('ei_cart', cart); }

function addToCart(name, price, seller, img) {
  if (!getSession()) { showToast('Inicia sesión para agregar productos.', 'warn'); openModal('cliente'); return; }
  var ex = null;
  for (var i=0; i<cart.length; i++) { if (cart[i].name===name){ex=cart[i];break;} }
  if (ex) ex.qty++; else cart.push({name:name, price:price, seller:seller, img:img, qty:1});
  saveCart(); updateUI(); renderCartItems();
  showToast('"' + name.substring(0,28) + (name.length>28?'…':'') + '" agregado.');
}
function removeFromCart(i) { cart.splice(i,1); saveCart(); updateUI(); renderCartItems(); }
function changeQty(i, d) {
  if (!cart[i]) return;
  cart[i].qty += d;
  if (cart[i].qty<=0) { removeFromCart(i); return; }
  saveCart(); updateUI(); renderCartItems();
}
function clearCart()  { cart=[]; saveCart(); updateUI(); renderCartItems(); }
function cartTotal()  { return cart.reduce(function(s,i){return s+(i.price*i.qty);},0); }

function openCart()  { var p=document.getElementById('cart-panel'),o=document.getElementById('cart-overlay'); if(!p)return; renderCartItems(); p.classList.add('open'); if(o)o.classList.add('open'); }
function closeCart() { var p=document.getElementById('cart-panel'),o=document.getElementById('cart-overlay'); if(!p)return; p.classList.remove('open'); if(o)o.classList.remove('open'); }

function renderCartItems() {
  var list=document.getElementById('cart-items'), total=document.getElementById('cart-total'),
      empty=document.getElementById('cart-empty'), foot=document.getElementById('cart-footer');
  if (!list) return;
  if (cart.length===0) { list.innerHTML=''; if(empty)empty.style.display='flex'; if(foot)foot.style.display='none'; return; }
  if (empty) empty.style.display='none'; if (foot) foot.style.display='block';
  var html='';
  for (var i=0;i<cart.length;i++) {
    var item=cart[i];
    html+='<article class="cart-item">'+
      '<img src="'+item.img+'" alt="'+item.name+'" class="cart-item-img"/>'+
      '<div class="cart-item-info"><p class="cart-item-name">'+item.name+'</p><p class="cart-item-seller">'+item.seller+'</p>'+
      '<div class="cart-item-controls">'+
        '<button type="button" onclick="changeQty('+i+',-1)" aria-label="Reducir">−</button>'+
        '<span>'+item.qty+'</span>'+
        '<button type="button" onclick="changeQty('+i+',1)" aria-label="Aumentar">+</button>'+
      '</div></div>'+
      '<div class="cart-item-right"><p class="cart-item-price">$'+(item.price*item.qty).toLocaleString('es-CL')+'</p>'+
      '<button type="button" class="cart-remove" onclick="removeFromCart('+i+')" aria-label="Eliminar">✕</button></div>'+
    '</article>';
  }
  list.innerHTML = html;
  if (total) total.textContent = '$' + cartTotal().toLocaleString('es-CL');
}

function checkout() {
  if (!getSession()) { showToast('Debes iniciar sesión para finalizar.', 'warn'); return; }
  if (cart.length===0) return;
  showToast('¡Pedido realizado por $'+cartTotal().toLocaleString('es-CL')+'! Gracias 🎉');
  clearCart(); closeCart();
}

/* ═══════════════════════════════════════════════
   5. BUSCADOR AVANZADO Y DINÁMICO
═══════════════════════════════════════════════ */
var searchDropdown = null;
var searchTimeout  = null;

// Catálogo completo de productos para búsqueda avanzada
var CATALOGO_PRODUCTOS = [
  { title:'Torta de Milhojas Artesanal 1 kg',         seller:'Doña Rosa',      cat:'Pastelería',      precio:22000, img:'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=80&h=80&fit=crop', badge:'Novedad' },
  { title:'Mochila Tejida a Mano Hilos Naturales',    seller:'El Telar',       cat:'Artesanía',       precio:24990, img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop', badge:'' },
  { title:'Set Jabones Naturales Avena y Miel x3',    seller:'Eco Pica',       cat:'Cosmética',       precio:4500,  img:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=80&h=80&fit=crop', badge:'-15%' },
  { title:'Maceta Cerámica con Suculenta Incluida',   seller:'Tierra Norte',   cat:'Cerámica',        precio:12000, img:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=80&h=80&fit=crop', badge:'' },
  { title:'Miel Artesanal del Oasis de Pica 500g',    seller:'Sabores Norte',  cat:'Alimentos',       precio:6500,  img:'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=80&h=80&fit=crop', badge:'' },
  { title:'Polera Algodón Orgánico Unisex',           seller:'Boutique Norte', cat:'Moda',            precio:9990,  img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop', badge:'-20%' },
  { title:'Collar Plata con Turquesa Natural del Norte', seller:'Orfebrería IQQ', cat:'Joyería',      precio:26000, img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=80&h=80&fit=crop', badge:'' },
  { title:'Reparación de Pantalla Smartphone',        seller:'Tech Iquique',   cat:'Tecnología',      precio:18000, img:'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=80&h=80&fit=crop', badge:'' },
  { title:'Macramé decorativo para pared',            seller:'El Telar',       cat:'Artesanía',       precio:15000, img:'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=80&h=80&fit=crop', badge:'' },
  { title:'Serum facial de rosa mosqueta',            seller:'Eco Pica',       cat:'Cosmética',       precio:8900,  img:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop', badge:'' },
  { title:'Empanadas norteñas (docena)',              seller:'Sabores Norte',  cat:'Alimentos',       precio:9000,  img:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=80&h=80&fit=crop', badge:'Novedad' },
  { title:'Cargador inalámbrico universal',           seller:'ByteNorte',      cat:'Tecnología',      precio:14500, img:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop', badge:'' },
  { title:'Cuadro pintura desértica 40x60 cm',       seller:'Arte Pampa',     cat:'Arte',            precio:35000, img:'https://images.unsplash.com/photo-1574169208507-84376144848b?w=80&h=80&fit=crop', badge:'' },
  { title:'Sesión de fotografía (1 hora)',            seller:'Foto Desierto',  cat:'Servicios',       precio:25000, img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=80&h=80&fit=crop', badge:'' },
  { title:'Figura cerámica artesanal atacameña',      seller:'Tierra Norte',   cat:'Cerámica',        precio:19000, img:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=80&h=80&fit=crop', badge:'' },
  { title:'Plan entrenamiento personalizado',         seller:'FitNorte',       cat:'Servicios',       precio:30000, img:'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=80&h=80&fit=crop', badge:'' },
];

var CATEGORIAS_FILTRO = ['Todas','Pastelería','Artesanía','Cosmética','Cerámica','Alimentos','Moda','Joyería','Tecnología','Arte','Servicios'];

function initSearch() {
  var input = document.getElementById('buscar');
  var btn   = input ? input.parentElement.querySelector('button') : null;
  if (!input) return;

  // Crear panel de búsqueda avanzada
  crearPanelBusqueda(input);

  function doSearch(activatePanel) {
    var q = input.value.trim().toLowerCase();

    // Filtrar tarjetas de la página actual
    var cards = document.querySelectorAll('.product-card');
    var hayResultados = false;
    cards.forEach(function(card) {
      var title  = (card.querySelector('.title')  || {}).textContent || '';
      var seller = (card.querySelector('.seller') || {}).textContent || '';
      var match  = !q || title.toLowerCase().includes(q) || seller.toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
      if (match) hayResultados = true;
    });

    var catItems = document.querySelectorAll('.cat-item');
    catItems.forEach(function(item) {
      var name = item.querySelector('span') ? item.querySelector('span').textContent.toLowerCase() : '';
      var cat  = item.querySelector('small') ? item.querySelector('small').textContent.toLowerCase() : '';
      item.style.display = (!q || name.includes(q) || cat.includes(q)) ? '' : 'none';
    });

    var aviso = document.getElementById('search-aviso');
    if (!hayResultados && cards.length > 0) {
      if (!aviso) {
        aviso = document.createElement('p');
        aviso.id = 'search-aviso';
        aviso.style.cssText = 'text-align:center;color:var(--text-muted);padding:30px;grid-column:1/-1;';
        var grid = document.querySelector('.products-grid');
        if (grid) grid.appendChild(aviso);
      }
      aviso.textContent = 'No se encontraron resultados para "' + input.value.trim() + '".';
      aviso.style.display = '';
    } else if (aviso) {
      aviso.style.display = 'none';
    }

    // Mostrar dropdown de sugerencias
    if (activatePanel && q.length >= 1) {
      mostrarSugerencias(q);
    } else {
      ocultarSugerencias();
    }
  }

  function resetSearch() {
    input.value = '';
    document.querySelectorAll('.product-card').forEach(function(c){ c.style.display=''; });
    document.querySelectorAll('.cat-item').forEach(function(c){ c.style.display=''; });
    var aviso = document.getElementById('search-aviso');
    if (aviso) aviso.style.display = 'none';
    ocultarSugerencias();
  }

  input.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    if (input.value === '') { resetSearch(); return; }
    searchTimeout = setTimeout(function(){ doSearch(true); }, 180);
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { doSearch(false); ocultarSugerencias(); }
    if (e.key === 'Escape') { resetSearch(); }
  });
  input.addEventListener('focus', function() {
    if (input.value.length >= 1) mostrarSugerencias(input.value.toLowerCase());
  });

  if (btn) btn.addEventListener('click', function(){ doSearch(false); ocultarSugerencias(); });

  document.addEventListener('click', function(e) {
    var wrap = document.querySelector('.search-wrap');
    if (wrap && !wrap.contains(e.target)) ocultarSugerencias();
  });
}

function crearPanelBusqueda(input) {
  var wrap = input.parentElement;
  wrap.style.position = 'relative';

  // Dropdown sugerencias
  var drop = document.createElement('div');
  drop.id = 'search-dropdown';
  drop.className = 'search-dropdown';
  drop.style.display = 'none';
  wrap.appendChild(drop);
  searchDropdown = drop;
}

function mostrarSugerencias(q) {
  if (!searchDropdown) return;

  var resultados = CATALOGO_PRODUCTOS.filter(function(p) {
    return p.title.toLowerCase().includes(q) ||
           p.seller.toLowerCase().includes(q) ||
           p.cat.toLowerCase().includes(q);
  }).slice(0, 6);

  if (resultados.length === 0) {
    searchDropdown.innerHTML = '<div class="search-drop-empty">Sin resultados para <strong>"' + q + '"</strong></div>';
    searchDropdown.style.display = 'block';
    return;
  }

  var html = '<div class="search-drop-header">Resultados rápidos</div>';

  // Filtros por categoría
  var cats = [];
  resultados.forEach(function(p){ if(cats.indexOf(p.cat)===-1) cats.push(p.cat); });
  if (cats.length > 1) {
    html += '<div class="search-drop-cats">';
    html += '<span class="search-cat-tag active" onclick="filtrarDropCat(this,\'\')">Todos</span>';
    cats.forEach(function(c){
      html += '<span class="search-cat-tag" onclick="filtrarDropCat(this,\''+c.toLowerCase()+'\')" data-cat="'+c.toLowerCase()+'">'+c+'</span>';
    });
    html += '</div>';
  }

  html += '<div class="search-drop-items">';
  resultados.forEach(function(p, i) {
    html += '<div class="search-drop-item" data-cat="'+p.cat.toLowerCase()+'" onclick="abrirBusquedaAvanzada(\''+q+'\')">' +
      '<img src="'+p.img+'" alt="'+p.title+'" class="search-drop-img"/>' +
      '<div class="search-drop-info">' +
        '<span class="search-drop-name">'+resaltarTexto(p.title, q)+'</span>' +
        '<span class="search-drop-seller">'+p.seller+' · '+p.cat+'</span>' +
      '</div>' +
      '<span class="search-drop-price">$'+p.precio.toLocaleString('es-CL')+'</span>' +
    '</div>';
  });
  html += '</div>';

  html += '<div class="search-drop-footer" onclick="abrirBusquedaAvanzada(\''+q+'\')">Ver todos los resultados para <strong>"'+q+'"</strong> →</div>';

  searchDropdown.innerHTML = html;
  searchDropdown.style.display = 'block';
}

function resaltarTexto(texto, q) {
  if (!q) return texto;
  var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi');
  return texto.replace(re, '<mark>$1</mark>');
}

function filtrarDropCat(el, cat) {
  var tags = document.querySelectorAll('.search-cat-tag');
  tags.forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
  var items = document.querySelectorAll('.search-drop-item');
  items.forEach(function(item){
    item.style.display = (!cat || item.dataset.cat === cat) ? '' : 'none';
  });
}

function ocultarSugerencias() {
  if (searchDropdown) searchDropdown.style.display = 'none';
}

function abrirBusquedaAvanzada(q) {
  ocultarSugerencias();
  var input = document.getElementById('buscar');
  if (input && q) input.value = q;

  var overlay = document.createElement('div');
  overlay.id = 'adv-search-overlay';
  overlay.className = 'adv-search-overlay';

  var resultados = q ?
    CATALOGO_PRODUCTOS.filter(function(p){
      return p.title.toLowerCase().includes(q.toLowerCase()) ||
             p.seller.toLowerCase().includes(q.toLowerCase()) ||
             p.cat.toLowerCase().includes(q.toLowerCase());
    }) : CATALOGO_PRODUCTOS.slice();

  var html = '<div class="adv-search-box">' +
    '<div class="adv-search-header">' +
      '<div class="adv-search-title">🔍 Búsqueda Avanzada</div>' +
      '<button type="button" onclick="document.getElementById(\'adv-search-overlay\').remove()" class="adv-close-btn">×</button>' +
    '</div>' +
    '<div class="adv-search-body">' +
      '<!-- Panel de filtros -->' +
      '<div class="adv-filters">' +
        '<h3 class="adv-filter-title">Filtrar por</h3>' +
        '<div class="adv-filter-group"><label class="adv-filter-label">Categoría</label>' +
        '<div class="adv-cat-list">' +
        CATEGORIAS_FILTRO.map(function(c){
          return '<label class="adv-cat-check"><input type="checkbox" value="'+c.toLowerCase()+'" '+(c==='Todas'?'checked':'')+' onchange="aplicarFiltrosAdv()"> '+c+'</label>';
        }).join('') +
        '</div></div>' +
        '<div class="adv-filter-group"><label class="adv-filter-label">Precio máximo</label>' +
          '<input type="range" id="adv-precio-max" min="0" max="50000" step="500" value="50000" oninput="actualizarPrecioLabel(this.value);aplicarFiltrosAdv()" class="adv-range"/>' +
          '<span id="adv-precio-label" class="adv-range-label">Hasta $50.000</span>' +
        '</div>' +
        '<div class="adv-filter-group"><label class="adv-filter-label">Ordenar por</label>' +
          '<select id="adv-orden" onchange="aplicarFiltrosAdv()" class="adv-select">' +
            '<option value="rel">Relevancia</option>' +
            '<option value="asc">Precio: menor a mayor</option>' +
            '<option value="desc">Precio: mayor a menor</option>' +
            '<option value="nombre">Nombre A-Z</option>' +
          '</select>' +
        '</div>' +
        '<div class="adv-filter-group">' +
          '<label class="adv-cat-check"><input type="checkbox" id="adv-oferta" onchange="aplicarFiltrosAdv()"> Solo ofertas / novedades</label>' +
        '</div>' +
        '<button type="button" onclick="resetFiltrosAdv()" class="adv-reset-btn">Limpiar filtros</button>' +
      '</div>' +
      '<!-- Resultados -->' +
      '<div class="adv-results-col">' +
        '<div class="adv-results-top">' +
          '<input type="search" id="adv-q" value="'+(q||'')+'" placeholder="Buscar productos, vendedores..." class="adv-search-input" oninput="aplicarFiltrosAdv()"/>' +
          '<span id="adv-count" class="adv-count">'+resultados.length+' resultado'+( resultados.length!==1?'s':'' )+'</span>' +
        '</div>' +
        '<div id="adv-grid" class="adv-grid"></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  // Guardar catálogo para filtrado
  overlay._catalogo = CATALOGO_PRODUCTOS;
  overlay._q = q || '';

  aplicarFiltrosAdv();

  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  document.addEventListener('keydown', function cerrarAdv(e){
    if (e.key==='Escape') { var o=document.getElementById('adv-search-overlay'); if(o){o.remove();} document.removeEventListener('keydown',cerrarAdv); }
  });
}

function actualizarPrecioLabel(val) {
  var el = document.getElementById('adv-precio-label');
  if (el) el.textContent = val >= 50000 ? 'Sin límite' : 'Hasta $' + parseInt(val).toLocaleString('es-CL');
}

function aplicarFiltrosAdv() {
  var overlay = document.getElementById('adv-search-overlay');
  if (!overlay) return;

  var q = (document.getElementById('adv-q') || {}).value || '';
  q = q.toLowerCase().trim();

  var precioMax = parseInt((document.getElementById('adv-precio-max') || {}).value || 50000);
  var orden = (document.getElementById('adv-orden') || {}).value || 'rel';
  var soloOferta = (document.getElementById('adv-oferta') || {}).checked || false;

  // Categorías seleccionadas
  var catChecks = document.querySelectorAll('.adv-cat-list input[type=checkbox]:checked');
  var cats = [];
  catChecks.forEach(function(c){ cats.push(c.value); });
  var todasCats = cats.indexOf('todas') !== -1 || cats.length === 0;

  var res = CATALOGO_PRODUCTOS.filter(function(p) {
    var matchQ = !q || p.title.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
    var matchCat = todasCats || cats.indexOf(p.cat.toLowerCase()) !== -1;
    var matchPrecio = p.precio <= precioMax;
    var matchOferta = !soloOferta || (p.badge && p.badge !== '');
    return matchQ && matchCat && matchPrecio && matchOferta;
  });

  if (orden === 'asc')    res.sort(function(a,b){ return a.precio-b.precio; });
  else if (orden === 'desc') res.sort(function(a,b){ return b.precio-a.precio; });
  else if (orden === 'nombre') res.sort(function(a,b){ return a.title.localeCompare(b.title,'es'); });

  var count = document.getElementById('adv-count');
  if (count) count.textContent = res.length + ' resultado' + (res.length!==1?'s':'');

  var grid = document.getElementById('adv-grid');
  if (!grid) return;

  if (res.length === 0) {
    grid.innerHTML = '<div class="adv-no-results"><svg viewBox="0 0 24 24" width="48" height="48" fill="var(--text-muted)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg><p>Sin resultados</p><small>Prueba con otros filtros</small></div>';
    return;
  }

  grid.innerHTML = res.map(function(p){
    return '<div class="adv-card">' +
      (p.badge ? '<span class="adv-badge">'+p.badge+'</span>' : '') +
      '<img src="'+p.img+'" alt="'+p.title+'" class="adv-card-img" onerror="this.src=\'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop\'"/>' +
      '<div class="adv-card-body">' +
        '<p class="adv-card-cat">'+p.cat+'</p>' +
        '<p class="adv-card-name">'+resaltarTexto(p.title, q)+'</p>' +
        '<p class="adv-card-seller">'+p.seller+'</p>' +
        '<p class="adv-card-price">$'+p.precio.toLocaleString('es-CL')+'</p>' +
        '<button type="button" class="adv-card-btn" onclick="addToCart(\''+p.title.replace(/'/g,"\\'")+ '\','+p.precio+',\''+p.seller+'\',\''+p.img+'\');showToast(\'Agregado al carrito\')">Agregar al carrito</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function resetFiltrosAdv() {
  var checks = document.querySelectorAll('.adv-cat-list input[type=checkbox]');
  checks.forEach(function(c){ c.checked = (c.value==='todas'); });
  var precio = document.getElementById('adv-precio-max');
  if (precio) { precio.value = 50000; actualizarPrecioLabel(50000); }
  var orden = document.getElementById('adv-orden');
  if (orden) orden.value = 'rel';
  var oferta = document.getElementById('adv-oferta');
  if (oferta) oferta.checked = false;
  aplicarFiltrosAdv();
}

/* ═══════════════════════════════════════════════
   6. MODAL "VER TODOS LOS NEGOCIOS" (solo emprendedores)
═══════════════════════════════════════════════ */
// Base de datos de negocios de Iquique
var NEGOCIOS_IQQ = [
  { nombre:'Doña Rosa',         categoria:'Pastelería',       img:'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=120&h=120&fit=crop' },
  { nombre:'El Telar',          categoria:'Artesanía textil', img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop' },
  { nombre:'Eco Pica',          categoria:'Cosmética natural',img:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=120&h=120&fit=crop' },
  { nombre:'Tierra Norte',      categoria:'Cerámica',         img:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=120&h=120&fit=crop' },
  { nombre:'Tech Iquique',      categoria:'Reparaciones tech',img:'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=120&h=120&fit=crop' },
  { nombre:'Verde Hogar',       categoria:'Plantas y jardín', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=120&h=120&fit=crop' },
  { nombre:'Sabores Norte',     categoria:'Comida regional',  img:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=120&h=120&fit=crop' },
  { nombre:'La Cevichería IQQ', categoria:'Mariscos',         img:'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=120&h=120&fit=crop' },
  { nombre:'Boutique Norte',    categoria:'Moda y diseño',    img:'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&h=120&fit=crop' },
  { nombre:'Orfebrería IQQ',    categoria:'Joyería plata',    img:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=120&h=120&fit=crop' },
  { nombre:'ByteNorte',         categoria:'Computadores',     img:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop' },
  { nombre:'Arte Pampa',        categoria:'Pintura y arte',   img:'https://images.unsplash.com/photo-1574169208507-84376144848b?w=120&h=120&fit=crop' },
  { nombre:'Foto Desierto',     categoria:'Fotografía',       img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&h=120&fit=crop' },
  { nombre:'FitNorte',          categoria:'Fitness y salud',  img:'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=120&h=120&fit=crop' },
  { nombre:'IQQ Print',         categoria:'Impresión 3D',     img:'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=120&h=120&fit=crop' },
  { nombre:'Dulces Pampinos',   categoria:'Repostería',       img:'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=120&h=120&fit=crop' },
  { nombre:'Clases Norte',      categoria:'Academia y clases',img:'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop' },
  { nombre:'Estética Nortina',  categoria:'Belleza y cuidado',img:'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=120&h=120&fit=crop' },
  { nombre:'Madera Atacameña',  categoria:'Talla en madera',  img:'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=120&h=120&fit=crop' },
  { nombre:'CiberNorte',        categoria:'Ciberseguridad',   img:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&h=120&fit=crop' },
];

function openNegociosModal() {
  // Accesible para todos: clientes, emprendedores y visitantes
  var session = getSession();

  // Combinar negocios base + emprendedores registrados
  var users = getUsers().filter(function(u){ return u.rol==='emprendedor'; });
  var todos = NEGOCIOS_IQQ.slice();
  users.forEach(function(u) {
    if (!todos.find(function(n){ return n.nombre===u.nombre; })) {
      todos.push({ nombre:u.nombre, categoria:'Emprendedor registrado', img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwCAIAAABJgmMcAAAApUlEQVR42u3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBuAABHgAAAABJRU5ErkJggg==' });
    }
  });

  var overlay = document.createElement('div');
  overlay.id = 'negocios-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';
  
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg-card);border-radius:16px;max-width:800px;width:100%;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.4);';
  
  var header = '<div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;background:var(--header-bg);color:#fff;border-radius:16px 16px 0 0;">' +
    '<div><h2 style="margin:0;font-size:18px;">Todos los Negocios de Iquique</h2><p style="margin:4px 0 0;font-size:13px;color:#ccc;">' + todos.length + ' negocios registrados</p></div>' +
    '<button type="button" onclick="document.getElementById(\'negocios-overlay\').remove()" style="background:none;border:none;color:#fff;font-size:28px;cursor:pointer;line-height:1;">×</button>' +
  '</div>';

  var search = '<div style="padding:16px 20px;border-bottom:1px solid var(--border-color);">' +
    '<input type="search" id="neg-search" placeholder="Buscar negocio o categoría..." style="width:100%;padding:10px 14px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-body);color:var(--text-main);font-size:14px;outline:none;" oninput="filterNegocios(this.value)"/>' +
  '</div>';

  var grid = '<div id="neg-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;padding:20px;overflow-y:auto;flex:1;">';
  todos.forEach(function(n, idx) {
    grid += '<div class="neg-card" data-nombre="'+n.nombre.toLowerCase()+'" data-cat="'+n.categoria.toLowerCase()+'" style="background:var(--bg-body);border:1px solid var(--border-color);border-radius:12px;padding:16px;text-align:center;cursor:default;">' +
      '<img src="'+n.img+'" alt="'+n.nombre+'" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid var(--accent-main);margin-bottom:10px;" onerror="this.src=\'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=120&h=120&fit=crop\'"/>' +
      '<p style="font-weight:700;font-size:14px;color:var(--text-main);margin:0 0 4px;">'+n.nombre+'</p>' +
      '<p style="font-size:12px;color:var(--text-muted);margin:0;">'+n.categoria+'</p>' +
    '</div>';
  });
  grid += '</div>';

  box.innerHTML = header + search + grid;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  setTimeout(function(){ var s=document.getElementById('neg-search'); if(s) s.focus(); }, 100);
}

function filterNegocios(q) {
  q = q.toLowerCase();
  document.querySelectorAll('.neg-card').forEach(function(card) {
    var nombre = card.dataset.nombre || '';
    var cat    = card.dataset.cat    || '';
    card.style.display = (!q || nombre.includes(q) || cat.includes(q)) ? '' : 'none';
  });
}

/* ═══════════════════════════════════════════════
   7. TOASTS
═══════════════════════════════════════════════ */
function showToast(msg, type) {
  type = type || 'ok';
  var c = document.getElementById('toast-container');
  if (!c) { c=document.createElement('div'); c.id='toast-container'; document.body.appendChild(c); }
  var t = document.createElement('div');
  t.className = 'toast toast-' + type; t.textContent = msg;
  c.appendChild(t);
  setTimeout(function(){ t.classList.add('show'); }, 10);
  setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ if(t.parentNode) t.remove(); },400); }, 3500);
}

/* ═══════════════════════════════════════════════
   8. SLIDER AUTOMÁTICO
═══════════════════════════════════════════════ */
var currentSlide=0, slides=[], slideDots=[];
function goToSlide(index) {
  if (!slides.length) return;
  slides[currentSlide].classList.remove('active');
  if(slideDots[currentSlide]) slideDots[currentSlide].classList.remove('active');
  currentSlide=index;
  slides[currentSlide].classList.add('active');
  if(slideDots[currentSlide]) slideDots[currentSlide].classList.add('active');
}

/* ═══════════════════════════════════════════════
   9. SCROLL REVEAL
═══════════════════════════════════════════════ */
function initReveal() {
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('active'); }); }, {threshold:0.1, rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){ obs.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('active'); }); }
}

/* ═══════════════════════════════════════════════
   10. ACTUALIZAR UI SEGÚN SESIÓN
═══════════════════════════════════════════════ */
function updateUI() {
  var session=getSession(), btn=document.getElementById('floating-btn'), badge=document.getElementById('cart-badge');
  if (btn) {
    if (session) {
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' +
        session.nombre.split(' ')[0] + '<span class="btn-logout" onclick="event.stopPropagation();logout();" title="Cerrar sesión" aria-label="Cerrar sesión">✕</span>';
      btn.onclick = null;
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>Iniciar Sesión';
      btn.onclick = function(){ openModal('cliente'); };
    }
  }
  var count = cart.reduce(function(s,i){ return s+i.qty; }, 0);
  if (badge) badge.textContent = count > 99 ? '99+' : count;
}

/* ═══════════════════════════════════════════════
   11. INICIALIZACIÓN
═══════════════════════════════════════════════ */
window.addEventListener('load', function() {
  // Tema
  if (lsGet('theme')==='dark') { document.documentElement.setAttribute('data-theme','dark'); updateThemeIcon('dark'); }

  // Nav activo
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(function(link){ link.classList.remove('active'); if(link.getAttribute('href')===page) link.classList.add('active'); });

  // Slider
  slides    = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  slideDots = Array.prototype.slice.call(document.querySelectorAll('.slider-dots .dot'));
  if (slides.length>0) setInterval(function(){ goToSlide((currentSlide+1)%slides.length); }, 4500);

  // UI + Carrito
  updateUI();

  // Overlay carrito
  var ov = document.getElementById('cart-overlay');
  if (ov) ov.addEventListener('click', closeCart);

  // Modal auth form
  var form = document.getElementById('auth-form');
  if (form) form.addEventListener('submit', handleAuthSubmit);

  // Modal click fuera
  var m = document.getElementById('authModal');
  if (m) m.addEventListener('click', function(e){ if(e.target===m) closeModal(); });

  // Escape
  window.addEventListener('keydown', function(e){
    var m2=document.getElementById('authModal');
    if(e.key==='Escape'){
      if(m2&&m2.classList.contains('active')) closeModal();
      var no=document.getElementById('negocios-overlay');
      if(no) no.remove();
    }
  });

  // Botones agregar al carrito
  document.querySelectorAll('.btn-agregar').forEach(function(btn){
    btn.addEventListener('click', function(){
      var card=this.closest('.product-card'); if(!card) return;
      var name   = (card.querySelector('h3.title')||{}).textContent||'';
      var priceT = (card.querySelector('.price')||{}).textContent||'';
      var seller = (card.querySelector('.seller')||{}).textContent||'';
      var imgEl  = card.querySelector('.prod-img');
      addToCart(name.trim(), parseInt(priceT.replace(/[^0-9]/g,''),10), seller.trim(), imgEl?imgEl.src:'');
    });
  });

  // Buscador
  initSearch();

  // Reveal
  initReveal();
});

/* =============================================
   ACCESIBILIDAD
   ============================================= */
(function() {
  /* Niveles de escala de texto disponibles (1 = tamaño original).
     El mínimo (0.85) mantiene el texto legible y el máximo (1.4)
     evita que el diseño se rompa. */
  var FONT_LEVELS = [0.85, 0.9, 0.95, 1, 1.1, 1.2, 1.3, 1.4];
  var DEFAULT_LEVEL_INDEX = 3; // corresponde a 1 (100%)

  var levelIndex = DEFAULT_LEVEL_INDEX;
  var highContrast = false;
  var ttsActive = false;

  /* Guarda el tamaño de fuente ORIGINAL (en px) de cada elemento,
     calculado una sola vez, para poder escalarlo de forma consistente
     sin importar que el CSS use px fijos en vez de rem/em. */
  var originalSizes = new WeakMap();
  var trackedElements = [];

  function isTrackable(el) {
    if (!(el instanceof Element)) return false;
    var tag = el.tagName;
    return tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'LINK' && tag !== 'META';
  }

  function registerElement(el) {
    if (!isTrackable(el) || originalSizes.has(el)) return;
    var px = parseFloat(window.getComputedStyle(el).fontSize);
    if (!isNaN(px)) {
      originalSizes.set(el, px);
      trackedElements.push(el);
    }
  }

  function registerTree(root) {
    if (!root) return;
    registerElement(root);
    if (root.querySelectorAll) {
      var nodes = root.querySelectorAll('*');
      for (var i = 0; i < nodes.length; i++) registerElement(nodes[i]);
    }
  }

  function applyFontScale() {
    var scale = FONT_LEVELS[levelIndex];
    for (var i = 0; i < trackedElements.length; i++) {
      var el = trackedElements[i];
      if (!el.isConnected) continue;
      var original = originalSizes.get(el);
      if (original === undefined) continue;
      if (scale === 1) {
        el.style.removeProperty('font-size');
      } else {
        el.style.setProperty('font-size', (original * scale).toFixed(2) + 'px', 'important');
      }
    }
  }

  /* Observa el DOM para que el escalado también se aplique a contenido
     creado dinámicamente (modal, carrito, listado de negocios, etc.) */
  var domObserver = new MutationObserver(function(mutations) {
    var added = false;
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          registerTree(node);
          added = true;
        }
      });
    });
    if (added) applyFontScale();
  });

  function applyStoredAccessibility() {
    registerTree(document.body);

    var stored = localStorage.getItem('acc_settings');
    if (stored) {
      try {
        var s = JSON.parse(stored);
        if (typeof s.levelIndex === 'number' && s.levelIndex >= 0 && s.levelIndex < FONT_LEVELS.length) {
          levelIndex = s.levelIndex;
        }
        if (s.highContrast) { highContrast = true; document.body.classList.add('high-contrast'); updateContrastBtn(); }
        if (s.ttsActive) { ttsActive = true; updateTtsBtn(); }
      } catch(e) {}
    }

    applyFontScale();
    domObserver.observe(document.body, { childList: true, subtree: true });
  }

  function saveSettings() {
    localStorage.setItem('acc_settings', JSON.stringify({ levelIndex: levelIndex, highContrast: highContrast, ttsActive: ttsActive }));
  }

  function updateContrastBtn() {
    var btn = document.getElementById('btn-high-contrast');
    if (!btn) return;
    btn.classList.toggle('active', highContrast);
  }

  function updateTtsBtn() {
    var btn = document.getElementById('btn-tts');
    if (!btn) return;
    btn.classList.toggle('active', ttsActive);
  }

  window.toggleAccessibility = function() {
    var panel = document.getElementById('accessibility-panel');
    var btn = document.getElementById('btn-accessibility');
    if (!panel) return;
    var isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    panel.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
    if (btn) btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  };

  window.changeFontSize = function(dir) {
    levelIndex = Math.max(0, Math.min(FONT_LEVELS.length - 1, levelIndex + dir));
    applyFontScale();
    saveSettings();
  };

  window.toggleHighContrast = function() {
    highContrast = !highContrast;
    document.body.classList.toggle('high-contrast', highContrast);
    updateContrastBtn();
    saveSettings();
  };

  window.toggleTextToSpeech = function() {
    ttsActive = !ttsActive;
    updateTtsBtn();
    saveSettings();
    if (ttsActive) {
      document.body.addEventListener('click', ttsClickHandler, true);
    } else {
      document.body.removeEventListener('click', ttsClickHandler, true);
      window.speechSynthesis && window.speechSynthesis.cancel();
    }
  };

  function ttsClickHandler(e) {
    if (!ttsActive) return;
    var el = e.target;
    var text = el.innerText || el.textContent || el.alt || el.getAttribute('aria-label') || '';
    text = text.trim();
    if (text && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      var utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'es-CL';
      window.speechSynthesis.speak(utt);
    }
  }

  window.resetAccessibility = function() {
    levelIndex = DEFAULT_LEVEL_INDEX;
    highContrast = false;
    ttsActive = false;
    applyFontScale();
    document.body.classList.remove('high-contrast');
    document.body.removeEventListener('click', ttsClickHandler, true);
    window.speechSynthesis && window.speechSynthesis.cancel();
    updateContrastBtn();
    updateTtsBtn();
    localStorage.removeItem('acc_settings');
  };

  // Close panel when clicking outside
  document.addEventListener('click', function(e) {
    var wrap = document.getElementById('accessibility-wrap');
    if (wrap && !wrap.contains(e.target)) {
      var panel = document.getElementById('accessibility-panel');
      var btn = document.getElementById('btn-accessibility');
      if (panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('DOMContentLoaded', applyStoredAccessibility);
})();
