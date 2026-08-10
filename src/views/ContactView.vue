<script setup>
import { ref } from 'vue'
import { Phone, Mail, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-vue-next'

const contactForm = ref({
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: ''
})

const isSent = ref(false)

function submitContact() {
  isSent.value = true
}
</script>

<template>
  <div class="contact-page section-padding">
    <div class="container">
      <div class="page-header card">
        <div class="header-content">
          <div class="icon-box"><Phone :size="32" /></div>
          <div>
            <h1 class="heading-lg">اتصل بنا - تواصل مع فريق شركة البسيط</h1>
            <p class="text-muted">هل تحتاج إلى مساعدة؟ تواصل مع خدمة عملاء البسيط عبر الهاتف أو البريد الإكتروني أو زيارة فروعنا</p>
          </div>
        </div>
      </div>

      <!-- Offices Grid (من الصفحة 5 في المستند) -->
      <div class="offices-grid">
        <div class="office-card card">
          <span class="badge badge-gold mb-2">المقر الرئيسي</span>
          <h3>المكتب الرئيسي - مبيعات السيارات</h3>
          <p><MapPin :size="14" /> جدة، حي الخالدية، طريق الكورنيش</p>
          <p><Clock :size="14" /> الأحد إلى الخميس: 08:00 صباحاً - 04:30 مساءً</p>
        </div>

        <div class="office-card card">
          <span class="badge badge-primary mb-2">المكتب الإقليمي</span>
          <h3>المكتب الإقليمي الرياض</h3>
          <p><MapPin :size="14" /> حي الورود، تقاطع طريق الملك عبدالعزيز مع شارع الشيخ عبد الله العنقري</p>
          <p><Clock :size="14" /> الأحد إلى الخميس: 08:00 صباحاً - 04:30 مساءً</p>
        </div>

        <div class="office-card card">
          <span class="badge badge-orange mb-2">المنطقة الشرقية</span>
          <h3>المكتب الإقليمي الخبر</h3>
          <p><MapPin :size="14" /> طريق الظهران، تجاري الخبر مقابل اتصالات السعودية</p>
          <p><Clock :size="14" /> الأحد إلى الخميس: 08:00 صباحاً - 04:30 مساءً</p>
        </div>
      </div>

      <!-- Main Contact Grid -->
      <div class="contact-main-grid mt-4">
        <!-- Direct Quick Channels -->
        <div class="channels-col card">
          <h3 class="section-title">قنوات التواصل المباشرة</h3>

          <a href="tel:8002440204" class="channel-item">
            <div class="ch-icon phone"><Phone :size="24" /></div>
            <div>
              <span class="ch-label">الرقم المجاني الموحد</span>
              <strong class="ch-val">8002440204</strong>
            </div>
          </a>

          <a href="mailto:info@albaseetco.com" class="channel-item">
            <div class="ch-icon email"><Mail :size="24" /></div>
            <div>
              <span class="ch-label">البريد الإلكتروني</span>
              <strong class="ch-val">info@albaseetco.com</strong>
            </div>
          </a>

          <a href="https://wa.me/9668002440204" target="_blank" class="channel-item">
            <div class="ch-icon whatsapp"><MessageCircle :size="24" /></div>
            <div>
              <span class="ch-label">خدمة العملاء عبر الواتساب</span>
              <strong class="ch-val">مباشر على الواتساب 💬</strong>
            </div>
          </a>

          <div class="social-box mt-3">
            <p class="text-muted">ابحث عنا على وسائل التواصل الاجتماعي:</p>
            <div class="social-row">
              <span class="soc-tag">𝕏 @albaseetco</span>
              <span class="soc-tag">📸 @albaseetco</span>
              <span class="soc-tag">💼 شركة البسيط</span>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="form-col card">
          <h3 class="section-title">أرسل لنا رسالتك مباشرة</h3>

          <div v-if="isSent" class="text-center py-4">
            <CheckCircle :size="50" class="text-success mb-2" />
            <h3>تم استلام رسالتك بنجاح!</h3>
            <p class="text-muted">سيتواصل معك ممثل خدمة العملاء بشركة البسيط خلال أقرب وقت.</p>
          </div>

          <form v-else @submit.prevent="submitContact" class="contact-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">الاسم الكامل *</label>
                <input type="text" v-model="contactForm.name" class="form-control" required placeholder="اسمك" />
              </div>

              <div class="form-group">
                <label class="form-label">رقم الجوال *</label>
                <input type="text" v-model="contactForm.phone" class="form-control" required placeholder="05xxxxxxxx" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">البريد الإلكتروني *</label>
              <input type="email" v-model="contactForm.email" class="form-control" required placeholder="name@domain.com" />
            </div>

            <div class="form-group">
              <label class="form-label">عنوان الاستفسار</label>
              <input type="text" v-model="contactForm.subject" class="form-control" placeholder="حجز جديد، شكوى، استفسار..." />
            </div>

            <div class="form-group">
              <label class="form-label">تفاصيل الرسالة *</label>
              <textarea v-model="contactForm.message" class="form-control" rows="4" required placeholder="اكتب استفسارك بالتفصيل..."></textarea>
            </div>

            <button type="submit" class="btn btn-orange btn-lg w-full">
              <Send :size="18" />
              <span>إرسال الرسالة</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  padding: 2rem;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--primary-surface);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.offices-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.office-card {
  padding: 1.5rem;
}

.office-card h3 {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.office-card p {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.contact-main-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.75rem;
}

.channels-col, .form-col {
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  margin-bottom: 1rem;
  transition: var(--transition);
}

.channel-item:hover {
  border-color: var(--primary);
  transform: translateX(-4px);
}

.ch-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ch-icon.phone { background: var(--gold-light); color: var(--gold); }
.ch-icon.email { background: var(--primary-surface); color: var(--primary); }
.ch-icon.whatsapp { background: #E8F5E9; color: #2E7D32; }

.ch-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
}

.ch-val {
  font-size: 1.05rem;
  color: var(--text-dark);
}

.social-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.soc-tag {
  font-size: 0.8rem;
  background: var(--bg-subtle);
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.w-full {
  width: 100%;
}

@media (max-width: 1024px) {
  .offices-grid, .contact-main-grid {
    grid-template-columns: 1fr;
  }
}
</style>
