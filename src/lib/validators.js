const MAX_LENGTH = 120

export function validateInput(message) {
  if (!message || message.trim() === '') {
    return '请输入相亲对象的发言'
  }

  if (message.length > MAX_LENGTH) {
    return `输入不能超过${MAX_LENGTH}字，当前已输入${message.length}字`
  }

  return null
}
