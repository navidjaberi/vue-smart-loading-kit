import type { Component } from "vue";
import type { SkeletonVariantName } from "./types";
import Block from "./variants/Block.vue";
import Text from "./variants/Text.vue";
import Circle from "./variants/Circle.vue";
import Button from "./variants/Button.vue";
import Avatar from "./variants/Avatar.vue";
import Profile from "./variants/Profile.vue";
import Input from "./variants/Input.vue";
import Card from "./variants/Card.vue";
import Article from "./variants/Article.vue";
import Table from "./variants/Table.vue";
import List from "./variants/List.vue";
import Grid from "./variants/Grid.vue";
import Image from "./variants/Image.vue";
export const skeletonVariants: Record<SkeletonVariantName, Component> = {
  block: Block,
  text: Text,
  circle: Circle,
  button: Button,
  avatar: Avatar,
  profile: Profile,
  input: Input,
  card: Card,
  article: Article,
  table: Table,
  list: List,
  grid: Grid,
  image: Image,
};
