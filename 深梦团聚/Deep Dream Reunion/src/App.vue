<template>
  <!-- 根容器：居中显示，模拟移动端布局 -->
  <div class="min-h-screen bg-slate-100 font-sans text-slate-900 flex justify-center">
    <div class="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden">
      <!-- 根据 currentPage 状态条件渲染不同页面组件 -->
      <Home v-if="currentPage === 'HOME'" @apply="currentPage = 'FORM'" />
      <ApplicationForm v-if="currentPage === 'FORM'" @back="currentPage = 'HOME'" @submit="handleFormSubmit" />
      <AuditingStatus v-if="currentPage === 'AUDITING'" @back="currentPage = 'HOME'" />
      <ResultPassed v-if="currentPage === 'PASSED'" @back="currentPage = 'HOME'" :message="resultMessage" />
      <ResultFailed v-if="currentPage === 'FAILED'" @back="currentPage = 'HOME'" @retry="currentPage = 'FORM'" :message="resultMessage" />
    </div>
  </div>
</template>

<script>
/**
 * App.vue - 根组件
 * 管理页面路由状态 (HOME/FORM/AUDITING/PASSED/FAILED)
 * 通过 v-if 条件渲染实现页面切换
 */
import Home from './components/Home.vue'
import ApplicationForm from './components/ApplicationForm.vue'
import AuditingStatus from './components/AuditingStatus.vue'
import ResultPassed from './components/ResultPassed.vue'
import ResultFailed from './components/ResultFailed.vue'

export default {
  name: 'App',
  components: {
    Home,
    ApplicationForm,
    AuditingStatus,
    ResultPassed,
    ResultFailed,
  },
  data() {
    return {
      // 当前页面状态：HOME(首页) | FORM(表单) | AUDITING(审核中) | PASSED(通过) | FAILED(驳回)
      currentPage: 'HOME',
      // Dify 分析返回的原因文本
      resultMessage: ''
    }
  },
  methods: {
    /**
     * 处理表单提交
     * 发送网络请求给 Python 后端，获取真正大模型的打分与反馈
     */
    async handleFormSubmit(formData) {
      this.currentPage = 'AUDITING'
      this.resultMessage = ''
      
      try {
        // 构建支持文件上传的 FormData 对象
        const payload = new FormData();
        
        // 遍历所有表单字段
        for (const [key, value] of Object.entries(formData)) {
          if (Array.isArray(value)) {
            if (key === 'idImages' || key === 'relationImages') {
              // 对于文件数组，需要循环 append，让后端接收到 List[UploadFile]
              value.forEach(file => {
                payload.append(key, file);
              });
            } else {
              // 普通数组（如 relationships），转为逗号分隔的字符串
              payload.append(key, value.join(', '));
            }
          } else {
            payload.append(key, value);
          }
        }

        const response = await fetch('http://127.0.0.1:8000/api/submit-application', {
          method: 'POST',
          // 注: 使用 FormData 时，浏览器会自动加上包含 boundary 的 Content-Type，不要手动去设置
          body: payload
        });
        
        const data = await response.json();
        
        // Python 端已统一返回了 { status: 'PASSED' | 'FAILED', reason: '...' }
        if (data && data.status) {
          this.resultMessage = data.reason || '';
          this.currentPage = data.status === 'PASSED' ? 'PASSED' : 'FAILED';
        } else {
          throw new Error('返回格式不正确');
        }
      } catch (error) {
        console.error('提交失败:', error);
        this.resultMessage = '抱歉，系统通讯异常。请确保后端服务正常运行并检查工作流配置。';
        this.currentPage = 'FAILED';
      }
    },
  },
}
</script>
