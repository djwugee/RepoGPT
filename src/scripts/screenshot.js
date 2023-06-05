const puppeteer = require('puppeteer')
require('dotenv').config()
//
;(async () => {
  // Take the urls from the command line
  var args = process.argv.slice(2)

  try {
    // launch a new headless browser
    const browser = await puppeteer.launch({ headless: 'new' })

    // loop over the urls
    for (let i = 0; i < args.length; i++) {
      // check for https for safety!
      if (args[i].includes('http://')) {
        const page = await browser.newPage()

        // set the viewport size
        await page.setViewport({
          width: 1024,
          height: 630,
          deviceScaleFactor: 1
        })

        // tell the page to visit the url
        await page.goto(args[i])

        // fill open api key just for the screenshot
        await page.type('#openai-api-key', Array(64).fill('a').join(''))

        if (process.env.GITHUB_TOKEN) {
          console.log('Github token found, using it to make requests.')
          await page.type('#github-token', process.env.GITHUB_TOKEN)
        }

        // click on the button
        await page.click('#save-repo-url')

        // wait
        await page.waitForSelector('input[type="checkbox"]')

        // click on checkbox
        const checkboxes = await page.$$('input[type="checkbox"]')
        await checkboxes[6].click()

        // wait
        await page.waitForNetworkIdle()

        // take a screenshot and save it in the screenshots directory
        await page.screenshot({ path: `./public/og.png` })

        // done!
        console.log(`✅ Screenshot of ${args[i]} saved!`)
      } else {
        console.error(`❌ Could not save screenshot of ${args[i]}!`)
      }
    }

    // close the browser
    await browser.close()
  } catch (error) {
    console.log(error)
  }
})()
