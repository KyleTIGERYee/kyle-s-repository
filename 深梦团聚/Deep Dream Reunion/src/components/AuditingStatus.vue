<template>
  <div class="flex flex-col min-h-screen">
    <!-- 顶部导航栏 -->
    <header class="flex items-center bg-white/80 p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-200">
      <button @click="$emit('back')" class="text-blue-600 flex w-12 h-12 shrink-0 items-center justify-start cursor-pointer hover:bg-blue-600/10 rounded-full transition-colors">
        <!-- ArrowLeft 图标 -->
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
      <h2 class="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">申请状态</h2>
    </header>

    <main class="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <!-- 审核动画区域 -->
      <div class="w-full max-w-md">
        <div class="relative flex flex-col items-center justify-center min-h-[320px] bg-blue-600/5 rounded-xl overflow-hidden mb-8 border border-blue-600/20">
          <!-- 旋转动画圆环 -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="relative w-48 h-48">
              <!-- 外圈虚线旋转 -->
              <div class="absolute inset-0 rounded-full border-4 border-dashed border-blue-600/30 animate-spin" style="animation-duration: 10s;"></div>
              <!-- 内圈 + AI 图标 -->
              <div class="absolute inset-4 rounded-full border-4 border-blue-600/60 flex items-center justify-center">
                <!-- BrainCircuit 图标 -->
                <svg class="w-16 h-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>
              </div>
              <!-- 顶部脉冲光条 -->
              <div class="absolute top-0 left-0 w-full h-1 bg-blue-600/40 shadow-[0_0_15px_#2b7cee] animate-pulse" style="animation-duration: 2s;"></div>
            </div>
          </div>
          <!-- 背景图片（低透明度） -->
          <div
            class="w-full h-full opacity-10 bg-center bg-cover absolute inset-0"
            :style="{ backgroundImage: bgImage }"
          ></div>
        </div>
      </div>

      <!-- 提交成功文字 -->
      <h1 class="text-slate-900 tracking-tight text-3xl font-bold leading-tight pb-3">申请已提交</h1>
      <p class="text-slate-600 text-base font-normal leading-normal max-w-sm mx-auto">
        DIFY AI 正在审核您的团聚请求。我们正在匹配时间线、空间数据和情感概况，以确保完美的重逢。
      </p>

      <!-- 审核进度指示 -->
      <div class="mt-8 w-full max-w-xs space-y-4 mx-auto text-left">
        <div class="flex items-center gap-3 text-sm font-medium text-slate-700">
          <!-- CheckCircle2 图标 (绿色) -->
          <svg class="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          <span>已收到提交内容</span>
        </div>
        <div class="flex items-center gap-3 text-sm font-medium text-blue-600">
          <!-- RefreshCw 图标 (旋转动画) -->
          <svg class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          <span>AI 审核中...</span>
        </div>
        <div class="flex items-center gap-3 text-sm font-medium text-slate-400">
          <!-- Circle 图标 -->
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
          <span>正在生成团聚路径</span>
        </div>
      </div>

      <!-- 预计等待时间 -->
      <div class="mt-10 px-4 py-3 bg-blue-600/10 rounded-lg flex items-center justify-center gap-3 mx-auto w-fit">
        <!-- Clock 图标 -->
        <svg class="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span class="text-sm text-blue-600 font-semibold">预计等待时间：约 45 秒</span>
      </div>
    </main>
  </div>
</template>

<script>
import auditingBg from '../assets/images/auditing_bg.jpg';

/**
 * AuditingStatus.vue - 审核中状态页
 * 展示 AI 审核动画、审核进度步骤和预计等待时间
 */
export default {
  name: 'AuditingStatus',
  data() {
    return {
      // 背景图片 URL
      bgImage: `url(${auditingBg})`,
    }
  },
}
</script>
