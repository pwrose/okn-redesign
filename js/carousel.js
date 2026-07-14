// Knowledge-graph carousel arrows.
//
// Markup (see frontend/index.html.j2):
//
//   <div class="kg-carousel" data-carousel="kg">
//     <button class="kg-carousel-arrow left"  data-carousel-arrow="left">&#8249;</button>
//     <div class="kg-carousel-track" data-carousel-track>
//       <a class="kg-card">...</a>  ...repeated...
//     </div>
//     <button class="kg-carousel-arrow right" data-carousel-arrow="right">&#8250;</button>
//   </div>
//
// Behavior:
//   * Clicking left/right scrolls the track by one card-width.
//   * Arrows disable themselves when the track is at the corresponding edge.
//   * Native scrolling (trackpad, touch, wheel) is preserved.
//   * Window resize and content load re-evaluate edge state.

(function () {
    "use strict";

    function setupCarousel(root) {
        var track = root.querySelector("[data-carousel-track]");
        var leftBtn  = root.querySelector('[data-carousel-arrow="left"]');
        var rightBtn = root.querySelector('[data-carousel-arrow="right"]');
        if (!track) return;

        // Use the first card's outer width (including the flex gap) as
        // the page distance. Falls back to the visible track width if
        // there are no cards yet.
        function pageDistance() {
            var first = track.querySelector(".kg-card");
            if (!first) return track.clientWidth;
            var style = window.getComputedStyle(track);
            // ``column-gap`` is the modern flex gap; older browsers
            // expose it as ``gap``. Either way it's a CSS length.
            var gap = parseFloat(style.columnGap || style.gap || "0") || 0;
            return first.offsetWidth + gap;
        }

        function updateArrows() {
            if (!leftBtn || !rightBtn) return;
            var maxScroll = track.scrollWidth - track.clientWidth;
            // 1px slop for sub-pixel rendering on fractional zoom.
            leftBtn.disabled  = track.scrollLeft <= 1;
            rightBtn.disabled = track.scrollLeft >= maxScroll - 1;
        }

        function scrollByPage(direction) {
            track.scrollBy({
                left: direction * pageDistance(),
                behavior: "smooth"
            });
        }

        if (leftBtn)  leftBtn.addEventListener("click",  function () { scrollByPage(-1); });
        if (rightBtn) rightBtn.addEventListener("click", function () { scrollByPage(1); });

        // Edge-state updates. ``scroll`` fires during user drags too,
        // so the arrows stay in sync with native scrolling.
        track.addEventListener("scroll", updateArrows, { passive: true });
        window.addEventListener("resize", updateArrows);

        // Initial state. Run after layout settles in case images or
        // late-arriving CSS change the track width.
        updateArrows();
        // One more pass on the next frame to catch subpixel layout.
        if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(updateArrows);
        }
    }

    function init() {
        var roots = document.querySelectorAll('[data-carousel]');
        for (var i = 0; i < roots.length; i++) {
            setupCarousel(roots[i]);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
