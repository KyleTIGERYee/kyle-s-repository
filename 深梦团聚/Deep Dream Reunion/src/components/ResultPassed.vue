<template>
  <div class="flex flex-col min-h-screen">
    <header class="flex items-center bg-white/80 p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-200">
      <button @click="$emit('back')" class="text-slate-900 flex w-12 h-12 shrink-0 items-center justify-start cursor-pointer hover:bg-slate-100 rounded-full transition-colors">
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
      <h2 class="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">申请结果</h2>
    </header>
    <main class="flex-1 flex flex-col">
      <div class="w-full p-4">
        <div class="w-full overflow-hidden aspect-[3/2] rounded-xl flex shadow-lg">
          <div class="w-full bg-center bg-no-repeat bg-cover flex-1" :style="{ backgroundImage: heroImage }"></div>
        </div>
      </div>
      <div class="px-6 py-4 text-center">
        <div class="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-full mb-4">
          <svg class="w-10 h-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h1 class="text-slate-900 tracking-tight text-3xl font-bold leading-tight pb-3">恭喜您！</h1>
        <p class="text-slate-600 text-base font-normal leading-normal pb-6">您申请的<span class="text-blue-600 font-semibold">"深梦团聚"</span>已通过审核。我们很高兴您能加入这段旅程！</p>
        
        <!-- 动态审核原因/反馈文本 -->
        <div v-if="message" class="bg-blue-50/50 rounded-2xl p-5 mb-8 border border-blue-100/50 relative text-left">
          <p class="text-sm text-slate-800 leading-relaxed relative z-10">{{ message }}</p>
        </div>
      </div>
      <div class="px-6 pb-8">
        <div class="bg-white rounded-xl p-6 border border-blue-600/10 shadow-sm">
          <h3 class="text-slate-900 text-lg font-bold leading-tight tracking-tight mb-4">为您分配的管家</h3>
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center overflow-hidden border-2 border-blue-600/30">
              <img :src="stewardAvatar" alt="Alex Chen" class="w-full h-full object-cover" />
            </div>
            <div>
              <p class="text-slate-900 font-bold text-lg">Alex Chen</p>
              <p class="text-slate-500 text-sm italic">高级团聚专员</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <svg class="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.09.6.22 1.2.4 1.77a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.57.18 1.17.31 1.77.4A2 2 0 0 1 22 16.92z"/></svg>
              <div class="flex flex-col">
                <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">手机号</span>
                <span class="text-slate-900 font-medium">+1 (555) 0123-4567</span>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <svg class="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              <div class="flex flex-col">
                <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">微信号</span>
                <span class="text-slate-900 font-medium">DeepDream_Alex</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="px-6 pb-12 mt-auto">
        <button class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          立即联系管家
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
        <p class="text-center text-slate-400 text-xs mt-4 font-medium italic">我们的专员提供24/7全天候服务，协助您处理团聚详情。</p>
      </div>
    </main>
  </div>
</template>

<script>
import heroPassed from '../assets/images/hero_passed.jpg';
import stewardAvatarImg from '../assets/images/steward_avatar.jpg';

export default {
  name: 'ResultPassed',
  props: {
    message: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      heroImage: `url(${heroPassed})`,
      stewardAvatar: stewardAvatarImg,
    }
  },
}
</script>
