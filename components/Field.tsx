"use client";

import { useEffect, useRef } from "react";

// The halftone field: one triangle, one fragment shader, no library.
// `order` 0 = scattered noise, 1 = a regular dot screen. It is noise during load, order at rest,
// and loosens a little with scroll speed and near the pointer.
export const field = { order: 0, loosen: 0 };

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform vec2 uMouse;uniform float uTime;uniform float uOrder;uniform float uCell;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.02;a*=.5;}return s;}
void main(){
  vec2 px=gl_FragCoord.xy;
  vec2 g=floor(px/uCell); vec2 f=fract(px/uCell)-.5;
  vec2 uv=g*uCell/uRes.y;
  float field=fbm(uv*1.7+vec2(uTime*.02,0.));
  float d=distance(px,uMouse)/uRes.y;
  float order=uOrder*(1.-.85*smoothstep(.2,.0,d));
  float r=hash(g+floor(uTime*2.));
  float chaotic=step(.74,field*.75+r*.45)*(.10+.30*r);
  float ordered=.07+.20*smoothstep(.25,.75,field);
  float size=mix(chaotic,ordered,order);
  vec2 jitter=(vec2(hash(g+1.3),hash(g+7.1))-.5)*(1.-order)*.7;
  float m=smoothstep(size,size-.07,length(f-jitter));
  // fade toward the edges so the screen sits behind the wordmark, not the whole page
  vec2 c=(px/uRes-vec2(.58,.56))*vec2(1.25,1.5);
  float vig=smoothstep(1.0,.25,length(c));
  vec3 col=mix(vec3(.047),vec3(.74,.80,.85),m*mix(.30,.19,order)*vig);
  gl_FragColor=vec4(col,1.);
}`;

export default function Field() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    // Desktop pointers only; phones and reduced-motion keep the static CSS dots underneath.
    if (!matchMedia("(pointer: fine) and (min-width: 960px) and (prefers-reduced-motion: no-preference)").matches) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes"), uMouse = u("uMouse"), uTime = u("uTime"), uOrder = u("uOrder"), uCell = u("uCell");

    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let mx = -9999, my = -9999, visible = true, raf = 0, last = 0, moved = 0;

    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uCell, 9 * dpr);
    };
    resize();
    canvas.style.opacity = "1";

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * dpr;
      my = (r.bottom - e.clientY) * dpr;
      moved = performance.now();
    };
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      // At rest the picture barely changes: 12 fps is plenty. Full rate only while something is happening.
      const busy = field.order < 0.999 || field.loosen > 0.01 || t - moved < 400;
      if (!busy && t - last < 83) return;
      last = t;
      gl.uniform1f(uTime, t / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uOrder, Math.max(0, field.order - field.loosen));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return <canvas ref={ref} className="field" aria-hidden="true" style={{ opacity: 0 }} />;
}
