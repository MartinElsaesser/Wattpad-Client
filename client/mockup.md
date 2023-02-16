Components:
* Localstorage Interface
* Pinia?
* Wattpad Client
* Reader

Reader:
* replaceYNByName(name)
* state: paused | playing | stopped
* play_resume
* pause
* stop
* configs...()

Wattpad Client:
* getChapter()
	* text: String
	* url to this chapter: String
	* chapter number: Number
	* headline: String
	* url to next chapter: String

* getLibrary() requires: user
	* books: []

* getBook()
	* chapters: [chapterUrl?]
	* last read chapter: Number
	* image: Base64
	* tags: [String]
	* tile: String

* getUser()

