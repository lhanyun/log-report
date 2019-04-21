import {
  isOBJ,
  isEmpty,
  isRepeat,
  isOBJByType
} from '../utils'
import getOfflineDB from '../offline/index'
import send from '../report'

let submitLogList = []
let comboTimeout = 0

const submitLog = function(config) {
  clearTimeout(comboTimeout)

  if (!submitLogList.length) {
    return
  }

  const _url = config._reportUrl + submitLogList.join('&') + '&count=' + submitLogList.length + '&_t=' + (+new Date())
  send(_url)

  comboTimeout = 0
  submitLogList = []
}

const reportLog2String = function(error, index, config) {
  const param = []
  const params = []
  const stringify = []
  if (isOBJ(error)) {
    error.level = error.level || config.level
    for (const key in error) {
      let value = error[key]
      if (!isEmpty(value)) {
        if (isOBJ(value)) {
          try {
            value = JSON.stringify(value)
          } catch (err) {
            value = '[BJ_REPORT detect value stringify error' + err.toString()
          }
        }
        stringify.push(key + ':' + value)
        param.push(key + '=' + encodeURIComponent(value))
        params.push(key + '[' + index + ']=' + encodeURIComponent(value))
      }
    }
  }
  return [params.join('&'), stringify.join(','), param.join('&')]
}
