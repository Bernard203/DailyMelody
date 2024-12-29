<script setup lang="ts">
import { ref } from "vue";
import { getCollectionById } from "../api/music.ts";
import {router} from "../router";
// 使用props接收父界面传来的数据
const props = defineProps({
  collectionId: {
    type: Number,
    required: true
  }
});


console.log(props.collectionId);
const musicId = ref(0)
const name = ref('歌名');
const imgUrl = ref('/images/background.jpeg');
const date = ref('2024-12-29');
const sentence = ref('你的未来晴空万里');
const festival = ref('好耶');
const thought = ref('我没什么想说的');
const weather = ref('晴天');
const sunrise = ref('07:29');
const sunset = ref('16:29');
function toMusicDetailPage(musicId: Number) {
  router.push("/musicDetail/" + musicId)
}
getCollectionById(props.collectionId).then(res => {
  console.log(res)
  name.value = res.data.musicName;
  imgUrl.value = res.data.imgUrl;
  date.value = res.data.date;
  sentence.value = res.data.sentence;
  festival.value = res.data.festival|| "普通的一天";
  thought.value = res.data.thought || "那天你没有记录感想哦"; // 缺省值
  weather.value = res.data.weather;
});
</script>
<template>
  <el-card
      class="collection-item-card"
      :body-style="{ padding: '0px' }"
      shadow="hover"
  >
    <div class="card-content">
      <img :src="imgUrl" class="album-cover" alt="专辑封面" />
      <div class="card-details">
        <div class="card-row">
          <p   @click="toMusicDetailPage(musicId + 1)"
              class="title"> 歌名 - {{ name }}</p>
          <p class="date">{{ date }}</p>
        </div>
        <p class="song-name">那日好句 - {{ sentence }}</p>
        <div class="card-row">
          <p class="weather">天气 - {{ weather }}</p>
          <p class="temperature">日升 - {{ sunrise }}</p>
          <p class="humidity">日落 - {{ sunset }}</p>
          <p v-if="festival" class="festival">节日 - {{ festival }}</p>
        </div>
        <p class="thought">感想 - {{ thought }}</p>
      </div>
    </div>
  </el-card>
</template>
<style scoped>

.collection-item-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 900px;
  height: 220px; /* 卡片高度适中 */
  margin: 40px;
  padding: 10px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5));
  border: 2px solid #ffffff; /* 白色边框 */
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collection-item-card:hover {
  transform: translateY(-1px); /* 悬浮时向上移动 */
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.card-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
}

.album-cover {
  width: 220px; /* 严格控制图片大小 */
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px; /* 图片和文字之间的间距 */
}

.card-details {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.card-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1px;
  color: #2f4a75; /* 深蓝色字体 */

}

.title {
  font-size: 22px; /* 放大歌名 */
  font-weight: bold;
  color: #2e4770; /* 深蓝色字体 */
  margin-bottom: 10px;
  text-decoration: underline; /* 添加下划线 */
}

.song-name, .temperature, .humidity, .weather, .festival, .thought {
  font-size: 16px;
  color: #2f4a75; /* 深蓝色字体 */
}

.date {
  font-size: 16px;
  color: #354f78; /* 深蓝色字体 */
}
.song-name {

}



.temperature, .humidity, .weather, .festival {
  font-size: 14px;
  color: #415b8e;
  margin-right: 30px; /* 增加温度、湿度、天气等属性之间的间距 */
}

.thought {
  margin-top: 15px;
  font-size: 16px;
}

.thought::before {

}

</style>