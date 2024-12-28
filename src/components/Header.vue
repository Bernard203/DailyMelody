<script setup lang="ts">
import { computed, ref } from "vue";
import { ElButton, ElDialog, ElTag, ElMessage, ElMessageBox } from 'element-plus';
import { router } from '../router';
import { SwitchButton,User } from "@element-plus/icons-vue"; // 图标

// 控制弹窗显示与隐藏的状态
const dialogVisible = ref(false);

// 用户信息

const role = ref<string | null>(sessionStorage.getItem('role'));
const token = sessionStorage.getItem('token') as string;
const name = sessionStorage.getItem('name') as string;


// 退出登录
function logout() {
  ElMessageBox.confirm(
      '是否要退出登录？',
      '提示',
      {
        customClass: "customDialog",
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: "warning",
        showClose: false,
        roundButton: true,
        center: true
      }
  ).then(() => {
    sessionStorage.clear();
    router.push({ path: "/login" });
  });
}

</script>
<template>
  <body>
  <el-header class="custom-header" height="20">
    <el-row :gutter="20">

      <el-col :span="4" class="header-icon">
        <router-link to="/search" class="no-link">
          <h1 class="header-text">Linked Papers</h1>
        </router-link>
      </el-col>

      <el-col :span="12"></el-col>

      <h3 class="hello-text">今天好，{{ name }}</h3>

      <el-col :span="1" class="header-icon">
        <a @click="logout">
          <el-icon :size="35" color="white">
            <User />
          </el-icon>
        </a>
      </el-col>
      <el-col :span="1" class="header-icon">
        <a @click="logout">
          <el-icon :size="35" color="white">
            <SwitchButton />
          </el-icon>
        </a>
      </el-col>

    </el-row>
  </el-header>
  </body>
</template>
<style scoped>
body {
  height: 66px;
  background-color: #2a5caa;
}

.no-link {
  text-decoration: none;
}

.header-text {
  color: white;
  font-size: x-large;
  min-width: max-content;
  margin-top: 15px;
  margin-bottom: 15px;
}

.hello-text {
  color: white;
  margin-top: 20px;
  margin-bottom: 15px;
}

.header-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.link {
  margin-left: 10px;
  color: white;
  font-size: large;
  cursor: pointer;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}
/* 按钮颜色 */
.pay-button {
  background-color: #5482b3;
  border-color: #235180;
  color: white;
}

.cancel-button {
  background-color: #ffffff;
  border-color: #dcdfe6;
  color: #526c88;
}

</style>

