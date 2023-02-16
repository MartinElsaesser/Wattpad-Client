<script setup>
import { ref } from 'vue';
import Reader from "../components/Reader.vue";

const url = ref("https://www.wattpad.com/1238653547-a-better-boyfriend-girlxgirl-one-scarlet");
const urlInput = ref("https://www.wattpad.com/1238653807-a-better-boyfriend-girlxgirl-two-destiny");
function changeUrl(newUrl) {
	url.value = newUrl;
	urlInput.value = newUrl;
}
</script>

<template>
	<main>
		<h1>home</h1>
		<form @submit.prevent="changeUrl(urlInput)">
			<input type="text" v-model="urlInput" placeholder="Input URL to wattpad story">
			<button type="submit">go</button>
		</form>

		<Reader :url="url" @nextChapter="changeUrl"></Reader>
	</main>
</template>
