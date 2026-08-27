export interface LightboxTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface LightboxState {
  isOpen: boolean;
  svgContent: string;
  transform: LightboxTransform;
  title?: string;
}

export const INITIAL_LIGHTBOX_TRANSFORM: LightboxTransform = {
  scale: 1.0,
  translateX: 0,
  translateY: 0,
};

export const INITIAL_LIGHTBOX_STATE: LightboxState = {
  isOpen: false,
  svgContent: '',
  transform: INITIAL_LIGHTBOX_TRANSFORM,
};
