<script setup>
import { Phone, Mail, MapPin, Globe, ShieldCheck, Heart } from 'lucide-vue-next'
</script>

<template>
  <footer class="main-footer">
    <!-- Top Footer Highlights -->
    <div class="footer-top-highlights">
      <div class="container highlights-grid">
        <div class="highlight-item">
          <div class="icon-box"><ShieldCheck :size="24" /></div>
          <div class="text-box">
            <h4>أسطول حديث ومضمون</h4>
            <p>جميع سياراتنا موديل 2025 - 2026 ومفحوصة بالكامل</p>
          </div>
        </div>

        <div class="highlight-item">
          <div class="icon-box"><Phone :size="24" /></div>
          <div class="text-box">
            <h4>دعم على مدار الساعة</h4>
            <p>فريق خدمة العملاء جاهز لخدمتك على الرقم المجاني 8002440204</p>
          </div>
        </div>

        <div class="highlight-item">
          <div class="icon-box"><MapPin :size="24" /></div>
          <div class="text-box">
            <h4>فروعنا في أرجاء المملكة</h4>
            <p>متواجدون في جميع المطارات والمحاور الرئيسية في الرياض، جدة والدمام</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Footer Content Grid -->
    <div class="container footer-main-content">
      <div class="footer-grid">
        <!-- Col 1: About Brand -->
        <div class="footer-col brand-col">
          <div class="footer-brand">
            <img src="/logo.png" alt="شركة البسيط المتحدة لتأجير السيارات" class="footer-logo-img" />
          </div>
          <p class="brand-desc">
            شركة البسيط للتأجير تفخر بتقديم أحدث حلول تأجير السيارات بالمملكة العربية السعودية، بأسعار منافسة وباقة خدمات متكاملة تضمن لك الراحة والأمان في كل رحلة.
          </p>
          <div class="social-links">
            <a href="#" class="social-icon" title="Twitter / X">𝕏</a>
            <a href="#" class="social-icon" title="Instagram">📸</a>
            <a href="#" class="social-icon" title="WhatsApp">💬</a>
            <a href="#" class="social-icon" title="LinkedIn">💼</a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div class="footer-col">
          <h4 class="col-title">روابط سريعة</h4>
          <ul class="footer-links">
            <li><router-link to="/">الصفحة الرئيسية</router-link></li>
            <li><router-link to="/booking">احجز سيارتك الآن</router-link></li>
            <li><router-link to="/manage-booking">إدارة وتعديل الحجز</router-link></li>
            <li><router-link to="/fleet">أسطول السيارات</router-link></li>
            <li><router-link to="/offers">العروض الحصرية</router-link></li>
          </ul>
        </div>

        <!-- Col 3: Customer Help & Info -->
        <div class="footer-col">
          <h4 class="col-title">معلومات وتسهيلات</h4>
          <ul class="footer-links">
            <li><router-link to="/branches">مواقع الفروع والمطارات</router-link></li>
            <li><router-link to="/careers">انضم لفريقنا (الوظائف)</router-link></li>
            <li><router-link to="/faq">الأسئلة الأكثر شيوعاً</router-link></li>
            <li><router-link to="/contact">اتصل بنا</router-link></li>
            <li><a href="#">الشروط والأحكام</a></li>
          </ul>
        </div>

        <!-- Col 4: Payment Methods & App Badges -->
        <div class="footer-col">
          <h4 class="col-title">طرق الدفع الآمنة</h4>
          <p class="pay-desc">ندعم كافة وسائل الدفع الإلكتروني وخيارات التقسيط الميسرة:</p>
          <div class="pay-badges">
            <span class="pay-badge mada">مدى mada</span>
            <span class="pay-badge visa">VISA</span>
            <span class="pay-badge mc">MasterCard</span>
            <span class="pay-badge tabby">تابي tabby</span>
            <span class="pay-badge tamara">تمارا tamara</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Copyright Bar -->
    <div class="footer-bottom-bar">
      <div class="container bottom-content">
        <p class="copyright-text">
          جميع الحقوق محفوظة © {{ new Date().getFullYear() }} شركة البسيط للتأجير.
        </p>
        <div class="dev-tag">
          <span>صُمم وطُوّر بأعلى معايير الجودة لخدمتكم</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.main-footer {
  background: var(--bg-dark);
  color: var(--text-white);
  margin-top: auto;
  border-top: 4px solid var(--gold);
}

.footer-top-highlights {
  background: var(--bg-dark-card);
  padding: 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(212, 175, 55, 0.15);
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.text-box h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 0.2rem;
}

.text-box p {
  font-size: 0.8rem;
  color: var(--text-light);
}

.footer-main-content {
  padding: 3.5rem 1.25rem 2.5rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 2.5rem;
}

.footer-brand {
  margin-bottom: 1.25rem;
}

.footer-logo-img {
  height: 54px;
  max-width: 240px;
  object-fit: contain;
  filter: drop-shadow(0 2px 10px rgba(255, 255, 255, 0.15));
}

.brand-desc {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-light);
  margin-bottom: 1.25rem;
}

.social-links {
  display: flex;
  gap: 0.75rem;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: var(--transition);
}

.social-icon:hover {
  background: var(--gold);
  color: var(--bg-dark);
  transform: translateY(-2px);
}

.col-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: 1.25rem;

}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.footer-links a {
  color: var(--text-light);
  font-size: 0.88rem;
  transition: var(--transition);
}

.footer-links a:hover {
  color: var(--gold);
  transform: translateX(-4px);
}

.pay-desc {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.pay-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pay-badge {
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.pay-badge.tabby { background: #27F5C6; color: #000; }
.pay-badge.tamara { background: #FFD29D; color: #000; }
.pay-badge.mada { background: #00A3A6; color: #FFF; }

.footer-bottom-bar {
  background: rgba(0, 0, 0, 0.4);
  padding: 1.25rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.bottom-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-light);
}

@media (max-width: 1024px) {
  .highlights-grid {
    grid-template-columns: 1fr;
  }
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
  .bottom-content {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
