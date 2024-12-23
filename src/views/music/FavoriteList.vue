<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCollectionInfo, getMusicById } from "../../api/Music";

type FavoriteItem = {
  id: number; // 收藏ID
  musicName: string; // 歌曲名称
  sentence: string; // 好句
  date: string; // 收藏日期
  festival?: string; // 特殊节日
  thought?: string; // 感想
  imgUrl: string; // 专辑封面
};

const favoriteList = ref<FavoriteItem[]>([]);
const loading = ref(false);
const error = ref("");

async function fetchFavoriteList() {
  loading.value = true;
  error.value = "";
  try {
    const collectionRes = await getCollectionInfo();
    const collections = collectionRes.data.result;

    const promises = collections.map(async (collection: any) => {
      const musicRes = await getMusicById(collection.musicId);
      const music = musicRes.data.result;

      return {
        id: collection.id,
        musicName: music.name,
        sentence: music.sentence,
        date: collection.date,
        festival: collection.festival,
        thought: collection.thought,
        imgUrl: music.imgUrl,
      };
    });

    favoriteList.value = await Promise.all(promises);
  } catch (err) {
    error.value = "加载收藏列表失败，请稍后重试。";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchFavoriteList();
});
</script>

<template>
  <el-main>
    <h1 class="favorite-title">我的收藏歌单</h1>

    <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        closable
        class="error-alert"
    />

    <el-loading v-if="loading" :fullscreen="true" />

    <div v-if="!loading && !error" class="favorite-container">
      <el-row :gutter="20">
        <el-col
            v-for="item in favoriteList"
            :key="item.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
        >
          <el-card
              shadow="always"
              class="favorite-card"
              :header="item.musicName"
          >
            <img :src="item.imgUrl" class="album-cover" alt="专辑封面" />
            <p class="favorite-sentence">{{ item.sentence }}</p>
            <p class="favorite-date">收藏日期：{{ item.date }}</p>
            <p v-if="item.festival" class="favorite-festival">
              节日：{{ item.festival }}
            </p>
            <p v-if="item.thought" class="favorite-thought">
              感想：{{ item.thought }}
            </p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-main>
</template>

<style scoped>
.favorite-title {
  text-align: center;
  margin: 20px 0;
}

.favorite-container {
  padding: 20px;
}

.favorite-card {
  margin-bottom: 20px;
}

.album-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin-bottom: 10px;
}

.favorite-sentence,
.favorite-date,
.favorite-festival,
.favorite-thought {
  margin: 5px 0;
}
</style>