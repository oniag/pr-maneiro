const CreateHelperFunctions = require('./helpers')
const { readFileSync } = require('fs')

const html = readFileSync(process.cwd() + '/index.template.html')

const fetch = path => new Promise(resolve => {
  const file = readFileSync(process.cwd() + path)
  resolve({
    text: () => Promise.resolve(file.toString())
  })
})

const deps = {
  document,
  window: {
    ...window,
    domtoimage: {
      toPng: () => 'image_png'
    },
    fetch,
    navigator: {
      clipboard: {
        write: true
      }
    },
    ClipboardItem: () => ({})
  }
}

let helpers
beforeAll(async () => {
  document.documentElement.innerHTML = html
  helpers = await CreateHelperFunctions({ deps })
})

describe('Helpers', () => {
  test('should get an element on DOM', () => {
    const button = helpers.$('#buttonCopy')
    expect(button.textContent.trim()).toBe('Copiar!')
  })

  test('should return true with clipboard API available', () => {
    const hasFeature = helpers.checkCopyFeature()
    expect(hasFeature).toBe(true)
  })

  test('should load a template with a component name', async () => {
    const tweet = await helpers.loadComponent('tweet')
    expect(typeof tweet === 'string').toBe(true)
  })

  test('should get a date with exactly twitter format', async () => {
    const time = new Date('2019-12-21T22:47:07')
    const dateFormated = await helpers.getCurrentTimeFormated(time)
    const hourNow = time.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
    const day = time.getDate()
    const month = time.getMonth()
    const year = time.getFullYear()
    expect(dateFormated).toEqual(`${hourNow} · ${helpers.monthList[month]} ${day} ${year}`)
  })

  test('should replace values from a gave template', async () => {
    const template = '{{ tweetContent }}|{{ name }}|{{ username }}|{{ image }}|{{ time }}'
    const time = new Date('2019-12-21T22:47:07.889Z')
    const element = await helpers.replaceValues({
      template,
      previewEl: document.getElementById('template'),
      name: 'Igor Halfeld',
      username: '@igorhalfeld',
      value: 'hello friend',
      image: 'image_url',
      time
    })
    expect(element.innerHTML).toEqual(`hello friend|Igor Halfeld|@igorhalfeld|image_url|${time}`)
  })
})
