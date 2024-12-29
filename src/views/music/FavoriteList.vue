<script setup lang="ts">
import { ref } from "vue";
import { getCollectionInfo } from "../../api/music.ts";
import CollectionItem from "../../components/CollectionItem.vue";
// 定义响应式变量 collectionList
const collectionList = ref([]);
// 获取数据并赋值
getCollectionInfo().then(res => {
  console.log(res); // 确保此处输出了期望的结果
  collectionList.value = res.data; // 假设 res.data 是一个数组
});
</script>
<template>
  <el-main class="paper-list-page">
    <el-header class="custom-header" height="20">
      <router-link to="/MusicPlayer" v-slot="{ navigate }">
        <el-text @click="navigate" class="text">
          ♪继续听歌♪
        </el-text>
      </router-link>
    </el-header>

    <div class="paper-list">
      <CollectionItem
          v-for="collectionVO in collectionList"
          :collectionId="collectionVO.id"
          :key="collectionVO.id"
      />
    </div>
  </el-main>
</template>
<style scoped>
.paper-list-page {
  background-image: url("../../../public/images/background.jpeg");
  background-size: cover; /* 背景图片覆盖整个容器 */
  background-position: center; /* 居中对齐背景 */
  padding: 20px;
  align-items: center;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 增加垂直滚动条 */
  height: calc(100vh - 60px); /* 设置最大高度，确保出现滚动条 */

  /* 添加高斯模糊效果 */
  position: relative;
  isolation: isolate; /* 确保 backdrop-filter 只作用于当前容器 */
}

.paper-list-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw; /* 遮罩层宽度覆盖整个视口 */
  height: 100vh; /* 遮罩层高度覆盖整个视口 */
  background: rgba(53, 50, 50, 0.2); /* 半透明白色遮罩 */
  backdrop-filter: blur(10px); /* 高斯模糊 */
  z-index: -1; /* 置于背景图片上方但低于内容 */
}

.custom-header {
  padding: 15px;
  text-align: center;
  z-index: 1; /* 确保内容高于背景模糊层 */
}

.text {
  font-size: 20px; /* 增大字体 */
  font-weight: bold;
  color: #445f83; /* 深蓝色 */
  text-decoration: underline; /* 添加下划线 */
  cursor: pointer;
}

.text:hover {
  color: #e6e5db; /* 悬停时的颜色变化 */
}



</style>