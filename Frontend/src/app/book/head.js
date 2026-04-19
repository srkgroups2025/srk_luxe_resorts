import { TEXT } from "@/constants/site";

export default function Head() {
  return (
    <>
      <title key="title">Rooms | {TEXT.SITE.TITLE}</title>
      <meta
        name="description"
        content={TEXT.SEO.ROOMS}
        key="description"
      />
    </>
  );
}
