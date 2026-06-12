// --- 1. الذاكرة المحلية المخزنة للعمليات الحقيقية ---
let cartCount = parseInt(localStorage.getItem('rgb_cart_count')) || 0;
let favorites = JSON.parse(localStorage.getItem('rgb_favorites')) || [];

// تحديث الشارات (البادج) بالصفحة فوراً عند فتح المتصفح
const cartBadge = document.getElementById('cartBadge');
if (cartBadge) cartBadge.innerText = cartCount;

// --- 2. دالة توليد الإشعارات التنبيهية الفخمة نيون (Toast Alerts) ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `cyber-toast ${type === 'fav' ? 'fav-toast' : ''}`;
    toast.innerHTML = `<i class="${type === 'fav' ? 'fas fa-heart text-danger' : 'fas fa-bolt'}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // إخفاء التنبيه تلقائياً بعد 3 ثوانٍ بأنيميشن انسيابي
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// --- 3. التفتيش وتفعيل قلوب المفضلة المخزنة سابقاً وصباغتها بالأحمر ---
document.querySelectorAll('.product-card').forEach(card => {
    const prodId = card.getAttribute('data-id');
    const favBtn = card.querySelector('.fav-btn');
    
    if (favorites.includes(prodId) && favBtn) {
        favBtn.classList.add('active');
        favBtn.querySelector('i').className = 'fas fa-heart';
    }
});

// --- 4. إعداد المستمعات والأحداث لكروت المنتجات وعناصرها ---
document.addEventListener('click', function(e) {
    
    // أ. منطق الضغط على زر المفضلة (القلب)
    if (e.target.closest('.fav-btn')) {
        e.stopPropagation(); // منع فتح واجهة تفاصيل المنتج عند الضغط على القلب فقط
        const btn = e.target.closest('.fav-btn');
        const card = btn.closest('.product-card');
        const prodId = card.getAttribute('data-id');
        const prodTitle = card.querySelector('.product-info h3').innerText;
        
        if (btn.classList.contains('active')) {
            // إلغاء المفضلة
            btn.classList.remove('active');
            btn.querySelector('i').className = 'far fa-heart';
            favorites = favorites.filter(id => id !== prodId);
            showToast(`تم إزالة ${prodTitle} من المفضلة`, 'success');
        } else {
            // إضافة للمفضلة والصبغ بالأحمر
            btn.classList.add('active');
            btn.querySelector('i').className = 'fas fa-heart';
            favorites.push(prodId);
            showToast(`تم إضافة المنتج للمفضلة ❤️`, 'fav');
        }
        localStorage.setItem('rgb_favorites', JSON.stringify(favorites));
        return;
    }
    
    // ب. منطق زر إضافة إلى السلة السريع بالـ Card (المصلح للربط الفعلي والمصفوفة)
    if (e.target.closest('.add-to-cart')) {
        e.stopPropagation(); // منع فتح تفاصيل المنتج عند ضغط السلة
        const card = e.target.closest('.product-card');
        const prodId = card.getAttribute('data-id');
        
        // جلب مصفوفة السلة الحقيقية وإضافة المعرف الجديد لها
        let cartIds = JSON.parse(localStorage.getItem('rgb_cart_ids')) || [];
        cartIds.push(prodId);
        localStorage.setItem('rgb_cart_ids', JSON.stringify(cartIds));
        
        cartCount = cartIds.length;
        if (cartBadge) cartBadge.innerText = cartCount;
        localStorage.setItem('rgb_cart_count', cartCount);
        
        showToast("تم شحن العتاد المصلح وعمل إضافة إلى السلة! ⚡");
        return;
    }
    
    // ج. منطق فتح واجهة شاشة كاملة لتفاصيل وصف المنتج (Modal) عند الضغط على الكارت
    if (e.target.closest('.product-card')) {
        const card = e.target.closest('.product-card');
        const title = card.querySelector('.product-info h3').innerText;
        const price = card.querySelector('.price').innerText;
        const desc = card.getAttribute('data-desc');
        const imgUrl = card.getAttribute('data-gallery');
        const prodId = card.getAttribute('data-id');
        
        // تعبئة بيانات شاشة التفاصيل تلقائياً
        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalPrice').innerText = price;
        document.getElementById('modalDescription').innerText = desc;
        document.getElementById('modalMainImg').src = imgUrl;
        document.getElementById('productModal').setAttribute('data-current-id', prodId);
        
        // استرجاع تقييم اللاعب المخزن لهذا المنتج إن وجد
        const savedRating = localStorage.getItem(`rgb_rating_prod_${prodId}`) || 0;
        resetStars();
        if(savedRating > 0) {
            highlightStars(savedRating);
        }
        
        document.getElementById('productModal').classList.add('open');
    }
});

// إغلاق نافذة تفاصيل المنتج
const closeModalBtn = document.getElementById('closeModalBtn');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('open');
    });
}

// إضافة المنتج للسلة من داخل نافذة الوصف الكامل (المصلح للربط الحقيقي)
const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
        const currentProdId = document.getElementById('productModal').getAttribute('data-current-id');
        let cartIds = JSON.parse(localStorage.getItem('rgb_cart_ids')) || [];
        cartIds.push(currentProdId);
        localStorage.setItem('rgb_cart_ids', JSON.stringify(cartIds));
        
        cartCount = cartIds.length;
        if (cartBadge) cartBadge.innerText = cartCount;
        localStorage.setItem('rgb_cart_count', cartCount);
        showToast("تم إضافة المنتج لعربة التسوق بنجاح! 🛒");
    });
}

// --- 5. نظام التقييم بالنجوم التفاعلي من داخل الوصف ---
const starElements = document.querySelectorAll('#modalRating i');
starElements.forEach(star => {
    star.addEventListener('click', (e) => {
        const val = e.target.getAttribute('data-value');
        const currentProdId = document.getElementById('productModal').getAttribute('data-current-id');
        
        // حفظ التقييم بذاكرة المتصفح
        localStorage.setItem(`rgb_rating_prod_${currentProdId}`, val);
        
        resetStars();
        highlightStars(val);
        showToast(`شكراً لك! قمت بتقييم هذا العتاد بـ ${val} نجوم ⭐`);
    });
});

function resetStars() {
    starElements.forEach(s => {
        s.className = 'far fa-star';
        s.classList.remove('selected');
    });
}

function highlightStars(count) {
    starElements.forEach(s => {
        if(parseInt(s.getAttribute('data-value')) <= parseInt(count)) {
            s.className = 'fas fa-star selected';
        }
    });
}

// --- 6. أنيميشن تغميض الأعين للروبوت الكلاسيكي (صفحة الدخول) ---
const passwordInput = document.getElementById('passwordInput');
const cyberRobot = document.getElementById('cyberRobot');

if(passwordInput && cyberRobot) {
    passwordInput.addEventListener('focus', () => cyberRobot.classList.add('eyes-closed'));
    passwordInput.addEventListener('blur', () => cyberRobot.classList.remove('eyes-closed'));
}

// --- 7. منطق إرسال الكود والتحقق الحقيقي (OTP Logic لصفحات الحسابات) ---
const loginForm = document.getElementById('loginForm');
const forgotForm = document.getElementById('forgotForm');
const otpSection = document.getElementById('otpSection');
const statusMsg = document.getElementById('statusMsg');
let generatedOTP = ""; 

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
        alert(`[سيرفر RGB ZONE]\nتم إرسال كود التحقق بنجاح إلى: ${email}\n\nكود الدخول الخاص بك هو: ${generatedOTP}`);
        if(otpSection) otpSection.style.display = "block";
    });
}

if (forgotForm) {
    forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
        alert(`[سيرفر RGB ZONE]\nتم إرسال كود استعادة الحساب إلى: ${email}\n\nكود الاستعادة الخاص بك هو: ${generatedOTP}`);
        if(otpSection) otpSection.style.display = "block";
    });
}

// ترتيب حقول الـ OTP التلقائي
const otpFields = document.querySelectorAll('.otp-field');
otpFields.forEach((field, index) => {
    field.addEventListener('input', (e) => {
        if (e.target.value.length >= 1 && index < otpFields.length - 1) {
            otpFields[index + 1].focus();
        }
    });
    field.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && index > 0 && field.value.length === 0) {
            otpFields[index - 1].focus();
        }
    });
});

// مطابقة كود الـ OTP
const verifyBtn = document.getElementById('verifyBtn');
if (verifyBtn) {
    verifyBtn.addEventListener('click', () => {
        let enteredOTP = "";
        otpFields.forEach(field => { enteredOTP += field.value; });

        if (enteredOTP === generatedOTP) {
            if (statusMsg) {
                statusMsg.style.color = "var(--neon-cyan)";
                statusMsg.innerHTML = "تم التحقق بنجاح! جاري الاتصال بالسيرفر...";
            }
            setTimeout(() => { window.location.href = "index.html"; }, 1200);
        } else {
            if (statusMsg) {
                statusMsg.style.color = "var(--neon-pink)";
                statusMsg.innerHTML = "الكود المدخل غير صحيح، يرجى المحاولة مرة أخرى!";
            }
        }
    });
}