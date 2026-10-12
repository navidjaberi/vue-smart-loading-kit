/** Realistic markup covering every rule in skeletonize.css. */
export const FIXTURE = `
<article class="card" style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;width:320px;font:16px/1.5 system-ui">
  <div class="row" style="display:flex;gap:10px;align-items:center">
    <img class="avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'/%3E" width="48" height="48" style="border-radius:50%" alt="Ada">
    <div><div class="name">Ada Lovelace</div><small class="role">Engineer</small></div>
  </div>
  <h3 class="title">A title long enough to wrap onto two lines here</h3>
  <p class="para">A paragraph with <strong class="inline">bold text</strong> and a <a class="link" href="#">link</a> inside it.</p>
  <ul class="list"><li class="item">First item</li><li class="item">Second item</li></ul>
  <table class="table" style="border-collapse:collapse"><tr><td class="cell" style="border:2px solid #000;padding:4px">Cell</td></tr></table>
  <form><label class="label">Email</label><input class="input" placeholder="you@example.com"><button class="button" type="button"><svg class="icon" width="12" height="12"><circle cx="6" cy="6" r="6"/></svg>Follow</button></form>
  <p class="ignored" data-skeleton="ignore">Always visible</p>
  <div class="chart" data-skeleton="block" style="height:60px"><span class="chart-label">Chart</span></div>
  <div class="mixed" data-skeleton="text">Mixed <b>content</b> here</div>
  <div class="mixed-auto">Total: <b class="mixed-b">$12</b> per month</div>
  <div class="bordered" style="border:2px solid;padding:4px">Box with a currentColor border</div>
  <hr class="divider">
  <svg style="display:none"><symbol id="vslk-test-icon" viewBox="0 0 24 24"><path fill="#e11d48" d="M2 2h20v20H2z"/></symbol></svg>
  <p class="icons"><svg class="sprite" width="24" height="24"><use class="sprite-use" href="#vslk-test-icon"/></svg><svg class="hard" width="24" height="24"><path class="hard-path" style="fill:#e11d48 !important" d="M2 2h20v20H2z"/></svg></p>
</article>`;
