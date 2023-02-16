// const express = require("express");
import express from "express";
const app = express();
// const fetch = require("node-fetch");
import fetch from 'node-fetch';


app.use(express.json());

function parseCookie(str) {
	return str
		.split(";")
		.map(cookie => {
			cookie = cookie.trim();
			var idx = cookie.indexOf("=");
			var splits = [cookie.slice(0, idx), cookie.slice(idx + 1)];
			return splits
		})
		.reduce((acc, v) => {
			acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
			return acc;
		}, {});
}

app.get("/", async (req, res) => {
	const username = "marelsmare1@gmail.com";
	const password = "E$$enboob2002";
	const r = await fetch("https://www.wattpad.com/login", {
		method: "POST",
		headers: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
			"Content-Type": "application/x-www-form-urlencoded",
			'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"'
		},
		body: new URLSearchParams({
			username,
			password
		})
	});

	const cookieHeader = r.headers.get("set-cookie");
	const cookies = parseCookie(cookieHeader);


	const site = await fetch("https://www.wattpad.com/", {
		method: "GET",
		headers: {
			"cookie": cookieHeader
		},
	});
	console.log(
		cookies
	)
	const html = await site.text()
	res.send(html);
});

app.listen("8080")