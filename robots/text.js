const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')


async function robot(content) {
	await fetchContentFromWikipedia(content)
	senitizeContent(content)
	breakContentIntoSentences(content)
	limitMaximumSentences(content)
	await fetchKeywordsOfAllSentences(content)

	async function fetchContentFromWikipedia(content) {
		const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
		const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
		const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
		const wikipediaContent = wikipediaResponde.get()

		content.sourceContentOriginal = wikipediaContent.content
	}

	function senitizeContent(content) {
		const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
		const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
		content.sourceContentSenitized = withoutDatesInParentheses

		function removeBlankLinesAndMarkdown(text) {
			const allLines = text.split('\n')
			const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
				if (line.trim().lenght === 0 || line.trim().startsWith('=')) {
					return false
				}

				return true
			})

		return withoutBlankLinesAndMarkdown.join(' ')
		}
	}

	function removeDatesInParentheses(text) {
		return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
	}

	async function fetchKeywordsOfAllSentences(content) {
	    for (const sentence of content.sentences) {
	      var firstword =  sentence.text.replace(/ .*/, '')
	      sentence.keywords.push(firstword)
	      sentence.keywords.push(firstword)
	    }
    }


	function breakContentIntoSentences(content) {
		content.sentences = []

		const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSenitized)
		sentences.forEach((sentence) => {
			content.sentences.push({
				text: sentence,
				keywords: [],
				images: []
			})
		})
	}

	function limitMaximumSentences(content) {
		content.sentences = content.sentences.slice(0, content.maximumSentences)
	}

}

module.exports = robot