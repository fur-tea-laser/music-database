import { db } from "./client.ts";
import * as schema from "./schema.ts";

async function seed() {
  console.log("🌱 Seeding database with current data...");

  // 1. Music Platforms
  const platforms = await db.insert(schema.musicPlatforms).values([
    {
      platformName: "Youtube Music",
      platformLabel: "YT Music",
      platformUrl: "https://music.youtube.com/",
    },
    {
      platformName: "Spotify",
      platformLabel: "Spotify",
      platformUrl: "https://open.spotify.com/",
    },
    {
      platformName: "Apple Music",
      platformLabel: "Apple Music",
      platformUrl: "https://music.apple.com/",
    },
  ]).returning();

  const getPlatformId = (label: string) =>
    platforms.find((p) => p.platformLabel === label)!.id;

  // 2. Music Collection Kinds
  const kinds = await db.insert(schema.musicCollectionKind).values([
    { collectionLabel: "Album" },
    { collectionLabel: "EP" },
    { collectionLabel: "Single" },
    { collectionLabel: "Compilation" },
    { collectionLabel: "Mix" },
  ]).returning();

  const getKindId = (label: string) =>
    kinds.find((k) => k.collectionLabel === label)!.id;

  // 3. Music Contexts
  const contexts = await db.insert(schema.musicContexts).values([
    { contextLabel: "Studio" },
    { contextLabel: "Live" },
    { contextLabel: "Concert" },
  ]).returning();

  const getContextId = (label: string) =>
    contexts.find((c) => c.contextLabel === label)!.id;

  // 4. Music Tags
  const tags = await db.insert(schema.musicTags).values([
    { tagLabel: "Hip-Hop" },
    { tagLabel: "Rock" },
    { tagLabel: "Electronic" },
    { tagLabel: "Pop" },
    { tagLabel: "Rap" },
    { tagLabel: "Jam" },
    { tagLabel: "World" },
    { tagLabel: "Punk" },
  ]).returning();

  const getTagId = (label: string) =>
    tags.find((t) => t.tagLabel === label)!.id;

  // 5. Music Artists
  const artists = await db.insert(schema.musicArtists).values([
    { artistName: "Gorillaz" },
    { artistName: "Future" },
    { artistName: "Drake" },
    { artistName: "Modest Mouse" },
    { artistName: "Dave Matthews Band" },
    { artistName: "Neneh Cherry" },
    { artistName: "MF Doom" },
  ]).returning();

  const getArtistId = (name: string) =>
    artists.find((a) => a.artistName === name)!.id;

  // 6. Music Collections

  // --- Demon Days ---
  const [demonDays] = await db.insert(schema.musicCollections).values({
    collectionTitle: "Demon Days",
    collectionCoverUrl:
      "https://lh3.googleusercontent.com/_3LJKVh0dy-71CwQzWKt0q7JHI7M2rxIMGGAdT0wEhmGEEELRX98ACJFdKK5Fyl226nuNfQ0OAMc-JtP=w544-h544-l90-rj",
    collectionNotes:
      "Demon Days is the second studio album by British virtual band Gorillaz.",
    collectionDateYear: 2005,
    collectionDateMonth: 5,
    collectionKindId: getKindId("Album"),
  }).returning();

  await db.insert(schema.musicCollectionArtists).values([
    { musicCollectionId: demonDays.id, musicArtistId: getArtistId("Gorillaz") },
  ]);
  await db.insert(schema.musicCollectionTags).values([
    { musicCollectionId: demonDays.id, musicTagId: getTagId("Hip-Hop") },
    { musicCollectionId: demonDays.id, musicTagId: getTagId("Rock") },
  ]);
  await db.insert(schema.musicCollectionContexts).values([
    { musicCollectionId: demonDays.id, musicContextId: getContextId("Studio") },
  ]);
  const ddLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/playlist?list=OLAK5uy_msC_GYWaz8ESAiX9d41hRIs2uhcL8t_aw",
    },
    {
      musicPlatformId: getPlatformId("Spotify"),
      linkUrl: "https://open.spotify.com/album/0bUTHlWbkSQysoM3VsWldT",
    },
  ]).returning();
  await db.insert(schema.musicCollectionLinks).values(
    ddLinks.map((l) => ({ musicCollectionId: demonDays.id, musicLinkId: l.id })),
  );

  // Tracks for Demon Days
  const [kidsWithGuns] = await db.insert(schema.musicTracks).values({
    trackTitle: "Kids with Guns",
    trackCollectionId: demonDays.id,
  }).returning();
  await db.insert(schema.musicTrackArtists).values([
    { trackId: kidsWithGuns.id, artistId: getArtistId("Neneh Cherry") },
  ]);
  const kwgLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=VCkFSe3voRc&si=QDfOx4gTDNbuQ09c",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    kwgLinks.map((l) => ({ trackId: kidsWithGuns.id, linkId: l.id })),
  );

  const [feelGoodInc] = await db.insert(schema.musicTracks).values({
    trackTitle: "Feel Good Inc.",
    trackCollectionId: demonDays.id,
  }).returning();
  const fgiLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=HyHNuVaZJ-k&si=fSbsOfteVn1d62XY",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    fgiLinks.map((l) => ({ trackId: feelGoodInc.id, linkId: l.id })),
  );

  const [novemberHasCome] = await db.insert(schema.musicTracks).values({
    trackTitle: "November Has Come",
    trackCollectionId: demonDays.id,
  }).returning();
  await db.insert(schema.musicTrackArtists).values([
    { trackId: novemberHasCome.id, artistId: getArtistId("MF Doom") },
  ]);
  await db.insert(schema.musicTrackTags).values([
    { trackId: novemberHasCome.id, tagId: getTagId("Hip-Hop") },
  ]);
  const nhcLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=EGc9mgpvtxU&si=BEiQztv64K8-1esQ",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    nhcLinks.map((l) => ({ trackId: novemberHasCome.id, linkId: l.id })),
  );

  // --- The Lonesome Crowded West ---
  const [lonesome] = await db.insert(schema.musicCollections).values({
    collectionTitle: "The Lonesome Crowded West",
    collectionCoverUrl:
      "https://lh3.googleusercontent.com/LE0bkhQkPI2p3XNhvmIKU--ZQkb1egNAEFt_GK693wT3fVQCGdm-A3FIqNxKl0SIGPA-S4H0ioIgxy1S=w544-h544-l90-rj",
    collectionNotes:
      "The Lonesome Crowded West is the second studio album by American rock band Modest Mouse.",
    collectionDateYear: 1997,
    collectionDateMonth: 11,
    collectionKindId: getKindId("Album"),
  }).returning();

  await db.insert(schema.musicCollectionArtists).values([
    {
      musicCollectionId: lonesome.id,
      musicArtistId: getArtistId("Modest Mouse"),
    },
  ]);
  await db.insert(schema.musicCollectionTags).values([
    { musicCollectionId: lonesome.id, musicTagId: getTagId("Rock") },
  ]);
  await db.insert(schema.musicCollectionContexts).values([
    { musicCollectionId: lonesome.id, musicContextId: getContextId("Studio") },
  ]);
  const lonesomeLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/playlist?list=OLAK5uy_n1U4MQzDst7QvSTXFU7VTYMwh7e_02ZsA",
    },
    {
      musicPlatformId: getPlatformId("Apple Music"),
      linkUrl:
        "https://music.apple.com/us/album/the-lonesome-crowded-west/1566174024",
    },
  ]).returning();
  await db.insert(schema.musicCollectionLinks).values(
    lonesomeLinks.map((l) => ({ musicCollectionId: lonesome.id, musicLinkId: l.id })),
  );

  // Tracks for Lonesome
  const [truckersAtlas] = await db.insert(schema.musicTracks).values({
    trackTitle: "Truckers Atlas",
    trackCollectionId: lonesome.id,
  }).returning();
  await db.insert(schema.musicTrackTags).values([
    { trackId: truckersAtlas.id, tagId: getTagId("Punk") },
  ]);
  const truckersLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=Io3T8MglU1o&si=-UCVSJqLd8MV0snZ",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    truckersLinks.map((l) => ({ trackId: truckersAtlas.id, linkId: l.id })),
  );

  const [cockroach] = await db.insert(schema.musicTracks).values({
    trackTitle: "Doin' The Cockroach",
    trackCollectionId: lonesome.id,
  }).returning();
  const cockroachLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=RIXWhTjnQwQ&si=WTS_tJSVbUj_Wk2S",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    cockroachLinks.map((l) => ({ trackId: cockroach.id, linkId: l.id })),
  );

  const [cowboyDan] = await db.insert(schema.musicTracks).values({
    trackTitle: "Cowboy Dan",
    trackCollectionId: lonesome.id,
  }).returning();
  const cowboyDanLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=1e4Hcm2kRjA&si=aDoNaMFUMR26fwjT",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    cowboyDanLinks.map((l) => ({ trackId: cowboyDan.id, linkId: l.id })),
  );

  const [trailerTrash] = await db.insert(schema.musicTracks).values({
    trackTitle: "Trailer Trash",
    trackCollectionId: lonesome.id,
  }).returning();
  const trailerTrashLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=5kwLVhnTYlI&si=WsgzR_NDanKi4Tu_",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    trailerTrashLinks.map((l) => ({ trackId: trailerTrash.id, linkId: l.id })),
  );

  const [polarOpposites] = await db.insert(schema.musicTracks).values({
    trackTitle: "Polar Opposites",
    trackCollectionId: lonesome.id,
  }).returning();
  const polarOppositesLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=k8A6g37KJj0&si=yOh4pCYEzCD2Vh4W",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    polarOppositesLinks.map((l) => ({ trackId: polarOpposites.id, linkId: l.id })),
  );

  // --- What A Time To Be Alive ---
  const [whatATime] = await db.insert(schema.musicCollections).values({
    collectionTitle: "What A Time To Be Alive",
    collectionCoverUrl:
      "https://lh3.googleusercontent.com/wYDYI-C9N1BtRO_CwrZrL24V-hmzGoAOFFxUwlqU05htWIqWsKmmjxfFZZEbISpaOEfktmTFkDvToaRA=w544-h544-l90-rj",
    collectionNotes:
      "What a Time to Be Alive is a collaborative mixtape by Canadian rapper Drake and American rapper Future.",
    collectionDateYear: 2015,
    collectionDateMonth: 9,
    collectionKindId: getKindId("Album"),
  }).returning();

  await db.insert(schema.musicCollectionArtists).values([
    { musicCollectionId: whatATime.id, musicArtistId: getArtistId("Future") },
    { musicCollectionId: whatATime.id, musicArtistId: getArtistId("Drake") },
  ]);
  await db.insert(schema.musicCollectionTags).values([
    { musicCollectionId: whatATime.id, musicTagId: getTagId("Hip-Hop") },
    { musicCollectionId: whatATime.id, musicTagId: getTagId("Rap") },
  ]);
  await db.insert(schema.musicCollectionContexts).values([
    { musicCollectionId: whatATime.id, musicContextId: getContextId("Studio") },
  ]);
  const watLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/playlist?list=OLAK5uy_nmrUFtSXSbVFJSm05JoPf9vzyAfqIdMm8",
    },
    {
      musicPlatformId: getPlatformId("Spotify"),
      linkUrl: "https://open.spotify.com/album/1ozpmkWcCHwsQ4QTnxOOdT",
    },
  ]).returning();
  await db.insert(schema.musicCollectionLinks).values(
    watLinks.map((l) => ({ musicCollectionId: whatATime.id, musicLinkId: l.id })),
  );

  // Tracks for What A Time
  const [digitalDash] = await db.insert(schema.musicTracks).values({
    trackTitle: "Digital Dash",
    trackCollectionId: whatATime.id,
  }).returning();
  const digitalDashLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=HDFOxsR0RoI&si=c_6MaN4z2t681g7X",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    digitalDashLinks.map((l) => ({ trackId: digitalDash.id, linkId: l.id })),
  );

  const [gutter] = await db.insert(schema.musicTracks).values({
    trackTitle: "Live From The Gutter",
    trackCollectionId: whatATime.id,
  }).returning();
  const gutterLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=B3_KKZ1XJcw&si=RW_yxP2qfI_0NmDj",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    gutterLinks.map((l) => ({ trackId: gutter.id, linkId: l.id })),
  );

  const [changeLocations] = await db.insert(schema.musicTracks).values({
    trackTitle: "Change Locations",
    trackCollectionId: whatATime.id,
  }).returning();
  const changeLocationsLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=E5RnhIrkxxg&si=HdambUhM23UoEdro",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    changeLocationsLinks.map((l) => ({ trackId: changeLocations.id, linkId: l.id })),
  );

  // --- The Best of What's Around Vol. 1 ---
  const [bestAround] = await db.insert(schema.musicCollections).values({
    collectionTitle: "The Best of What's Around Vol. 1",
    collectionCoverUrl:
      "https://lh3.googleusercontent.com/lGyFzskk1LWd7hhi-wCYZT2g_syBJArQyiBQ5mPPskMPFdBAush18ZO2v_WlszCvO0F-cR1qfEytcPWH=w544-h544-l90-rj",
    collectionNotes:
      "The Best of What's Around Vol. 1 is a greatest hits album by Dave Matthews Band.",
    collectionDateYear: 2006,
    collectionDateMonth: 11,
    collectionKindId: getKindId("Compilation"),
  }).returning();

  await db.insert(schema.musicCollectionArtists).values([
    {
      musicCollectionId: bestAround.id,
      musicArtistId: getArtistId("Dave Matthews Band"),
    },
  ]);
  await db.insert(schema.musicCollectionTags).values([
    { musicCollectionId: bestAround.id, musicTagId: getTagId("Rock") },
    { musicCollectionId: bestAround.id, musicTagId: getTagId("Jam") },
    { musicCollectionId: bestAround.id, musicTagId: getTagId("World") },
  ]);
  await db.insert(schema.musicCollectionContexts).values([
    { musicCollectionId: bestAround.id, musicContextId: getContextId("Studio") },
    {
      musicCollectionId: bestAround.id,
      musicContextId: getContextId("Concert"),
    },
  ]);
  const baLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/playlist?list=OLAK5uy_nBtbroAAlwPIb821FUP9CgYcnyAOM4aDM",
    },
    {
      musicPlatformId: getPlatformId("Apple Music"),
      linkUrl:
        "https://open.spotify.com/album/1kae5MA0gbXveSdJDYtFHo?autoplay=true",
    },
    {
      musicPlatformId: getPlatformId("Spotify"),
      linkUrl:
        "https://music.apple.com/us/album/the-best-of-whats-around-vol-1/311604755",
    },
  ]).returning();
  await db.insert(schema.musicCollectionLinks).values(
    baLinks.map((l) => ({ musicCollectionId: bestAround.id, musicLinkId: l.id })),
  );

  // Tracks for Best Around
  const [warehouse] = await db.insert(schema.musicTracks).values({
    trackTitle: "Warehouse",
    trackCollectionId: bestAround.id,
  }).returning();
  const warehouseLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=rPnAcMuBrRM&si=X-GPkf1A9rzhmd8L",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    warehouseLinks.map((l) => ({ trackId: warehouse.id, linkId: l.id })),
  );

  const [everyday] = await db.insert(schema.musicTracks).values({
    trackTitle: "Everyday",
    trackCollectionId: bestAround.id,
  }).returning();
  const everydayLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=kvCA849JYtI&si=rpPlB4yMm4TAY1pG",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    everydayLinks.map((l) => ({ trackId: everyday.id, linkId: l.id })),
  );

  const [twoStep] = await db.insert(schema.musicTracks).values({
    trackTitle: "Two Step",
    trackCollectionId: bestAround.id,
  }).returning();
  const twoStepLinks = await db.insert(schema.musicLinks).values([
    {
      musicPlatformId: getPlatformId("YT Music"),
      linkUrl:
        "https://music.youtube.com/watch?v=9UeTCzs2SSU&si=AlE_X7ATU6xjeCTN",
    },
  ]).returning();
  await db.insert(schema.musicTrackLinks).values(
    twoStepLinks.map((l) => ({ trackId: twoStep.id, linkId: l.id })),
  );

  // --- Danish & Blue ---
  await db.insert(schema.musicCollections).values({
    collectionTitle: "Danish & Blue",
    collectionCoverUrl:
      "https://lh3.googleusercontent.com/V-fAk8pKO9-xHt5rtLAnMdrJZK2Sxku7zDhVMPMixq7xMOtS9N-kMckDo4HQYKkng5ph1c6hFhVZGDvE=w544-h544-l90-rj",
    collectionNotes: "",
    collectionDateYear: 2013,
    collectionDateMonth: 4,
    collectionKindId: getKindId("Album"),
  });

  console.log("✅ Seeding complete!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:");
  console.error(err);
  Deno.exit(1);
});
