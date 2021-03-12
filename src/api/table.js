import request from '@/utils/request'

const baseUlr = 'http://10.8.201.39:3301'
export function getCategorys() {
  return request({
    url: `${baseUlr}/bossapi/categorys`,
    method: 'get'
  })
}
export function createArticle(data) {
  return request({
    url: `${baseUlr}/bossapi/create`,
    method: 'post',
    data
  })
}

export function getArticles(params) {
  return request({
    url: `${baseUlr}/bossapi/articles`,
    method: 'get',
    params
  })
}

export function deleteArticle(params) {
  return request({
    url: `${baseUlr}/bossapi/delete`,
    method: 'delete',
    params
  })
}
