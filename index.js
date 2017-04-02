/*! (C) 2017 Andrea Giammarchi - @WebReflection - ISC License */
/**
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
 * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
document.addEventListener('click', function (e) {
  // find the link node
  var anchor = e.target.closest('a');
  if (
    // it was found
    anchor &&
    // it's for the current page
    /^(?:_self)?$/i.test(anchor.target) &&
    // it's not a download
    !anchor.hasAttribute('download') &&
    // it's not a resource handled externally
    anchor.getAttribute('rel') !== 'external'
  ) {
    // all states are simply fully resolved URLs
    // pushstate will be the new page with old one as state
    // popstate will be old page with previous one as state.
    var next = new URL(anchor.href);
    var curr = location;
    // only if in the same origin
    if (next.origin === curr.origin) {
      // verify it's not just an anchor change
      var redirect = next.pathname + next.search;
      var hash = next.hash;
      var scrollIntoView = true;
      // in every case prevent the default action
      e.preventDefault();
      // but don't stop propagation, other listeners
      // might want to be triggered regardless the history
      if (redirect === (curr.pathname + curr.search)) {
        // anchors should do what anchors do, only if valid
        // https://www.w3.org/TR/html4/types.html#type-name
        if (/^#[a-z][a-z0-9.:_-]+$/i.test(hash)) {
          var target = document.querySelector(
            hash + ',[name="' + hash.slice(1) + '"]'
          );
          if (target) {
            // verify if other listeners tried to prevent the default
            e.preventDefault = function () { scrollIntoView = false; };
            // after this event has captured and bubbled the DOM
            setTimeout(function () {
              // if nobody else prevented the default
              // simulate what an anchor would've done
              if (scrollIntoView) target.scrollIntoView(true);
            });
          }
        }
        // replace the history to ignore the popstate on anchor
        history.replaceState(history.state, document.title, redirect + hash);
      } else {
        // trigger a new pushstate notification
        var evt = new CustomEvent('pushstate');
        evt.state = curr.href;
        // being sure it happens after so the new location will be available
        setTimeout(function () {
          // dispatch the event
          dispatchEvent(evt);
          // also trigger Level 0 if possible
          if (window.onpushstate) onpushstate(evt);
        });
        history.pushState(next.href, document.title, redirect + hash);
      }
    }
  }
}, true);
