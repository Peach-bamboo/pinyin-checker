import fs from 'fs';
import glob from 'glob';

// 拼音正则（你提供的正则）
const pinyinRegex = /(a[io]?|ou?|e[inr]?|ang?|ng|[bmp](a[io]?|[aei]ng?|ei|ie?|ia[no]|o|u)|pou|me|m[io]u|[fw](a|[ae]ng?|ei|o|u)|fou|wai|[dt](a[io]?|an|e|[aeio]ng|ie?|ia[no]|ou|u[ino]?|uan)|dei|diu|[nl](a[io]?|ei?|[eio]ng|i[eu]?|i?ang?|iao|in|ou|u[eo]?|ve?|uan)|nen|lia|lun|[ghk](a[io]?|[ae]ng?|e|ong|ou|u[aino]?|uai|uang?)|[gh]ei|[jqx](i(ao?|ang?|e|ng?|ong|u)?|u[en]?)|([csz]h?|[rz])([ae]ng?|ao|e|ou|u[ino]?)|[csz](ai?ong)|[csz]h(ai?uai)|zei|[sz]hua|[cz]hong)/g;

// 获取 src 目录下的文件
function getFilesFromSrc() {
  return glob.sync('src/**/*.{vue,js,css}'); // 获取所有 js, vue, css 文件
}

// 查找文件中的拼音
function findPinyinInFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const matches = fileContent.match(/[a-zA-Z0-9_]+/g) || []; // 匹配所有变量名

  const seen = new Set();  // 用于记录已处理的字符串，避免重复

  // 过滤拼音命名，长度大于4，去重
  const filteredMatches = [...new Set(matches.filter(match => {
    // 去掉下划线结尾后检查
    const cleanMatch = match.endsWith('_') ? match.slice(0, -1) : match;
    const finalMatch = cleanMatch.replace(/_/g, ''); // 去掉下划线

    // 如果去掉下划线后的字符串已经出现过，跳过
    if (seen.has(finalMatch)) {
      return false;
    }

    // 标记该字符串已处理
    seen.add(finalMatch);

    // 检查拼音是否符合规则，且过滤掉不符合条件的命名风格
    return cleanMatch.length > 6
      && pinyinRegex.test(cleanMatch) // 确保是拼音
      && !/[A-Z]/.test(cleanMatch)   // 排除包含大写字母的字符串
      && !/^[a-z]+([A-Z][a-z]+)+$/.test(cleanMatch)   // 排除小驼峰命名
      && !/^[A-Z][a-z]+([A-Z][a-z]+)*$/.test(cleanMatch)  // 排除大驼峰命名
      && !/\d/.test(cleanMatch)  // 排除包含数字的命名
      && !/_.+/.test(cleanMatch) // 排除带下划线的命名
      && !cleanMatch.includes('detail') && !cleanMatch.includes('dd')
      && !cleanMatch.includes('adjust') && !cleanMatch.includes('ar')
      && !cleanMatch.includes('fund') && !cleanMatch.includes('ff') && !cleanMatch.includes('fr')
      && !cleanMatch.includes('ount') && !cleanMatch.includes('oo')
      && !cleanMatch.includes('ve') && !cleanMatch.includes('vi')
      && !cleanMatch.includes('st') && !cleanMatch.includes('sp') && !cleanMatch.includes('sion')
      && !cleanMatch.includes('pl') && !cleanMatch.includes('ph') && !cleanMatch.includes('pt')
      && !cleanMatch.includes('th') && !cleanMatch.includes('tl') && !cleanMatch.includes('ty') && !cleanMatch.includes('tr') && !cleanMatch.includes('tion') && !cleanMatch.includes('tor')
      && !cleanMatch.includes('bs') && !cleanMatch.includes('bl')
      && !cleanMatch.includes('lt') && !cleanMatch.includes('ll')
      && !cleanMatch.includes('ck') && !cleanMatch.includes('context')
      && !cleanMatch.includes('ear')
      && !cleanMatch.includes('mb') && !cleanMatch.includes('mary')
      && !cleanMatch.includes('gg')
      && !cleanMatch.includes('rr')
      && !cleanMatch.includes('tt')
      && !cleanMatch.includes('ss')
      && !cleanMatch.includes('prod') && !cleanMatch.includes('ponent')
      && !match.endsWith('t') && !match.endsWith('k') && !match.endsWith('m') && !match.endsWith('d') && !match.endsWith('l') && !match.endsWith('s');
  }))];

  return filteredMatches;
}

// 查找 src 目录下的所有文件中的拼音
function findPinyinInSrc() {
  const files = getFilesFromSrc(); // 获取所有文件
  const result = {};

  files.forEach(file => {
    const matches = findPinyinInFile(file);

    if (matches.length > 0) {
      // 如果当前文件匹配到拼音，就将拼音和文件路径记录到结果中
      matches.forEach(match => {
        // 检查 result[match] 是否为数组，若不是，则初始化为空数组
        if (!Array.isArray(result[match])) {
          result[match] = [];
        }
        result[match].push(file); // 将文件路径添加到拼音的匹配结果中
      });
    }
  });

  return result;
}

// 展示匹配结果
function displayResults() {
  const result = findPinyinInSrc(); // 获取拼音匹配的结果

  if (Object.keys(result).length === 0) {
    console.log("没有找到拼音命名字段。");
    return;
  }

  console.log("以下字符串可能是拼音命名：");

  // 提取所有拼音并去重
  const allPinyins = [...new Set(Object.keys(result))];

  // 展示所有拼音字段
  console.log('------------****-------------');
  console.log(allPinyins.join(', '));
  console.log('------------****-------------');
}

// 执行展示
displayResults();
