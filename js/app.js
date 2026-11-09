(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initQuote();
  initLines();
  initIdioms();
  initJukebox();
  initDish();
  initMascot();

  function initQuote() {
    const quote = document.querySelector("#quote");
    if (!quote) return;
    const quotes = [
      "If a saying has weather in it, somebody is probably sneezing.",
      "A short tune can fix a long afternoon.",
      "Idioms are just jokes that got a job.",
      "Marbles do not have a five-year plan.",
      "The best line is the one you repeat to a patient friend.",
      "Midnight oil is a terrible beverage.",
      "If the room is quiet, flip a card.",
      "Nothing here asks for an account, a password, or a serious face.",
    ];
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const day = Math.floor((now - start) / 86400000);
    quote.textContent = quotes[day % quotes.length];
  }

  function initLines() {
    const items = [...document.querySelectorAll("#line-source li")].map((li) => li.textContent.trim());
    const text = document.querySelector("#line-text");
    const kicker = document.querySelector("#line-kicker");
    const count = document.querySelector("#line-count");
    const nextButton = document.querySelector("#next-line");
    const copyButton = document.querySelector("#copy-line");
    let index = 0;
    let bag = [];
    let lock = false;
    let copyTimer = 0;

    function shuffle(list) {
      for (let i = list.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    }

    if (!text || !kicker || !count || !nextButton || !copyButton || !items.length) return;

    function render() {
      text.textContent = items[index];
      count.textContent = `${index + 1} of ${items.length}`;
      kicker.textContent = `Line ${String(index + 1).padStart(2, "0")}`;
    }

    function pick() {
      if (!bag.length) {
        bag = shuffle(items.map((_, i) => i).filter((i) => i !== index));
      }
      return bag.pop();
    }

    function showNext() {
      if (lock || !items.length) return;
      lock = true;
      const next = pick();
      const reveal = () => {
        index = next;
        render();
        text.classList.remove("is-out");
        lock = false;
      };
      if (reduced) {
        reveal();
        return;
      }
      text.classList.add("is-out");
      window.setTimeout(reveal, 160);
    }

    render();
    nextButton.addEventListener("click", showNext);
    async function copyLine(value) {
      try {
        await navigator.clipboard.writeText(value);
        return "Copied";
      } catch (error) {
        const area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.cssText = "position:fixed;left:0;top:0;opacity:0;pointer-events:none;";
        document.body.appendChild(area);
        area.focus();
        area.select();
        let ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (fallbackError) {
          ok = false;
        }
        area.remove();
        if (ok) return "Copied";
      }
      const range = document.createRange();
      range.selectNodeContents(text);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return "Line selected";
    }

    copyButton.addEventListener("click", async () => {
      const original = "Copy line";
      copyButton.textContent = await copyLine(items[index]);
      window.clearTimeout(copyTimer);
      copyTimer = window.setTimeout(() => {
        copyButton.textContent = original;
      }, 1400);
    });
  }

  function initIdioms() {
    document.querySelectorAll(".idiom").forEach((card) => {
      const front = card.querySelector(".idiom__face--front");
      const back = card.querySelector(".idiom__face--back");
      const panels = [...card.querySelectorAll(".idiom__panel")];
      const backButton = card.querySelector(".idiom__back");

      function showMeaning(lang) {
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.lang !== lang;
        });
        card.classList.add("is-flipped");
        front.inert = true;
        back.inert = false;
        front.setAttribute("aria-hidden", "true");
        back.setAttribute("aria-hidden", "false");
        backButton.focus();
      }

      function showPicture(returnTo) {
        card.classList.remove("is-flipped");
        front.inert = false;
        back.inert = true;
        front.setAttribute("aria-hidden", "false");
        back.setAttribute("aria-hidden", "true");
        if (returnTo) returnTo.focus();
      }

      card.querySelectorAll(".idiom__lang").forEach((link) => {
        link.addEventListener("click", () => {
          showMeaning(link.dataset.lang);
        });
      });

      backButton.addEventListener("click", () => {
        const lang = panels.find((panel) => !panel.hidden)?.dataset.lang || "en";
        showPicture(card.querySelector(`.idiom__lang[data-lang="${lang}"]`));
      });
    });
  }

  function initJukebox() {
    const NOTES = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, Gsharp3: 207.65, A3: 220.0, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, Gsharp4: 415.3, A4: 440.0, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, Gsharp5: 830.61, A5: 880.0,
    };

    const LEFT_HAND = [
      ["A3", "C4", "E4"], ["A3", "C4", "E4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"],
      ["D3", "F3", "A3"], ["E3", "Gsharp3", "B3"], ["A3", "C4", "E4"], ["A3", "C4", "E4"],
      ["A3", "C4", "E4"], ["E3", "Gsharp3", "B3"], ["D3", "F3", "A3"], ["A3", "C4", "E4"],
      ["F3", "A3", "C4"], ["A3", "C4", "E4"], ["E3", "Gsharp3", "B3"], ["A3", "C4", "E4"],
      ["E3", "G3", "B3"], ["E3", "G3", "B3"], ["F3", "A3", "C4"], ["G3", "B3", "D4"],
      ["E3", "G3", "B3"], ["A3", "C4", "E4"], ["E3", "Gsharp3", "B3"], ["E3", "Gsharp3", "B3"],
      ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["A3", "C4", "E4"], ["D3", "F3", "A3"],
      ["E3", "Gsharp3", "B3"], ["A3", "C4", "E4"], ["E3", "Gsharp3", "B3"], ["A3", "C4", "E4"],
    ];

    const TUNES = {
      night: {
        name: "Night Minuet",
        step: 0.312,
        score: [
          "A4*2 C5*2 E5*2",
          "D5*2 C5 B4*2 A4",
          "C5*2 E5*2 G5*2",
          "F5*2 E5 D5*2 C5",
          "B4*2 A4 Gsharp4*2 A4",
          "B4*2 C5 D5*2 E5",
          "D5*2 C5 B4*2 A4",
          "A4*6",
          "C5*2 E5*2 A5*2",
          "G5*2 F5 E5*2 D5",
          "C5*2 B4 A4*2 G4",
          "F4*2 E4 D4*2 E4",
          "F4*2 G4 A4*2 B4",
          "C5*2 B4 A4*2 Gsharp4",
          "B4*2 E5 D5*2 C5",
          "A4*4 . .",
          "E5*2 D5*2 C5*2",
          "B4*2 A4 G4*2 F4",
          "E4*2 F4 G4*2 A4",
          "B4*2 C5 D5*2 E5",
          "D5*2 C5 B4*2 A4",
          "Gsharp4*2 A4 B4*2 C5",
          "D5*2 C5 B4*2 Gsharp4",
          "E5*4 . .",
          "A4*2 C5*2 E5*2",
          "D5*2 C5 B4*2 A4",
          "C5*2 E5*2 G5*2",
          "F5*2 E5 D5*2 C5",
          "B4*2 A4 G4*2 F4",
          "E4*2 F4 Gsharp4*2 A4",
          "B4*2 C5 D5*2 E5",
          "A4*6",
        ].join(" "),
      },
    };

    const buttons = [...document.querySelectorAll(".tune")];
    const stage = document.querySelector("#stage");
    const nowPlaying = document.querySelector("#now-playing");
    const stopButton = document.querySelector("#stop-tune");
    const volume = document.querySelector("#volume");
    const bars = [...document.querySelectorAll("#bars i")];
    if (!stage || !nowPlaying || !stopButton || !volume || !buttons.length) return;
    let audio = null;
    let playToken = 0;
    let loopTimer = 0;
    let active = [];
    let raf = 0;
    let currentId = "";

    function parseScore(score, step) {
      return score.trim().split(/\s+/).map((token) => {
        const [name, mult] = token.split("*");
        const dur = step * (Number(mult) || 1);
        if (name === ".") return { freq: 0, dur };
        const freq = NOTES[name];
        if (!freq) throw new Error(`Unknown note ${name}`);
        return { freq, dur };
      });
    }

    function masterLevel() {
      return Number(volume.value) / 100;
    }

    function ensureAudio() {
      if (audio) return audio;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = masterLevel();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 5200;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const length = Math.floor(ctx.sampleRate * 0.06);
      const hammer = ctx.createBuffer(1, length, ctx.sampleRate);
      const noise = hammer.getChannelData(0);
      for (let i = 0; i < length; i += 1) {
        noise[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
      }
      master.connect(filter);
      filter.connect(analyser);
      analyser.connect(ctx.destination);
      audio = { ctx, master, analyser, hammer, data: new Uint8Array(analyser.frequencyBinCount) };
      return audio;
    }

    function remember(node) {
      active.push(node);
      node.onended = () => {
        const i = active.indexOf(node);
        if (i >= 0) active.splice(i, 1);
      };
    }

    function pianoNote(freq, when, length, peak, soft) {
      const { ctx, master, hammer } = audio;
      const attack = soft ? 0.04 : 0.01;
      const tail = soft ? Math.max(0.34, length * 0.4) : Math.max(0.2, length * 0.28);
      const end = when + length + tail;
      [1, 0.5, 0.2, 0.08].forEach((amount, partial) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const level = peak * amount;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * (partial + 1), when);
        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.exponentialRampToValueAtTime(level, when + attack);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.42), when + attack + length * 0.55);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.connect(gain);
        gain.connect(master);
        osc.start(when);
        osc.stop(end + 0.03);
        remember(osc);
      });
      if (soft) return;
      const tap = ctx.createBufferSource();
      const tapGain = ctx.createGain();
      tap.buffer = hammer;
      tapGain.gain.setValueAtTime(peak * 0.22, when);
      tapGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);
      tap.connect(tapGain);
      tapGain.connect(master);
      tap.start(when);
      tap.stop(when + 0.06);
      remember(tap);
    }

    function schedule(notes, when, step) {
      let cursor = when;
      notes.forEach((note) => {
        if (note.freq) pianoNote(note.freq, cursor, note.dur * 1.05, 0.09, false);
        cursor += note.dur;
      });
      const bar = step * 6;
      LEFT_HAND.forEach((chord, index) => {
        const start = when + index * bar;
        chord.forEach((name, voice) => {
          pianoNote(NOTES[name], start + voice * 0.028, bar * 0.96, 0.032, true);
        });
      });
      return cursor - when;
    }

    function clearSound() {
      window.clearTimeout(loopTimer);
      active.forEach((node) => {
        try {
          node.stop();
        } catch (error) {
          /* already stopped */
        }
      });
      active = [];
    }

    function setPressed(id) {
      buttons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.tune === id));
      });
    }

    function stop() {
      playToken += 1;
      currentId = "";
      clearSound();
      setPressed("");
      stage.classList.remove("is-playing");
      stopButton.disabled = true;
      nowPlaying.textContent = "";
    }

    function arm(token, notes, when, step) {
      if (token !== playToken || !audio) return;
      const startAt = Math.max(when, audio.ctx.currentTime + 0.05);
      const duration = schedule(notes, startAt, step);
      const next = startAt + duration;
      const wait = (next - audio.ctx.currentTime - 0.2) * 1000;
      loopTimer = window.setTimeout(() => arm(token, notes, next, step), Math.max(40, wait));
    }

    function play(id) {
      const tune = TUNES[id];
      const engine = ensureAudio();
      if (!engine) {
        nowPlaying.textContent = "This browser cannot play the tunes.";
        return;
      }
      stop();
      engine.ctx.resume();
      currentId = id;
      playToken += 1;
      const token = playToken;
      stage.classList.add("is-playing");
      stopButton.disabled = false;
      setPressed(id);
      nowPlaying.textContent = "";
      const notes = parseScore(tune.score, tune.step);
      arm(token, notes, engine.ctx.currentTime + 0.06, tune.step);
    }

    function paintBars() {
      raf = window.requestAnimationFrame(paintBars);
      if (!audio || !currentId) {
        bars.forEach((bar) => {
          bar.style.height = "8%";
        });
        return;
      }
      audio.analyser.getByteFrequencyData(audio.data);
      bars.forEach((bar, i) => {
        const value = audio.data[(i % 6) + 1] || 0;
        bar.style.height = `${Math.max(14, (value / 255) * 100)}%`;
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.tune;
        if (id === currentId) stop();
        else play(id);
      });
    });
    stopButton.addEventListener("click", stop);
    volume.addEventListener("input", () => {
      if (!audio) return;
      audio.master.gain.setTargetAtTime(masterLevel(), audio.ctx.currentTime, 0.03);
    });
    paintBars();
  }

  function initDish() {
    const canvas = document.querySelector("#dish-canvas");
    if (!canvas) return;
    const status = document.querySelector("#dish-status");
    const ctx = canvas.getContext("2d");
    const COLORS = ["#e23b2f", "#2457e6", "#ffd84d", "#1e8c56", "#6d4aff", "#ff8a3d", "#fffaf2"];
    const MAX = 48;
    let balls = [];
    let width = 0;
    let height = 0;
    let pointer = null;
    let running = false;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function clamp(ball) {
      ball.x = Math.min(width - ball.r, Math.max(ball.r, ball.x));
      ball.y = Math.min(height - ball.r, Math.max(ball.r, ball.y));
    }

    function addBall(x, y, energetic) {
      if (!width || !height) return false;
      if (balls.length >= MAX) {
        status.textContent = "The dish is full. Reset it if you want a quieter crowd.";
        return false;
      }
      const r = 12 + Math.random() * 16;
      const ball = {
        x: Math.min(width - r, Math.max(r, x)),
        y: Math.min(height - r, Math.max(r, y)),
        r,
        vx: (Math.random() - 0.5) * (energetic ? 7 : 1.5),
        vy: (Math.random() - 0.5) * (energetic ? 7 : 1.5),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
      balls.push(ball);
      if (balls.length < MAX) status.textContent = "";
      return true;
    }

    function seed(count) {
      balls = [];
      for (let i = 0; i < count; i += 1) {
        addBall(width * (0.12 + Math.random() * 0.76), height * (0.12 + Math.random() * 0.76), false);
      }
      status.textContent = "";
    }

    function localPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    function step() {
      balls.forEach((ball) => {
        ball.vx += (Math.random() - 0.5) * 0.03;
        ball.vy += (Math.random() - 0.5) * 0.03;
        if (pointer) {
          const dx = ball.x - pointer.x;
          const dy = ball.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          if (dist < 100) {
            const force = ((100 - dist) / 100) * 1.35;
            ball.vx += (dx / dist) * force;
            ball.vy += (dy / dist) * force;
          }
        }
        const speed = Math.hypot(ball.vx, ball.vy);
        if (speed > 9) {
          ball.vx = (ball.vx / speed) * 9;
          ball.vy = (ball.vy / speed) * 9;
        }
        ball.vx *= 0.992;
        ball.vy *= 0.992;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x < ball.r) {
          ball.x = ball.r;
          ball.vx = Math.abs(ball.vx);
        } else if (ball.x > width - ball.r) {
          ball.x = width - ball.r;
          ball.vx = -Math.abs(ball.vx);
        }
        if (ball.y < ball.r) {
          ball.y = ball.r;
          ball.vy = Math.abs(ball.vy);
        } else if (ball.y > height - ball.r) {
          ball.y = height - ball.r;
          ball.vy = -Math.abs(ball.vy);
        }
      });

      for (let i = 0; i < balls.length; i += 1) {
        for (let j = i + 1; j < balls.length; j += 1) {
          const a = balls[i];
          const b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const min = a.r + b.r;
          if (dist >= min) continue;
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = (min - dist) / 2;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (rel > 0) {
            a.vx -= rel * nx;
            a.vy -= rel * ny;
            b.vx += rel * nx;
            b.vy += rel * ny;
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      balls.forEach((ball) => {
        const gloss = ctx.createRadialGradient(
          ball.x - ball.r * 0.35,
          ball.y - ball.r * 0.4,
          ball.r * 0.1,
          ball.x,
          ball.y,
          ball.r
        );
        gloss.addColorStop(0, "#fffaf2");
        gloss.addColorStop(0.42, ball.color);
        gloss.addColorStop(1, ball.color);
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = gloss;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#1c1915";
        ctx.stroke();
      });
    }

    function frame() {
      if (document.hidden) {
        running = false;
        return;
      }
      step();
      draw();
      window.requestAnimationFrame(frame);
    }

    function start() {
      resize();
      if (width < 10 || height < 10) {
        window.requestAnimationFrame(start);
        return;
      }
      seed(width > 760 ? 18 : 14);
      draw();
      if (reduced) {
        status.textContent = "Animation is paused because this browser is set to reduce motion. You can still drop marbles.";
        return;
      }
      if (!running) {
        running = true;
        frame();
      }
    }

    canvas.addEventListener("pointerdown", (event) => {
      const point = localPoint(event);
      addBall(point.x, point.y, true);
      if (reduced) draw();
    });
    canvas.addEventListener("pointermove", (event) => {
      pointer = localPoint(event);
    });
    canvas.addEventListener("pointerleave", () => {
      pointer = null;
    });
    document.querySelector("#handful").addEventListener("click", () => {
      for (let i = 0; i < 6; i += 1) {
        const placed = addBall(width * (0.15 + Math.random() * 0.7), height * (0.15 + Math.random() * 0.7), true);
        if (!placed) break;
      }
      if (reduced) draw();
    });
    document.querySelector("#reset-dish").addEventListener("click", () => {
      seed(width > 760 ? 18 : 14);
      if (reduced) draw();
    });
    window.addEventListener("resize", () => {
      resize();
      balls.forEach(clamp);
      if (reduced) draw();
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !reduced && !running && balls.length) {
        running = true;
        frame();
      }
    });
    start();
  }

  function initMascot() {
    const button = document.querySelector("#mascot");
    const speech = document.querySelector("#speech");
    if (!button || !speech) return;
    const remarks = [
      "Okay, okay. I'm awake.",
      "That tickles in a strictly circular way.",
      "I contain exactly one expression, and you found it.",
      "Still round. Still on the clock.",
    ];
    let clicks = 0;
    let hideTimer = 0;
    button.addEventListener("click", () => {
      clicks += 1;
      button.classList.remove("is-poked");
      void button.offsetWidth;
      button.classList.add("is-poked");
      speech.hidden = false;
      speech.textContent = remarks[(clicks - 1) % remarks.length];
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        button.classList.remove("is-poked");
        speech.hidden = true;
      }, 5000);
    });
  }
})();
