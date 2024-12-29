<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { getMusic } from '../api/music.ts';

const props = defineProps({
  dialog: Boolean, // 由父组件传入的控制状态
});
const emit = defineEmits(['update:dialog']);
const date = ref('2024-12-2');
const festival = ref('');
const weather = ref('晴天');
const temperatureLow = ref('4');
const temperatureHigh = ref('12');
const fx = ref('东北风');
const fl = ref('二级');
const sunrise = ref('07:29');
const sunset = ref('16:29');
getMusic().then(res => {
  console.log(res);
  date.value = res.data.time;
  festival.value = res.data.festival;
  weather.value = res.data.weatherInfo.weather;
  temperatureHigh.value = res.data.weatherInfo.temperatureHigh;
  temperatureLow.value = res.data.weatherInfo.temperatureLow;
  fx.value = res.data.weatherInfo.fx;
  fl.value = res.data.weatherInfo.fl;
  sunrise.value = res.data.weatherInfo.sunrise;
  sunset.value = res.data.weatherInfo.sunset;
});

const localDialog = ref(false);

watch(() => props.dialog, (newVal) => {
  localDialog.value = newVal;
  console.log('dialogVisible变化:', newVal);
});

watch(localDialog, (newVal) => {
  if (!newVal) {
    emit('update:dialog', false);
  }
});
</script>

<template>
  <el-dialog
      v-model="localDialog"
      :show-close="false"
      class="custom-dialog"
  >
    <div class="dialog-content">
      <h3 class="dialog-title">今日情况</h3>
      <div>日期： {{ date }}</div>
      <div v-if="festival">节日：  {{ festival }}</div>
      <div>天气： {{ weather }}</div>
      <div class="horizontal-layout">
        <span>风向：  {{ fx }}</span>
        <span>风级： {{ fl }}</span>
      </div>
      <div class="horizontal-layout">
        <span>日升： {{ sunrise }}</span>
        <span>日落：{{ sunset }}</span>
      </div>
      <div class="horizontal-layout">
        <span>最低温： {{ temperatureLow }}°C</span>
        <span>最高温： {{ temperatureHigh }}%</span>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
/* el-dialog 样式 */
.custom-dialog {
  border-radius: 10px;
  background: linear-gradient(to bottom, rgba(114, 134, 165, 0.6), rgba(216, 205, 192, 0.6));
  padding: 20px;
}

/* 标题样式 */
.dialog-title {
  margin-top: 0px; /* 距离顶端 20px */
  text-align: center; /* 居中显示 */
  color: #f4eded; /* 字体颜色白色 */
  font-weight: bold; /* 加粗 */
  font-size: 28px;
}

/* 内容样式 */
.dialog-content {
  padding: 5px;
  color: #f3ecec; /* 内容字体颜色白色 */
}

.dialog-content > div {
  font-size: 16px; /* 字体大小 16px */
  margin-bottom: 25px; /* 每部分间隔 10px */
}

/* 水平布局样式 */
.horizontal-layout {
  display: flex; /* 使用Flex布局 */
  justify-content: space-between; /* 项目之间水平等间距 */
  align-items: center; /* 垂直居中对齐 */
  font-size: 16px; /* 字体大小 */
  color: #f3ecec; /* 字体颜色白色 */
}
</style>
