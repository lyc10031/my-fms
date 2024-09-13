<template>
    <div class="fault-management">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入搜索内容"
          class="search-input"
        ></el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="success" @click="navigateToCreateFault">新建</el-button>
      </div>
      
    <el-table :data="filteredTableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="180"></el-table-column>
      <el-table-column prop="name" label="故障名称" width="180"></el-table-column>
      <el-table-column prop="status" label="状态"></el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新建故障" width="30%">
      <el-form :model="newFault" label-width="80px">
        <el-form-item label="故障名称">
          <el-input v-model="newFault.name"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="newFault.status" placeholder="请选择状态">
            <el-option label="未处理" value="未处理"></el-option>
            <el-option label="处理中" value="处理中"></el-option>
            <el-option label="已解决" value="已解决"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createFault">确定</el-button>
        </span>
      </template>
    </el-dialog>
    </div>
  </template>
  

<script>

import router from '@/router'; // 导入 router 实例

export default {
  name: 'fault-management',
  setup() {
    const router = useRouter() // 初始化 router
    const searchQuery = ref('')
    const tableData = ref([
      { id: 1, name: '故障1', status: '已解决' },
      { id: 2, name: '故障2', status: '处理中' },
      { id: 3, name: '故障3', status: '未处理' },
    ])
    const dialogVisible = ref(false)
    const newFault = ref({
      name: '',
      status: ''
    })

    const filteredTableData = computed(() => {
      if (!searchQuery.value) return tableData.value
      return tableData.value.filter(item => 
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const handleSearch = () => {
      // 搜索逻辑已通过 computed 属性实现
      console.log('搜索:', searchQuery.value)
    }

    const navigateToCreateFault = () => {
      console.log("新建故障")
      router.push('/create-fault')
    }

    const createFault = () => {
      if (newFault.value.name && newFault.value.status) {
        const newId = Math.max(...tableData.value.map(f => f.id)) + 1
        tableData.value.push({
          id: newId,
          name: newFault.value.name,
          status: newFault.value.status
        })
        dialogVisible.value = false
        newFault.value = { name: '', status: '' }
        ElMessage.success('故障创建成功')
      } else {
        ElMessage.error('请填写完整的故障信息')
      }
    }

    const handleView = (row) => {
      // 实现查看逻辑
      console.log('查看故障:', row)
      // 这里可以添加导航到详情页的逻辑，例如：
      // router.push({ name: 'FaultDetail', params: { id: row.id } })
    }

    return {
      searchQuery,
      tableData,
      filteredTableData,
      dialogVisible,
      newFault,
      handleSearch,
      createFault,
      handleView,
      navigateToCreateFault
    }
  }
}
</script>

<style scoped>
.fault-management {
  padding: 20px;
}

.search-bar {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
  margin-right: 10px;
}
</style>