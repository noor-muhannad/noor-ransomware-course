'use strict';
(() => {
 const sections=window.COURSE, lessons=sections.filter(s=>s.number), resources=sections.filter(s=>!s.number);
 const $=id=>document.getElementById(id), key='noor-course-progress-v1';
 let done=new Set();
 try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))done=new Set(saved.filter(n=>Number.isInteger(n)&&n>=1&&n<=10));}catch{}
 const descriptions=['افهم AI وMachine Learning وDeep Learning من الصفر.','حلّل تهديد Ransomware وحدد مكان النموذج في الدفاع.','اقرأ ملفات PE وابنِ Data Card احترافية.','جهّز البيانات وامنع Leakage قبل أن يدمر النتيجة.','افهم Neural Networks وطبقات 1D-CNN عملياً.','ادخل عالم Transformers وDistilBERT وTokenization.','ادمج المسارين وافهم لماذا قد يتفوق Hybrid Model.','درّب النموذج واضبطه واحفظ أفضل Checkpoint.','اقرأ نتيجة 99% بالمقاييس والتحليل العلمي الصحيح.','حوّل كل ما تعلمته إلى مشروع وخطة تطوير متقدمة.'];
 const quizzes=[
  {q:'أي عبارة تصف العلاقة بصورة صحيحة؟',a:['AI جزء من Deep Learning','Deep Learning جزء من Machine Learning، وهو جزء من AI','Machine Learning وAI شيء واحد'],ok:1,why:'Deep Learning فرع من Machine Learning، وMachine Learning أحد أساليب Artificial Intelligence.'},
  {q:'أي وظيفة لا ينفذها نموذج الكشف وحده؟',a:['تصنيف عينة','تقدير احتمال Ransomware','استعادة الملفات المشفرة تلقائياً'],ok:2,why:'الكشف جزء من الدفاع، لكنه لا يعوض Backup أوIncident Response أوأداة استعادة.'},
  {q:'لماذا لا نستخدم family كـFeature؟',a:['لأنها نص','لأنها تكشف الإجابة وتسبب Target Leakage','لأنها تحتوي أسماء طويلة'],ok:1,why:'family هي التسمية التي نحاول توقعها؛ إدخالها يجعل الاختبار غير صالح.'},
  {q:'أين نلائم StandardScaler؟',a:['على Training فقط','على Test فقط','على كامل البيانات قبل التقسيم'],ok:0,why:'نستنتج المتوسط والانحراف من Training ثم نطبقهما على Validation وTest.'},
  {q:'ماذا ينتج Adaptive Average Pooling في مسار البحث؟',a:['فئة نهائية','متجه من 128 قيمة لكل عينة','512 Token'],ok:1,why:'يضغط البعد التسلسلي ليعطي تمثيل CNN بحجم 128.'},
  {q:'ما الخطر من حد 512 Token؟',a:['يزيد عدد الفئات','قد يقتطع خصائص في نهاية النص','يمنع استخدام الأرقام السالبة'],ok:1,why:'لذلك نقيس طول الترميز ونسبة العينات المقتطعة.'},
  {q:'لماذا يصبح Fusion Vector بحجم 896؟',a:['لأن 62×14≈896','لأن 128 من CNN تُوصل مع 768 من DistilBERT','لأنه عدد عينات Test'],ok:1,why:'Concatenation يضع المتجهين جنباً إلى جنب: 128 + 768 = 896.'},
  {q:'إذا كانت أفضل نتيجة في Epoch 9 وتوقف التدريب في 14، أي أوزان نستخدم؟',a:['Epoch 14','Epoch 1','Checkpoint من Epoch 9'],ok:2,why:'Early Stopping يتطلب استعادة أفضل Checkpoint، لا آخر حقبة.'},
  {q:'ماذا يجيب Recall؟',a:['كم إنذاراً كان صحيحاً؟','كم هجمة موجودة اكتشفنا؟','كم ملفاً سليماً فحصنا؟'],ok:1,why:'Recall = TP / (TP + FN)، أي تغطية الهجمات الموجودة.'},
  {q:'أي اختبار أقوى لادعاء كشف عائلة جديدة؟',a:['تقسيم عشوائي فقط','تدريب واختبار على العائلة نفسها','حجب عائلة كاملة ثم اختبارها'],ok:2,why:'Leave-one-family-out يقيس التعميم على عائلة لم تدخل التدريب.'}
 ];
 function link(s,cls){const a=document.createElement('a');a.className=cls;a.href='#'+s.id;return a;}
 lessons.forEach(s=>{const a=link(s,'nav-link');const n=document.createElement('span');n.className='num';n.textContent=String(s.number).padStart(2,'0');const t=document.createElement('span');t.textContent=s.title;a.append(n,t);a.dataset.number=s.number;$('lesson-nav').append(a);});
 resources.forEach(s=>{const a=link(s,'resource-link');a.textContent=s.title;$('resource-nav').append(a);});
 const finalExam=resources.find(s=>s.title.includes('الختامي'));
 if(finalExam)$('assessment-link').href='#'+finalExam.id;
 function updateProgress(){
  $('progress').value=done.size;$('progress-label').textContent=`إنجازك: ${done.size} من 10 محاضرات`;
  document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('done',done.has(Number(a.dataset.number))));
  const first=lessons.find(s=>!done.has(s.number));$('start').href='#'+(first?.id||'lesson-1');$('start').firstChild.textContent=done.size?'تابع التعلّم ':'ابدأ التعلّم ';
 }
 function cards(query=''){
  $('lesson-cards').replaceChildren();const q=query.trim().toLowerCase();const found=lessons.filter(s=>(s.title+' '+s.text).toLowerCase().includes(q));
  found.forEach(s=>{const a=link(s,'lesson-card');const num=document.createElement('span');num.className='card-num';num.textContent=String(s.number).padStart(2,'0');
   const copy=document.createElement('div');copy.className='card-copy';const h=document.createElement('h3');h.textContent=s.title;const p=document.createElement('p');p.textContent=descriptions[s.number-1];
   const bottom=document.createElement('div');bottom.className='card-bottom';const duration=document.createElement('span');duration.textContent='120 دقيقة';const state=document.createElement('span');state.className='status';state.textContent=done.has(s.number)?'مكتملة ✓':'شرح · تطبيق · تقويم';bottom.append(duration,state);copy.append(h,p,bottom);
   const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='←';a.append(num,copy,arrow);$('lesson-cards').append(a);
  });$('empty').hidden=found.length>0;
 }
 let current=null;
 function route(){
  const id=location.hash.slice(1)||'home';current=sections.find(s=>s.id===id)||null;
  $('home').hidden=!!current;$('reader').hidden=!current;
  if(current){$('reader-title').textContent=current.title;$('reader-content').innerHTML=current.html;$('reader-meta').textContent=current.number?`المحاضرة ${current.number} / 10 · ساعتان`:'مكتبة الكورس';
   $('reader-kicker').textContent=current.number?`MODULE ${String(current.number).padStart(2,'0')} · ZERO TO PROFESSIONAL`:'COURSE RESOURCE';
   $('reader-progress-label').textContent=current.number?`${current.number} من 10`:'مرجع إضافي';$('reader-progress-bar').style.width=current.number?`${current.number*10}%`:'100%';renderQuiz(current.number);
   $('complete').hidden=!current.number;$('complete').setAttribute('aria-pressed',String(done.has(current.number)));$('complete').textContent=done.has(current.number)?'مكتملة ✓ — إلغاء العلامة':'علّم المحاضرة كمكتملة ✓';
   const next=lessons.find(s=>s.number===current.number+1);$('next').href=next?'#'+next.id:'#home';$('next').textContent=next?'المحاضرة التالية ←':'العودة إلى المسار ←';
  }
  document.querySelectorAll('#sidebar a').forEach(a=>{const selected=a.getAttribute('href')==='#'+id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.title=(current?current.title:'مختبر الكشف الذكي')+' | نور مهند احمد';document.body.classList.remove('menu-open');$('menu').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:'instant'});
 }
 function renderQuiz(number){const box=$('quiz');if(!number){box.hidden=true;return;}box.hidden=false;const quiz=quizzes[number-1];$('quiz-question').textContent=quiz.q;$('quiz-feedback').textContent='';$('quiz-options').replaceChildren();quiz.a.forEach((answer,index)=>{const button=document.createElement('button');button.textContent=answer;button.addEventListener('click',()=>{const good=index===quiz.ok;document.querySelectorAll('#quiz-options button').forEach((b,i)=>{b.disabled=true;b.classList.toggle('correct',i===quiz.ok);b.classList.toggle('wrong',i===index&&!good);});$('quiz-feedback').textContent=(good?'إجابة صحيحة — ':'راجع الفكرة — ')+quiz.why;});$('quiz-options').append(button);});}
 $('complete').addEventListener('click',()=>{if(!current?.number)return;done.has(current.number)?done.delete(current.number):done.add(current.number);try{localStorage.setItem(key,JSON.stringify([...done]));}catch{}updateProgress();cards($('search').value);route();});
 $('search').addEventListener('input',e=>cards(e.target.value));$('print').addEventListener('click',()=>window.print());
 $('menu').addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');$('menu').setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('menu-open');$('menu').setAttribute('aria-expanded','false');}});
 window.addEventListener('hashchange',()=>{route();$('main').focus({preventScroll:true});});updateProgress();cards();route();
})();
