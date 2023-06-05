import Head from 'next/head'
import { AppProps } from 'next/app'
import '../styles/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  const title = 'RepoGPT'
  const description =
    "Merge github's repository files into text to send it to GPT API or to copy and paste it into ChatGPT."
  const keywords = 'gpt, openai, github, repository, merge, text, chat, chatgpt, repogpt'
  const author = 'Mark Kop'
  const imageUrl = 'https://repogpt.markkop.dev/og.png'
  const url = 'https://repogpt.markkop.dev'
  const twitterHandle = '@HeyMarkKop'

  return (
    <>
      <Head>
        <title>RepoGPT</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={twitterHandle} />
        <meta name="twitter:creator" content={twitterHandle} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={title} />
        <meta name="twitter:url" content={url} />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
