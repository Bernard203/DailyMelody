<template>
  <div class="layout" :style="backgroundStyle">
    <div class="overlay"></div>
    <header class ="header">
      <Dashboard v-model:drawer="drawerVisible" />
      <Weather v-model:dialog="dialogVisible" />
      <el-header class="custom-header" height="20">
        <el-row :gutter="20">

          <el-col :span="4" class="header-icon">
          </el-col>

          <el-col :span="12"></el-col>

          <!--          <h3 class="hello-text">今天好，{{ name }}</h3>-->
          <el-col :span="1" class="header-icon">
            <el-icon @click="HandleDialog" :size="35" color="white" >
              <Sunny />
            </el-icon>
          </el-col>
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
          </div>

          <div class="lyrics-container" ref="lyricsContainer">
            <div class="lyrics-wrapper" :style="{ transform: `translateY(${-currentLyricIndex * 40}px)` }">
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
            <p class="quote">{{ currentSong.sentence }}</p>
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
import Weather from '../../components/Weather.vue'
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import {addCollection,getMusic} from '../../api/music.ts'
import {User,Sunny, Document, SwitchButton, UserFilled} from "@element-plus/icons-vue"
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
  components: {Weather, Dashboard, Sunny,SwitchButton,User,Document},
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
      lrcUrl: '[00:00.0]起风了 - 买辣椒也用券\n' +
          '[00:03.87]词：米果\n' +
          '[00:04.41]曲：高桥优\n' +
          '[00:05.29]编曲：池洼浩一 (Kouichi Ikekubo)\n' +
          '[00:06.84]吉他：池洼浩一 (Kouichi Ikekubo)\n' +
          '[00:08.09]贝斯：小岛刚広 (Takehiro Kojima)\n' +
          '[00:09.46]鼓：吉田佳史 (TRICERATOPS) (Yoshifumi Yoshida(TRICERATOPS))\n' +
          '[00:11.34]键盘：平畑彻也 (Tetsuya Hirahata)\n' +
          '[00:12.9]小提琴：须磨和声 (Wasei Suma)\n' +
          '[00:14.3]弦乐：须磨和声/池洼浩一\n' +
          '[00:16.16]录音工程：玉乃井光纪 (Mitsunori Tamanoi) - studioFine\n' +
          '[00:18.05]出品：Negia Entertainment Inc.\n' +
          '[00:19.6]特别支持：中村光雄(Mitsuo Nakamura)\n' +
          '[00:22.01]（未经著作人许可，不得翻唱、翻录或使用）\n' +
          '[00:25.77]这一路上走走停停\n' +
          '[00:29.05]顺着少年漂流的痕迹\n' +
          '[00:32.23]迈出车站的前一刻\n' +
          '[00:35.48]竟有些犹豫\n' +
          '[00:38.59]不禁笑这近乡情怯\n' +
          '[00:41.84]仍无可避免\n' +
          '[00:44.11]而长野的天\n' +
          '[00:45.72]依旧那么暖\n' +
          '[00:47.27]风吹起了从前\n' +
          '[00:49.85]从前初识这世间\n' +
          '[00:52.81]万般流连\n' +
          '[00:54.58]看着天边似在眼前\n' +
          '[00:57.44]也甘愿赴汤蹈火去走它一遍\n' +
          '[01:02.53]如今走过这世间\n' +
          '[01:05.61]万般流连\n' +
          '[01:07.36]翻过岁月不同侧脸\n' +
          '[01:10.3]措不及防闯入你的笑颜\n' +
          '[01:16.18]我曾难自拔于世界之大\n' +
          '[01:20.270004]也沉溺于其中梦话\n' +
          '[01:23.4]不得真假 不做挣扎 不惧笑话\n' +
          '[01:29.05]我曾将青春翻涌成她\n' +
          '[01:32.67]也曾指尖弹出盛夏\n' +
          '[01:35.89]心之所动 且就随缘去吧\n' +
          '[01:41.96]逆着光行走 任风吹雨打\n' +
          '[01:58.78]短短的路走走停停\n' +
          '[02:02.01]也有了几分的距离\n' +
          '[02:05.06]不知抚摸的是故事 还是段心情\n' +
          '[02:11.34]也许期待的不过是 与时间为敌\n' +
          '[02:17.01]再次看到你\n' +
          '[02:18.54001]微凉晨光里\n' +
          '[02:20.12]笑得很甜蜜\n' +
          '[02:22.59]从前初识这世间\n' +
          '[02:25.67]万般流连\n' +
          '[02:27.39]看着天边似在眼前\n' +
          '[02:30.39]也甘愿赴汤蹈火去走它一遍\n' +
          '[02:35.37]如今走过这世间\n' +
          '[02:38.51]万般流连\n' +
          '[02:40.22]翻过岁月不同侧脸\n' +
          '[02:43.18]措不及防闯入你的笑颜\n' +
          '[02:48.99]我曾难自拔于世界之大\n' +
          '[02:53.08]也沉溺于其中梦话\n' +
          '[02:56.23]不得真假 不做挣扎 不惧笑话\n' +
          '[03:01.88]我曾将青春翻涌成她\n' +
          '[03:05.49]也曾指尖弹出盛夏\n' +
          '[03:08.72]心之所动 且就随缘去吧\n' +
          '[03:40.27]晚风吹起你鬓间的白发\n' +
          '[03:44.22]抚平回忆留下的疤\n' +
          '[03:47.43]你的眼中 明暗交杂 一笑生花\n' +
          '[03:53.09]暮色遮住你蹒跚的步伐\n' +
          '[03:57.05]走进床头藏起的画\n' +
          '[04:00.21]画中的你 低着头说话\n' +
          '[04:05.86]我仍感叹于世界之大\n' +
          '[04:09.46]也沉醉于儿时情话\n' +
          '[04:12.74]不剩真假 不做挣扎 无谓笑话\n' +
          '[04:18.67]我终将青春还给了她\n' +
          '[04:22.3]连同指尖弹出的盛夏\n' +
          '[04:25.84]心之所动 就随风去了\n' +
          '[04:31.42]以爱之名 你还愿意吗',
      imgUrl: '/test.jpg',
      festival:'初一',
      date:"2014-1"
    })
    getMusicInfo()
    const musicId = ref(0)
    const sunrise = ref('')
    const sunset = ref('')
    function getMusicInfo() {
      getMusic().then(res => {
        console.log(res);
        currentSong.value.date = res.data.time;
        currentSong.value.name = res.data.musicInfo.name;
        currentSong.value.sentence = res.data.musicInfo.sentence;
        currentSong.value.musicUrl = res.data.musicInfo.musicUrl;
        // currentSong.value.lrcUrl = res.data.musicInfo.lrcUrl;
        currentSong.value.imgUrl = res.data.musicInfo.imgUrl;
        musicId.value = res.data.musicInfo.id;
        sunrise.value = res.data.weatherInfo.sunrise;
        sunset.value = res.data.weatherInfo.sunset;
        currentSong.value.festival = res.data.musicInfo.festival;
      })
    }

    // 解析LRC歌词
    const parsedLyrics = computed(() => {
      console.log(currentSong.value.lrcUrl)
      const lyrics = currentSong.value.lrcUrl
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
        lrcUrl: '[00:00.0]起风了 - 买辣椒也用券\n' +
            '[00:03.87]词：米果\n' +
            '[00:04.41]曲：高桥优\n' +
            '[00:05.29]编曲：池洼浩一 (Kouichi Ikekubo)\n' +
            '[00:06.84]吉他：池洼浩一 (Kouichi Ikekubo)\n' +
            '[00:08.09]贝斯：小岛刚広 (Takehiro Kojima)\n' +
            '[00:09.46]鼓：吉田佳史 (TRICERATOPS) (Yoshifumi Yoshida(TRICERATOPS))\n' +
            '[00:11.34]键盘：平畑彻也 (Tetsuya Hirahata)\n' +
            '[00:12.9]小提琴：须磨和声 (Wasei Suma)\n' +
            '[00:14.3]弦乐：须磨和声/池洼浩一\n' +
            '[00:16.16]录音工程：玉乃井光纪 (Mitsunori Tamanoi) - studioFine\n' +
            '[00:18.05]出品：Negia Entertainment Inc.\n' +
            '[00:19.6]特别支持：中村光雄(Mitsuo Nakamura)\n' +
            '[00:22.01]（未经著作人许可，不得翻唱、翻录或使用）\n' +
            '[00:25.77]这一路上走走停停\n' +
            '[00:29.05]顺着少年漂流的痕迹\n' +
            '[00:32.23]迈出车站的前一刻\n' +
            '[00:35.48]竟有些犹豫\n' +
            '[00:38.59]不禁笑这近乡情怯\n' +
            '[00:41.84]仍无可避免\n' +
            '[00:44.11]而长野的天\n' +
            '[00:45.72]依旧那么暖\n' +
            '[00:47.27]风吹起了从前\n' +
            '[00:49.85]从前初识这世间\n' +
            '[00:52.81]万般流连\n' +
            '[00:54.58]看着天边似在眼前\n' +
            '[00:57.44]也甘愿赴汤蹈火去走它一遍\n' +
            '[01:02.53]如今走过这世间\n' +
            '[01:05.61]万般流连\n' +
            '[01:07.36]翻过岁月不同侧脸\n' +
            '[01:10.3]措不及防闯入你的笑颜\n' +
            '[01:16.18]我曾难自拔于世界之大\n' +
            '[01:20.270004]也沉溺于其中梦话\n' +
            '[01:23.4]不得真假 不做挣扎 不惧笑话\n' +
            '[01:29.05]我曾将青春翻涌成她\n' +
            '[01:32.67]也曾指尖弹出盛夏\n' +
            '[01:35.89]心之所动 且就随缘去吧\n' +
            '[01:41.96]逆着光行走 任风吹雨打\n' +
            '[01:58.78]短短的路走走停停\n' +
            '[02:02.01]也有了几分的距离\n' +
            '[02:05.06]不知抚摸的是故事 还是段心情\n' +
            '[02:11.34]也许期待的不过是 与时间为敌\n' +
            '[02:17.01]再次看到你\n' +
            '[02:18.54001]微凉晨光里\n' +
            '[02:20.12]笑得很甜蜜\n' +
            '[02:22.59]从前初识这世间\n' +
            '[02:25.67]万般流连\n' +
            '[02:27.39]看着天边似在眼前\n' +
            '[02:30.39]也甘愿赴汤蹈火去走它一遍\n' +
            '[02:35.37]如今走过这世间\n' +
            '[02:38.51]万般流连\n' +
            '[02:40.22]翻过岁月不同侧脸\n' +
            '[02:43.18]措不及防闯入你的笑颜\n' +
            '[02:48.99]我曾难自拔于世界之大\n' +
            '[02:53.08]也沉溺于其中梦话\n' +
            '[02:56.23]不得真假 不做挣扎 不惧笑话\n' +
            '[03:01.88]我曾将青春翻涌成她\n' +
            '[03:05.49]也曾指尖弹出盛夏\n' +
            '[03:08.72]心之所动 且就随缘去吧\n' +
            '[03:40.27]晚风吹起你鬓间的白发\n' +
            '[03:44.22]抚平回忆留下的疤\n' +
            '[03:47.43]你的眼中 明暗交杂 一笑生花\n' +
            '[03:53.09]暮色遮住你蹒跚的步伐\n' +
            '[03:57.05]走进床头藏起的画\n' +
            '[04:00.21]画中的你 低着头说话\n' +
            '[04:05.86]我仍感叹于世界之大\n' +
            '[04:09.46]也沉醉于儿时情话\n' +
            '[04:12.74]不剩真假 不做挣扎 无谓笑话\n' +
            '[04:18.67]我终将青春还给了她\n' +
            '[04:22.3]连同指尖弹出的盛夏\n' +
            '[04:25.84]心之所动 就随风去了\n' +
            '[04:31.42]以爱之名 你还愿意吗',
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
        lrcUrl: '[00:00.0]起风了 - 买辣椒也用券\n' +
            '[00:25.77]这一路上走走停停\n' +
            '[00:29.05]顺着少年漂流的痕迹\n' +
            '[00:32.23]迈出车站的前一刻\n' +
            '[00:35.48]竟有些犹豫\n' +
            '[00:38.59]不禁笑这近乡情怯\n' +
            '[00:41.84]仍无可避免\n' +
            '[00:44.11]而长野的天\n' +
            '[00:45.72]依旧那么暖\n' +
            '[00:47.27]风吹起了从前\n' +
            '[00:49.85]从前初识这世间\n' +
            '[00:52.81]万般流连\n' +
            '[00:54.58]看着天边似在眼前\n' +
            '[00:57.44]也甘愿赴汤蹈火去走它一遍\n' +
            '[01:02.53]如今走过这世间\n' +
            '[01:05.61]万般流连\n' +
            '[01:07.36]翻过岁月不同侧脸\n' +
            '[01:10.3]措不及防闯入你的笑颜\n' +
            '[01:16.18]我曾难自拔于世界之大\n' +
            '[01:20.270004]也沉溺于其中梦话\n' +
            '[01:23.4]不得真假 不做挣扎 不惧笑话\n' +
            '[01:29.05]我曾将青春翻涌成她\n' +
            '[01:32.67]也曾指尖弹出盛夏\n' +
            '[01:35.89]心之所动 且就随缘去吧\n' +
            '[01:41.96]逆着光行走 任风吹雨打\n' +
            '[01:58.78]短短的路走走停停\n' +
            '[02:02.01]也有了几分的距离\n' +
            '[02:05.06]不知抚摸的是故事 还是段心情\n' +
            '[02:11.34]也许期待的不过是 与时间为敌\n' +
            '[02:17.01]再次看到你\n' +
            '[02:18.54001]微凉晨光里\n' +
            '[02:20.12]笑得很甜蜜\n' +
            '[02:22.59]从前初识这世间\n' +
            '[02:25.67]万般流连\n' +
            '[02:27.39]看着天边似在眼前\n' +
            '[02:30.39]也甘愿赴汤蹈火去走它一遍\n' +
            '[02:35.37]如今走过这世间\n' +
            '[02:38.51]万般流连\n' +
            '[02:40.22]翻过岁月不同侧脸\n' +
            '[02:43.18]措不及防闯入你的笑颜\n' +
            '[02:48.99]我曾难自拔于世界之大\n' +
            '[02:53.08]也沉溺于其中梦话\n' +
            '[02:56.23]不得真假 不做挣扎 不惧笑话\n' +
            '[03:01.88]我曾将青春翻涌成她\n' +
            '[03:05.49]也曾指尖弹出盛夏\n' +
            '[03:08.72]心之所动 且就随缘去吧\n' +
            '[03:40.27]晚风吹起你鬓间的白发\n' +
            '[03:44.22]抚平回忆留下的疤\n' +
            '[03:47.43]你的眼中 明暗交杂 一笑生花\n' +
            '[03:53.09]暮色遮住你蹒跚的步伐\n' +
            '[03:57.05]走进床头藏起的画\n' +
            '[04:00.21]画中的你 低着头说话\n' +
            '[04:05.86]我仍感叹于世界之大\n' +
            '[04:09.46]也沉醉于儿时情话\n' +
            '[04:12.74]不剩真假 不做挣扎 无谓笑话\n' +
            '[04:18.67]我终将青春还给了她\n' +
            '[04:22.3]连同指尖弹出的盛夏\n' +
            '[04:25.84]心之所动 就随风去了\n' +
            '[04:31.42]以爱之名 你还愿意吗',
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
          musicId:musicId.value,
          sentence:currentSong.value.sentence,
          sunRise:sunrise.value,
          sunSet:sunset.value
        };
        console.log(payload)
        console.log("发了！")
        addCollection(payload).then(res => {
          console.log(res);
          if (res.status==200) {
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

    const dialogVisible = ref(false); // 控制对话框显示状态

    const HandleDialog = () => {
      dialogVisible.value = true; // 打开对话框
      console.log(dialogVisible.value)
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
      dialogVisible,
      User,
      Document,
      SwitchButton,
      initAudio,
      formatTime,
      HandleDialog,
      isFavorite,
      Weather,
      Sunny,
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
  font-size: 19px;
  color: rgba(255, 255, 255, 0.9);
}

.song-info {
  text-align: left;
}

.song-title {
  font-size: 30px;
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
  font-size: 18px;
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