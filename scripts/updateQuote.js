import { readFile, writeFile } from "node:fs/promises";

async function updateQuote() {
  const response = await fetch("https://api.animechan.io/v1/quotes/random");
  const json = await response.json();

  const quote = json.data.content;
  const character = json.data.character.name;
  const anime = json.data.anime.name;

  const query = `
query ($search: String) {
  Character(search: $search) {
    image {
      large
    }
  }
}
`;

const anilistResponse = await fetch("https://graphql.anilist.co", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query,
    variables: {
      search: character,
    },
  }),
});

const anilistJson = await anilistResponse.json();

const image =
  anilistJson.data?.Character?.image?.large ??
  "https://via.placeholder.com/180";

  const replacement = `
<p align="center">
  <img src="${image}" width="180" />
</p>

> ${quote}

**— ${character}**  
*${anime}*
`;

  let readme = await readFile("README.md", "utf8");

  readme = readme.replace(
    /<!--START_ANIME_QUOTE-->[\s\S]*<!--END_ANIME_QUOTE-->/,
    `<!--START_ANIME_QUOTE-->
${replacement}
<!--END_ANIME_QUOTE-->`
  );

  await writeFile("README.md", readme);
}

updateQuote();