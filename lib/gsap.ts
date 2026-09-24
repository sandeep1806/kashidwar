/**
 * Single GSAP entry point. Import gsap/ScrollTrigger/SplitText from here so
 * plugins are registered exactly once (client only). Consumers must still wrap
 * their animations in `gsap.context()` and call `ctx.revert()` on unmount.
 *
 * `import "gsap"` pulls in gsap's ambient type declarations, which is what
 * types the `gsap/all` module specifier.
 */
import "gsap";
import { gsap, ScrollTrigger, SplitText } from "gsap/all";

let registered = false;

export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
