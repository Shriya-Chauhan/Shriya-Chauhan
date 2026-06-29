import { readFile, writeFile } from "node:fs/promises";

async function updateQuote() {
  const response = await fetch("https://api.animechan.io/v1/quotes/random");
  const json = await response.json();

  const quote = json.data.content;
  const character = json.data.character.name;
  const anime = json.data.anime.name;

  const replacement = `> ${quote}

**— ${character}**  
*${anime}*`;

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