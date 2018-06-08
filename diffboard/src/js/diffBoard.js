jQuery(document)
		.ready(function () {
				jQuery(".collapsible").collapsible();
				var selected = "";

				var pages = jQuery("li .text").map(function () {
						var name = jQuery(this).text();
						return {name: null};
				}).get();

				var autoData = Object.assign({}, [].concat(pages));

				var resultIds = jQuery("li[id]").map(function () {
						if (jQuery("li[id='" + this.id + "'] .result").length) {
								return this.id;
						} else {
								return;
						}
				}).get();

				resultIds.forEach(function (resultId) {
						var result = document.querySelector("li[id='" + resultId + "'] pre.result");
						var fragment = document.createDocumentFragment();
						var lines = result
								.textContent
								.split(/\r?\n/);
						lines.forEach(function (line) {
								var node;
								if (line.includes("\u001b-")) {
										node = document.createElement("del");
										node.appendChild(document.createTextNode(line + "\n"));
								} else if (line.includes("\u001b+")) {
										node = document.createElement("ins");
										node.appendChild(document.createTextNode(line + "\n"));
								} else {
										node = document.createTextNode(line + "\n");
								}
								fragment.appendChild(node);
						});
						result.textContent = "";
						result.appendChild(fragment);
				});

				window.onload = function () {
						onDiffViewTypeChange(document.querySelector('#settings [name="diff-view-type"]:checked'));
				};

				jQuery("li.text").click(function () {
						selected = this.innerText;
				});

				jQuery("[id*='stat']").click(function () {
						jQuery("[id*='stat']").removeClass("active");
						jQuery("#" + this.id).addClass("active");
						if (this.id.includes("all")) {
								jQuery("li.match").css("display", "block");
								jQuery("li.discrepancy").css("display", "block");
						} else if (this.id.includes("match")) {
								jQuery("li.match").css("display", "block");
								jQuery("li.discrepancy").css("display", "none");
						} else {
								jQuery("li.match").css("display", "none");
								jQuery("li.discrepancy").css("display", "block");
						}
				});

				jQuery("[class*='btn']").click(function () {
						var selectedBtn = this.classList[1];
						var id = jQuery(this)
								.closest("li")
								.attr("id");
						var idSelector = "[id='" + id + "']";
						if (this.className.includes("_selected")) {
								jQuery(this).removeClass("_selected");
								jQuery(this).addClass("_disabled");
								jQuery(idSelector + " th." + selectedBtn).css("display", "none");
								jQuery(idSelector + " td." + selectedBtn).css("display", "none");
						} else {
								jQuery(this).addClass("_selected");
								jQuery(this).removeClass("_disabled");
								jQuery(idSelector + " th." + selectedBtn).css("display", "");
								jQuery(idSelector + " td." + selectedBtn).css("display", "");
						}
				});

				jQuery("input.autocomplete").autocomplete({
						// data: autoData
				});
				function onDiffViewTypeChange(radio, id) {
						var idSelector = "[id='" + id + "']";
						if (radio.value == "full") {
								jQuery(idSelector + " del").css("display", "block");
								jQuery(idSelector + " ins").css("display", "block");
						} else if (radio.value == "add") {
								jQuery(idSelector + " del").css("display", "none");
								jQuery(idSelector + " ins").css("display", "block");
						} else {
								jQuery(idSelector + " del").css("display", "block");
								jQuery(idSelector + " ins").css("display", "none");
						}
				}
				jQuery("[name='diff-view-type']")
						.change(function () {
								var parentId = jQuery(this)
										.closest("li")
										.attr("id");
								onDiffViewTypeChange(this, parentId);
						});

				jQuery("#autocomplete-input").on("change keyup", function () {
						var value = jQuery("#autocomplete-input").val();
						var filter,
								ul,
								li,
								text,
								i;
						filter = value.toUpperCase();
						ul = document.getElementById("list");
						li = ul.getElementsByTagName("li");

						// Loop through all list items, and hide those who don't match the search query
						for (i = 0; i < li.length; i++) {
								text = jQuery(li[i]).attr("id");
								if (text.toUpperCase().indexOf(filter) > -1) {
										li[i].style.display = "";
								} else {
										li[i].style.display = "none";
								}
						}
				});

				var stickyStatsAndSearchBar = jQuery(".stats-and-search")
						.offset()
						.top;

				jQuery(window).scroll(function () {
						if (jQuery(window).scrollTop() > stickyStatsAndSearchBar) {
								jQuery(".stats-and-search").addClass("affix");
						} else {
								jQuery(".stats-and-search").removeClass("affix");
						}
				});

				jQuery('time').each(function (i, e) {
						var time = moment(jQuery(e).attr('datetime'));
						jQuery(e).html('<span>' + time.fromNow() + '</span>');
				});
		});
