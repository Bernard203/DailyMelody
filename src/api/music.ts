import {axios} from '../utils/request'
import {MUSIC_MODULE} from './_prefix'

type MusicInfo = {
    name: string,//歌名
    sentence:string,//好句
    musicUrl:string,//mp3
    lrcUrl:string,//歌词文件
    imgUrl:string,//专辑封面
    keyword:string,
}

type CollectionInfo = {
    musicId:number,
    musicName:string,
    date:string,//日期yyyy-mm-dd
    festival?:string,//特殊节日（可空）
    thought?:string,//感想（可空）
    imgUrl:string,
    sunSet:string,
    sunRise:string,
    sentence:string,
}

// 上传音乐信息
export const createMusic = (musicInfo: MusicInfo) => {
    return axios.post(`${MUSIC_MODULE}/create`, musicInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 根据音乐Id获取指定音乐信息
export const getMusicById = (musicId: number) => {
    return axios.get(`${MUSIC_MODULE}/${musicId}`)
        .then(res => {
            return res
        })
}

// 根据url获取歌词
export const getLrcByUrl = (lrcUrl: string) => {
    return axios.get(`${MUSIC_MODULE}/lrc/${lrcUrl}`)
        .then(res => {
            return res
        })
}


// 获取推歌
export const getMusic = () => {
    return axios.get(`${MUSIC_MODULE}/getMusic`)
        .then(res => {
            return res
        })
}

// 添加收藏信息
export const addCollection = (collectionInfo: CollectionInfo) => {
    return axios.post(`${MUSIC_MODULE}/collection`, collectionInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 获取全部收藏信息
export const getCollectionInfo = () => {
    return axios.get(`${MUSIC_MODULE}/collection/all`, )
        .then(res => {
            return res
        })
}

// 根据收藏ID获取收藏信息,包括音乐名、
export const getCollectionById = (collectionId: number) => {
    return axios.get(`${MUSIC_MODULE}/collection/${collectionId}`)
        .then(res => {
            return res
        })
}
