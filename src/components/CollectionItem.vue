<script setup lang="ts">
import {ref} from "vue"
import {getCollectionById} from "../api/Music.ts"
// 使用props接收父界面传来的数据
const props = defineProps({
  collectionId: {
    type: Number,
    required: true
  }
})


const name = ref('')
const imgUrl = ref('')
const date = ref('')
const sentence = ref('')
const festival = ref('')
const thought = ref('')

getCollectionById(props.collectionId).then(res => {
  name.value = res.data.result.name
  imgUrl.value = res.data.result.imgUrl
  date.value = res.data.result.date
  sentence.value = res.data.result.sentence
  festival.value = res.data.result.festival
  thought.value = res.data.result.thought

})
</script>

<template>
  <el-card
      shadow="always"
      class="favorite-card"
      :header="name"
  >
    <img :src="imgUrl" class="album-cover" alt="专辑封面" />
    <p class="favorite-sentence">{{ sentence }}</p>
    <p class="favorite-date">收藏日期：{{ date }}</p>
    <p v-if="festival" class="favorite-festival">
      节日：{{ festival }}
    </p>
    <p v-if="thought" class="favorite-thought">
      感想：{{ thought }}
    </p>
  </el-card>
</template>

<style scoped>

</style>