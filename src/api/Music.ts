import {axios} from '../utils/request'
import {MUSIC_MODULE} from './_prefix'

type MusicInfo = {
    name: string,
    musicUrl:string,
}

// 创建商店
export const createMusic = (storeInfo: MusicInfo) => {
    return axios.post(`${MUSIC_MODULE}/`, storeInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 获取收藏中全部信息
export const getFavouriteSongsInfo = () => {
    return axios.get(`${MUSIC_MODULE}/all`, )
        .then(res => {
            return res
        })
}

// 根据音乐Id获取指定音乐
export const getMusicById = (musicId: number) => {
    return axios.get(`${MUSIC_MODULE}/${musicId}`)
        .then(res => {
            return res
        })
}
