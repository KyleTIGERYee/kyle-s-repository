<template>
  <div class="flex flex-col min-h-screen">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200">
      <button @click="$emit('back')" class="text-blue-600 flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-blue-600/10 transition-colors cursor-pointer">
        <!-- ArrowLeft 图标 -->
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
      <h2 class="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">深梦团聚申请表</h2>
    </div>

    <main class="flex-1 pb-24">
      <!-- ====== 个人信息区域 ====== -->
      <div class="px-4 pt-6 pb-2">
        <h3 class="text-slate-900 text-lg font-bold flex items-center gap-2">
          <span class="w-1 h-5 bg-blue-600 rounded-full"></span>
          个人信息
        </h3>
      </div>

      <div class="space-y-1 px-4">
        <!-- 1. 申请人姓名 -->
        <div class="py-3">
          <label class="flex flex-col gap-2">
            <span class="text-slate-700 text-sm font-medium">1. 申请人姓名</span>
            <input v-model="formData.name" type="text" placeholder="请输入真实姓名" class="w-full rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-12 px-4 text-base outline-none transition-colors" />
          </label>
        </div>

        <!-- 2. 身份证号 -->
        <div class="py-3">
          <label class="flex flex-col gap-2">
            <span class="text-slate-700 text-sm font-medium">2. 身份证号</span>
            <input v-model="formData.idCard" type="text" placeholder="请输入18位身份证号" class="w-full rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-12 px-4 text-base outline-none transition-colors" />
          </label>
        </div>

        <!-- 3. 手机号码 -->
        <div class="py-3">
          <label class="flex flex-col gap-2">
            <span class="text-slate-700 text-sm font-medium">3. 手机号码</span>
            <input v-model="formData.phone" type="tel" placeholder="请输入常用联系电话" class="w-full rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-12 px-4 text-base outline-none transition-colors" />
          </label>
        </div>

        <!-- 4. 工作单位 -->
        <div class="py-3">
          <label class="flex flex-col gap-2">
            <span class="text-slate-700 text-sm font-medium">4. 工作单位</span>
            <input v-model="formData.workUnit" type="text" placeholder="请输入目前就职单位全称" class="w-full rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-12 px-4 text-base outline-none transition-colors" />
          </label>
        </div>

        <!-- 5. 职业类型 -->
        <div class="py-3">
          <label class="flex flex-col gap-2">
            <span class="text-slate-700 text-sm font-medium">5. 职业类型</span>
            <select v-model="formData.jobType" class="w-full rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-12 px-4 text-base outline-none transition-colors appearance-none">
              <option value="" disabled>请选择职业类别</option>
              <option>快递员</option>
              <option>网约配送员</option>
              <option>网约车司机</option>
              <option>货车司机</option>
              <option>公交车司机</option>
              <option>地铁一线运营服务人员</option>
              <option>保障房建筑工人</option>
            </select>
          </label>
        </div>

        <!-- 6. 身份证明材料 -->
        <div class="py-3">
          <span class="text-slate-700 text-sm font-medium block mb-3">6. 身份证明材料 (最多3张)</span>
          <div class="grid grid-cols-3 gap-3">
            <label class="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-white hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer">
              <!-- Camera 图标 -->
              <svg class="w-8 h-8 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              <span class="text-[10px] text-center px-1">点击上传</span>
              <input type="file" multiple accept="image/*" class="hidden" @change="handleIdImageChange" />
            </label>
            <!-- 占位显示已选择数量 -->
            <div v-if="formData.idImages.length > 0" class="col-span-2 flex items-center text-sm text-green-600 font-medium">
              已选择 {{ formData.idImages.length }} 张照片 ✅
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 申请意向区域 ====== -->
      <div class="px-4 pt-8 pb-2">
        <h3 class="text-slate-900 text-lg font-bold flex items-center gap-2">
          <span class="w-1 h-5 bg-blue-600 rounded-full"></span>
          申请意向
        </h3>
      </div>

      <div class="space-y-1 px-4">
        <!-- 7. 意向门店 -->
        <div class="py-3">
          <label class="flex flex-col gap-2">
            <span class="text-slate-700 text-sm font-medium">7. 意向门店</span>
            <select v-model="formData.store" class="w-full rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-12 px-4 text-base outline-none transition-colors appearance-none">
              <option value="" disabled>选择希望入住的门店</option>
              <option>南山深梦旗舰店</option>
              <option>福田中心店</option>
              <option>罗湖悦享店</option>
              <option>宝安共创店</option>
            </select>
          </label>
        </div>

        <!-- 8. 团聚家庭人数（单选） -->
        <div class="py-3">
          <span class="text-slate-700 text-sm font-medium block mb-3">8. 团聚家庭人数</span>
          <div class="flex flex-wrap gap-2">
            <label v-for="size in familySizes" :key="size" class="flex-1 min-w-[60px]">
              <input v-model="formData.familySize" type="radio" name="family_size" :value="size" class="peer hidden" />
              <div class="w-full text-center py-2 rounded-lg border border-slate-200 peer-checked:bg-blue-600/10 peer-checked:border-blue-600 peer-checked:text-blue-600 transition-all cursor-pointer">
                {{ size }}
              </div>
            </label>
          </div>
        </div>

        <!-- 9. 成员关系（多选） -->
        <div class="py-3">
          <span class="text-slate-700 text-sm font-medium block mb-3">9. 成员关系 (多选)</span>
          <div class="grid grid-cols-2 gap-3">
            <label v-for="rel in relationships" :key="rel" class="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 cursor-pointer">
              <input v-model="formData.relationships" :value="rel" type="checkbox" class="rounded text-blue-600 focus:ring-blue-600 w-4 h-4 border-slate-300" />
              <span class="text-sm">{{ rel }}</span>
            </label>
          </div>
        </div>

        <!-- 10. 关系证明材料 -->
        <div class="py-3">
          <span class="text-slate-700 text-sm font-medium block mb-3">10. 关系证明材料 (最多10张)</span>
          <div class="grid grid-cols-4 gap-2">
            <label class="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-white hover:border-blue-600 hover:text-blue-600 cursor-pointer transition-colors">
              <!-- Upload 图标 -->
              <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              <input type="file" multiple accept="image/*" class="hidden" @change="handleRelationImageChange" />
            </label>
            <div v-if="formData.relationImages.length > 0" class="col-span-3 flex items-center text-sm text-green-600 font-medium pl-2">
              已选择 {{ formData.relationImages.length }} 张照片 ✅
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-2">如户口本、结婚证、出生证明等</p>
        </div>

        <!-- 11. 计划入住日期 -->
        <div class="py-3">
          <label class="flex flex-col gap-2">
            <span class="text-slate-700 text-sm font-medium">11. 计划入住日期</span>
            <div class="relative">
              <input v-model="formData.checkInDate" type="date" class="w-full rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-12 px-4 text-base outline-none transition-colors" />
            </div>
          </label>
        </div>

        <!-- 12. 预计停留天数 -->
        <div class="py-3">
          <label class="flex flex-col gap-2">
            <span class="text-slate-700 text-sm font-medium">12. 预计停留天数</span>
            <div class="relative flex items-center">
              <input v-model="formData.stayDays" type="number" placeholder="请输入天数" class="w-full rounded-xl border border-slate-200 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-12 px-4 text-base pr-12 outline-none transition-colors" />
              <span class="absolute right-4 text-slate-400">天</span>
            </div>
          </label>
        </div>

        <!-- 13. 是否愿意参与"团聚故事"记录 -->
        <div class="py-3">
          <span class="text-slate-700 text-sm font-medium block mb-3">13. 是否愿意参与"团聚故事"记录？</span>
          <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="formData.story" type="radio" name="story" value="yes" class="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-600" />
              <span class="text-base">愿意分享</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="formData.story" type="radio" name="story" value="no" class="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-600" />
              <span class="text-base">暂时不方便</span>
            </label>
          </div>
          <p class="text-xs text-slate-400 mt-2 italic">参与分享可获得品牌定制礼品一份</p>
        </div>
      </div>
    </main>

    <!-- 底部提交区域 -->
    <div class="sticky bottom-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
      <div class="space-y-4">
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" class="mt-1 rounded text-blue-600 focus:ring-blue-600 w-4 h-4 border-slate-300" />
          <span class="text-xs text-slate-500 leading-relaxed">
            我已阅读并同意 <a href="#" class="text-blue-600 hover:underline">《深梦团聚申请须知》</a> 与 <a href="#" class="text-blue-600 hover:underline">《个人隐私保护协议》</a>，保证所填信息真实有效。
          </span>
        </label>
        <button @click="submit" class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all text-lg">
          提交申请
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ApplicationForm.vue - 申请表单组件
 * 包含个人信息（姓名/证件/手机/工作单位/职业类型/证明材料）
 * 和申请意向（门店/家庭人数/成员关系/证明材料/入住日期/停留天数/故事记录）
 */
export default {
  name: 'ApplicationForm',
  data() {
    return {
      // 家庭人数选项
      familySizes: ['2人', '3人', '4人', '5人', '5+'],
      // 成员关系选项
      relationships: ['父母', '配偶', '子女', '其他'],
      // 表单收集的数据
      formData: {
        name: '',
        idCard: '',
        phone: '',
        workUnit: '',
        jobType: '',
        store: '',
        familySize: '',
        relationships: [],
        checkInDate: '',
        stayDays: '',
        story: '',
        idImages: [],      // 存储 File 对象数组
        relationImages: [] // 存储 File 对象数组
      }
    }
  },
  methods: {
    handleIdImageChange(event) {
      this.formData.idImages = Array.from(event.target.files);
    },
    handleRelationImageChange(event) {
      this.formData.relationImages = Array.from(event.target.files);
    },
    submit() {
      this.$emit('submit', this.formData);
    }
  }
}
</script>
