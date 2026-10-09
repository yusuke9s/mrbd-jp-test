(function () {
  var $ = function (id) { return document.getElementById(id); };
  var hasJapanese = function (s) { return /[぀-ヿ㐀-鿿]/.test(s); };

  var labels = { v1: 'A', v2: 'B', v3: 'C', v4: 'D', v5: 'E', v6: 'F', v7: 'G' };
  var results = {};
  function showInput(e) {
    var v = e.target.value !== undefined ? e.target.value : e.target.textContent;
    if (!v) return;
    results[labels[e.target.id]] = (hasJapanese(v) ? '✅' : '❌') + ' ' + labels[e.target.id] + ': ' + v;
    $('inputResult').textContent = Object.keys(results).sort().map(function (k) { return results[k]; }).join('\n');
  }
  Array.prototype.forEach.call(document.querySelectorAll('.dict'), function (el) {
    el.addEventListener('change', showInput);
    el.addEventListener('input', showInput);
    el.addEventListener('blur', showInput);
  });

  $('playFile').addEventListener('click', function () {
    var audio = new Audio('voice.m4a');
    $('audioResult').textContent = 'playing file...';
    audio.onended = function () { $('audioResult').textContent = 'file ended (heard Japanese?)'; };
    audio.onerror = function () { $('audioResult').textContent = '❌ file error'; };
    audio.play().catch(function (err) { $('audioResult').textContent = '❌ ' + err.name + ': ' + err.message; });
  });

  $('playTts').addEventListener('click', function () {
    if (!window.speechSynthesis) { $('audioResult').textContent = '❌ no speechSynthesis'; return; }
    var u = new SpeechSynthesisUtterance('こんにちは。日本語の読み上げテストです。');
    u.lang = 'ja-JP';
    u.onstart = function () { $('audioResult').textContent = 'tts speaking...'; };
    u.onend = function () { $('audioResult').textContent = 'tts ended'; };
    u.onerror = function (e) { $('audioResult').textContent = '❌ tts ' + e.error; };
    speechSynthesis.speak(u);
  });

  $('tryRecog').addEventListener('click', function () {
    var R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) { $('micResult').textContent = '❌ no SpeechRecognition'; return; }
    try {
      var r = new R();
      r.lang = 'ja-JP';
      r.interimResults = true;
      r.onresult = function (e) {
        var t = '';
        for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        $('micResult').textContent = '✅ ' + t;
      };
      r.onerror = function (e) { $('micResult').textContent = '❌ recog ' + e.error; };
      r.onend = function () { $('micResult').textContent += ' (end)'; };
      r.start();
      $('micResult').textContent = 'listening... speak Japanese';
    } catch (err) {
      $('micResult').textContent = '❌ ' + err.message;
    }
  });

  $('tryMic').addEventListener('click', function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $('micResult').textContent = '❌ no getUserMedia';
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      $('micResult').textContent = '✅ mic stream: ' + stream.getAudioTracks().map(function (t) { return t.label; }).join(',');
      stream.getTracks().forEach(function (t) { t.stop(); });
    }).catch(function (err) {
      $('micResult').textContent = '❌ ' + err.name + ': ' + err.message;
    });
  });

  function renderInfo() {
    var voices = window.speechSynthesis ? speechSynthesis.getVoices().map(function (v) { return v.name + '/' + v.lang; }).join(', ') : 'none';
    $('info').textContent = [
      'language: ' + navigator.language + ' [' + (navigator.languages || []).join(',') + ']',
      'voices: ' + voices,
      'SpeechRecognition: ' + !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      'getUserMedia: ' + !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      'screen: ' + window.innerWidth + 'x' + window.innerHeight,
      'UA: ' + navigator.userAgent
    ].join('\n');
  }
  renderInfo();

  var focusables = function () { return Array.prototype.slice.call(document.querySelectorAll('.focusable')); };
  document.addEventListener('keydown', function (e) {
    var list = focusables();
    var idx = list.indexOf(document.activeElement);
    var next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = list[(idx + 1) % list.length];
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = list[(idx - 1 + list.length) % list.length];
    if (next) {
      e.preventDefault();
      next.focus();
      next.scrollIntoView({ block: 'center' });
    }
  });
  focusables()[0].focus();
})();
