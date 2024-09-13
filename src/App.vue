<template>
  <el-container class="layout-container-demo" style="height: 100vh">
    <el-aside :width="sidebarWidth">
      <Sidebar @collapse="handleSidebarCollapse" />
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          <img src="https://img2.jacocdn.com/orj1080/b3801005la1hqx1tvnz2wj20m70g1t98.jpg" alt="Logo" class="header-logo">
          <span class="header-title">故障管理平台</span>
        </div>
        <div class="header-right">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
              Admin <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">个人信息</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 异步加载 Sidebar 组件
const Sidebar = defineAsyncComponent(() => import('@/components/Sidebar.vue'))

const sidebarWidth = ref('200px')
const route = useRoute()
const router = useRouter()

const handleSidebarCollapse = (isCollapsed) => {
  sidebarWidth.value = isCollapsed ? '64px' : '200px'
}

const currentRoute = computed(() => {
  return route.meta.title || route.name || '当前页面'
})

const handleLogout = () => {
  // 这里应该添加实际的登出逻辑
  ElMessage.success('登出成功')
  router.push('/login')
}

const handleProfile = () => {
  router.push('/profile')
}
</script>


<style>
.layout-container-demo .el-header {
  position: relative;
  background-color: #fff;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-logo {
  height: 40px;
  margin-right: 10px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}
.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 20px;
}

.el-dropdown-link .el-avatar {
  margin-right: 8px;
}

.el-breadcrumb {
  margin-right: 20px;
}

.layout-container-demo .el-main {
  padding: 20px;
  background-color: #f0f2f5;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .header-title {
    font-size: 16px;
  }

  .el-breadcrumb {
    display: none;
  }

  .header-right {
    flex-direction: column;
    align-items: flex-end;
  }

  .el-dropdown-link {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>