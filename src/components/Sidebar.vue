<template>
  <div class="sidebar" :class="{ collapsed: isCollapse }">
    <div class="logo" v-if="!isCollapse">
      <img src="https://img2.jacocdn.com/orj1080/b3801005la1hqx1tvnz2wj20m70g1t98.jpg" alt="Logo" />
      <span class="title">故障管理平台</span>
    </div>

    <el-menu
      default-active="/"
      class="el-menu-vertical"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
      router
      unique-opened
      :collapse-transition="false"
    >
      <el-menu-item index="/">
        <el-icon><icon-menu /></el-icon>
        <template #title>Dashboard</template>
      </el-menu-item>
      <el-menu-item index="/fault-management">
        <el-icon><icon-tools /></el-icon>
        <template #title>故障管理</template>
      </el-menu-item>
    </el-menu>

    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon v-if="isCollapse"><icon-arrow-right /></el-icon>
      <el-icon v-else><icon-arrow-left /></el-icon>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import {
  Menu as IconMenu,
  User as IconUser,
  Tools as IconTools,
  ArrowRight as IconArrowRight,
  ArrowLeft as IconArrowLeft,
} from '@element-plus/icons-vue';
import router from '@/router'; // 导入 router 实例

export default {
  components: {
    IconMenu,
    IconUser,
    IconTools,
    IconArrowRight,
    IconArrowLeft,
  },
  setup(props, { emit }) {
    const isCollapse = ref(false);

    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value;
      emit('collapse', isCollapse.value);
    };

    const handleOpen = (key, keyPath) => {
      console.log('Menu Opened:', key, keyPath);
    };

    const handleClose = (key, keyPath) => {
      console.log('Menu Closed:', key, keyPath);
    };

    return {
      isCollapse,
      toggleCollapse,
      handleOpen,
      handleClose,
    };
  },
};
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  width: 200px;
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2c3e50;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.logo img {
  width: 30px;
  margin-right: 10px;
}

.el-menu-vertical {
  border-right: none;
}

.collapse-btn {
  margin-top: auto;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #f4f4f5;
  transition: background-color 0.3s;
}

.collapse-btn:hover {
  background-color: #e6e8eb;
}

.el-menu-item.is-active {
  background-color: #ecf5ff;
}

.el-menu-item:hover {
  background-color: #f5f7fa;
}

.sidebar.collapsed .collapse-btn {
  justify-content: flex-end;
  padding-right: 20px;
}
</style>