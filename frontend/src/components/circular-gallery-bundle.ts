import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

type GL = Renderer['gl'];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number | undefined;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

export interface GalleryItem {
  image: string;
  badge: string;
  title: string;
  quote: string;
  author: string;
  context?: string;
  tags?: string[];
  text?: string;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 4
) {
  const words = text.split(' ');
  let line = '';
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      if (linesCount >= maxLines - 1) {
        ctx.fillText(line.trim() + '…', x, y);
        return;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
      linesCount++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&bull;/g, '•')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“");
}

function createCardCanvas(
  item: GalleryItem,
  certImg: HTMLImageElement | null
): HTMLCanvasElement {
  // High-resolution 1200x1600 canvas for ultra-sharp vector rasterization
  const width = 1200;
  const height = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Enable crisp text rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Crisp Luxurious Light Card Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(0.7, '#fafbfc');
  bgGrad.addColorStop(1, '#f1f5f9');

  roundRect(ctx, 0, 0, width, height, 52);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Subtle clean border
  roundRect(ctx, 2, 2, width - 4, height - 4, 50);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Top Accent Bar (Gradient from vibrant orange #ff6500 to amber gold #f59e0b to slate #0f172a)
  ctx.save();
  roundRect(ctx, 0, 0, width, height, 52);
  ctx.clip();
  const topBarGrad = ctx.createLinearGradient(0, 0, width, 0);
  topBarGrad.addColorStop(0, '#ff6500');
  topBarGrad.addColorStop(0.5, '#f59e0b');
  topBarGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = topBarGrad;
  ctx.fillRect(0, 0, width, 12);
  ctx.restore();

  // 2. Certificate Image Thumbnail
  const padX = 56;
  const imgY = 60;
  const imgW = width - padX * 2;
  const imgH = 610;

  if (certImg && certImg.complete && certImg.naturalWidth > 0) {
    // Subtle shadow behind certificate frame
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    roundRect(ctx, padX, imgY, imgW, imgH, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, padX, imgY, imgW, imgH, 26);
    ctx.clip();

    // Cover fill certificate image
    const imgAspect = certImg.naturalWidth / certImg.naturalHeight;
    const boxAspect = imgW / imgH;
    let renderW = imgW;
    let renderH = imgH;
    let renderX = padX;
    let renderY = imgY;

    if (imgAspect > boxAspect) {
      renderW = imgH * imgAspect;
      renderX = padX - (renderW - imgW) / 2;
    } else {
      renderH = imgW / imgAspect;
      renderY = imgY - (renderH - imgH) / 2;
    }
    ctx.drawImage(certImg, renderX, renderY, renderW, renderH);

    ctx.restore();

    // Image border
    roundRect(ctx, padX, imgY, imgW, imgH, 26);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.1)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    // Placeholder background if image is still loading
    roundRect(ctx, padX, imgY, imgW, imgH, 26);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
  }

  // 3. Badge Pill (e.g. 🥇 1ST PLACE WINNER)
  const badgeY = imgY + imgH + 46;
  ctx.font = '700 28px "Instrument Sans", "Plus Jakarta Sans", -apple-system, sans-serif';
  const rawBadge = cleanText(item.badge || '🏆 WINNER');
  const badgeMetrics = ctx.measureText(rawBadge);
  const badgeW = badgeMetrics.width + 54;
  const badgeH = 62;

  // Badge pill background in deep luxury slate #0f172a
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, padX, badgeY, badgeW, badgeH, 31);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = '700 28px "Instrument Sans", "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText(rawBadge, padX + badgeW / 2, badgeY + badgeH / 2 + 1);

  // Star Rating on right of badge
  ctx.fillStyle = '#f59e0b';
  ctx.font = '36px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('★★★★★', width - padX, badgeY + badgeH / 2);

  // 4. Hackathon Title — bold, crisp charcoal black
  const titleY = badgeY + badgeH + 46;
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 52px "Instrument Sans", "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  wrapText(ctx, cleanText(item.title), padX, titleY, width - padX * 2, 68, 2);

  // 5. Divider Line
  const divY = titleY + 152;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, divY);
  ctx.lineTo(width - padX, divY);
  ctx.stroke();

  // 6. Quote / What Organizers Say — rich italic slate
  const quoteY = divY + 34;
  ctx.font = 'italic 500 36px "Instrument Sans", "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  const quoteMaxWidth = width - padX * 2;
  const quoteLineHeight = 54;
  wrapText(ctx, cleanText(item.quote), padX, quoteY, quoteMaxWidth, quoteLineHeight, 4);

  // 7. Author / Context footer
  const footerY = height - 156;
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, footerY);
  ctx.lineTo(width - padX, footerY);
  ctx.stroke();

  const authorY = footerY + 28;
  ctx.font = '700 34px "Instrument Sans", "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillStyle = '#ff6500';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(cleanText(item.author), padX, authorY);

  if (item.context) {
    ctx.font = '500 28px "Instrument Sans", "Plus Jakarta Sans", -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(cleanText(item.context), padX, authorY + 44);
  }

  return canvas;
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  item: GalleryItem;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius?: number;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  item: GalleryItem;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius: number;
  program!: Program;
  plane!: Mesh;
  texture!: Texture;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;

  constructor({
    geometry,
    gl,
    item,
    index,
    length,
    renderer,
    scene,
    screen,
    viewport,
    bend,
    borderRadius = 0.05
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.item = item;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    this.texture = new Texture(this.gl, {
      generateMipmaps: false,
      minFilter: this.gl.LINEAR,
      magFilter: this.gl.LINEAR
    });

    // Initial placeholder canvas
    const initialCanvas = createCardCanvas(this.item, null);
    this.texture.image = initialCanvas;

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          // Dynamic inertial curve only during active scroll movement; perfectly flat and crisp at rest
          p.z = sin(p.x * 2.0) * clamp(abs(uSpeed) * 0.22, 0.0, 0.45);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec4 color = texture2D(tMap, vUv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha * color.a);
        }
      `,
      uniforms: {
        tMap: { value: this.texture },
        uSpeed: { value: 0 },
        uBorderRadius: { value: this.borderRadius },
        uPlaneSizes: { value: [0, 0] },
        uViewportSizes: { value: [0, 0] }
      },
      transparent: true
    });

    // Load actual certificate image and render complete composite card
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.item.image;
    img.onload = () => {
      const fullCardCanvas = createCardCanvas(this.item, img);
      this.texture.image = fullCardCanvas;
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(Math.max(0.0001, R * R - effectiveX * effectiveX));
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(Math.min(1.0, effectiveX / R));
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(Math.min(1.0, effectiveX / R));
      }
    }
    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uSpeed.value = this.speed;
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    const isMobile = this.screen.width < 768;
    this.scale = isMobile ? Math.max(this.screen.height / 1100, 0.6) : this.screen.height / 1300;

    // Aspect ratio of the card canvas (840 x 1120 = 0.75)
    const cardHeight = isMobile ? 860 : 960;
    const cardWidth = cardHeight * 0.75;

    this.plane.scale.y = (this.viewport.height * (cardHeight * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (cardWidth * this.scale)) / this.screen.width;

    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = isMobile ? 1.8 : 2.5;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

export interface AppConfig {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  autoScroll?: boolean;
  onActiveChange?: (index: number, item: GalleryItem) => void;
}

export class AppCore {
  container: HTMLElement;
  scrollSpeed: number;
  autoScroll: boolean;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  onCheckDebounce: (...args: any[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  rawItems: GalleryItem[] = [];
  mediasImages: GalleryItem[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;
  boundOnResize!: () => void;
  boundOnWheel!: (e: Event) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;
  isDown: boolean = false;
  start: number = 0;
  lastActiveIndex: number = -1;
  onActiveChange?: (index: number, item: GalleryItem) => void;
  userInteractedTimeout: number | undefined;
  isUserInteracting: boolean = false;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 3,
      borderRadius = 0.05,
      scrollSpeed = 2.2,
      scrollEase = 0.05,
      autoScroll = true,
      onActiveChange
    }: AppConfig = {}
  ) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.autoScroll = autoScroll;
    this.onActiveChange = onActiveChange;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 180);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, borderRadius);
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      powerPreference: 'high-performance'
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 40,
      widthSegments: 80
    });
  }

  createMedias(
    items: GalleryItem[] | undefined,
    bend: number = 3,
    borderRadius: number = 0.05
  ) {
    this.rawItems = items && items.length ? items : [];

    // Double the items array for seamless continuous looping
    this.mediasImages = this.rawItems.concat(this.rawItems);
    this.medias = this.mediasImages.map((item, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        item,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        bend,
        borderRadius
      });
    });
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.isUserInteracting = true;
    window.clearTimeout(this.userInteractedTimeout);
    this.scroll.position = this.scroll.current;
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.022);
    this.scroll.target = (this.scroll.position ?? 0) + distance;
  }

  onTouchUp() {
    this.isDown = false;
    this.onCheck();
    window.clearTimeout(this.userInteractedTimeout);
    this.userInteractedTimeout = window.setTimeout(() => {
      this.isUserInteracting = false;
    }, 2500);
  }

  onWheel(e: Event) {
    const wheelEvent = e as WheelEvent;
    const delta = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.16;
    this.isUserInteracting = true;
    window.clearTimeout(this.userInteractedTimeout);
    this.userInteractedTimeout = window.setTimeout(() => {
      this.isUserInteracting = false;
    }, 2500);
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(this.scroll.target / width);
    this.scroll.target = width * itemIndex;
  }

  scrollToIndex(index: number) {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    this.scroll.target = width * index;
    this.isUserInteracting = true;
    window.clearTimeout(this.userInteractedTimeout);
    this.userInteractedTimeout = window.setTimeout(() => {
      this.isUserInteracting = false;
    }, 3000);
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth || window.innerWidth,
      height: this.container.clientHeight || 640
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update() {
    // Subtle auto-scroll drift when user is not interacting
    if (this.autoScroll && !this.isUserInteracting && !this.isDown) {
      this.scroll.target += 0.012;
    }

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));

      if (this.onActiveChange && this.medias[0]) {
        let closestIndex = 0;
        let minDistance = Infinity;
        for (let i = 0; i < this.medias.length; i++) {
          const dist = Math.abs(this.medias[i].plane.position.x);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = i;
          }
        }
        const normalizedIndex = closestIndex % this.rawItems.length;
        if (normalizedIndex !== this.lastActiveIndex) {
          this.lastActiveIndex = normalizedIndex;
          this.onActiveChange(normalizedIndex, this.rawItems[normalizedIndex]);
        }
      }
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);

    window.addEventListener('resize', this.boundOnResize);
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: true });
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.clearTimeout(this.userInteractedTimeout);
    window.removeEventListener('resize', this.boundOnResize);
    if (this.container) {
      this.container.removeEventListener('wheel', this.boundOnWheel);
      this.container.removeEventListener('mousedown', this.boundOnTouchDown);
      this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    }
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).CircularGalleryCore = AppCore;
}
