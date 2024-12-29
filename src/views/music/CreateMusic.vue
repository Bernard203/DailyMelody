<script setup lang="ts">
import { computed, ref } from 'vue'
import { router } from '../../router'
import { Back, UploadFilled } from "@element-plus/icons-vue"
import { createMusic } from '../../api/music.ts'
import { uploadImage } from "../../api/tools.ts"

// 输入框值（需要前端阻拦不合法输入）
const name = ref('')
const sentence = ref('')
const musicUrl = ref('')
const lrcUrl = ref('')
const imgUrl = ref('')
const keyword = ref('')

const imageFileList = ref([]) // 图片文件列表
const musicFileList = ref([]) // 音乐文件列表
const lrcFileList = ref([]) // 歌词文件列表

const hasNameInput = computed(() => name.value != '')
const hasSentenceInput = computed(() => sentence.value != '')
const hasMp3File = computed(() => musicUrl.value != '')
const hasLrcFile = computed(() => lrcUrl.value != '')
const hasImageFile = computed(() => imgUrl.value != '')
const createDisabled = computed(() => {
  return !(hasNameInput.value && hasSentenceInput.value &&
      hasMp3File.value && hasLrcFile.value && hasImageFile.value)
})

// 创建歌曲按钮触发
function handleCreateMusic() {
  console.log("222")
  const payload = {
    name: name.value,
    sentence: sentence.value,
    musicUrl: musicUrl.value,
    lrcUrl: lrcUrl.value,
    imgUrl: imgUrl.value,
    keyword: keyword.value,
  };
  createMusic(payload).then(res => {
    console.log(res)
    if (res.status == 200) {
      ElMessage({
        message: '添加音乐成功！',
        type: 'success',
        center: true,
      })
      name.value = ''
      sentence.value = ''
      lrcUrl.value = ''
      imgUrl.value = ''
      musicUrl.value = ''
      keyword.value = ''
      imageFileList.value.splice(0)
      musicFileList.value.splice(0)
      lrcFileList.value.splice(0)
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
}

function handleImgChange(file: any, fileList: any) {
  imageFileList.value = fileList
  let formData = new FormData()
  formData.append('file', file.raw)
  uploadImage(formData).then(res => {
    imgUrl.value = res.data.result
    console.log(res.data)
  })
}

function handleMusicChange(file: any, fileList: any) {
  musicFileList.value = fileList
  let formData = new FormData()
  formData.append('file', file.raw)
  uploadImage(formData).then(res => {
    musicUrl.value = res.data.result
    console.log(res.data)
  })
}

function handleLrcChange(file: any, fileList: any) {
  lrcFileList.value = fileList
  let formData = new FormData()
  formData.append('file', file.raw)
  uploadImage(formData).then(res => {
    lrcUrl.value = res.data.result
    console.log(res.data)
  })
}

function handleExceed() {
  ElMessage.warning(`当前限制选择 1 个文件`);
}

function uploadHttpRequest() {
  return new XMLHttpRequest()
}

function toBackPage() {
  router.push("/MusicPlayer")
}
</script>

<template>
  <el-main>
    <el-button @click="toBackPage()" type="primary" circle plain>
      <el-icon><Back/></el-icon>
    </el-button>

    <h1 class="create-store-title">新建音乐</h1>

    <el-form label-position="left" label-width="90px" size="large" class="create-store-form">

      <el-form-item label="歌名">
        <el-input id="name" v-model="name" required placeholder="请输入歌名"/>
      </el-form-item>

      <el-form-item label="关键词">
        <el-input id="keyword" v-model="keyword" required placeholder="请输入关键词"/>
      </el-form-item>

      <el-form-item label="对应好句">
        <el-input id="location" v-model="sentence" required placeholder="对应好句"/>
      </el-form-item>

      <el-form-item label="歌曲封面">
        <el-upload
            v-model:file-list="imageFileList"
            :limit="1"
            :on-change="handleImgChange"
            :on-exceed="handleExceed"
            :on-remove="handleImgChange"
            class="upload-demo"
            list-type="picture"
            :http-request="uploadHttpRequest"
            drag>
          <el-icon class="el-icon--upload">
            <upload-filled/>
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处或单击此处上传。仅允许上传一份文件。
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item label="歌曲文件">
        <el-upload
            v-model:file-list="musicFileList"
            :limit="1"
            :on-change="handleMusicChange"
            :on-exceed="handleExceed"
            :on-remove="handleMusicChange"
            class="upload-demo"
            list-type="picture"
            :http-request="uploadHttpRequest"
            drag>
          <el-icon class="el-icon--upload">
            <upload-filled/>
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处或单击此处上传。仅允许上传一份文件。
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item label="歌词文件">
        <el-upload
            v-model:file-list="lrcFileList"
            :limit="1"
            :on-change="handleLrcChange"
            :on-exceed="handleExceed"
            :on-remove="handleLrcChange"
            class="upload-demo"
            list-type="picture"
            :http-request="uploadHttpRequest"
            drag>
          <el-icon class="el-icon--upload">
            <upload-filled/>
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处或单击此处上传。仅允许上传一份文件。
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button @click.prevent="handleCreateMusic()" :disabled="createDisabled"
                   type="primary" plain>
          创建歌曲
        </el-button>
      </el-form-item>
    </el-form>
  </el-main>
</template>

<style scoped>
.create-store-title {
  margin-left: 25%;
}

.create-store-form {
  margin-left: 25%;
  width: 50%;
}
</style>
