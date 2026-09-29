export type SkeletonVariantName =
  | "block"
  | "text"
  | "circle"
  | "button"
  | "avatar"
  | "profile"
  | "input"
  | "card"
  | "article"
  | "table"
  | "list"
  | "grid"
  | "image"
export type SkeletonAnimationName = "none" | "shimmer" | "pulse" | "wave";
/** Object form of `outlined`. Omitted fields fall back to 1px solid. */
export type SkeletonOutline = {
  enabled?: boolean;
  /** Border thickness; numbers are px, strings are any CSS length. */
  width?: number | string;
  /** Any CSS border-style; the common ones autocomplete. */
  style?: "solid" | "dashed" | "dotted" | "double" | (string & {});
};

export type SkeletonBaseProps = {
  size?: number | string;
    width?: number | string;
  height?: number | string;
  radius?: number | string;
  color?: string;
  highlight?: string;
  animation?: SkeletonAnimationName;
  speed?: number;
  striped?: boolean;
  angle?: number | string;
  avatarSize?: number | string;
  lines?: number;
  outlined?: boolean | SkeletonOutline;
  options?: Record<string, any>;
};
