import {axios} from '../utils/request'
import {MUSIC_MODULE} from './_prefix'

type MusicInfo = {
    name: string,//歌名
    sentence:string,//好句
    musicUrl:string,//mp3
    lrcUrl:string,//歌词文件
    imgUrl:string,//专辑封面
}

type CollectionInfo = {
    musicId:number,//对应歌ID
    date:string,//日期
    festival?:string,//特殊节日（可空）
    thought?:string,//感想（可空）
}

// 上传音乐信息
export const createMusic = (musicInfo: MusicInfo) => {
    return axios.post(`${MUSIC_MODULE}/`, musicInfo,
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

// 添加收藏信息
export const addCollection = (collectionInfo: CollectionInfo) => {
    return axios.post(`${MUSIC_MODULE}/`, collectionInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 获取全部收藏信息
export const getCollectionInfo = () => {
    return axios.get(`${MUSIC_MODULE}/all`, )
        .then(res => {
            return res
        })
}

// 根据收藏ID获取收藏信息,包括音乐名、
export const getCollectionById = (collectionId: number) => {
    return axios.get(`${MUSIC_MODULE}/${collectionId}`)
        .then(res => {
            return res
        })
}
