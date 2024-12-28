<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { UserFilled } from "@element-plus/icons-vue";
import {userInfo} from '../api/user.ts'
import { parseTime} from "../utils";
// 定义 props 和 emits
const props = defineProps({
  drawer: Boolean // 由父组件传入的控制状态
});

const emit = defineEmits(['update:drawer']); // 定义事件发射，用于同步状态
const name = ref('')
const tel = ref('')
const regTime = ref()

// getUserInfo()

function getUserInfo() {
  userInfo().then(res => {
    name.value = res.data.result.name
    tel.value = res.data.result.phone
    regTime.value = parseTime(res.data.result.createTime)
  })
}
// 本地状态控制 `el-drawer`
const localDrawer = ref(false);

// 监听 props 的变化，同步到本地状态
watch(() => props.drawer, (newVal) => {
  localDrawer.value = newVal;
});

// 当本地状态关闭时通知父组件更新状态
watch(localDrawer, (newVal) => {
  if (!newVal) {
    emit('update:drawer', false); // 通知父组件关闭抽屉
  }
});
</script>

<template>
  <el-drawer
      v-model="localDrawer"
      title="我的信息"
      :direction="'ltr'"
  >
    <div class="avatar-area">
      <el-avatar :icon="UserFilled" :size="80">
      </el-avatar>
      <span class="avatar-text"> 欢迎您，{{ }}</span>
    </div>

    <el-divider></el-divider>
    <el-descriptions
        :column="1"
        border
        title="我的信息"
    >
      <el-descriptions-item label="账号电话">
        {{ tel }}
      </el-descriptions-item>
      <el-descriptions-item label="注册时间">
        {{ regTime }}
      </el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>



<style scoped>

.error-warn {
  color: red;
}

.error-warn-input {
  --el-input-focus-border-color: red;
}

.main-container {
  display: flex;
  flex-direction: row;
  padding: 15px;
  gap: 5px;
  justify-content: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.change-card {
  width: 66%;
}

.avatar-area {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 30px;
}

.avatar-text {
  font-size: x-large;
  font-weight: bolder;
  padding-right: 40px;
  color:#2a5caa;
}


</style>
