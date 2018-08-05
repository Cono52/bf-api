/* @flow */

export type Site = {
  subs: Array<string>,
  _id: string,
  baseUrl: string
};

export type Article = {
  title: string,
  date: string,
  link: string
};
