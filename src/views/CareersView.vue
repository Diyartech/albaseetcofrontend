<script setup>
import { ref } from 'vue'
import { Briefcase, Send, CheckCircle, MapPin } from 'lucide-vue-next'

const jobs = ref([
  {
    id: 1,
    title: 'ممثل مبيعات وفروع (Branch Sales Representative)',
    city: 'الرياض / جدة / الدمام',
    type: 'دوام كامل',
    dept: 'إدارة الفروع والمبيعات',
    tasks: 'استقبال العملاء، إنهاء عقود التأجير على النظام، متابعة تسليم وتسلم المركبات، وتقديم الخدمة المتميزة.'
  },
  {
    id: 2,
    title: 'مشرف خدمة العملاء ودعم الحجوزات',
    city: 'الرياض (المكتب الرئيسي)',
    type: 'دوام كامل',
    dept: 'خدمة العملاء',
    tasks: 'الرد على استفسارات الهاتف والواتساب، متابعة تعديلات وإلغاءات الحجز، وحل الشكاوى وتوجيه الدعم الفني.'
  },
  {
    id: 3,
    title: 'سائق توصيل واستلام مركبات (Delivery Driver)',
    city: 'جدة / أبها',
    type: 'دوام كامل',
    dept: 'الخدمات اللوجستية',
    tasks: 'توصيل السيارات لمواقع العملاء، فحص حالة المركبة قبل التسليم، والقيادة الآمنة والالتزام بالمواعيد.'
  }
])

const applyForm = ref({
  name: '',
  phone: '',
  email: '',
  jobTitle: 'ممثل مبيعات وفروع (Branch Sales Representative)',
  cvNote: ''
})

const isSubmitted = ref(false)

function submitApplication() {
  isSubmitted.value = true
}
</script>

<template>
  <div class="careers-page section-padding">
    <div class="container">
      <div class="page-header card">
        <div class="header-content">
          <div class="icon-box"><Briefcase :size="32" /></div>
          <div>
            <h1 class="heading-lg">انضم إلى فريق شركة البسيط للتأجير</h1>
            <p class="text-muted">نبحث دائماً عن الكفاءات المتميزة لبناء مستقبل خدمات التأجير بالمملكة</p>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="careers-layout">
        <!-- Open Jobs List (من المستند: تصميم للوظائف أو نص مع المهام) -->
        <div class="jobs-list">
          <h2 class="section-heading mb-3">الفرص الوظيفية المتاحة حالياً</h2>

          <div v-for="j in jobs" :key="j.id" class="job-card card">
            <div class="job-header">
              <div>
                <span class="badge badge-primary mb-1">{{ j.dept }}</span>
                <h3 class="job-title">{{ j.title }}</h3>
              </div>
              <span class="badge badge-gold">{{ j.type }}</span>
            </div>

            <p class="job-city"><MapPin :size="14" /> {{ j.city }}</p>
            <p class="job-tasks"><strong>المهام والمسؤوليات:</strong> {{ j.tasks }}</p>

            <button class="btn btn-outline-primary btn-sm apply-btn" @click="applyForm.jobTitle = j.title">
              <span>التقديم على هذه الوظيفة</span>
            </button>
          </div>
        </div>

        <!-- Application Form Sidebar -->
        <div class="apply-sidebar card">
          <h3 class="sidebar-title">نموذج التقديم السريع</h3>
          
          <div v-if="isSubmitted" class="text-center py-4">
            <CheckCircle :size="50" class="text-success mb-2" />
            <h3>تم استلام طلبك بنجاح!</h3>
            <p class="text-muted">سيتواصل معك فريق الموارد البشرية بشركة البسيط في أقرب وقت.</p>
          </div>

          <form v-else @submit.prevent="submitApplication" class="apply-form">
            <div class="form-group">
              <label class="form-label">الوظيفة المتقدم لها</label>
              <input type="text" v-model="applyForm.jobTitle" class="form-control" readonly />
            </div>

            <div class="form-group">
              <label class="form-label">الاسم الكامل *</label>
              <input type="text" v-model="applyForm.name" class="form-control" required placeholder="ادخل اسمك الثلاثي" />
            </div>

            <div class="form-group">
              <label class="form-label">رقم الجوال *</label>
              <input type="text" v-model="applyForm.phone" class="form-control" required placeholder="05xxxxxxxx" />
            </div>

            <div class="form-group">
              <label class="form-label">البريد الإلكتروني *</label>
              <input type="email" v-model="applyForm.email" class="form-control" required placeholder="name@email.com" />
            </div>

            <div class="form-group">
              <label class="form-label">نبذة عن الخبرة / رابط السيرة الذاتية</label>
              <textarea v-model="applyForm.cvNote" class="form-control" rows="3" placeholder="أرفق رابط CV أو نبذة سريعة..."></textarea>
            </div>

            <button type="submit" class="btn btn-orange w-full">
              <Send :size="16" />
              <span>إرسال الطلب</span>
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

.careers-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.75rem;
}

.section-heading {
  font-size: 1.35rem;
  font-weight: 800;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.job-card {
  padding: 1.5rem;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.job-title {
  font-size: 1.15rem;
  font-weight: 800;
}

.job-city {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.job-tasks {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.apply-sidebar {
  padding: 1.5rem;
  height: fit-content;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.apply-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.w-full {
  width: 100%;
}

@media (max-width: 1024px) {
  .careers-layout {
    grid-template-columns: 1fr;
  }
}
</style>
