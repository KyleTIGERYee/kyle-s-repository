<template>
  <div class="flex flex-col min-h-screen">
    <!-- 顶部导航栏 -->
    <header class="flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 p-4 justify-between border-b border-slate-200">
      <div class="w-10"></div>
      <h1 class="text-slate-900 text-lg font-bold leading-tight tracking-tight text-center">深梦团聚</h1>
      <div class="w-10 flex justify-end">
        <!-- Share2 图标 -->
        <svg class="w-5 h-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
      </div>
    </header>

    <main class="flex-1 pb-20">
      <!-- Banner 区域 -->
      <div class="px-4 py-4">
        <div class="relative bg-blue-600/10 rounded-xl overflow-hidden min-h-[320px] flex flex-col justify-end group shadow-sm">
          <div
            class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            :style="{ backgroundImage: bannerBg }"
          ></div>
          <div class="relative p-6">
            <span class="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider">限时公益活动</span>
            <h2 class="text-white text-3xl font-bold leading-tight">深梦团聚 · 免费住</h2>
            <p class="text-white/90 text-sm mt-2 font-medium">助力建设者，温暖团圆梦</p>
          </div>
        </div>
      </div>

      <!-- 活动介绍 -->
      <section class="px-6 py-6 text-center">
        <h3 class="text-slate-900 text-2xl font-bold leading-tight mb-3">让爱跨越距离</h3>
        <p class="text-slate-600 text-base font-normal leading-relaxed">
          为了感谢每一位城市建设者的辛勤付出，我们发起"深梦团聚"计划。为您的家属提供免费优质住宿空间，让您在繁忙的工作之余，与家人共享温馨的团聚时刻。
        </p>
      </section>

      <!-- 活动规则说明 -->
      <section class="px-6 py-8 border-t border-slate-100">
        <h2 class="text-xl font-bold text-slate-900 mb-6 text-center">深梦团聚-春节免费住活动说明</h2>
        <div class="space-y-6 text-sm text-slate-600 leading-relaxed">
          <div>
            <h3 class="text-base font-bold text-slate-800 mb-2">一、活动时间</h3>
            <p>2026年2月1日-2月28日期间</p>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 mb-2">二、服务对象</h3>
            <p>在深工作的快递员、网约配送员、网约车司机、货车司机四类新就业群体和保障房建筑工人、公交车司机、地铁一线运营服务人员等在春节期间保障城市运行的城市建设者；</p>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 mb-2">三、活动权益</h3>
            <p>"深梦团聚"春节免费住公益活动由安居集团旗下安居乐寓公司及房屋租赁公司提供房源并让利租金收入，在深工作的快递员、网约配送员、网约车司机、货车司机四类新就业群体和保障房建筑工人、公交车司机、地铁一线运营服务人员等在春节期间保障城市运行的城市建设者可以带家人在对应房源中免费居住15天。</p>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 mb-2">四、活动规则</h3>
            <div class="mt-4 space-y-4">
              <div>
                <h4 class="font-bold text-slate-700 mb-1 italic underline">（一）房源说明：</h4>
                <ul class="list-disc ml-4 space-y-1">
                  <li>房源户型：深圳范围内"安居乐寓"及"寓见安居"品牌房源，含单间、一居室、二居室及三居室。</li>
                  <li>房源数量：500套</li>
                  <li>申请次序：各门店免费住名额数量有限，采用先到先得的形式，房源户型分配原则以同住人人数合理分配，房源位置分配原则以申请人意向区域及居住地址就近分配。</li>
                </ul>
              </div>
              <div>
                <h4 class="font-bold text-slate-700 mb-1 italic underline">（二）入住条件：</h4>
                <ul class="list-disc ml-4 space-y-1">
                  <li>报名申请：申请人必须符合新就业群体人员及春节期间保障城市运行的特定城市建设者，且年龄须为18周岁及以上，同住人年龄不限。</li>
                  <li>签约入住：签约人必须为申请人本人，工作人员按照申请人提交的报名信息，含有效证明材料（如工作证或接单证明或社保证明等；保障房建筑工人需提供由总包单位盖章确认属于XX保障房项目建筑工人的相关证明材料）进行活动审核，审核通过后即可办理入住；如报名客户标记为【企业通道】来源客户则表示对接企业已审核，直接排房即可。</li>
                </ul>
              </div>
              <div>
                <h4 class="font-bold text-slate-700 mb-1 italic underline">（三）入住费用：</h4>
                <p>免除15天月租金。</p>
                <ul class="list-disc ml-4 space-y-1">
                  <li>签订活动协议时需实缴固定押金500元，退租时可退；</li>
                  <li>入住当天需缴纳所选房源对应的月服务费（188元、238元或288元），办理退租时会按实际居住天数扣除服务费(6-10元/天，具体根据门店收费标准执行）后退还剩余部分；</li>
                  <li>水电费根据实际居住门店水电收费标准，按使用情况进行缴纳。</li>
                </ul>
              </div>
              <div>
                <h4 class="font-bold text-slate-700 mb-1 italic underline">（四）居住租期：</h4>
                <p>居住租期为15天，需在活动时间内入住且最晚办理入住时间为2026年2月14日；入住后不可换房，居住期满可按市场挂牌价续租；如发生人为损坏资产，需缴纳相应的赔偿费用。</p>
              </div>
              <div>
                <h4 class="font-bold text-slate-700 mb-1 italic underline">（五）到期退租</h4>
                <p>到期及提前退租均全退押金。如发生人为损坏资产，需缴纳相应的赔偿费用。</p>
              </div>
              <div>
                <h4 class="font-bold text-slate-700 mb-1 italic underline">（六）特别说明</h4>
                <p>活动房间每人在活动周期内仅享受一次15天免费住权益，房间仅用于申请人及家人居住，不可转租、不可用于其他经营、不可长期空置（3天以上）。门店有权定期抽查房间居住情况，如发现违规情况，门店有权清退。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部报名按钮 -->
    <footer class="sticky bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4">
      <button
        @click="$emit('apply')"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <!-- UserCheck 图标 -->
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
        立即报名申请
      </button>
    </footer>
  </div>
</template>

<script>
import homeBanner from '../assets/images/home_banner.jpg';

/**
 * Home.vue - 首页组件
 * 展示活动 Banner、介绍文案、详细活动规则和底部报名按钮
 * 点击"立即报名申请"按钮时触发 apply 事件
 */
export default {
  name: 'Home',
  data() {
    return {
      // Banner 背景图片（渐变叠加 + 本地图片）
      bannerBg: `linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 50%), url(${homeBanner})`,
    }
  },
}
</script>
