<template>
  <div class="create-fault">
    <el-form :model="faultForm"  :rules="rules" ref="faultFormRef" label-width="120px">
      <h2>新建故障</h2>
      <el-form-item label="故障简述" prop="desc">
        <el-input type="textarea" v-model="faultForm.desc" autosize></el-input>
      </el-form-item>
      <div class="form-item-container">
        <el-form-item label="故障类型" prop="category">
          <el-cascader v-model="faultForm.category" :options="categoryOptions" :props="cascaderProps"
            @change="handleChange" class="custom-select" />
        </el-form-item>
        <el-form-item label="故障等级" prop="level">
          <el-select v-model="faultForm.level" placeholder="请选择故障等级" class="custom-select">
            <el-option label="低" value="低"></el-option>
            <el-option label="中" value="中"></el-option>
            <el-option label="高" value="高"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="当前状态" prop="currentStatus">
          <el-select v-model="faultForm.currentStatus" placeholder="请选择故障当前状态" class="custom-select">
            <el-option label="未处理" value="未处理"></el-option>
            <el-option label="处理中" value="处理中"></el-option>
            <el-option label="已修复" value="已修复"></el-option>
            <el-option label="todo 跟进中" value="todo 跟进中"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <el-form-item label="故障影响" prop="impact">
        <el-input type="textarea" v-model="faultForm.impact" autosize></el-input>
      </el-form-item>
      <el-form-item label="故障持续时间" prop="duration">
      <el-date-picker
        v-model="faultForm.duration"
        type="datetimerange"
        range-separator="To"
        start-placeholder="Start date"
        end-placeholder="End date"
      />
      </el-form-item>
      <h2>故障处理时间线</h2>
      <el-timeline prop="timeline">
        <el-timeline-item v-for="(activity, index) in faultForm.timeline" :key="index">

          <div class="timeline-timestamp" v-if="editingTimestampIndex !== index">
            <span @click="startEditingTimestamp(index, activity)">{{ formatTimestamp(activity.timestamp) }}</span>
          </div>

          <el-date-picker v-else v-model="editingTimestamp" type="datetime" placeholder="选择日期时间"
            format="YYYY年MM月DD日 HH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss"
            @change="saveEditingTimestamp(activity, index)" @clear="cancelEditingTimestamp"
            @blur="cancelEditingTimestamp" @close="cancelEditingTimestamp" />

          <div class="timeline-content">
            <md-editor v-if="editingIndex === index" v-model="editingContent" />
            <MdPreview v-else :modelValue="activity.content" />
          </div>
          <div class="timeline-actions">
            <el-button v-if="editingIndex !== index" type="primary" size="small"
              @click="startEditing(index, activity)">编辑</el-button>
            <el-button v-else type="success" size="small" @click="saveEditing(index)">保存</el-button>
            <el-button v-if="editingIndex !== index" type="danger" size="small"
              @click="removeActivity(index)">删除</el-button>
            <el-button v-else type="info" size="small" @click="cancelEditing">取消</el-button>
          </div>
        </el-timeline-item>
      </el-timeline>

      <el-form-item label="时间节点" :model="newActivity"  prop="timeline" label-width="120px">
        <el-date-picker v-model="newActivity.timestamp" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>
      <el-form-item label="处理内容" prop="timeline">
        <!-- <div class="custom-md-editor"> -->
        <md-editor v-model="newActivity.content" preview-theme="light" />
        <!-- </div> -->
      </el-form-item>
      <el-form-item>
        <!-- <el-button v-if="newActivity.value.timestamp && newActivity.value.content"  >Default</el-button> -->
        <el-button  type="primary" @click="addActivity">添加时间节点记录</el-button>
      </el-form-item>

      <h2>改进todo</h2>
      <el-form-item :model="faultForm" prop="todoContent" label-width="100px">
        <md-editor v-model="faultForm.todoContent" preview-theme="light" />
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="submitFault">提交故障</el-button>
  </div>
</template>




<script setup>
import api from '@/api/index.js'
import DOMPurify from 'dompurify';
import 'md-editor-v3/lib/style.css';

const router = useRouter() // 初始化 router

// 编辑状态
const editingIndex = ref(-1)  // 当前编辑中的内容索引
const editingContent = ref('')
const editingTimestamp = ref(new Date())
const originalTimestamp = ref(new Date())  // 保存原始时间
const editingTimestampIndex = ref(-1)  // 记录当前正在编辑时间的位置索引

const faultForm = ref({
  desc: '', // 故障简述
  category: [], // 故障类型
  level: '', // 故障等级
  currentStatus: '', // 故障当前状态
  impact: '', // 故障影响
  duration: '', // 故障持续时间
  timeline: [], // 故障处理时间线
  todoContent: ''// 改进todo内容
})

const faultFormRef = ref(null)

const rules = reactive({
  desc: [
    { required: true, message: '请填写故障简述', trigger: 'blur' },
    { min: 3, max: 500, message: '长度应在 3 到 500 个字符', trigger: 'blur' }
  ],
  category: [
    { type: 'array', required: true, message: '请选择故障类型', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择故障等级', trigger: 'change' }
  ],
  currentStatus: [
    { required: true, message: '请选择当前状态', trigger: 'change' }
  ],
  impact: [
    { required: true, message: '请填写故障影响', trigger: 'blur' }
  ],
  duration: [
    // { type: 'array', required: true, message: '请选择故障持续时间', trigger: 'change' }
    { 
      type: 'array', 
      required: true, 
      message: '请选择故障持续时间', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (!value || value.length !== 2) {
          callback(new Error('请选择完整的故障持续时间范围'))
        } else if (value[0] >= value[1]) {
          callback(new Error('结束时间必须晚于开始时间'))
        } else {
          callback()
        }
      }
    }
  ],
  timeline: [
    // { 
    //   type: 'array', 
    //   required: true, 
    //   message: '请添加至少一条时间线记录', 
    //   validator: (rule, value, callback) => {
    //     if (value.length === 0) {
    //       callback(new Error('请添加至少一条时间线记录'));
    //     } else {
    //       callback();
    //     }
    //   }
    // }

    { 
    type: 'array', 
    required: true, 
    message: '请添加至少一条时间线记录', 
    validator: (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('请添加至少一条时间线记录'))
      } else {
        const isValid = value.every(item => 
          item.timestamp && 
          item.content && 
          item.content.trim().length > 0
        )
        if (!isValid) {
          callback(new Error('所有时间线记录必须包含有效的时间戳和内容'))
        } else {
          callback()
        }
      }
    }
  }
  ],
  todoContent: [
    { required: true, message: '请填写改进todo内容', trigger: 'change' }
  ]
})

const newActivity = ref({
  timestamp: '',
  content: ''
})


// 定义级联选择器的选项
const categoryOptions = ref([
  {
    value: 'orthogonal',
    label: '三方依赖故障',
    children: [
      {
        value: 'live',
        label: '直播'
      },
      {
        value: 'chat',
        label: '聊天'
      }
    ]
  },
  {
    value: 'frontend',
    label: '前端故障',
    children: [
      {
        value: 'Android',
        label: 'android端故障'
      },
      {
        value: 'iOS',
        label: 'iOS应用故障'
      }
    ]
  }
])

// Cascader 配置
const cascaderProps = {
  expandTrigger: 'hover',
  multiple: false,
  checkStrictly: false
}

// 选择变化时的处理函数
const handleChange = (value) => {
  console.log('选中的值:', value)
  ElMessage.success(`您选择了: ${value.join(' / ')}`)
}

// 清理 HTML
const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html)
}

// 添加处理记录 
// const addActivity = () => {
//   // 触发表单验证
//   if (newActivity.value.timestamp && newActivity.value.content) {
//     faultForm.value.timeline.push({
//       timestamp: newActivity.value.timestamp,
//       content: sanitizeHtml(newActivity.value.content)
//     })
//     newActivity.value = { timestamp: '', content: '' }
//     // 触发表单验证
//     // 修改验证调用
//     faultFormRef.value.validateField('timeline', (valid, field) => {
//       if (!valid) {
//         console.log('Timeline validation failed:', field)
//       }
//     })    
//   } else {
//     ElMessage.warning('请填写完整的处理记录')
//   }
// }
const addActivity = () => {
  if (newActivity.value.timestamp && newActivity.value.content.trim()) {
    // 创建新的活动对象
    const activity = {
      timestamp: new Date(newActivity.value.timestamp).toISOString(),
      content: DOMPurify.sanitize(newActivity.value.content.trim())
    }

    // 添加到时间线
    faultForm.value.timeline.push(activity)

    // 重置新活动输入
    newActivity.value = { timestamp: '', content: '' }

    // 验证时间线字段
    faultFormRef.value.validateField('timeline', (valid) => {
      if (valid) {
        ElMessage({
          message: '时间节点记录添加成功',
          type: 'success',
          duration: 2000
        })
      } else {
        ElMessage({
          message: '时间节点记录已添加，但可能不满足整体要求，请检查',
          type: 'warning',
          duration: 3000
        })
      }
    })

    // 触发表单的 change 事件（如果需要）
    // faultFormRef.value.emit('change', faultForm.value)
  } else {
    ElMessage({
      message: '请填写完整的处理记录（时间和内容）',
      type: 'warning',
      duration: 2000
    })
  }
}


// 提交故障 TODO: 待后端接口
// const submitFault = () => {
//   console.log('提交前的表单数据:', faultForm.value)
//   faultFormRef.value.validate((valid,fields) => {
//     console.log('验证结果:', valid, fields)
//     if (valid) {
//       // 表单验证通过，执行提交逻辑
//       console.log('提交的故障信息：', faultForm.value)
//       ElMessage.success('故障创建成功')
//       router.push('/fault-management')
//       // 重置表单
//       faultFormRef.value.resetFields()
//       faultForm.value.timeline = []
//     } else {
//       console.log('验证失败的字段:', fields)
//       ElMessage.error('请填写完整的故障信息')
//     }
//   })
// };

const submitFault = async () => {
  try {
    await faultFormRef.value.validate()
    const response = await api.post('/api/createFaults', faultForm.value)
    if (response.data.success) {
      ElMessage.success('故障创建成功')
      router.push('/fault-management')
      faultFormRef.value.resetFields()
      faultForm.value.timeline = []
    } else {
      ElMessage.error(response.data.message || '创建失败，请重试')
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      ElMessage.error('请填写完整的故障信息')
    } else {
      console.error(`提交故障信息时出错: error: ${error}; faultForm.value: ${JSON.stringify(faultForm.value)}`)
      ElMessage.error('提交失败，请稍后重试')
    }
  }
}



// 删除活动
const removeActivity = (index) => {
  ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    faultForm.value.timeline.splice(index, 1)
    ElMessage.success('删除成功')
    // 触发表单验证
    // 修改验证调用
    faultFormRef.value.validateField('timeline', (valid, field) => {
      if (!valid) {
        console.log('Timeline validation failed after removal:', field)
      }
    })
  }).catch(() => {
    // 取消删除操作
  })
}

// 使用 JavaScript 原生的 Intl.DateTimeFormat 格式化时间
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) {
    return "无效的日期"; // 如果时间无效，返回提示
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false  // 24小时制
  }).format(date)
}

// 开始编辑内容
const startEditing = (index, activity) => {
  editingIndex.value = index
  editingContent.value = activity.content
}

// 保存内容编辑
const saveEditing = (index) => {
  if (!editingContent.value.trim()) {
    ElMessage.warning('内容不能为空')
    return
  }
  faultForm.value.timeline[index].content = editingContent.value
  editingIndex.value = -1
  editingContent.value = ''
  ElMessage.success('修改成功')
}

// 取消内容编辑
const cancelEditing = () => {
  editingIndex.value = -1
  editingContent.value = ''
}

// 开始编辑时间
const startEditingTimestamp = (index, activity) => {
  editingTimestampIndex.value = index  // 当前编辑时间的索引
  originalTimestamp.value = new Date(activity.timestamp)  // 保存原始时间
  editingTimestamp.value = new Date(activity.timestamp)  // 使用已有时间作为默认值
}

// Save time when the user clicks "OK"
const saveEditingTimestamp = (activity, index) => {
  // Log the current state for debugging
  console.log('Before saving:', editingTimestamp.value);

  // Ensure the activity timestamp is updated correctly
  activity.timestamp = new Date(editingTimestamp.value);  // Ensure the timestamp is saved as a Date object

  // Log the updated activity timestamp
  console.log('Updated activity timestamp:', activity.timestamp);

  // Reset the index to exit the time editing state
  editingTimestampIndex.value = -1;

  // Provide feedback that the time was successfully updated
  ElMessage.success('时间已更新');
};

// Cancel time editing and revert to original timestamp
const cancelEditingTimestamp = () => {
  console.log('Cancel editing timestamp, reverting to original:', originalTimestamp.value);

  // Revert to the original timestamp
  editingTimestamp.value = originalTimestamp.value;

  // Exit the time editing state
  editingTimestampIndex.value = -1;
};
</script>


<style scoped lang="scss">
.create-fault {
  max-width: fit-content; // 修复拼写错误
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, Helvetica, sans-serif;
  background-color: rgb(20, 160, 207);
  margin: auto;
  background: fixed;
}

/* 定义一个可调节大小的文本区域样式 */
.faultForm-description-resizeable-textarea .el-textarea__inner {
  resize: vertical;
  /* 允许垂直方向调整大小 */
}

:deep(.md-editor) {
  height: 300px;
}

.timeline-content {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

:deep(.md-editor-preview) {
  background-color: transparent;
  padding: 0;
}

:deep(.md-editor-preview h1),
:deep(.md-editor-preview h2),
:deep(.md-editor-preview h3),
:deep(.md-editor-preview h4),
:deep(.md-editor-preview h5),
:deep(.md-editor-preview h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.md-editor-preview p) {
  margin-bottom: 1em;
}

:deep(.md-editor-preview ul),
:deep(.md-editor-preview ol) {
  padding-left: 2em;
  margin-bottom: 1em;
}

:deep(.md-editor-preview code) {
  background-color: #e6e6e6;
  padding: 2px 4px;
  border-radius: 2px;
}

:deep(.md-editor-preview pre) {
  background-color: #e6e6e6;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

:deep(.md-editor-preview blockquote) {
  border-left: 4px solid #ccc;
  margin-left: 0;
  padding-left: 10px;
  color: #666;
}

.timeline-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.md-editor) {
  height: 200px;
  margin-bottom: 10px;
}

:deep(.el-timeline-item__content) {
  max-width: 100%;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 0.9em;
  color: #909399;
}


/* 突出显示时间的样式 */
.timeline-timestamp {
  font-size: 1.2em;
  font-weight: bold;
  color: #409eff;
  /* 颜色可以根据需求修改 */
  margin-bottom: 10px;
}

.custom-md-editor {
  /* 添加你的自定义样式 */
  background-color: #071e40;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;

}

.form-item-container {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  /* 可选：设置组件之间的间距 */
  gap: 20px 50px;
}

.custom-select {
  width: 190px;
  /* 设置选择框的宽度 */
}
</style>