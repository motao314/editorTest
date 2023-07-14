function inputBridge(slotFn) {
  var textarea = document.createElement('textarea');
  document.body.appendChild(textarea);
  // 隐藏此输入框
  textarea.style.position = 'fixed';
  textarea.style.clip = 'rect(0 0 0 0)';
  textarea.style.top = '10px';
  textarea.focus();
  slotFn(textarea);
  // 移除输入框
  document.body.removeChild(textarea);
}
// 复制以上内容到剪切板的
export const copy = (text) => {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard) {
      // clipboard api 复制
      navigator.clipboard.writeText(text).then(() => {
        console.log('通过clipboard写入内容successful!');
        resolve(true);
      });
    } else {
      inputBridge(function (textarea) {
        // 赋值
        textarea.value = text;
        // 选中
        textarea.select();
        // 复制
        document.execCommand('copy', true);
        window._clipboard_data = text;

        console.log('通过execCommand写入内容', text);
        resolve(true);
      });
    }
  });
};

// 粘贴暂时不加
