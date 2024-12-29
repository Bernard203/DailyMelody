<template>
  <div class="layout" :style="backgroundStyle">
    <div class="overlay"></div>
    <header class ="header">
      <Dashboard v-model:drawer="drawerVisible" />
      <el-header class="custom-header" height="20">
        <el-row :gutter="20">

          <el-col :span="4" class="header-icon">
          </el-col>

          <el-col :span="12"></el-col>

          <!--          <h3 class="hello-text">今天好，{{ name }}</h3>-->
          <el-col :span="1" class="header-icon">
            <router-link to="/favouriteSongs" v-slot="{navigate}">
              <el-icon @click="navigate" :size="35" color="white" >
                <Document />
              </el-icon>
            </router-link>
          </el-col>
          <el-col :span="1" class="header-icon">
            <el-icon @click="HandleDrawer" :size="35" color="white" >
              <User />
            </el-icon>
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
    </header>
    <main class="main-content">
      <div class="music-player">

        <!-- 左侧封面区域 -->
        <div class="cover-section">
          <div class="cover-art" :class="{ 'is-playing': isPlaying }">
            <img :src="currentSong.imgUrl" alt="封面" class="cover-image">
          </div>
        </div>

        <!-- 右侧控制和语录区域 -->
        <div class="player-controls">
          <div class="song-info">
            <h3 class="song-title">{{ currentSong.name }}</h3>
            <p class="artist">{{ currentSong.sentence }}</p>
          </div>

          <div class="lyrics-container" ref="lyricsContainer">
            <div class="lyrics-wrapper" :style="{ transform: `translateY(${-currentLyricIndex * 24}px)` }">
              <p v-for="(line, index) in parsedLyrics"
                 :key="index"
                 :class="{ 'active': currentLyricIndex === index }"
                 class="lyric-line">
                {{ line.text }}
              </p>
            </div>
          </div>

          <div class="progress-bar" @click="seek">
            <div class="progress" :style="{ width: progress + '%' }"></div>
            <span class="time">{{ formatTime(currentTime) }}/{{ formatTime(duration) }}</span>
          </div>

          <div class="control-buttons">
            <el-input
                v-model="thought"
                placeholder="我的感想"
                class = "favourite">sd</el-input>
            <button class="favorite-button" @click="toggleFavorite" :class="{ 'is-favorite': isFavorite }">
              <span class="heart-icon">♥</span>
            </button>
            <button class="play-button" @click="togglePlay">
              {{ isPlaying ? '||' : '▶' }}
            </button>
          </div>

          <div class="quote-container">
            <p class="quote">{{ currentQuote }}</p>
          </div>
        </div>
      </div>
    </main>

    <audio
        ref="audioPlayer"
        :src="currentSong.musicUrl"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @error="onError"
        preload="auto"
    ></audio>

  </div>
</template>

<script lang="ts">
import Dashboard from '../../components/Dashboard.vue'
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import {addCollection,getMusic} from'../../api/Music.ts'
import {User, Document, SwitchButton, UserFilled} from "@element-plus/icons-vue"
import {router} from "../../router";
interface Lyric {
  time: number
  text: string
}
interface MusicInfo {
  name: string      // 歌名
  sentence: string  // 好句
  musicUrl: string  // mp3
  lrcUrl: string    // 歌词文件
  imgUrl: string    // 专辑封面
  date:string  //时间
  festival:string
}
export default defineComponent({
  name: 'Layout',
  computed: {
    UserFilled() {
      return UserFilled
    }
  },
  components: {Dashboard, SwitchButton,User,Document},
  setup() {
    const drawer = ref()
    const audioPlayer = ref<HTMLAudioElement | null>(null)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)
    const currentLyricIndex = ref(0)
    const quotes = [
      "岁月漫长，然而值得等待",
      "生命的意义不在于活了多久，而在于经历了什么",
      "愿你的未来，既有诗也有远方",
      "把喜欢的事情做好，就是成功"
    ]
    const currentQuote = ref(quotes[Math.floor(Math.random() * quotes.length)])

    const currentSong = ref<MusicInfo>({
      name: '空飛ぶ猫',
      sentence: '岁月漫长，值得等待',
      musicUrl: '/test.mp3',
      lrcUrl: 'images/test.lrc',
      imgUrl: '/test.jpg',
      festival:'初一',
      date:"2014-1"
    })
    getMusicInfo()

    function getMusicInfo() {
      getMusic().then(res => {
        currentSong.value.name = res.data.name;
        currentSong.value.sentence = res.data.sentence;
        currentSong.value.musicUrl = res.data.musicUrl;
        currentSong.value.lrcUrl = "images/test.lrc";
        currentSong.value.imgUrl = res.data.imgUrl;
        currentSong.value.festival = res.data.festival;
        currentSong.value.date = res.data.date;
      })
    }

    // 解析LRC歌词
    const parsedLyrics = computed(async () => {
      const response = await fetch(currentSong.value.lrcUrl)
      console.log(response);
      const lyrics = await response.text()
      const lines = lyrics.split('\n')
      const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
      return lines
          .map(line => {
            const match = timeRegex.exec(line)
            if (!match) return null

            const minutes = parseInt(match[1])
            const seconds = parseInt(match[2])
            const milliseconds = parseInt(match[3])

            const time = minutes * 60 + seconds + milliseconds / 1000
            const text = line.replace(timeRegex, '').trim()

            return { time, text }
          })
          .filter((line): line is Lyric => line !== null)
          .sort((a, b) => a.time - b.time)
    })
    const background = ref('/images/background.jpeg')
    // 计算进度百分比
    const progress = computed(() => {
      return (currentTime.value / duration.value) * 100 || 0
    })

    // 背景样式
    const backgroundStyle = computed(() => ({
      backgroundImage: `url(${background.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }))

    // 播放/暂停切换
    const togglePlay = async () => {
      if (!audioPlayer.value) {
        console.error('找不到音频元素')
        return
      }

      try {
        // 检查音频源是否有效
        if (!currentSong.value.musicUrl) {
          console.error('无效的音频源:', currentSong.value.musicUrl)
          return
        }

        console.log('当前播放状态:', isPlaying.value)
        console.log('音频就绪状态:', audioPlayer.value.readyState)

        if (isPlaying.value) {
          await audioPlayer.value.pause()
          isPlaying.value = false
        } else {
          try {
            await audioPlayer.value.play()
            isPlaying.value = true
          } catch (playError) {
            console.error('播放失败:', playError)
            isPlaying.value = false
          }
        }
      } catch (error) {
        console.error('播放控制错误:', error)
        isPlaying.value = false
      }
    }
    // 时间更新处理
    const onTimeUpdate = () => {
      if (!audioPlayer.value) return
      currentTime.value = audioPlayer.value.currentTime
      updateCurrentLyric()
    }

    // 更新当前歌词
    const updateCurrentLyric = () => {
      const currentTime = audioPlayer.value?.currentTime || 0
      for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
        if (currentTime >= parsedLyrics.value[i].time) {
          currentLyricIndex.value = i
          break
        }
      }
    }

    // 加载元数据
    const onLoadedMetadata = () => {
      if (!audioPlayer.value) return
      duration.value = audioPlayer.value.duration
    }

    // 播放结束处理
    const onEnded = () => {
      if (!audioPlayer.value) return
      audioPlayer.value.currentTime = 0
      audioPlayer.value.play()
    }

    // 进度条跳转
    const seek = (event: MouseEvent) => {
      if (!audioPlayer.value) return
      const progressBar = event.currentTarget as HTMLElement
      const rect = progressBar.getBoundingClientRect()
      const percent = (event.clientX - rect.left) / rect.width
      audioPlayer.value.currentTime = percent * duration.value
    }

    // 格式化时间
    const formatTime = (time: number): string => {
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // 修改音频初始化和错误处理
    const initAudio = () => {
      if (!audioPlayer.value) return

      // 设置初始音频源
      const testAudio = '/test.mp3' // 确保这个文件存在
      currentSong.value = {
        name: '测试音乐',
        sentence: '测试语录',
        musicUrl: testAudio,
        lrcUrl: '/test.lrc',
        imgUrl: '/test.jpg',
        festival:'初一',
        date:"2014-1"
      }

      // 预加载音频
      audioPlayer.value.load()
    }

    onMounted(() => {
      // 确保有初始数据
      currentSong.value = {
        name: '测试音乐',
        sentence: '测试语录',
        musicUrl: '/public/周杰伦 - 安静.flac', // 确保这个文件存在于 public 目录
        lrcUrl: '/test.lrc',
        imgUrl: '/test.jpg',
        festival:'初一',
        date:"2014-1"
      }

      if (audioPlayer.value) {
        // 添加音频事件监听
        audioPlayer.value.addEventListener('canplay', () => {
          console.log('音频可以播放')
        })

        audioPlayer.value.addEventListener('error', (e) => {
          console.error('音频错误:', e)
        })

        // 预加载音频
        audioPlayer.value.load()
      }
    })

    const onError = (error: Event) => {
      console.error('音频加载错误:', error)
      const audioElement = error.target as HTMLAudioElement
      console.error('错误详情:', audioElement.error)
      isPlaying.value = false
    }

    // 添加音频状态监听
    watch(isPlaying, (newValue) => {
      if (!audioPlayer.value) return

      console.log('播放状态改变:', newValue)
      if (newValue) {
        audioPlayer.value.play()
            .catch(error => {
              console.error('播放失败:', error)
              isPlaying.value = false
            })
      } else {
        audioPlayer.value.pause()
      }
    })
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
        sessionStorage.setItem('token', '')
        router.push({path: "/login"})
      })
    }
    // 在 setup 函数中添加收藏相关逻辑
    const isFavorite = ref(false)
    const thought = ref('')
    const toggleFavorite = () => {
      if(!isFavorite.value){
        const payload = {
          musicName:currentSong.value.name,//对应歌ID
          date:currentSong.value.date,//日期
          festival:currentSong.value.festival,//特殊节日（可空）
          thought:thought.value,
          imgUrl:currentSong.value.imgUrl,
        };
        console.log("发了！")
        addCollection(payload).then(res => {
          if (res.data.code === '000') {
            console.log(res);
            thought.value = "您已进行过今日记录";
            isFavorite.value = true;
          } else if (res.data.code === '400') {
            ElMessage({
              message: res.data.msg,
              type: 'error',
              center: true,
            })
          }
        })
      }
    }
    const drawerVisible = ref(false); // 控制抽屉显示状态

    const HandleDrawer = () => {
      drawerVisible.value = true; // 打开抽屉
    };


    return {
      audioPlayer,
      isPlaying,
      currentTime,
      duration,
      progress,
      drawerVisible,
      HandleDrawer,
      currentSong,
      currentLyricIndex,
      parsedLyrics,
      currentQuote,
      backgroundStyle,
      drawer,
      logout,
      togglePlay,
      onTimeUpdate,
      onLoadedMetadata,
      onEnded,
      onError,
      seek,
      User,
      Document,
      SwitchButton,
      initAudio,
      formatTime,
      isFavorite,
      thought,
      toggleFavorite,
      Dashboard
    }
  }
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: #1e90ff;
  color: white;
  position: relative;
  overflow: hidden;
}
.header {
  position: absolute; /* 使header可以从顶部浮动 */
  top: 30px; /* 距离顶部10px */
  left: 0;
  right: 0;
  z-index: 2; /* 确保header在最上层 */
}


.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}


.main-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  padding: 10px;
  z-index: 1;
}

.music-player {
  display: flex;
  align-items: center;
  gap: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  max-width: 800px;
  width: 100%;
}

/* 左侧封面区域 */
.cover-section {
  flex: 0 0 300px;
}

.cover-art {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.1);
  animation: rotate 20s linear infinite;
  animation-play-state: paused;
}
.cover-art.is-playing {
  animation-play-state: running;
}

/* 右侧控制和语录区域 */
.player-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0; /* 防止内容溢出 */
}
.progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #fff;
  border-radius: 3px;
  transition: width 0.1s linear;
  z-index: 1;
}

.time {
  position: absolute;
  right: 0;
  top: -25px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.song-info {
  text-align: left;
}

.song-title {
  font-size: 28px;
  margin: 0;
  color: #fff;
}
.favourite {
  border-radius: 10px;          /* 圆角效果 */
  background-color: rgba(255, 255, 255, 0.5); /* 半透明背景 */
  width: 300px;                 /* 限定宽度 */
  padding: 10px;                /* 内边距 */
  border: 1px solid #ccc;       /* 边框颜色 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 微妙的阴影 */
  transition: background-color 0.3s, border-color 0.3s; /* 平滑过渡效果 */
}

.favourite:focus {
  background-color: rgba(255, 255, 255, 0.8); /* 获得焦点时增加透明度 */
  border-color: #1e90ff;          /* 获得焦点时改变边框颜色 */
  box-shadow: 0 0 8px rgba(30, 144, 255, 0.5); /* 焦点阴影效果 */
}

.artist {
  font-size: 18px;
  opacity: 0.8;
  margin: 5px 0;
}

.quote-container {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  text-align: left;
}

.quote {
  font-size: 16px;
  line-height: 1.6;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  margin: 20px 0;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 20px; /* 按钮之间的间距 */
  margin-top: 20px;
}

.play-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #1e90ff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}
.play-button:hover {
  transform: scale(1.05);
  background: #fff;
}

.cover-art {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.1);
  animation: rotate 20s linear infinite;
  animation-play-state: paused;
}

.cover-art.is-playing {
  animation-play-state: running;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lyrics-container {
  height: 72px; /* 显示3行歌词 */
  overflow: hidden;
  margin: 20px 0;
}

.lyrics-wrapper {
  transition: transform 0.3s ease;
}

.lyric-line {
  height: 24px;
  line-height: 24px;
  text-align: center;
  transition: all 0.3s;
  opacity: 0.5;
}

.lyric-line.active {
  opacity: 1;
  font-size: 1.1em;
}

.favorite-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-button:hover {
  transform: scale(1.05);
  background: #fff;
}

.favorite-button.is-favorite {
  color: #ff4081;
}

.heart-icon {
  display: inline-block;
  transition: transform 0.3s;
}

.favorite-button:hover .heart-icon {
  transform: scale(1.2);
}

.favorite-button.is-favorite .heart-icon {
  animation: heartbeat 1.2s ease-in-out;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
  75% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>