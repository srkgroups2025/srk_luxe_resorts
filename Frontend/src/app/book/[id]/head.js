import { TEXT } from "@/constants/site";

export default function Head() {
  return (
    <>
      <title key="title">Book a Room | {TEXT.SITE.TITLE}</title>
      <meta
        name="description"
        content={TEXT.SEO.BOOKING}
        key="description"
      />
    </>
  );
}
