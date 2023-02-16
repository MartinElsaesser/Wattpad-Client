
class wDOM {
	constructor(html) {
		this._parser = new DOMParser();
		this.dom = this._parser.parseFromString(html, "text/html");

		const base = this.dom.createElement("base");
		base.href = "https://www.wattpad.com/";
		this.dom.head.appendChild(base);
	}
	getLinkHref(selector) {
		let href = this.dom.querySelector(selector)?.href;
		return href;
	}
	getImageSrc(selector) {
		let src = this.dom.querySelector(selector)?.src;
		return src;
	}
	getElementInnerText(selector) {
		let text = this.dom.querySelector(selector)?.innerText;
		return text;
	}
	querySelectorAll(selector) {
		return Array.from(this.dom.querySelectorAll(selector));
	}

}


const wattpad = (function () {
	async function getHTML(url) {
		const data = await fetch(url);
		const html = await data.text();
		return html;
	}

	function isValidWattpadURL(url) {
		if (url.length === 0) return false; // no url passed in
		if (encodeURI(url) !== url) return false; // url contains invalid characters
		const regex = /^https?:\/\/(www\.)?wattpad\.com[\w\d-]*/gm; // invalid url
		return regex.test(url);
	}

	let paragraphPatterns = {
		br: /<br\/?>/g,
		doubleLine: /={2,}\n?/g,
		line: /-{2,}\n?/g,
		allTags: /<[^>]*>/g,
		url: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
	}

	function getListOfParagraphs(dom) {
		const paragraphsSelector = "#story-reading main#parts-container-new pre p";
		const paragraphsEl = dom.querySelectorAll(paragraphsSelector);
		let story = [];

		paragraphsEl.forEach(paragraph => {
			// Split paragraphs if to long (limit is 32,767 for screen reader)
			let p = paragraph.innerHTML;
			p = p.replace(paragraphPatterns.br, "\n"); // replace <br> by \n
			p = p.replace(paragraphPatterns.doubleLine, "\n"); // replace ====== by \n
			p = p.replace(paragraphPatterns.line, "\n"); // replace ------ by \n
			p = p.replace(paragraphPatterns.allTags, '');
			p = p.replace(paragraphPatterns.url, "[URL]");
			p = p.trim();
			if (p.length > 0) story.push(p);
		});
		return story;
	}


	function getLinkToNextStory(dom) {
		return dom.getLinkHref("#story-part-navigation a");
	}

	function getChapterNumber(dom) {
		const chaptersEl = dom.querySelectorAll("ul.table-of-contents li");

		let chapterIdx = chaptersEl.findIndex(chapt =>
			chapt.classList.contains("active")
		);
		return chapterIdx === -1 ? null : chapterIdx + 1;
	}

	function getHeadline(dom) {
		let headline = dom.getElementInnerText("h1");
		return headline.trim();
	}

	function getTitle(dom) {
		return dom.getElementInnerText(".story-info .story-info__title");
	}

	function getTableOfContents(dom) {
		const chaptersEl = dom.querySelectorAll(".table-of-contents li a");
		return chaptersEl.map((chapterEl, i) => {
			return {
				url: chapterEl.href,
				number: i + 1,
				headline: chapterEl.innerText
			}
		});
	}

	function getTags(dom) {
		const tagsEl = dom.querySelectorAll(".tag-carousel a");
		const tags = tagsEl.map(tagEl => tagEl.innerText);
		return tags;
	}

	async function getImage64(dom) {
		const src = dom.getImageSrc(".story-cover img");
		const response = await fetch(src);
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			try {
				const reader = new FileReader();
				reader.onload = function () { resolve(this.result) };
				reader.readAsDataURL(blob);
			} catch (e) {
				reject(e);
			}
		});
	}

	function getLastRead(dom) {
		// TODO: auth
		const chaptersEl = dom.querySelectorAll(".table-of-contents li a");
		const chapters = chaptersEl.findIndex(chapt => {
			console.log(chapt.className);
		});
		console.log(chaptersEl);
	}

	return {
		async getChapter(url) {
			// TODO: implement url check
			const trimmedURL = url.trim();

			if (!isValidWattpadURL(trimmedURL)) {
				throw "Not a valid Wattpad Url"
			}

			let html = await getHTML(trimmedURL);
			const dom = new wDOM(html);

			return {
				nextChapterUrl: getLinkToNextStory(dom),
				text: getListOfParagraphs(dom),
				currentChapterUrl: trimmedURL,
				chapterNumber: getChapterNumber(dom), // not index
				headline: getHeadline(dom),
			}
		},
		async getBook(url) {
			const trimmedURL = url.trim();

			if (!isValidWattpadURL(trimmedURL)) {
				throw "Not a valid Wattpad Url"
			}

			let html = await getHTML(trimmedURL);
			const dom = new wDOM(html);

			return {
				chapters: getTableOfContents(dom),
				// lastRead: getLastRead(dom), // TODO: needs auth
				image: await getImage64(dom),
				tags: getTags(dom),
				title: getTitle(dom),
			}
		},
		async auth() {
			const username = "marelsmare1@gmail.com";
			const password = "E$$enboob2002";
			const res = await fetch("https://www.wattpad.com/login?nextUrl=/home", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: new URLSearchParams({
					username,
					password
				})
			});
			res.headers.forEach(console.log);
			const data = await res.blob();
			console.log(data);
		}
	}
})();


void async function () {
	const url = "https://www.wattpad.com/1238654904-a-better-boyfriend-girlxgirl-seven-scarlet";
	const bookUrl = "https://www.wattpad.com/story/314178596-a-better-boyfriend-girlxgirl";
	// const story = await wattpad.getChapter(url);
	// console.log(story);
	// const book = await wattpad.getBook(bookUrl);
	wattpad.auth();
}()