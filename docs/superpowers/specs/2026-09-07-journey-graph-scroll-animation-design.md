# Journey Graph Scroll Animation Design

## Goal

Animate the industry journey graph once when it enters the viewport. The orange line and pale area reveal together from left to right, and each journey dot highlights when the reveal reaches it.

## Behavior

- The graph starts visually unrevealed before its first viewport entry.
- When the graph enters the viewport, a single timed animation begins and continues to completion independently of further scrolling.
- The orange stroke and pale filled area share the same left-to-right reveal progress so they grow in parallel.
- Each dot and its caption switch to an active state when the reveal reaches that dot's horizontal position.
- The animation does not replay after completion, including after scrolling away and returning.
- Existing dot links and smooth scrolling remain functional.
- At viewport widths where the graph is hidden, no animation work runs.
- When `prefers-reduced-motion: reduce` is active, the graph renders immediately in its completed state.

## Implementation

Add stable classes to the SVG stroke and fill paths. Reveal both paths through a shared SVG clipping rectangle whose width is animated from zero to the full SVG width. Use an `IntersectionObserver` to start the sequence once, then update progress with `requestAnimationFrame`. Dot thresholds come from each node's inline horizontal percentage, keeping animation timing aligned with the existing layout without duplicating positions.

CSS will define the initial, active, and completed dot/caption appearance. JavaScript will add state classes only; it will not replace existing hover or navigation behavior.

## Failure Handling

If `IntersectionObserver` is unavailable, or SVG animation setup cannot be resolved, the graph is shown fully rather than left hidden. The same completed fallback applies for reduced motion.

## Verification

- Confirm the line and fill reveal together without separating.
- Confirm all three dots activate in order as the reveal reaches them.
- Confirm the sequence plays once and stays complete after revisiting the section.
- Confirm dot links still scroll to their corresponding stages.
- Confirm reduced-motion and mobile layouts do not leave hidden content.
