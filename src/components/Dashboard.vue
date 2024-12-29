<script setup lang="ts">
import {ref, watch, defineProps, defineEmits, computed} from 'vue';
import { UserFilled } from "@element-plus/icons-vue";
import {userInfo, userInfoUpdate} from '../api/user.ts'
import { parseTime} from "../utils";
import {router} from "../router";

const props = defineProps({
  drawer: Boolean // 由父组件传入的控制状态
});

const emit = defineEmits(['update:drawer']);
const name = ref('')
const tel = ref('')
const regTime = ref()
const password = ref('')
const confirmPassword = ref('')
const hasConfirmPasswordInput = computed(() => confirmPassword.value != '')
const isPasswordIdentical = computed(() => password.value == confirmPassword.value)
const changeDisabled = computed(() => {
  return !(hasConfirmPasswordInput.value && isPasswordIdentical.value)
})

getUserInfo()

function getUserInfo() {
  userInfo().then(res => {
    console.log(res)
    name.value = res.data.result.name
    tel.value = res.data.result.phone
    regTime.value = parseTime(res.data.result.createTime)
  })
}

const localDrawer = ref(false);

watch(() => props.drawer, (newVal) => {
  localDrawer.value = newVal;
});

watch(localDrawer, (newVal) => {
  if (!newVal) {
    emit('update:drawer', false);
  }
});

function updatePassword() {
  userInfoUpdate({
    name: undefined,
    password: password.value,
    address: undefined
  }).then(res => {
    if (res.data.code === '000') {
      password.value = ''
      confirmPassword.value = ''
      ElMessageBox.alert(
          `请重新登录`,
          '修改成功',
          {
            customClass: "customDialog",
            confirmButtonText: '跳转到登录',
            type: "success",
            showClose: false,
            roundButton: true,
            center: true
          }).then(() => router.push({path: "/login"}))
    } else if (res.data.code === '400') {
      ElMessage({
        customClass: 'customMessage',
        type: 'error',
        message: res.data.msg,
      })
      password.value = ''
      confirmPassword.value = ''
    }
  })
}
</script>

<template>
  <el-drawer
      v-model="localDrawer"
      title="我的信息"
      class="custom-drawer"
      :direction="'ltr'"
      :show-close="false" >  <!-- 去除叉号 -->
  <div class="avatar-area">
    <el-avatar :icon="UserFilled" :size="80"></el-avatar>
    <span class="avatar-text"> 欢迎您，{{name }}</span>
  </div>
  <el-divider></el-divider>
  <el-descriptions
      :column="1"
      border
      title="我的信息"
      class="custom-descriptions"
  >
    <el-descriptions-item label="账号电话">{{ tel }}</el-descriptions-item>
    <el-descriptions-item label="注册时间">{{ regTime }}</el-descriptions-item>
  </el-descriptions>
  <el-divider></el-divider>
  <el-form>
    <el-form-item>
      <label for="password">密码</label>
      <el-input type="password" id="password" v-model="password" placeholder="•••••••••" required/>
    </el-form-item>
    <el-form-item>
      <label v-if="!hasConfirmPasswordInput" for="confirm_password">确认密码</label>
      <label v-else-if="!isPasswordIdentical" for="confirm_password" class="error-warn">密码不一致</label>
      <label v-else for="confirm_password">确认密码</label>

      <el-input type="password" id="confirm_password" v-model="confirmPassword"
                :class="{'error-warn-input' :(hasConfirmPasswordInput && !isPasswordIdentical)}"
                placeholder="•••••••••" required/>
    </el-form-item>
  </el-form>

  <div class="card-header">
    <span>修改密码</span>
    <el-button @click="updatePassword" :disabled="changeDisabled">修改密码</el-button>
  </div>
  </el-drawer>
</template>


<style scoped>
/* Drawer 样式 */
/deep/.el-drawer.ltr {
  background: #6aabc5;
}


/* 隐藏 Drawer 头部 */
.el-drawer__header {
  display: none !important; /* 隐藏标题栏 */
}

/* 修改字体颜色 */
.avatar-text {
  font-size: x-large !important;
  font-weight: bolder !important;
  padding-right: 40px !important;
  color: #254063 !important; /* 偏灰的深蓝色 */
}

/* 弱化线条，修改表格描述的样式 */
.custom-descriptions .el-descriptions__item {
  border: none !important; /* 去除边框 */
}

.el-divider {
  margin: 15px 0 !important;
}

/* 表单项标签颜色 */
.el-form label {
  color: #113c71 !important; /* 偏灰的深蓝色 */
}

/* 修改按钮样式 */
.card-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.card-header el-button {
  background-color: #2a5caa !important;
  color: white !important;
  border: none !important;
  transition: background-color 0.3s !important;
}

.card-header el-button:hover {
  background-color: #1a4d80 !important;
}

.avatar-area {
  display: flex !important;
  justify-content: space-around !important;
  align-items: center !important;
  gap: 30px !important;
}

.error-warn {
  color: red !important;
}

.error-warn-input {
  --el-input-focus-border-color: red !important;
}
</style>
