import { readFile, writeFile } from "node:fs/promises";

async function updateQuote() {
  // Fetch a random quote
  const response = await fetch("https://api.animechan.io/v1/quotes/random");
  const json = await response.json();

  const quote = json.data.content;
  const character = json.data.character.name;
  const anime = json.data.anime.name;

  // Query AniList using the anime name
  const query = `
    query ($anime: String) {
      Media(search: $anime, type: ANIME) {
        characters {
          nodes {
            name {
              full
            }
            image {
              large
            }
          }
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
        anime,
      },
    }),
  });

  const anilistJson = await anilistResponse.json();

  const media = anilistJson.data?.Media;

  const matchedCharacter = media?.characters?.nodes.find((c) =>
    c.name.full.toLowerCase().includes(character.toLowerCase()) ||
    character.toLowerCase().includes(c.name.full.toLowerCase())
  );

  const image = matchedCharacter?.image?.large;

  // Generate README section
  const replacement = `
${image ? `<p align="center"><img src="${image}" width="180" /></p>` : ""}

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