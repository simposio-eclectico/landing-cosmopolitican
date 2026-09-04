import { findSearchResults, type SearchEntry } from "@lib/searchIndex";

export const initSearchModal = (searchIndex: SearchEntry[]) => {
	const searchOverlay = document.getElementById("search-overlay");
	const searchInput = document.getElementById("search-input");
	const searchResults = document.getElementById("search-results");
	const searchEmpty = document.getElementById("search-empty");
	const searchHint = document.getElementById("search-hint");
	const searchBtn = document.getElementById("nav-search-btn");
	const searchCloseBtn = document.getElementById("search-close");
	let activeResultIndex = -1;

	if (searchHint) {
		const shortcutKey = navigator.platform.toUpperCase().includes("MAC")
			? "⌘"
			: "Ctrl";
		searchHint.innerHTML = `Escribe para buscar en la revista. Atajo: <kbd>${shortcutKey}</kbd><kbd>K</kbd>`;
	}

	const renderSearchResults = (results: SearchEntry[]) => {
		if (!searchResults || !searchEmpty || !searchHint) {
			return;
		}

		searchResults.innerHTML = "";
		activeResultIndex = -1;

		if (results.length === 0) {
			searchResults.hidden = true;
			searchEmpty.hidden = false;
			searchHint.hidden = true;
			return;
		}

		searchEmpty.hidden = true;
		searchHint.hidden = true;
		searchResults.hidden = false;

		for (const [index, entry] of results.entries()) {
			const item = document.createElement("li");
			item.className = "search-result";
			item.setAttribute("role", "option");

			const link = document.createElement("a");
			link.className = "search-result__link";
			link.href = entry.href;
			link.dataset.index = String(index);

			const media = document.createElement("span");
			media.className = "search-result__media";

			if (entry.imageSrc) {
				const thumb = document.createElement("img");
				thumb.className = "search-result__thumb";
				thumb.src = entry.imageSrc;
				thumb.alt = entry.imageAlt ?? entry.title;
				thumb.width = 100;
				thumb.height = 100;
				thumb.loading = "lazy";
				media.append(thumb);
			} else {
				media.classList.add("search-result__media--placeholder");
				media.setAttribute("aria-hidden", "true");
			}

			const content = document.createElement("span");
			content.className = "search-result__content";

			const title = document.createElement("span");
			title.className = "search-result__title";
			title.textContent = entry.title;

			const meta = document.createElement("span");
			meta.className = "search-result__meta";

			const section = document.createElement("span");
			section.className = "search-result__section";
			section.textContent = entry.menuSection;

			const separator = document.createElement("span");
			separator.className = "search-result__separator";
			separator.setAttribute("aria-hidden", "true");
			separator.textContent = "·";

			const author = document.createElement("span");
			author.className = "search-result__author";
			author.textContent = entry.author;

			meta.append(section, separator, author);
			content.append(title, meta);
			link.append(media, content);
			item.append(link);
			searchResults.append(item);
		}
	};

	const setActiveResult = (index: number) => {
		if (!searchResults) {
			return;
		}

		const links = searchResults.querySelectorAll(".search-result__link");
		activeResultIndex = index;

		for (const [linkIndex, link] of links.entries()) {
			link.classList.toggle(
				"search-result__link--active",
				linkIndex === activeResultIndex,
			);
		}

		if (activeResultIndex >= 0) {
			links[activeResultIndex]?.scrollIntoView({ block: "nearest" });
		}
	};

	const openSearch = () => {
		if (
			!searchOverlay ||
			!searchInput ||
			!searchEmpty ||
			!searchHint ||
			!searchResults
		) {
			return;
		}

		searchOverlay.hidden = false;
		searchOverlay.classList.add("active");
		document.body.style.overflow = "hidden";
		searchInput.value = "";
		renderSearchResults([]);
		searchEmpty.hidden = true;
		searchHint.hidden = false;
		searchResults.hidden = true;
		searchInput.focus();
	};

	const closeSearch = () => {
		if (!searchOverlay) {
			return;
		}

		searchOverlay.classList.remove("active");
		searchOverlay.hidden = true;
		document.body.style.overflow = "";
		activeResultIndex = -1;
	};

	const handleSearchInput = () => {
		if (!searchInput) {
			return;
		}

		renderSearchResults(findSearchResults(searchIndex, searchInput.value));
	};

	searchBtn?.addEventListener("click", openSearch);
	searchCloseBtn?.addEventListener("click", closeSearch);
	searchOverlay?.addEventListener("click", (event) => {
		if (event.target === searchOverlay) {
			closeSearch();
		}
	});
	searchInput?.addEventListener("input", handleSearchInput);
	searchInput?.addEventListener("keydown", (event) => {
		if (!searchResults) {
			return;
		}

		const links = searchResults.querySelectorAll(".search-result__link");

		if (event.key === "Escape") {
			event.preventDefault();
			closeSearch();
			return;
		}

		if (links.length === 0) {
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveResult(
				activeResultIndex < links.length - 1 ? activeResultIndex + 1 : 0,
			);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveResult(
				activeResultIndex > 0 ? activeResultIndex - 1 : links.length - 1,
			);
			return;
		}

		if (event.key === "Enter" && activeResultIndex >= 0) {
			event.preventDefault();
			(links[activeResultIndex] as HTMLAnchorElement | undefined)?.click();
		}
	});

	document.addEventListener("keydown", (event) => {
		const isShortcut =
			(event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

		if (isShortcut) {
			event.preventDefault();
			openSearch();
		}
	});
};
