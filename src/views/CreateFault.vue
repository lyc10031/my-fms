<template>
  <div class="create-fault">
    <h2>新建故障</h2>
    <el-form :model="faultForm" label-width="100px">
      <el-form-item label="故障简述">
        <el-input type="textarea" v-model="faultForm.desc" autosize></el-input>
      </el-form-item>  
      <div class="form-item-container">
      <el-form-item label="故障等级" >
        <el-select v-model="faultForm.level" placeholder="请选择故障等级" class="custom-select">
          <el-option label="低" value="低"></el-option>
          <el-option label="中" value="中"></el-option>
          <el-option label="高" value="高"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="初始状态">
        <el-select v-model="faultForm.initialStatus" placeholder="请选择初始状态" class="custom-select">
          <el-option label="未处理" value="未处理" ></el-option>
          <el-option label="处理中" value="处理中" ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="故障影响">
        <el-input type="textarea" v-model="faultForm.impact" autosize></el-input>
    </el-form-item>
    </div>

    </el-form>

    <h3>故障处理时间线</h3>
    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in faultForm.timeline"
        :key="index"
      >
        
        <div class="timeline-timestamp" v-if="editingTimestampIndex !== index">
          <span @click="startEditingTimestamp(index, activity)">{{ formatTimestamp(activity.timestamp) }}</span>
        </div>
        
        <el-date-picker
          v-else
          v-model="editingTimestamp"
          type="datetime"
          placeholder="选择日期时间"
          format="YYYY年MM月DD日 HH:mm:ss"
          value-format="YYYY-MM-DDTHH:mm:ss"
          @change="saveEditingTimestamp(activity, index)"
          @clear="cancelEditingTimestamp"
          @blur="cancelEditingTimestamp"
          @close="cancelEditingTimestamp"
        />

        <div class="timeline-content">
         
          <md-editor v-if="editingIndex === index" v-model="editingContent" />
          <MdPreview v-else :modelValue="activity.content" />
        </div>
        <div class="timeline-actions">
          <el-button v-if="editingIndex !== index" type="primary" size="small" @click="startEditing(index, activity)">编辑</el-button>
          <el-button v-else type="success" size="small" @click="saveEditing(index)">保存</el-button>
          <el-button v-if="editingIndex !== index" type="danger" size="small" @click="removeActivity(index)">删除</el-button>
          <el-button v-else type="info" size="small" @click="cancelEditing">取消</el-button>
        </div>
      </el-timeline-item>
    </el-timeline>

    <el-form :model="newActivity" label-width="100px">
      <el-form-item label="时间">
        <el-date-picker
          v-model="newActivity.timestamp"
          type="datetime"
          placeholder="选择日期时间"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="处理内容">
        <!-- <div class="custom-md-editor"> -->
          <md-editor v-model="newActivity.content" preview-theme="light"  />
        <!-- </div> -->
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addActivity">添加处理记录</el-button>
      </el-form-item>
    </el-form>
    <el-form :model="faultForm" label-width="100px">
    <h3>改进todo</h3>
      <el-form-item >
        <md-editor v-model="newActivity.content" preview-theme="light"  />
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="submitFault">提交故障</el-button>
  </div>
</template>
 



<script setup>
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
  impact: '',
  description: '',
  initialStatus: '',
  timeline: []

})
const newActivity = ref({
  timestamp: '',
  content: ''
})

// 清理 HTML
const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html)
}

// 添加处理记录
const addActivity = () => {
  if (newActivity.value.timestamp && newActivity.value.content) {
    faultForm.value.timeline.push({
      timestamp: newActivity.value.timestamp,
      content: sanitizeHtml(newActivity.value.content)
    })
    newActivity.value = { timestamp: '', content: '' }
  } else {
    ElMessage.warning('请填写完整的处理记录')
  }
}

// 提交故障
const submitFault = () => {
  if (faultForm.value.name && faultForm.value.initialStatus) {
    console.log('提交故障:', faultForm.value)
    ElMessage.success('故障创建成功')
    router.push('/fault-management')
  } else {
    ElMessage.error('请填写完整的故障信息')
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
  resize: vertical; /* 允许垂直方向调整大小 */
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
  color: #409eff; /* 颜色可以根据需求修改 */
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
  margin-top: 20px;
  display: flex;
  gap: 20px; /* 可选：设置组件之间的间距 */
}

.custom-select {
  width: 200px; /* 设置选择框的宽度 */
}
</style>