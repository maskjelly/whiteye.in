// The page X frames inside a post (twitter:player on the home page): a live version of the social card.
// The horse flies in and bursts into dots that settle into the name; the dots flee the pointer and a click
// bursts them again. Layers come from scripts/build-og-animation.py.
export const dynamic = "force-static"

const html = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Aaryan Singh</title>
<style>
html,body{height:100%;margin:0;overflow:hidden;background:#f7f6f5}
body{display:grid;place-items:center}
#stage{position:relative;width:min(100vw,calc(100vh*1200/630));aspect-ratio:1200/630;background:url(/og.png) center/100% 100%}
canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
a{position:absolute;left:3%;top:5%;width:13%;height:7%}
</style>
</head>
<body>
<div id="stage">
<canvas id="c" role="img" aria-label="Aaryan Singh, engineer, 20"></canvas>
<a href="https://whiteye.in/" target="_blank" rel="noopener" aria-label="Open whiteye.in"></a>
</div>
<script>
(function () {
  var W = 1200, H = 630, STEP = 3, CX = W / 2, CY = 345;
  var INK = [25, 25, 25], ACCENT = [42, 20, 230];
  var FLIGHT = [ACCENT, [255, 92, 56], [255, 186, 0], [0, 170, 130], ACCENT, INK];
  var canvas = document.getElementById("c"), ctx = canvas.getContext("2d");
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function load(src) {
    return new Promise(function (ok, fail) {
      var i = new Image();
      i.onload = function () { ok(i); };
      i.onerror = fail;
      i.src = src;
    });
  }
  function pixels(img, w, h) {
    var o = document.createElement("canvas");
    o.width = w; o.height = h;
    var c = o.getContext("2d", { willReadFrequently: true });
    c.drawImage(img, 0, 0, w, h);
    return c.getImageData(0, 0, w, h).data;
  }
  function fit() {
    var r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * d);
    canvas.height = Math.round(r.height * d);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }

  Promise.all([load("/og-base.png"), load("/og-text.png"), load("/logo.png")]).then(function (imgs) {
    var base = imgs[0], text = imgs[1];
    fit();
    addEventListener("resize", fit);
    if (still) {
      (function draw() { ctx.drawImage(base, 0, 0, W, H); ctx.drawImage(text, 0, 0, W, H); })();
      addEventListener("resize", function () { ctx.drawImage(base, 0, 0, W, H); ctx.drawImage(text, 0, 0, W, H); });
      return;
    }

    // Where the dots rest: every STEP px of the text layer.
    var td = pixels(text, W, H), P = [];
    for (var y = 0; y < H; y += STEP) for (var x = 0; x < W; x += STEP) {
      var k = (y * W + x) * 4;
      if (td[k + 3] > 128) P.push({ tx: x, ty: y, x: x, y: y, vx: 0, vy: 0, hx: 0, hy: 0, c: td[k + 2] > 150 ? ACCENT : INK, f: FLIGHT[0], heat: 0 });
    }
    // Where they start: the light pixels of the horse mark.
    var HS = 430, hd = pixels(imgs[2], HS, HS), horse = [];
    for (var hy = 0; hy < HS; hy += 2) for (var hx = 0; hx < HS; hx += 2) {
      var j = (hy * HS + hx) * 4;
      if ((hd[j] + hd[j + 1] + hd[j + 2]) / 3 > 150 && hd[j + 3] > 128) horse.push([hx - HS / 2, hy - HS / 2]);
    }
    P.forEach(function (p, i) {
      var h = horse[(i * 7919) % horse.length];
      p.hx = h[0]; p.hy = h[1];
      p.f = FLIGHT[i % FLIGHT.length];
    });

    var pointer = null, solid = 0, start = performance.now(), last = start, idle = start;
    var ENTER = 1.1, CHARGE = 0.35, ring = -1, rx = CX, ry = CY;
    var mode = "horse", t0 = start;

    function burst(x, y, power) {
      P.forEach(function (p) {
        var dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1;
        var a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.9;
        var s = power * (0.35 + Math.random()) * Math.min(1, 260 / d + 0.25);
        p.vx += Math.cos(a) * s; p.vy += Math.sin(a) * s;
        p.heat = 1;
      });
      ring = 0; rx = x; ry = y;
    }
    function replay(now) { mode = "horse"; t0 = now; }
    function at(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    }
    canvas.addEventListener("pointermove", function (e) { pointer = at(e); idle = performance.now(); });
    canvas.addEventListener("pointerleave", function () { pointer = null; });
    canvas.addEventListener("pointerdown", function (e) {
      var q = at(e);
      idle = performance.now();
      if (mode === "free") burst(q.x, q.y, 1500);
    });

    function tick(now) {
      var dt = Math.min(0.033, (now - last) / 1000); last = now;
      ctx.drawImage(base, 0, 0, W, H);
      var moving = 0, i, p;

      if (mode === "horse") {
        var t = (now - t0) / 1000, e = Math.min(1, t / ENTER), ease = 1 - Math.pow(2, -10 * e);
        var ox = -320 + (CX + 320) * (e >= 1 ? 1 : ease), oy = CY + Math.sin(e * Math.PI) * -26;
        var charge = Math.max(0, Math.min(1, (t - ENTER) / CHARGE)), sc = 1 - 0.08 * charge;
        for (i = 0; i < P.length; i++) {
          p = P[i];
          p.x = ox + p.hx * sc + (Math.random() - 0.5) * 5 * charge;
          p.y = oy + p.hy * sc + (Math.random() - 0.5) * 5 * charge;
          p.vx = p.vy = 0; p.heat = charge;
        }
        solid = 0; moving = P.length;
        if (t >= ENTER + CHARGE) { mode = "free"; burst(CX, CY, 1700); idle = now; }
      } else {
        for (i = 0; i < P.length; i++) {
          p = P[i];
          var ax = (p.tx - p.x) * 60, ay = (p.ty - p.y) * 60;
          if (pointer) {
            var dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
            if (d2 < 8100) { var d = Math.sqrt(d2) || 1, f = (1 - d / 90) * 5200; ax += dx / d * f; ay += dy / d * f; p.heat = Math.max(p.heat, 0.6); }
          }
          // A little swirl on the way home.
          ax += -(p.ty - p.y) * 7; ay += (p.tx - p.x) * 7;
          p.vx = (p.vx + ax * dt) * Math.pow(0.0006, dt);
          p.vy = (p.vy + ay * dt) * Math.pow(0.0006, dt);
          p.x += p.vx * dt; p.y += p.vy * dt;
          var off = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y);
          if (off > 1.5) moving++;
          p.heat = Math.max(0, p.heat - dt * (off < 30 ? 2.2 : 0.5));
        }
        if (now - idle > 9000) replay(now);
      }

      // Dots while anything moves; the crisp text fades in over them once all are home.
      solid += ((moving < P.length * 0.004 ? 1 : 0) - solid) * Math.min(1, dt * (moving ? 14 : 6));
      if (solid < 0.995) {
        ctx.globalAlpha = 1 - solid;
        var lastFill = "";
        for (i = 0; i < P.length; i++) {
          p = P[i];
          var h = p.heat, c = mode === "horse" ? INK : p.c, g = p.f;
          var fill = "rgb(" + Math.round(c[0] + (g[0] - c[0]) * h) + "," + Math.round(c[1] + (g[1] - c[1]) * h) + "," + Math.round(c[2] + (g[2] - c[2]) * h) + ")";
          if (fill !== lastFill) { ctx.fillStyle = fill; lastFill = fill; }
          var r = 1.55 + h * 0.9;
          ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
        }
      }
      if (solid > 0.005) { ctx.globalAlpha = solid; ctx.drawImage(text, 0, 0, W, H); }
      ctx.globalAlpha = 1;

      if (ring >= 0) {
        ring += dt * 1.6;
        if (ring >= 1) ring = -1;
        else {
          ctx.strokeStyle = "rgba(42,20,230," + (0.55 * (1 - ring)) + ")";
          ctx.lineWidth = 2.5 * (1 - ring) + 0.5;
          ctx.beginPath(); ctx.arc(rx, ry, 40 + 520 * (1 - Math.pow(1 - ring, 3)), 0, Math.PI * 2); ctx.stroke();
        }
      }

      var s = (now - start) / 1000, pad = function (n) { return (n < 10 ? "0" : "") + n; };
      ctx.fillStyle = "rgb(150,149,146)";
      ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(pad(Math.floor(s / 60) % 60) + ":" + pad(Math.floor(s) % 60) + ":" + pad(Math.floor(s * 100) % 100), 52, H - 50);
      ctx.textAlign = "center";
      ctx.fillText("MOVE · CLICK", CX, H - 50);
      ctx.textAlign = "start";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }).catch(function () {
    document.getElementById("stage").innerHTML = '<a style="position:static;display:block;width:100%;height:100%" href="https://whiteye.in/" target="_blank" rel="noopener"><img src="/og.gif" style="width:100%;height:100%" alt="Aaryan Singh, engineer, 20"></a>';
  });
})();
</script>
</body>
</html>`

export function GET() {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
