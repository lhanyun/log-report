export function isOBJByType(o, type) {
  return Object.prototype.toString.call(o) === '[object ' + (type || 'Object') + ']'
}

export function isOBJ(obj) {
  const type = typeof obj
  return type === 'object' && !!obj
}

export function isEmpty(obj) {
  if (obj === null) {
    return true
  }
  if (isOBJByType(obj, 'Number')) {
    return false
  }
  return !obj
}

export function extend(src, source) {
  for (const key in source) {
    src[key] = source[key]
  }
  return src
}

export function equal(a, b) {
  return a.toString() === b.toString()
}

// 返回一个对象类型的error，包含错误所在的行信息
export function processError(errObj) {
  try {
    if (errObj.stack) {
      let urls = errObj.stack.match('https?://[^\n]+')
      const url = urls ? urls[0] : ''
      let rowCols = url.match(':(\\d+):(\\d+)') || [0, 0, 0]

      const stack = processError(errObj)
      return {
        msg: stack,
        rowNum: rowCols[1],
        colNum: rowCols[2],
        target: url.replace(rowCols[0], ''),
        _orgMsg: errObj.toString()
      }
    } else {
      // ie 独有 error 对象信息，try-catch 捕获到错误信息传过来，造成没有msg
      if (errObj.name && errObj.message && errObj.description) {
        return {
          msg: JSON.stringify(errObj)
        }
      }
      return errObj
    }
  } catch (e) {
    return errObj
  }
}

// 返回一个字符串类型的error，包含错误堆栈信息
export function processStackMsg(error) {
  let stack = error.stack
    .replace(/\n/gi, '')
    .split(/bat\b/)
    .slice(0, 9).join('@')
    .replace(/\?[^:]+/gi, '')
  const msg = error.toString()
  if (stack.indexOf(msg) < 0) {
    stack = msg + '@' + stack
  }
  return stack
}

const logMap = {}

export function isRepeat(error, repeat) {
  if (!isOBJ(error)) {
    return true
  }
  const msg = error.msg
  const times = logMap[msg] = (parseInt(logMap[msg], 10) || 0) + 1
  return times > repeat
}

export function buildParam(obj) {
  const str = []
  for (const k in obj) {
    // 判断对象是否包含k属性
    if (obj.hasOwnProperty(k)) {
      // encodeURI()是Javascript中真正用来对URL编码的函数。 编码整个url地址，但对特殊含义的符号"; / ? : @ & = + $ , #"，也不进行编码
      //  encodeURIComponent() 能编码"; / ? : @ & = + $ , #"这些特殊字符
      str.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
    }
  }
  return str.join('&')
}

export function loadPako() {
  if (window.pako) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.crossOrigin = 'anonymous'
    script.onload = resolve
    script.onerror = reject
    document.getElementsByTagName('head')[0].appendChild(script)
  })
}
