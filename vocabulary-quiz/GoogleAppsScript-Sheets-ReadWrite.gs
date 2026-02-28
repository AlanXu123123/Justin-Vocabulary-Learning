/**
 * 背单词测验 - Google Sheet 词库（读 + 写）
 *
 * 功能：
 * - GET：从表格读取所有工作表的词库，返回 JSON 数组（兼容现有背单词页）
 * - POST：接收「分类名 + 单词列表」，追加到对应工作表（实现「从应用上传到 Sheet」）
 *
 * 使用步骤：
 * 1. 新建 Google 表格：https://sheets.google.com
 * 2. 表格里每个「工作表」（底部标签） = 一个分类，例如建一个名为 "SS10 Unit4" 的 sheet
 * 3. 每个 sheet 两列：A = 单词，B = 释义（第一行可为表头，脚本会跳过）
 * 4. 打开 https://script.google.com ，新建项目，粘贴本脚本
 * 5. 修改下面的 SPREADSHEET_ID：在表格网址里复制 /d/ 和 /edit 之间的那串字符
 * 6. 保存后「部署」→「新建部署」→ 类型「网页应用」→ 执行身份「我」→ 谁可访问「任何人」
 * 7. 在背单词网页里填这个部署链接：用于「从 Sheet 同步」和「上传当前词库到 Sheet」
 */

var SPREADSHEET_ID = '这里填你的表格ID';  // 例如：1ABC...xyz

function doGet(e) {
  var action = e && e.parameter ? String(e.parameter.action || '').trim() : '';
  if (action === 'createSheet') {
    var category = e && e.parameter ? String(e.parameter.category || '').trim() : '';
    if (!category) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: '需要 category 名称' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var created = createNewSheet(SPREADSHEET_ID, category);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, category: created.name, created: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (action === 'deleteSheet') {
    var delCategory = e && e.parameter ? String(e.parameter.category || '').trim() : '';
    if (!delCategory) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: '需要 category 名称' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var deleted = deleteSheetByName(SPREADSHEET_ID, delCategory);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, category: deleted.name, deleted: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var data = getVocabularyFromSpreadsheetAsCategories(SPREADSHEET_ID);
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST  body 格式：
 * 1) 创建新单词组：{ "action": "createSheet", "category": "新组名" }
 * 2) 追加单词：{ "category": "SS10 Unit4", "words": [ { "word": "xxx", "definition": "..." }, ... ] }
 */
function doPost(e) {
  try {
    var body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;
    if (!body) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: '无效请求' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (body.action === 'createSheet') {
      var cat = String(body.category || '').trim();
      if (!cat) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: '需要 category 名称' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var created = createNewSheet(SPREADSHEET_ID, cat);
      return ContentService.createTextOutput(JSON.stringify({ ok: true, category: created.name, created: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (!body.category || !Array.isArray(body.words) || body.words.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: '需要 category 和 words 数组' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var category = String(body.category).trim();
    var words = body.words.filter(function (w) { return w && w.word; });
    if (words.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: '没有有效单词' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var appended = appendWordsToSheet(SPREADSHEET_ID, category, words);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, appended: appended, category: category }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: (err.message || String(err)) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** 表格名不允许的字符： \ / * ? : [ ] */
function sanitizeSheetName(name) {
  return name.replace(/[\\/*?:\[\]]/g, '_').substring(0, 100);
}

/** 按工作表返回分类结构：{ categories: [ { id, name, words: [ { serial, word, definition }, ... ] } ] }。第一行为表头跳过；序列号始终为行号（从 1 开始）。 */
function getVocabularyFromSpreadsheetAsCategories(spreadsheetId) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheets = ss.getSheets();
  var categories = [];
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var name = sheet.getName();
    var data = sheet.getDataRange().getValues();
    var startRow = 0;
    if (data.length > 0) {
      var first = data[0][0];
      if (typeof first === 'string' && (String(first).toLowerCase() === 'word' || String(first).toLowerCase() === '单词' || String(first).toLowerCase() === '序列号')) startRow = 1;
    }
    var words = [];
    for (var r = startRow; r < data.length; r++) {
      var serial = String(r - startRow + 1);
      var word = '';
      var definition = '';
      if (data[r].length >= 3) {
        word = data[r][1] != null ? String(data[r][1]).trim().toLowerCase() : '';
        definition = data[r][2] != null ? String(data[r][2]).trim() : '';
      } else if (data[r].length >= 2) {
        var a = data[r][0] != null ? String(data[r][0]).trim() : '';
        var b = data[r][1] != null ? String(data[r][1]).trim() : '';
        if (/^\d+$/.test(a)) {
          word = b.toLowerCase();
        } else {
          word = a.toLowerCase();
          definition = b;
        }
      }
      if (word) words.push({ serial: serial, word: word, definition: definition || '(无释义)' });
    }
    categories.push({ id: name, name: name, words: words });
  }
  return { categories: categories };
}

/** 在表格中创建新工作表（仅表头：序列号、单词、释义） */
function createNewSheet(spreadsheetId, category) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var safeName = sanitizeSheetName(category);
  var sheet = ss.getSheetByName(safeName);
  if (sheet) return { name: safeName, existed: true };
  sheet = ss.insertSheet(safeName);
  sheet.getRange(1, 1, 1, 3).setValues([['序列号', '单词', '释义']]);
  return { name: safeName, existed: false };
}

/** 删除指定工作表（至少保留一个工作表，避免表格为空） */
function deleteSheetByName(spreadsheetId, category) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var safeName = sanitizeSheetName(category);
  var sheet = ss.getSheetByName(safeName);
  if (!sheet) throw new Error('未找到该单词组：' + safeName);
  if (ss.getSheets().length <= 1) throw new Error('至少需要保留一个单词组，无法删除最后一个工作表');
  ss.deleteSheet(sheet);
  return { name: safeName };
}

/** 在表格中查找或创建名为 category 的 sheet，追加 words（每行 word, definition） */
function appendWordsToSheet(spreadsheetId, category, words) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var safeName = sanitizeSheetName(category);
  var sheet = ss.getSheetByName(safeName);
  if (!sheet) {
    sheet = ss.insertSheet(safeName);
    sheet.getRange(1, 1, 1, 3).setValues([['序列号', '单词', '释义']]);
  }
  var nextRow = sheet.getLastRow() + 1;
  var data = words.map(function (w, idx) {
    var serial = w.serial != null ? String(w.serial) : String(nextRow + idx);
    return [serial, w.word, w.definition || '(无释义)'];
  });
  if (data.length > 0) sheet.getRange(nextRow, 1, nextRow + data.length - 1, 3).setValues(data);
  return data.length;
}
