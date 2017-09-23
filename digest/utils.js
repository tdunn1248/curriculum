const Path = require('path')
const fs = require('fs-extra')
const lexer = require('marked').lexer

const APP_ROOT = Path.resolve(__dirname, '..')

const promiseMap = function(map){
  const keys = Object.keys(map)
  const promises = keys.map(key => map[key])
  return Promise.all(promises).then(values => {
    const map = {}
    keys.forEach((key, index) => {
      map[key] = values[index]
    })
    return map
  })
}

const convertIdsToObjects = ids =>
  ids.map(id => ({id}))

const mapToObjectBy = (records, property) => {
  const map = {}
  records.forEach(record => {
    map[record[property]] = record
  })
  return map
}

const readFile = path =>
  fs.readFile(APP_ROOT+path)

const readdir = path =>
  fs.readdir(APP_ROOT+path).then(files =>
    files.filter(file => file[0] !== '.')
  )

/*
 * Usage:
 *   readDirectoriesWithREADMEs('/modules')
 *
 * Returns:
 *   array of objects like:
 *     {
 *       id: <directory name>,
 *       readme: <contents of readme file>,
 *     }
 */
const readDirectoriesWithREADMEs = path =>
  readdir(path)
  .then(files => files.sort())
  .then(convertIdsToObjects)
  .then(tryLoadingREADME(path))
  .then(directories =>
    directories.filter(directory => directory.READMEMarkdown)
  )

const tryLoadingREADME = path =>
  directories =>
    Promise.all(
      directories.map(directory =>
        readMarkdownFile(
          Path.join(path, directory.id, 'README.md')
        )
        .then(
          READMEMarkdown => {
            directory.READMEMarkdown = READMEMarkdown
            directory.name = getHeadingFromMarkdown(READMEMarkdown)
            return directory
          },
          error => { return directory },
        )
      )
    )

const getHeadingFromMarkdown = markdown =>
  (markdown.find(token => token.type === 'heading') || {}).text

const readMarkdownFile = path =>
  readFile(path)
    .then(file => lexer(file.toString()))

const extractSkillsFromREADMEMarkdowns = objects => {
  objects.forEach(object => {
    object.skills = extractListFromMarkdownSection(
      object.READMEMarkdown,
      'Skills',
      2,
    )
  })
  return objects
}



const nameToId = name =>
  name
    .replace(/^\s*/,'')
    .replace(/\s*$/,'')
    .replace(/[\/ #]/g, '-')
    .replace(/`/g, '')

const rawTextToName = rawText =>
  rawText
    .replace(/^\s*\[\s+\]\s+/, '')
    .replace(/^\s*/,'')
    .replace(/\s*$/,'')

const extractListFromMarkdownSection = (document, text, depth) => {
  // console.log('===== extractListFromMarkdownSection ====', text, depth)
  let
    items = [],
    withinSection = false,
    withinListItem = false,
    listItemText = ''

  document.forEach(token => {
    // console.log(withinSection, withinListItem, token)

    if (
      token.type === 'heading' &&
      (depth && token.depth <= depth)
    ) withinSection = false

    if (
      token.type === 'heading' &&
      ( depth !== undefined && token.depth === depth ) &&
      token.text === text
    ) withinSection = true

    if (!withinSection) return

    if (token.type === 'list_item_start') withinListItem = true

    if (token.type === 'list_item_end') {
      withinListItem = false
      items.push(listItemText)
      listItemText = ''
    }

    if (!withinListItem) return

    if (token.type === 'space') listItemText += ' '
    if (token.type === 'text') listItemText += token.text
  })
  return items
}


 module.exports = {
  // APP_ROOT,
  // mapToObjectBy,
  // convertIdsToObjects,
  // readdir,
  // readFile,
  // readMarkdownFile,
  // rawTextToName,
  // nameToId,
  // extractListFromMarkdownSection,
  promiseMap,
  readDirectoriesWithREADMEs,
  extractListFromMarkdownSection,
  extractSkillsFromREADMEMarkdowns,
 }
