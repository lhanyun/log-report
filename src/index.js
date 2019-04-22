import getOfflineDB from './offline/index'
import {
  isOBJ,
  isOBJByType,
  processError,
  processStackMsg,
  extend,
  buildParam,
  loadPako
} from './utils'
import Log from './log/index'
import send from './report'

let logList = []

const _config = {
  url: '//now.qq.com/badjs', // 上报接口
  version: 0,
  ext: null, // 扩展参数 用于自定义上报
  level: 4, // 错误级别 1-debug 2-info 4-error
  ignore: [], // 忽略某个错误, 支持 Regexp 和 Function
  random: 1, // 抽样 (0-1] 1-全量
  delay: 1000, // 延迟上报
  maxLength: 500, // 每条日志内容最大长度，通常不建议修改
  submit: null, // 自定义上报方式
  monitorUrl: '//report.url.cn/report/report_vm', // 自定义统计上报地址
  repeat: 5, // 重复上报次数(对于同一个错误超过多少次不上报),
  offlineLog: false,
  offlineLogExp: 3, // 离线日志过期时间，默认3天
  offlineLogAuto: false, // 是否自动询问服务器需要自动上报
  deflate: false, // 是否使用压缩算法
  onReport: () => {
  }, // 与上报同时触发，用于统计相关内容
  beforeReport: () => {
    return true
  } // aop：上报前执行，如果返回 false 则不上报
}

export default class WardjsReport {
  constructor(props) {
    this._initConfig(props)
    this.log = new Log(_config)
    if (this.offlineLog) {
      this._initOffline()
    }
    this._initError()
  }

  // 初始化参数
  _initConfig(props) {
    for (const key in _config) {
      if (key in props) {
        _config[key] = props[key]
      }
    }

    const id = parseInt(_config.id, 10)
    if (id) {
      if (/qq\.com$/gi.test(location.hostname)) {
        if (!_config.url) {
          _config.url = '//now.qq.com/badjs'
        }

        if (!_config.uin) {
          _config.uin = parseInt((document.cookie.match(/\bnim=\D+(\d+)/) || [])[1], 10)
        }
      }

      _config._reportUrl = (_config.url || '//now.qq.com/badjs') +
          '?id=' + id +
          '&uin=' + _config.uin +
          '&version=' + _config.version +
          '&'

      send(`${_config.url}/${id}`)
    }
    for (const key in _config) {
      this[key] = _config[key]
    }
  }

  // 初始化离线数据库
  _initOffline() {
    const _this = this
    this.offlineDB = getOfflineDB()

    this.offlineDB.ready(function(err, DB) {
      if (!err && DB) {
        setTimeout(function() {
          DB.clearDB(_this.offlineLogExp)
          setTimeout(function() {
            _this.offlineLogAuto && _this._autoReportOffline()
          }, 5000)
        }, 1000)
      }
    })
    return this
  }
}
