<template>
	<div>
		<div class="control">
			<button @click="play_resume">Play</button>
			<button @click="pause">Pause</button>
			<button @click="$emit('nextChapter', urlToNextChapter)">Next Chapter</button>
		</div>
		<div class="text">
			<p v-for="(paragraph, idx) in story" :class="idx === paragraphIdx ? 'active' : ''" @click="setToIndex(idx)">{{
				paragraph
			}}</p>
		</div>
	</div>
</template>

<script setup>
// https://jankapunkt.github.io/easy-speech/
import { ref, watchEffect, onMounted } from 'vue';
import EasySpeech from 'easy-speech';

const props = defineProps({
	url: String
});
const story = ref([]);
const urlToNextChapter = ref("");
const paragraphIdx = ref(0);
const readerState = ref("stopped");

onMounted(async _ => {
	await EasySpeech.init();
	console.log(EasySpeech.status());

	EasySpeech.on({
		end: () => {
			if (story.length >= paragraphIdx.value) return;
			paragraphIdx.value++;
			readerState.value = "stopped";
			play_resume();
		}
	});
});

const wattpad = (function () {

	async function getHTML(url) {
		const data = await fetch(url);
		const html = await data.text();
		return html;
	}
	function getListOfParagraphs(html) {
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(html, 'text/html');
		let paragraphsHTML = Array.from(htmlDoc.querySelectorAll("#story-reading main#parts-container-new pre p"));
		let story = [];

		let regexes = {
			br: /<br\/?>/g,
			doubleLine: /={2,}\n?/g,
			line: /-{2,}\n?/g,
			allTags: /<[^>]*>/g,
			url: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
		}


		paragraphsHTML.forEach(paragraph => {
			// Split paragraphs if to long (limit is 32,767 for screen reader)
			let p = paragraph.innerHTML;
			p = p.replace(regexes.br, "\n"); // replace <br> by \n
			p = p.replace(regexes.doubleLine, "\n"); // replace ====== by \n
			p = p.replace(regexes.line, "\n"); // replace ------ by \n
			p = p.replace(regexes.allTags, '');
			p = p.replace(regexes.url, "[URL]");
			p = p.trim();
			if (p.length > 0) story.push(p);
		});
		console.log(story);
		return story;
	}

	function getLinkToNextStory(html) {
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(html, 'text/html');
		let link = htmlDoc.querySelector("footer a.next-part-link")?.href;
		return link;
	}

	function isValidWattpadURL(url) {
		if (url.length === 0) return false; // no url passed in
		if (encodeURI(url) !== url) return false; // url contains invalid characters
		const regex = /^https?:\/\/(www\.)?wattpad\.com[\w\d-]*/gm; // invalid url
		return regex.test(url);
	}

	return {

		async getStory(url) {
			// TODO: implement url check
			const trimmedURL = url.trim();

			if (!isValidWattpadURL(trimmedURL)) {
				console.log("not valid");
				return "";
			}

			let html = await getHTML(trimmedURL);

			urlToNextChapter.value = getLinkToNextStory(html);

			return getListOfParagraphs(html);

		}

	}
})();


watchEffect(async () => {
	story.value = await wattpad.getStory(props.url);
	paragraphIdx.value = 0;
})




function setToIndex(idx) {
	paragraphIdx.value = idx;
	readerState.value = "stopped";
	EasySpeech.pause();
	EasySpeech.cancel();
	play_resume();
}


async function play_resume() {
	const voices = EasySpeech.voices();
	const voice = voices[9];
	const text = story.value[paragraphIdx.value];

	switch (readerState.value) {
		case "stopped":
			console.log(readerState.value);
			readerState.value = "playing";
			await EasySpeech.speak({
				text,
				voice,
			});
			break;

		case "paused":
			readerState.value = "playing";
			EasySpeech.resume();
			break;
	}
}


function pause() {
	readerState.value = "paused";
	EasySpeech.pause();
}
</script>

<style  scoped>
p {
	margin-bottom: 20px;
}

p.active {
	color: green;
}
</style>
