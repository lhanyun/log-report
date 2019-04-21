function beaconPollyfill(url, data, type) {
  if (type === 'post') {
    let iframe = document.createElement('iframe')
    iframe.name = 'badjs_offline_' + (new Date() - 0)
    iframe.frameBorder = 0
    iframe.height = 0
    iframe.width = 0
    iframe.src = 'javascript:false'

    iframe.onload = function() {
      const from = document.createElement('form')
      from.style.display = 'none'
      from.target = iframe.name
      from.method = 'POST'
      from.action = url + 'offlineLog'
      const input = document.createElement('input')
      input.style.display = 'none'
      input.type = 'hidden'
      input.name = 'offline_log'
      input.value = data

      iframe.contentDocument.body.appendChild(from)
      from.appendChild(input)
      from.submit()
      console.log('report offline log success')
      setTimeout(function() {
        document.body.removeChild(iframe)
        iframe = null
      }, 5000)

      iframe.onload = null
    }
    document.body.appendChild(iframe)
  } else {
    new Image().src = url
  }
}

export default function send(url, data, type) {
  if (navigator.sendBeacon && typeof navigator.sendBeacon === 'function') {
    try {
      if (type === 'post') {
        /**
           * FormData的主要用途有两个:
           * 1、将form表单元素的name与value进行组合，实现表单数据的序列化，从而减少表单元素的拼接，提高工作效率。
           * 2、异步上传文件
           */
        const fd = new FormData()
        fd.append('offline_log', data)
        navigator.sendBeacon(url, data)
      } else {
        navigator.sendBeacon(url, data)
      }
    } catch (e) {
      beaconPollyfill(url, data, type)
    }
  } else {
    beaconPollyfill(url, data, type)
  }
}
