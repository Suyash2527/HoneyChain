# Dev tool: add an AI voice-over (Indian English, Microsoft neural TTS via edge-tts) to the demo video.
# Usage: python docs/tools/voiceover.py [preset] [in.mp4] [out.mp4]
#   preset: girl (young female, most natural - default) | B (younger female, peppier) | plain | boy (young male)
#           sarvam:<speaker>   Sarvam AI Bulbul v3 voice, e.g. sarvam:priya  (needs SARVAM_API_KEY)
#   python docs/tools/voiceover.py samples   -> one short clip per candidate Sarvam female voice, to pick by ear
# SARVAM_API_KEY is read from the environment or from a .env file in the project root (.env is gitignored).
#
# What makes it sound less synthetic:
#   1. every sentence is synthesised on its own and separated by a short, slightly varied breath pause,
#      instead of one long robotic run per scene
#   2. the script is written the way people talk (contractions, "So,", "See,", short sentences)
#   3. the voice gets a little warmth, the digital high-end sizzle is softened, and a tiny room reverb
#      is added so it sounds recorded in a room, not generated inside the computer
# Each scene's sentences start at that scene's time, so the voice stays in sync with the video.
import asyncio, base64, json, os, random, re, subprocess, sys, tempfile, urllib.error, urllib.request
import edge_tts

PRESETS = {
    'girl': dict(voice='en-IN-NeerjaExpressiveNeural', rate='+3%', pitch='+4Hz'),
    'B': dict(voice='en-IN-NeerjaExpressiveNeural', rate='+7%', pitch='+12Hz'),
    'plain': dict(voice='en-IN-NeerjaNeural', rate='+0%', pitch='+0Hz'),
    'boy': dict(voice='en-IN-PrabhatNeural', rate='+5%', pitch='+4Hz'),  # young male
}
PRESETS['A'] = PRESETS['girl']  # old name
preset = sys.argv[1] if len(sys.argv) > 1 else 'girl'
if preset.startswith('sarvam:'):
    PRESETS[preset] = dict(provider='sarvam', voice=preset.split(':', 1)[1], rate='', pitch='')
# Sarvam's docs don't publish genders, so these are the names to audition for a young female voice.
# (bulbul:v3 speakers only; anushka/manisha/vidya/arya are v2-only). Measured: suhani and ishita sound youngest.
SARVAM_CANDIDATES = ['suhani', 'ishita', 'kavya', 'shruti', 'ritu', 'pooja', 'tanya', 'simran', 'shreya', 'priya',
                     'roopa', 'kavitha', 'rupali']


def sarvam_key():
    key = os.environ.get('SARVAM_API_KEY')
    if not key and os.path.exists('.env'):
        raw = open('.env', 'rb').read()  # PowerShell may save UTF-16 with a BOM
        text = raw.decode('utf-16') if raw[:2] in (b'\xff\xfe', b'\xfe\xff') else raw.decode('utf-8-sig')
        for line in text.splitlines():
            if line.strip().startswith('SARVAM_API_KEY='):
                key = line.split('=', 1)[1].strip().strip('"\'')
    if not key:
        sys.exit('SARVAM_API_KEY not set. Add a line  SARVAM_API_KEY=your_key  to a .env file in the project root.')
    return key


def sarvam_tts(text, speaker, path):
    body = json.dumps({'text': text, 'language_code': 'en-IN', 'model': 'bulbul:v3', 'speaker': speaker,
                       'pace': 1.0, 'temperature': 0.7, 'speech_sample_rate': 48000, 'output_audio_codec': 'wav'}).encode()
    req = urllib.request.Request('https://api.sarvam.ai/text-to-speech', data=body, method='POST',
                                 headers={'api-subscription-key': sarvam_key(), 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            audio = json.load(r)['audios'][0]
    except urllib.error.HTTPError as e:
        sys.exit(f'Sarvam API error {e.code}: {e.read().decode(errors="replace")[:400]}')
    with open(path, 'wb') as f:
        f.write(base64.b64decode(audio))
src = sys.argv[2] if len(sys.argv) > 2 else 'docs/demo/HoneyChain-demo-3min.mp4'
out = sys.argv[3] if len(sys.argv) > 3 else 'docs/demo/HoneyChain-demo-voiceover.mp4'
FFMPEG = os.path.join('node_modules', 'ffmpeg-static', 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
random.seed(7)  # same pauses every run

# (start second, end second, lines) - times match the scene marks printed by record-demo.mjs.
# Acronyms are spelled with spaces so they are read letter by letter.
SCRIPT = [
    (0.4, 4.0, "Hi! This is Honey Chain."),
    (4.4, 25.9, "So, Honey Chain gives every hive, every harvest, and every single jar of honey its own tamper-proof identity, on a blockchain. "
                "Up here, you're seeing real ledger blocks, live. "
                "And as we scroll down, you can follow one batch of honey, all the way from the hive to the jar."),
    (26.2, 43.0, "Okay, say you're a buyer. You just scan the QR code on the jar. "
                 "The app quietly re-checks every hash, every signature, and the lab results. "
                 "And this one's genuine! Trust score, one hundred. You can see exactly where it came from, and its whole journey."),
    (43.3, 59.6, "Now, here's a fake. It claims ninety-five kilos from just one hive, and it fails the lab. "
                 "So, trust score twenty. Don't buy it. "
                 "Even clever syrup fails the N M R test. And a forged QR code? Caught, instantly."),
    (59.9, 80.4, "For beekeepers, adding a harvest takes three taps. Pick the hives, enter the kilos, choose the flowers, done. "
                 "And every ledger entry prints a signed receipt, with the block hash, a barcode, and a QR code. "
                 "It gets sealed, and you tear it off, just like a real one."),
    (80.7, 96.7, "In the lab, they enter eight test results. Pass or fail is worked out automatically, and nobody can change it. "
                 "Here, the chemistry looks fine, but the N M R shows an anomaly. So, the batch is rejected. For good."),
    (97.0, 128.5, "Every hive also has a small, low-cost sensor. It tracks the weight, the temperature inside, humidity, and even the sound of the colony. "
                  "And our A I spots problems early. See, this hive is about to swarm, and it's ninety-eight percent sure, "
                  "with simple advice, and a thirty-day honey forecast. "
                  "In this other hive, it's caught foulbrood before it can spread. And two weeks of sensor data get sealed on the chain, as proof."),
    (128.8, 146.9, "Then, processors and shops record every handover. The current holder fills in by itself, "
                   "and you can never pack more honey than was actually harvested. And if a batch failed the lab? It simply can't move."),
    (147.2, 161.2, "Now, let's try to cheat. Someone secretly edits an old record, and, boom! "
                   "The chain breaks at that exact block. The alarm goes off, instantly."),
    (161.5, 177.6, "To roll it out, village sensors connect over LoRa to cluster gateways that work offline. "
                   "And the chain is run by K V I C, F S S A I, and accredited labs. Four phases, from a small pilot, to the whole country."),
    (177.9, 188.0, "And it's made for beekeepers. Hindi and English, big text, and a simple mode."),
    (188.3, 192.9, "Every drop, proven. Thank you!"),
]
SILENCE = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
# warmth, slight presence, soften the synthetic 7-9 kHz sizzle, tiny early-reflection "room"
VOICE_FX = ('highpass=f=75,equalizer=f=190:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=1,'
            'equalizer=f=8000:t=q:w=1.5:g=-3,aecho=0.9:0.55:19|37:0.09|0.05,'
            'acompressor=threshold=-20dB:ratio=2.5:attack=6:release=140,loudnorm=I=-16:TP=-1.5:LRA=8')


def duration(path):
    err = subprocess.run([FFMPEG, '-hide_banner', '-i', path], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def sentences(text):
    return [s.strip() for s in re.findall(r'[^.!?]+[.!?]+', text) if s.strip()]


async def synth(text, path, p):
    raw = path + '.src'
    if p.get('provider') == 'sarvam':
        await asyncio.to_thread(sarvam_tts, text, p['voice'], raw)
    else:
        await edge_tts.Communicate(text, p['voice'], rate=p['rate'], pitch=p['pitch']).save(raw)
    # trim the engine's own leading/trailing silence so we control the pauses exactly
    subprocess.run([FFMPEG, '-y', '-i', raw, '-af', SILENCE, '-ar', '48000', path], capture_output=True)
    return duration(path)


async def main():
    p = PRESETS[preset]
    tmp = tempfile.mkdtemp(prefix='hc-vo-')
    clips = []  # (start, file, tempo)
    for si, (start, end, text) in enumerate(SCRIPT):
        parts = sentences(text)
        files, durs = [], []
        for k, s in enumerate(parts):
            f = os.path.join(tmp, f's{si:02}_{k:02}.wav')
            durs.append(await synth(s, f, p)); files.append(f)
        # human-ish breath gaps: a little longer after a full stop than after ? or !
        gaps = [random.uniform(0.30, 0.48) if parts[k].endswith('.') else random.uniform(0.22, 0.34) for k in range(len(parts) - 1)]
        slot, total = end - start, sum(durs) + sum(gaps)
        if total > slot:  # first tighten the pauses, then (only if needed) speed up slightly
            gaps = [max(0.14, g * 0.6) for g in gaps]; total = sum(durs) + sum(gaps)
        tempo = min(1.10, total / slot) if total > slot else 1.0
        flag = '  <-- still long, shorten this scene' if total / tempo > slot + 0.3 else ''
        print(f'{start:6.1f}s  {len(parts)} sentences  {total:5.1f}s / {slot:4.1f}s slot  x{tempo:.2f}{flag}')
        t = start
        for k, f in enumerate(files):
            clips.append((t, f, tempo))
            t += durs[k] / tempo + (gaps[k] / tempo if k < len(gaps) else 0)

    video_len = duration(src)
    args = [FFMPEG, '-y', '-i', src]
    for _, f, _ in clips:
        args += ['-i', f]
    chains = [f"[{i + 1}:a]atempo={tp:.3f},adelay={int(s * 1000)}|{int(s * 1000)}[v{i}]" for i, (s, _, tp) in enumerate(clips)]
    mix = ''.join(f'[v{i}]' for i in range(len(clips)))
    graph = ';'.join(chains) + f";{mix}amix=inputs={len(clips)}:normalize=0,apad=whole_dur={video_len:.2f},{VOICE_FX}[a]"
    args += ['-filter_complex', graph, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
             '-t', f'{video_len:.2f}', '-movflags', '+faststart', out]
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-1500:]); sys.exit(1)
    print(f'saved {out} ({os.path.getsize(out) / 1e6:.1f} MB, {len(clips)} sentences, voice {p["voice"]} {p["rate"]} {p["pitch"]})')

async def samples():
    os.makedirs('docs/demo/voice-samples', exist_ok=True)
    line = "Okay, say you're a buyer. You just scan the QR code on the jar, and this one's genuine! Trust score, one hundred."
    for s in SARVAM_CANDIDATES:
        f = f'docs/demo/voice-samples/sarvam-{s}.wav'
        await synth(line, f, dict(provider='sarvam', voice=s))
        print('saved', f)

asyncio.run(samples() if preset == 'samples' else main())
