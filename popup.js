function copy(str) {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
}
function setCart() {
  const getContent = (container, element) => {
    if (!container) return null;
    const dataArray = container.querySelectorAll(element);
    const resultMap = {};

    dataArray.forEach((item) => {
      const { className, outerText } = item;
      resultMap[className] = outerText;
    });
    return resultMap;
  };

  const cardsInCart = [];
  let list = "";
  const body = document.getElementsByClassName(
    "container-fluid cart-product-list"
  )[0];
  const cards = Array.from(
    body.getElementsByClassName("row cart-item-wrapper")
  );

  if (!cards.length) {
    return { values: null, parse: null };
  }
  cards.forEach((card) => {
    if (card.getElementsByClassName("mtg-card").length) {
      const { innerText: quantity } = card.getElementsByClassName(
        "btn btn-default dropdown-toggle"
      )[0];
      const cardTaken = card.getElementsByClassName("product-link")[0];
      const content = getContent(cardTaken, "span");
      if (content?.title) {
        const separatorIndex = content?.title.indexOf("(");

        const title = content?.title.slice(
          0,
          separatorIndex === -1 ? content?.title.length : separatorIndex
        );
        const card = {
          link: cardTaken?.href,
          quantity: +quantity,
          title,
        };
        cardsInCart.push(card);
        list += `<li><span>${card?.quantity}</span> x <a href="${card?.link}" target="_blank">${card?.title}</a></li>`;
      }
    }
  });

  return { values: cardsInCart, parse: list };
}

async function goToCart() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.update(tab.id, { url: "https://www.cardkingdom.com/cart" });
  document.getElementById("wrapper-loader").style.display = "flex";
  document.getElementById("wrapper-disclaimer").style.display = "none";
  setTimeout(() => {
    document.getElementById("setCart").click();
  }, 2000);
}
document.getElementById("goToCart").addEventListener("click", goToCart);
document.getElementById("made");

document.getElementById("setCart").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url.includes("cart")) {
    document.getElementById("wrapper-disclaimer").style.display = "flex";
    document.getElementById("buttons").style.display = "none";
    document.getElementById("wrapper-loader").style.display = "none";
    return;
  }
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: setCart,
    })
    .then((res) => {
      const { result } = res[0];
      if (result?.parse || result?.values) {
        document.getElementById("html-content").outerHTML = result.parse;
        document.getElementById("recap").style.display = "block";
        document.getElementById("buttons").style.display = "flex";

        chrome.storage.sync.set({ cards: result.values });
      } else {
        document.getElementById("empty").style.display = "flex";
      }
      document.getElementById("wrapper-loader").style.display = "none";
    });
});

document.getElementById("copyCart").addEventListener("click", async () => {
  chrome.storage.sync.get("cards", ({ cards }) => {
    let res = "";
    cards.forEach((x) => {
      res += `${x.quantity} ${x.title}\n`;
    });
    // Add support to another SOs.
    copy(res);
  });
});
document.getElementById("exportCart").addEventListener("click", () => {
  window.open("https://www.cardkingdom.com/builder", "_blank");
});

setTimeout(() => {
  document.getElementById("setCart").click();
}, 2000);
