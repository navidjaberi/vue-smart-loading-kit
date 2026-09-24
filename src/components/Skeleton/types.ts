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
  outlined?:
    | boolean
    | { enabled?: boolean; width?: string | number; style?: string };
  options?: Record<string, any>;
};
