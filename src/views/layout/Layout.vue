<template>
  <div class="layout" :style="backgroundStyle">
    <div class="overlay"></div>
    <main class="main-content">
      <!-- 左侧主要内容区域 -->
      <div class="content-area">
        <router-view></router-view>
      </div>

      <!-- 右侧音乐播放控制区域 -->
      <div class="music-player">
        <!-- 音乐封面/插图 -->
        <div class="cover-art" :class="{ 'is-playing': isPlaying }">
          <img :src="currentSong.cover" alt="封面" class="cover-image">
        </div>

        <!-- 播放控制区域 -->
        <div class="player-controls">
          <!-- 音乐信息 -->
          <div class="song-info">
            <h3 class="song-title">{{ currentSong.title }}</h3>
            <p class="artist">{{ currentSong.artist }}</p>
          </div>

          <!-- 歌词显示区域 -->
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

          <!-- 进度条 -->
          <div class="progress-bar" @click="seek">
            <div class="progress" :style="{ width: progress + '%' }"></div>
            <span class="time">{{ formatTime(currentTime) }}/{{ formatTime(duration) }}</span>
          </div>

          <!-- 播放控制按钮 -->
          <div class="control-buttons">
            <button class="play-button" @click="togglePlay">
              {{ isPlaying ? '暂停' : '播放' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧鸡汤语录 -->
      <div class="quote-container">
        <p class="quote">{{ currentQuote }}</p>
      </div>
    </main>

    <!-- 音频元素 -->
    <audio
        ref="audioPlayer"
        :src="currentSong.url"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
    ></audio>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed} from 'vue'

interface Lyric {
  time: number
  text: string
}

export default defineComponent({
  name: 'Layout',
  setup() {
    const audioPlayer = ref<HTMLAudioElement | null>(null)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)
    const currentLyricIndex = ref(0)
    const currentQuote = ref('简单恣意的人生了吗')

    const currentSong = ref({
      url: '',  // MP3文件URL
      cover: '', // 封面图片URL
      title: '空飛ぶ猫',
      artist: 'ナナツカゼ',
      lyrics: '' // LRC歌词文件内容
    })

    // 解析LRC歌词
    const parsedLyrics = computed(() => {
      // 这里添加歌词解析逻辑
      return [] as Lyric[]
    })

    // 计算进度百分比
    const progress = computed(() => {
      return (currentTime.value / duration.value) * 100 || 0
    })

    // 背景样式
    const backgroundStyle = computed(() => ({
      backgroundImage: `url(${currentSong.value.cover})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }))

    // 播放/暂停切换
    const togglePlay = () => {
      if (!audioPlayer.value) return
      if (isPlaying.value) {
        audioPlayer.value.pause()
      } else {
        audioPlayer.value.play()
      }
      isPlaying.value = !isPlaying.value
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

    return {
      audioPlayer,
      isPlaying,
      currentTime,
      duration,
      progress,
      currentSong,
      currentLyricIndex,
      parsedLyrics,
      currentQuote,
      backgroundStyle,
      togglePlay,
      onTimeUpdate,
      onLoadedMetadata,
      onEnded,
      seek,
      formatTime
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
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.main-content {
  position: relative;
  display: flex;
  height: 100vh;
  padding: 20px;
  z-index: 1;
}

.cover-art {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
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

.quote-container {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  text-align: center;
}

.quote {
  font-style: italic;
  line-height: 1.5;
}

/* 保留之前的样式并添加以下内容 */
.music-player {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.control-buttons button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  font-size: 1.2em;
}

/* 其他样式保持不变... */
</style>