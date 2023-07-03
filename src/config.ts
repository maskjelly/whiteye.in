import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://whiteye.in/",
  author: "Aaryan Singh",
  desc: "A blog place where i speak my mind.",
  title: "Whiteye",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/asdfghjA1/whiteye.in",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:aaryan14decembersingh@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/LiquidZooo",
    linkTitle: `${SITE.title} on Twitter`,
    active: false,
  },
];
