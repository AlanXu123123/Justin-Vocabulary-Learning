/**
 * 背单词测验 - Google Doc 词库接口
 * 
 * 使用步骤：
 * 1. 打开 https://script.google.com ，新建项目
 * 2. 把下面整段代码粘贴进去，替换默认的 function myFunction()
 * 3. 修改 DOC_ID：打开你的 Google 文档，从网址里复制 /d/ 和 /edit 之间的那串字符
 *    例如网址是 https://docs.google.com/document/d/19fWknHdxBxgGKRE5VuZGx6jCVp4rmjcflLkI27EvAww/edit
 *    则 DOC_ID = '19fWknHdxBxgGKRE5VuZGx6jCVp4rmjcflLkI27EvAww'
 * 4. 保存（Ctrl+S），点击「部署」→「新建部署」→ 类型选「网页应用」
 * 5. 说明随便填；执行身份选「我」；谁可以访问选「任何人」
 * 6. 部署后复制「网页应用的 URL」（形如 https://script.google.com/macros/s/xxxxx/exec）
 * 7. 在背单词网页里「设置 Google Doc 词库」中粘贴该链接并保存
 * 
 * 文档格式要求：每行「序号. 单词」，下一行（或多行）是该词的英文解释。
 */

var DOC_ID = '19fWknHdxBxgGKRE5VuZGx6jCVp4rmjcflLkI27EvAww';  // 改成你的文档 ID

function doGet(e) {
  var list = getVocabularyFromDoc(DOC_ID);
  return ContentService
    .createTextOutput(JSON.stringify(list))
    .setMimeType(ContentService.MimeType.JSON);
}

function getVocabularyFromDoc(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var text = body.getText();
  var lines = text.split(/\r?\n/);
  var list = [];
  var numWordRe = /^\s*\d+\.\s+(.+)$/;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var m = line.match(numWordRe);
    if (m) {
      var word = m[1].trim().toLowerCase();
      var defLines = [];
      i++;
      while (i < lines.length) {
        if (lines[i].trim().match(numWordRe)) {
          i--;
          break;
        }
        if (lines[i].trim()) defLines.push(lines[i].trim());
        i++;
      }
      var definition = defLines.join(' ').trim() || '(无释义)';
      if (word) list.push({ word: word, definition: definition });
    }
  }
  return list;
}
