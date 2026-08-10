<script setup>
import { ref } from 'vue'
import { HelpCircle, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-vue-next'

const faqs = ref([
  {
    id: 1,
    question: 'هل يمكن لشخص آخر غير المستأجر استلام أو تسليم السيارة؟',
    answer: 'نعم، بشرط إضافة السائق الإضافي المعتمد في عقد التأجير عند التسجيل، وتقديم رخصة قيادة سارية ورقم هوية معتمد للسائق الإضافي.',
    isOpen: true
  },
  {
    id: 2,
    question: 'هل تقدمون خدمة الاستلام والتسليم من المطارات؟',
    answer: 'نعم، فروع البسيط والمفتاح متواجدة مباشرة في صالات الوصول بمطار الملك خالد بالرياض (T5)، مطار أبها الدولي، ومطار الملك فهد بالدمام، وتعمل على مدار 24 ساعة طوال أيام الأسبوع.',
    isOpen: false
  },
  {
    id: 3,
    question: 'ماذا لو أردت تغيير موقع الاستلام أو التسليم؟',
    answer: 'يمكنك تغيير موقع أو فرع التسليم بسهولة من خلال خيار "إدارة الحجز" في الموقع قبل موعد التسليم بـ 4 ساعات، أو التواصل مباشرة مع خدمة العملاء.',
    isOpen: false
  },
  {
    id: 4,
    question: 'هل هناك قيود على القيادة أو الكيلومترات اليومية؟',
    answer: 'العقد القياسي يتضمن 250 إلى 300 كم مجاني يومياً. كما يمكنك اختيار ميزة "كيلومتر مفتوح" للاستمتاع بقيادة لا محدودة الكيلومترات.',
    isOpen: false
  },
  {
    id: 5,
    question: 'هل يمكن استخدام السيارة لأغراض تجارية أو لنقل الركاب؟',
    answer: 'يتم تحديد ذلك حسب الفئة؛ الفئات التجارية والباصات مخصصة للنقل التجاري والتجاري للأعمال، بينما الفئات الاقتصادية والفخمة مخصصة للاستخدام الشخصي والعائلي.',
    isOpen: false
  },
  {
    id: 6,
    question: 'كيف يتم احتساب الأيام عند التأخير في التسليم؟',
    answer: 'عند تسليم السيارة، يكون وقت الإجازة غير مفعل حتى يتم احتساب يوم الإجازة على المستأجر بدقة، وفي حالة الحجز الأسبوعي أو الشهري يتحدد وقت التسليم بشكل مباشر مع مراعاة الوقت للتسليم.',
    isOpen: false
  }
])

function toggleFaq(id) {
  const f = faqs.value.find(item => item.id === id)
  if (f) f.isOpen = !f.isOpen
}
</script>

<template>
  <div class="faq-page section-padding">
    <div class="container">
      <div class="page-header card">
        <div class="header-content">
          <div class="icon-box"><HelpCircle :size="32" /></div>
          <div>
            <h1 class="heading-lg">الأسئلة الشائعة والمهمة</h1>
            <p class="text-muted">إجابات شاملة لكافة الاستفسارات المتعلقة بتأجير السيارات، الشروط، والتسليم</p>
          </div>
        </div>
      </div>

      <!-- FAQ Accordion List -->
      <div class="faq-list">
        <div 
          v-for="f in faqs" 
          :key="f.id" 
          class="faq-card card"
          :class="{ active: f.isOpen }"
        >
          <button class="faq-question" @click="toggleFaq(f.id)">
            <span>{{ f.question }}</span>
            <ChevronDown :size="20" class="arrow-icon" />
          </button>
          
          <div v-if="f.isOpen" class="faq-answer">
            <p>{{ f.answer }}</p>
          </div>
        </div>
      </div>

      <!-- Notes Box (من ملاحظات الصفحة 6 في المستند) -->
      <div class="important-notes-card card mt-4">
        <h3 class="notes-title">
          <AlertTriangle :size="20" class="text-orange" />
          <span>ملاحظات وإرشادات إضافية هامة</span>
        </h3>
        <ul class="notes-list">
          <li>عند تسليم السيارة يكون وقت الإجازة غير مفعل حتى يتم احتساب يوم الإجازة على المستأجر.</li>
          <li>عند حجز السيارة أسبوعي أو شهري يتحدد وقت التسليم بشكل مباشر مع مراعاة الوقت للتسليم.</li>
          <li>تطبيق البسيط والموقع مجهز وقابل للتحويل إلى تطبيق جوال ذكي (PWA Ready).</li>
          <li>الربط المباشر مع برنامج الفرع يضمن تحديث حالة استلام وتسليم المركبة لحظياً.</li>
        </ul>
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
  background: var(--gold-light);
  color: var(--gold);
  border: 1px solid var(--gold-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.faq-card {
  overflow: hidden;
}

.faq-question {
  width: 100%;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-dark);
  text-align: right;
  transition: var(--transition);
}

.faq-question:hover {
  color: var(--primary);
}

.arrow-icon {
  transition: var(--transition);
}

.faq-card.active .arrow-icon {
  transform: rotate(180deg);
  color: var(--primary);
}

.faq-answer {
  padding: 0 1.5rem 1.25rem;
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
  border-top: 1px dashed var(--border-light);
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.important-notes-card {
  padding: 1.75rem;
  background: var(--gold-light);
  border: 1px solid var(--gold-border);
  max-width: 900px;
  margin: 2rem auto 0;
}

.notes-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--primary-dark);
  margin-bottom: 1rem;
}

.notes-list {
  list-style: disc;
  padding-right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-dark);
}
</style>
