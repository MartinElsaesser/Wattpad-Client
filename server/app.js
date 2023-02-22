// const express = require("express");
import express from "express";
import puppeteer from "puppeteer";
import querystring from "querystring";

const app = express();
// const fetch = require("node-fetch");
// import fetch from 'node-fetch';


app.use(express.json());


class Page {
	constructor() {
		this.browser = null;
		this.page = null;
	}
	async loginWithWattpad(username, password) {
		this.browser = await puppeteer.launch();
		this.page = await this.browser.newPage();

		const postData = { username, password };
		await this.page.setRequestInterception(true);

		this.page.once('request', request => {
			var data = {
				'method': 'POST',
				'postData': querystring.stringify(postData),
				'headers': {
					...request.headers(),
					'Content-Type': 'application/x-www-form-urlencoded'
				},
			};

			request.continue(data);
			this.page.setRequestInterception(false);
		});

		const response = await this.page.goto('https://www.wattpad.com/login');

		return response;

	}
	async isAuthenticated() {
		return true;
	}
	async getWattpadCookies(auth /* specify which auth*/) {
		if (!this.page) return;
		if (!await this.isAuthenticated()) throw "Not logged In";
		let cookies = await this.page.cookies();
		return cookies;
	}
}

const page = new Page();

app.get("/", async (req, res) => {
	const username = "marelsmare1@gmail.com";
	const password = "E$$enboob2002";
	const result = await page.loginWithWattpad(username, password);
	res.send(await result.text());

});

app.get("/cookies", async (req, res) => {
	const cookies = await page.getWattpadCookies();
	res.send(cookies);
})

app.listen("8080")


// Page
// - pass cookie
// - pass google login
// - pass wattpad login
// - get cookies
// - get pages/extract data (extractor function)
//