<template>
  <div class="flex flex-col min-h-screen">
    <header class="flex items-center bg-white/80 p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-200">
      <button @click="$emit('back')" class="text-slate-900 flex w-12 h-12 shrink-0 items-center justify-start cursor-pointer hover:bg-slate-100 rounded-full transition-colors">
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
      <h2 class="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">申请状态</h2>
    </header>
    <main class="flex-1 flex flex-col">
      <div class="w-full bg-slate-200 flex flex-col justify-end overflow-hidden min-h-[218px] bg-center bg-no-repeat bg-cover" :style="{ backgroundImage: heroImage }"></div>
      <div class="px-6 py-6 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        </div>
        <h2 class="text-slate-900 text-2xl font-bold leading-tight pb-3">申请未通过</h2>
        <p class="text-slate-600 text-base font-normal leading-relaxed">我们审核了您的"深梦团聚"申请，但由于信息缺失或不清晰，目前无法通过您的申请。</p>
      </div>
      <div class="px-6 pb-8">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <h3 class="text-slate-900 text-lg font-bold">驳回详情 / AI 审核建议</h3>
          </div>
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="mt-1 flex-shrink-0">
                <svg class="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              </div>
              <div>
                <p class="text-slate-700 text-sm leading-relaxed text-justify whitespace-pre-line">{{ message || '您的申请暂时未通过系统设定的基础规则检查，请检查填报信息。' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="px-6 pb-6">
        <h4 class="text-slate-900 font-bold mb-3 text-sm uppercase tracking-wider">如何修复</h4>
        <ul class="space-y-3">
          <li class="flex items-center gap-3 text-sm text-slate-600">
            <svg class="w-5 h-5 text-blue-600/70" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            确保所有照片都在光线充足的环境下拍摄。
          </li>
          <li class="flex items-center gap-3 text-sm text-slate-600">
            <svg class="w-5 h-5 text-blue-600/70" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            上传出生证明或法律判决书。
          </li>
          <li class="flex items-center gap-3 text-sm text-slate-600">
            <svg class="w-5 h-5 text-blue-600/70" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            仔细检查所有文件上的姓名是否完全一致。
          </li>
        </ul>
      </div>
      <div class="px-6 py-6 mt-auto flex flex-col gap-3">
        <button @click="$emit('retry')" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          重新提交申请
        </button>
        <button class="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          联系客服
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import heroFailed from '../assets/images/hero_failed.jpg';

export default {
  name: 'ResultFailed',
  props: {
    message: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      heroImage: `url(${heroFailed})`,
    }
  },
}
</script>
