// Vanilla i18n from Github
// https://github.com/dazecoop/vanilla-js-i18n-translator

// List of available locales
const availableLocales = ["en", "es"];

// Default locale.
const defaultLanguage = "en";

// Locale translations.
const locales = {
  // EN
  en: {
    cart: {
      copy: "Copy list",
      open: "Open Deck builder",
      recap: "Recap",
      title: "Card Kingdom Cart.",
      empty: "Cart is empty",
      works: "This extension only works on the",
    },
    header: {
      info: "Community made",
    },
    footer: {
      by: "This browser extension is intended for non-commercial purposes only. Card Kingdom is not involved in any aspect of this extension. By installing and using this extension, you agree to abide by these terms and uses. --- May 2024",
    },
  },
  es: {
    cart: {
      copy: "Copiar lista",
      open: "Abrir Deck builder",
      recap: "Resumen",
      title: "carrito de Card Kingdom.",
      empty: "El carrito esta vacio",
      works: "Esta extension solo funciona en el",
    },
    header: {
      info: "Hecho por la comunidad",
    },
    footer: {
      by: "Esta extensión del navegador está destinada únicamente a fines no comerciales. Card Kingdom no participa en ningún aspecto de esta extensión. Al instalar y utilizar esta extensión, acepta cumplir con estos términos y usos. --- May 2024",
    },
  },
};

// Manually detect users' language, strip languages such as `en-GB` to just `en`.
let language = (
  window.navigator.userLanguage || window.navigator.language
).substr(0, 2);

// If `?lang=` exists in URL params & is valid, then use that instead.
const urlParams = new URLSearchParams(window.location.search);
const langFromUrl = urlParams.get("lang");
if (langFromUrl && availableLocales.includes(langFromUrl)) {
  language = langFromUrl;
}

// Get all page elements to be translated.

// Get JSON object of translations.

// On each element, found the translation from JSON file & update.
function setValues(lang) {
  // Set `pageLanguage` only if its available within our locales, otherwise default.
  let pageLanguage = defaultLanguage;
  if (availableLocales.includes(lang)) {
    pageLanguage = lang;
  }

  document.getElementById("langSelector").value = lang;
  const elements = document.querySelectorAll("[data-i18n]");
  const json = locales[pageLanguage];
  elements.forEach((element, index) => {
    const key = element.getAttribute("data-i18n");
    let text = key.split(".").reduce((obj, i) => (obj ? obj[i] : null), json);

    // Does this text have any variables? (eg {something})
    const variables = text.match(/{(.*?)}/g);
    if (variables) {
      // Iterate each variable in the text.
      variables.forEach((variable) => {
        // Filter all `data-*` attributes for this element to find the matching key.
        Object.entries(element.dataset).filter(([key, value]) => {
          if (`{${key}}` === variable) {
            try {
              // Attempt to run actual JavaScript code.
              text = text.replace(
                `${variable}`,
                new Function(`return (${value})`)()
              );
            } catch (error) {
              // Probably just static text replacement.
              text = text.replace(`${variable}`, value);
            }
          }
        });
      });
    }

    // Regular text replacement for given locale.
    element.innerHTML = text;
  });

  // Set <html> tag lang attribute.
  const htmlElement = document.querySelector("html");
  htmlElement.setAttribute("lang", pageLanguage);
}

//default call
setValues(language);

document.getElementById("langSelector").addEventListener("click", () => {
  setValues(document.getElementById("langSelector").value);
});
